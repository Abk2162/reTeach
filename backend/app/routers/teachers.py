"""
Teachers Router
Endpoints for teacher-specific operations like managing students
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

from app.database import db

router = APIRouter(prefix="/api/teachers", tags=["teachers"])


# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class StudentResponse(BaseModel):
    """Student information for teacher's class"""
    id: str
    email: str
    name: Optional[str]
    created_at: str
    total_submissions: int
    last_submission: Optional[str]


class RemoveStudentRequest(BaseModel):
    """Request to remove a student from teacher's class"""
    student_id: str


class OnboardingStatusResponse(BaseModel):
    """Teacher's onboarding status"""
    has_completed_onboarding: bool
    teacher_id: Optional[str]
    course_name: Optional[str]


class CompleteOnboardingRequest(BaseModel):
    """Request to mark onboarding as complete"""
    teacher_email: EmailStr


class TeacherFormResponse(BaseModel):
    """Teacher's form with share link information"""
    form_id: str
    title: str
    slug: str
    share_url: str
    created_at: str
    total_questions: int
    total_responses: int
    status: str


# ============================================================
# ENDPOINTS
# ============================================================

@router.get("/{teacher_email}/students", response_model=List[StudentResponse])
async def get_teacher_students(teacher_email: EmailStr):
    """
    Get all students for a specific teacher

    Returns students who have submitted forms created by this teacher.

    Args:
        teacher_email: Teacher's email address

    Returns:
        List of students with submission statistics
    """
    try:
        # Get teacher ID from email
        teacher_result = db.client.table("teachers")\
            .select("id")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            return []

        teacher_id = teacher_result.data[0]["id"]

        # Get all students linked to this teacher
        teacher_students_result = db.client.table("teacher_students")\
            .select("student_id")\
            .eq("teacher_id", teacher_id)\
            .execute()

        if not teacher_students_result.data:
            return []

        student_ids = [ts["student_id"] for ts in teacher_students_result.data]

        # Get student details and submission stats
        students = []
        for student_id in student_ids:
            # Get student info
            student_result = db.client.table("students")\
                .select("id, email, name, created_at")\
                .eq("id", student_id)\
                .execute()

            if not student_result.data:
                continue

            student = student_result.data[0]

            # Get submission count and last submission
            # Get all forms created by this teacher
            teacher_forms_result = db.client.table("forms")\
                .select("id")\
                .eq("teacher_id", teacher_id)\
                .execute()

            teacher_form_ids = [f["id"] for f in teacher_forms_result.data] if teacher_forms_result.data else []

            # Count submissions from this student on teacher's forms
            total_submissions = 0
            last_submission = None

            if teacher_form_ids:
                # Get all sessions for this student on teacher's forms
                sessions_result = db.client.table("form_sessions")\
                    .select("completed_at")\
                    .eq("student_id", student_id)\
                    .in_("form_id", teacher_form_ids)\
                    .not_.is_("completed_at", "null")\
                    .order("completed_at", desc=True)\
                    .execute()

                if sessions_result.data:
                    total_submissions = len(sessions_result.data)
                    last_submission = sessions_result.data[0]["completed_at"]

            students.append(StudentResponse(
                id=str(student["id"]),
                email=student["email"],
                name=student.get("name"),
                created_at=student["created_at"],
                total_submissions=total_submissions,
                last_submission=last_submission
            ))

        # Sort by last submission (most recent first)
        students.sort(key=lambda s: s.last_submission or "", reverse=True)

        return students

    except Exception as e:
        print(f"[TEACHERS] Error getting students: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{teacher_email}/students/{student_id}")
async def remove_student_from_teacher(teacher_email: EmailStr, student_id: str):
    """
    Remove a student from teacher's class

    This doesn't delete the student or their submissions, just removes
    the link between teacher and student.

    Args:
        teacher_email: Teacher's email address
        student_id: Student ID to remove

    Returns:
        Success message
    """
    try:
        # Get teacher ID from email
        teacher_result = db.client.table("teachers")\
            .select("id")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            raise HTTPException(status_code=404, detail="Teacher not found")

        teacher_id = teacher_result.data[0]["id"]

        # Delete the teacher-student link
        delete_result = db.client.table("teacher_students")\
            .delete()\
            .eq("teacher_id", teacher_id)\
            .eq("student_id", student_id)\
            .execute()

        return {
            "message": "Student removed from class successfully",
            "student_id": student_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[TEACHERS] Error removing student: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{teacher_email}/onboarding-status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(teacher_email: EmailStr):
    """
    Get teacher's onboarding completion status

    Args:
        teacher_email: Teacher's email address

    Returns:
        Onboarding status
    """
    try:
        # Get or create teacher record
        teacher_result = db.client.table("teachers")\
            .select("id, has_completed_onboarding, course_name")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            # Teacher doesn't exist yet - create record
            insert_result = db.client.table("teachers")\
                .insert({
                    "email": teacher_email.lower(),
                    "has_completed_onboarding": False
                })\
                .execute()

            return OnboardingStatusResponse(
                has_completed_onboarding=False,
                teacher_id=str(insert_result.data[0]["id"]) if insert_result.data else None,
                course_name=None
            )

        teacher = teacher_result.data[0]
        return OnboardingStatusResponse(
            has_completed_onboarding=teacher.get("has_completed_onboarding", False),
            teacher_id=str(teacher["id"]),
            course_name=teacher.get("course_name")
        )

    except Exception as e:
        print(f"[TEACHERS] Error getting onboarding status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{teacher_email}/complete-onboarding")
async def complete_onboarding(teacher_email: EmailStr):
    """
    Mark teacher's onboarding as complete

    Args:
        teacher_email: Teacher's email address

    Returns:
        Success message
    """
    try:
        # Get or create teacher record
        teacher_result = db.client.table("teachers")\
            .select("id")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            # Create teacher record with onboarding complete
            db.client.table("teachers")\
                .insert({
                    "email": teacher_email.lower(),
                    "has_completed_onboarding": True
                })\
                .execute()
        else:
            # Update existing record
            teacher_id = teacher_result.data[0]["id"]
            db.client.table("teachers")\
                .update({"has_completed_onboarding": True})\
                .eq("id", teacher_id)\
                .execute()

        return {
            "message": "Onboarding marked as complete",
            "teacher_email": teacher_email
        }

    except Exception as e:
        print(f"[TEACHERS] Error completing onboarding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class UpdateCourseNameRequest(BaseModel):
    """Request to update teacher's course name"""
    course_name: str


@router.put("/{teacher_email}/course-name")
async def update_course_name(teacher_email: EmailStr, request: UpdateCourseNameRequest):
    """
    Update teacher's course name

    Args:
        teacher_email: Teacher's email address
        request: Course name update request

    Returns:
        Success message
    """
    try:
        # Get or create teacher record
        teacher_result = db.client.table("teachers")\
            .select("id")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            # Create teacher record with course name
            db.client.table("teachers")\
                .insert({
                    "email": teacher_email.lower(),
                    "course_name": request.course_name,
                    "has_completed_onboarding": False
                })\
                .execute()
        else:
            # Update existing record
            teacher_id = teacher_result.data[0]["id"]
            db.client.table("teachers")\
                .update({"course_name": request.course_name})\
                .eq("id", teacher_id)\
                .execute()

        return {
            "message": "Course name updated successfully",
            "course_name": request.course_name
        }

    except Exception as e:
        print(f"[TEACHERS] Error updating course name: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{teacher_email}/forms", response_model=List[TeacherFormResponse])
async def get_teacher_forms(teacher_email: EmailStr):
    """
    Get all forms created by a specific teacher with share links

    Args:
        teacher_email: Teacher's email address

    Returns:
        List of forms with share link information
    """
    try:
        from app.config import settings

        # Get teacher ID from email
        teacher_result = db.client.table("teachers")\
            .select("id")\
            .eq("email", teacher_email.lower())\
            .execute()

        if not teacher_result.data:
            return []

        teacher_id = teacher_result.data[0]["id"]

        # Get all forms for this teacher
        forms_result = db.client.table("forms")\
            .select("id, form_id, title, slug, status, publish_date")\
            .eq("teacher_id", teacher_id)\
            .order("publish_date", desc=True)\
            .execute()

        if not forms_result.data:
            return []

        # For each form, get question count and response count
        forms = []
        for form in forms_result.data:
            form_uuid = form["id"]

            # Count questions
            questions_result = db.client.table("form_questions")\
                .select("id", count="exact")\
                .eq("form_id", form_uuid)\
                .execute()
            total_questions = questions_result.count or 0

            # Count completed sessions (responses)
            sessions_result = db.client.table("form_sessions")\
                .select("id", count="exact")\
                .eq("form_id", form_uuid)\
                .not_.is_("completed_at", "null")\
                .execute()
            total_responses = sessions_result.count or 0

            # Build share URL
            share_url = f"{settings.frontend_url}/form/{form['slug']}"

            forms.append(TeacherFormResponse(
                form_id=form["form_id"],
                title=form["title"],
                slug=form["slug"],
                share_url=share_url,
                created_at=form["publish_date"] or "",
                total_questions=total_questions,
                total_responses=total_responses,
                status=form["status"]
            ))

        return forms

    except Exception as e:
        print(f"[TEACHERS] Error getting teacher forms: {e}")
        raise HTTPException(status_code=500, detail=str(e))
