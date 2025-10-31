"""
Native Forms Router
Endpoints for creating, publishing, and managing shareable diagnostic forms
"""

from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator
from uuid import UUID, uuid4
from datetime import datetime
import html

from app.models.question import Question
from app.database import db
from app.utils.slug_generator import generate_slug
from app.services.email_service import get_email_service
from app.services.khan_academy_service import get_khan_academy_service
from app.config import settings

router = APIRouter(prefix="/api/forms", tags=["forms"])


# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class PublishFormRequest(BaseModel):
    """Request to publish a new diagnostic form"""
    title: str = Field(..., min_length=1, max_length=255)
    questions: List[Question] = Field(..., min_length=1, max_length=100)
    course_id: Optional[str] = Field(None, description="Associated course ID", max_length=100)
    teacher_email: Optional[EmailStr] = Field(None, description="Teacher email (for tracking)")
    teacher_name: Optional[str] = Field(None, description="Teacher name", max_length=255)

    @field_validator('title', 'course_id', 'teacher_name')
    @classmethod
    def sanitize_text(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize text fields to prevent XSS"""
        if v is None:
            return None
        return html.escape(v.strip())


class PublishFormResponse(BaseModel):
    """Response after publishing a form"""
    form_id: str
    slug: str
    url: str
    total_questions: int


class FormSummary(BaseModel):
    """Summary data for dashboard diagnostics list"""
    id: str
    slug: str
    form_uuid: str
    title: str
    course: str
    created_at: Optional[str]
    responses: int
    completion_pct: float
    weak_topics: List[str]
    strong_topics: List[str]
    status: str
    avg_score: Optional[float] = None
    last_submission: Optional[str] = None


class FormInfoResponse(BaseModel):
    """Public form information for students"""
    form_id: str
    title: str
    total_questions: int
    status: str


class StudentInfo(BaseModel):
    """Student information to start form session"""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr

    @field_validator('name')
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        """Sanitize name to prevent XSS"""
        return html.escape(v.strip())


class StartSessionResponse(BaseModel):
    """Response after starting a session"""
    session_id: str
    form_title: str
    total_questions: int
    questions: List[dict]


class SubmitAnswer(BaseModel):
    """Single answer submission"""
    question_id: str = Field(..., max_length=100)
    selected_index: int = Field(..., ge=0, le=5, description="Selected answer (0-5 for up to 6 options)")


class SubmitFormRequest(BaseModel):
    """Complete form submission"""
    session_id: str = Field(..., max_length=100)
    answers: List[SubmitAnswer] = Field(..., max_length=200)


class SubmitFormResponse(BaseModel):
    """Response after submitting form"""
    session_id: str
    score_percentage: float
    correct_answers: int
    total_questions: int
    message: str


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/publish", response_model=PublishFormResponse)
async def publish_form(request: PublishFormRequest):
    """
    Publish a diagnostic form and get shareable URL

    Creates a new form with unique slug, stores questions,
    and returns shareable link for students.

    Args:
        request: Form title and questions

    Returns:
        Form ID, slug, and shareable URL
    """
    try:
        print(f"[FORMS] Publishing form with {len(request.questions)} questions")
        print(f"[FORMS] Title: {request.title}")
        if request.questions:
            print(f"[FORMS] First question sample: {request.questions[0].model_dump()}")

        # Handle teacher creation/retrieval
        teacher_id = None
        if request.teacher_email:
            print(f"[FORMS] Processing teacher: {request.teacher_email}")

            # Check if teacher exists
            teacher_result = db.client.table("teachers")\
                .select("id")\
                .eq("email", request.teacher_email.lower())\
                .execute()

            if teacher_result.data:
                teacher_id = teacher_result.data[0]["id"]
                print(f"[FORMS] Found existing teacher: {teacher_id}")
            else:
                # Create new teacher
                new_teacher = db.client.table("teachers").insert({
                    "email": request.teacher_email.lower(),
                    "name": request.teacher_name
                }).execute()
                teacher_id = new_teacher.data[0]["id"] if new_teacher.data else None
                print(f"[FORMS] Created new teacher: {teacher_id}")

        # Create or get default course
        course_result = db.client.table("courses")\
            .select("id")\
            .eq("title", "Default Course")\
            .execute()

        if course_result.data:
            course_id = course_result.data[0]["id"]
        else:
            # Create default course
            new_course = db.client.table("courses").insert({
                "title": "Default Course",
                "subject": "General",  # Add required subject field
                "course_level": "ug",
                "grade_level": "Undergraduate"  # Add required grade_level field
            }).execute()
            course_id = new_course.data[0]["id"] if new_course.data else None

            if not course_id:
                raise HTTPException(status_code=500, detail="Failed to create course")

        # Generate unique slug
        slug = generate_slug(request.title)

        # Check if slug already exists (unlikely but possible)
        existing = db.client.table("forms").select("id").eq("slug", slug).execute()
        if existing.data:
            # Regenerate with longer suffix
            slug = generate_slug(request.title, length=6)

        # Create form record
        form_data = {
            "form_id": f"form_{slug}",
            "course_id": course_id,
            "title": request.title,
            "slug": slug,
            "status": "published",
            "publish_date": datetime.now().isoformat(),
            "teacher_id": teacher_id  # Link form to teacher
        }

        form_result = db.client.table("forms").insert(form_data).execute()

        if not form_result.data:
            raise HTTPException(status_code=500, detail="Failed to create form")

        form_record = form_result.data[0]
        form_uuid = form_record["id"]

        # Store each unique topic and create questions in proper tables
        topic_map = {}  # topic name -> topic uuid

        for question in request.questions:
            topic_name = question.topic

            # Get or create topic
            if topic_name not in topic_map:
                topic_result = db.client.table("topics")\
                    .select("id")\
                    .eq("course_id", course_id)\
                    .eq("name", topic_name)\
                    .execute()

                if topic_result.data:
                    topic_uuid = topic_result.data[0]["id"]
                else:
                    # Create new topic
                    new_topic = db.client.table("topics").insert({
                        "course_id": course_id,
                        "topic_id": f"topic_{slug}_{len(topic_map)}",
                        "name": topic_name,
                        "weight": 1.0 / len(set(q.topic for q in request.questions))
                    }).execute()
                    topic_uuid = new_topic.data[0]["id"] if new_topic.data else None

                    if not topic_uuid:
                        raise HTTPException(status_code=500, detail=f"Failed to create topic: {topic_name}")

                topic_map[topic_name] = topic_uuid

        # Store questions in questions table and link to form
        for idx, question in enumerate(request.questions):
            topic_uuid = topic_map[question.topic]

            # Generate unique question_id to avoid conflicts
            unique_question_id = f"{question.id}_{str(uuid4())[:8]}"

            # Map answer_index to letter (a, b, c, d)
            answer_letters = ['a', 'b', 'c', 'd', 'e', 'f']
            correct_answer_letter = answer_letters[question.answerIndex] if question.answerIndex < len(answer_letters) else 'a'

            # Create question in questions table
            question_result = db.client.table("questions").insert({
                "question_id": unique_question_id,
                "topic_id": topic_uuid,
                "stem": question.stem,
                "options": question.options,
                "answer_index": question.answerIndex,
                "correct_answer": correct_answer_letter,  # Use letter (a/b/c/d) not text
                "rationale": question.rationale,
                "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else question.difficulty,
                "bloom_level": question.bloom
            }).execute()

            if not question_result.data:
                raise HTTPException(status_code=500, detail=f"Failed to create question {idx}")

            question_uuid = question_result.data[0]["id"]

            # Link question to form
            db.client.table("form_questions").insert({
                "form_id": form_uuid,
                "question_id": question_uuid,
                "order_index": idx
            }).execute()

        # Build shareable URL from environment
        url = f"{settings.frontend_url}/form/{slug}"

        return PublishFormResponse(
            form_id=str(form_uuid),
            slug=slug,
            url=url,
            total_questions=len(request.questions)
        )

    except ValidationError as e:
        print(f"[FORMS] Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error publishing form: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[FormSummary])
async def list_forms(teacher_email: Optional[EmailStr] = None):
    """
    List published forms with aggregated response statistics.
    """
    try:
        teacher_id = None
        if teacher_email:
            teacher_result = db.client.table("teachers")\
                .select("id")\
                .eq("email", teacher_email.lower())\
                .execute()

            if not teacher_result.data:
                return []

            teacher_id = teacher_result.data[0]["id"]

        forms_query = db.client.table("forms")\
            .select("id, form_id, slug, title, status, publish_date, created_at, course_id")\
            .order("publish_date", desc=True)\
            .order("created_at", desc=True)

        if teacher_id:
            forms_query = forms_query.eq("teacher_id", teacher_id)

        forms_result = forms_query.execute()
        forms_data = forms_result.data or []

        if not forms_data:
            return []

        course_cache: dict[str, str] = {}
        summaries: List[FormSummary] = []

        for form in forms_data:
            # Only surface published/active diagnostics
            status = form.get("status") or "draft"
            if status != "published":
                continue

            form_uuid = form["id"]
            slug = form.get("slug") or form.get("form_id") or str(form_uuid)

            # Course lookup (cached)
            course_id = form.get("course_id")
            course_name = "General Diagnostic"
            if course_id:
                if course_id not in course_cache:
                    course_result = db.client.table("courses")\
                        .select("title")\
                        .eq("id", course_id)\
                        .limit(1)\
                        .execute()

                    if course_result.data:
                        course_cache[course_id] = course_result.data[0].get("title") or "Course"
                    else:
                        course_cache[course_id] = "Course"

                course_name = course_cache.get(course_id, "Course")

            # Aggregate stats
            stat_row = None
            try:
                summary_result = db.client.table("form_submission_summary")\
                    .select("*")\
                    .eq("form_id", form_uuid)\
                    .limit(1)\
                    .execute()
                stat_row = summary_result.data[0] if summary_result.data else None
            except Exception as stats_error:
                print(f"[FORMS] Warning: summary view unavailable for form {slug}: {stats_error}")

            # Total sessions (including in-progress)
            session_result = db.client.table("form_sessions")\
                .select("id", count="exact")\
                .eq("form_id", form_uuid)\
                .execute()

            total_sessions = session_result.count or 0
            completed = int(stat_row.get("total_submissions") or 0) if stat_row else 0
            responses = completed
            completion_pct = round((completed / total_sessions * 100), 1) if total_sessions else 0.0
            if completion_pct > 100:
                completion_pct = 100.0
            if completion_pct < 0:
                completion_pct = 0.0

            avg_score = None
            if stat_row and stat_row.get("average_score") is not None:
                try:
                    avg_score = float(stat_row.get("average_score"))
                except (TypeError, ValueError):
                    avg_score = None

            # Weak topics (bottom 3 by correctness)
            weak_topics: List[str] = []
            strong_topics: List[str] = []
            try:
                topic_stats = db.client.rpc("get_form_topic_stats", {
                    "form_uuid": form_uuid
                }).execute()

                topic_rows = topic_stats.data or []
                topic_scores = [
                    (
                        row.get("topic_name"),
                        float(row.get("correct_pct") or 0)
                    )
                    for row in topic_rows
                    if row.get("topic_name")
                ]

                if topic_scores:
                    weak_topics = [
                        name for name, _ in sorted(topic_scores, key=lambda item: item[1])[:3]
                    ]
                    strong_topics = [
                        name for name, _ in sorted(topic_scores, key=lambda item: item[1], reverse=True)[:3]
                    ]
            except Exception as e:
                print(f"[FORMS] Warning: failed to load topic stats for {slug}: {e}")

            created_at = form.get("publish_date") or form.get("created_at")

            summaries.append(FormSummary(
                id=slug,
                slug=slug,
                form_uuid=str(form_uuid),
                title=form.get("title") or "Untitled Diagnostic",
                course=course_name or "Course",
                created_at=created_at,
                responses=responses,
                completion_pct=completion_pct,
                weak_topics=weak_topics,
                strong_topics=strong_topics,
                status="active",
                avg_score=avg_score,
                last_submission=stat_row.get("latest_submission") if stat_row else None
            ))

        return summaries

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error listing forms: {e}")
        raise HTTPException(status_code=500, detail="Failed to list forms")


@router.delete("/{slug}")
async def delete_form(slug: str, teacher_email: Optional[EmailStr] = None):
    """
    Delete a published form and all associated records.
    """
    try:
        form_result = db.client.table("forms")\
            .select("id, teacher_id")\
            .eq("slug", slug)\
            .limit(1)\
            .execute()

        if not form_result.data:
            raise HTTPException(status_code=404, detail="Form not found")

        form = form_result.data[0]
        form_uuid = form["id"]
        teacher_id = form.get("teacher_id")

        if teacher_email:
            teacher_lookup = db.client.table("teachers")\
                .select("id")\
                .eq("email", teacher_email.lower())\
                .limit(1)\
                .execute()

            if not teacher_lookup.data:
                raise HTTPException(status_code=403, detail="Not authorized to delete this form")

            if teacher_id and teacher_lookup.data[0]["id"] != teacher_id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this form")

        db.client.table("forms").delete().eq("id", form_uuid).execute()

        return {"status": "deleted", "slug": slug}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error deleting form {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete form")


@router.get("/{slug}", response_model=FormInfoResponse)
async def get_form_by_slug(slug: str):
    """
    Get public form information by slug

    Students use this to view form before starting.

    Args:
        slug: Form slug from URL

    Returns:
        Form title and metadata (no questions yet)
    """
    try:
        # Query form by slug
        result = db.client.table("forms")\
            .select("id, form_id, title, status")\
            .eq("slug", slug)\
            .eq("status", "published")\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Form not found")

        form = result.data[0]

        # Count questions
        questions = db.client.table("form_questions")\
            .select("question_id", count="exact")\
            .eq("form_id", form["id"])\
            .execute()

        total_questions = questions.count or 0

        return FormInfoResponse(
            form_id=form["form_id"],
            title=form["title"],
            total_questions=total_questions,
            status=form["status"]
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error fetching form: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{slug}/start", response_model=StartSessionResponse)
async def start_form_session(slug: str, student_info: StudentInfo, request: Request):
    """
    Start a new form session for a student

    Collects student name/email and creates session.
    Returns questions for student to answer.

    Args:
        slug: Form slug
        student_info: Student name and email
        request: FastAPI request (for IP/user agent)

    Returns:
        Session ID and form questions
    """
    try:
        # Get form
        form_result = db.client.table("forms")\
            .select("id, title")\
            .eq("slug", slug)\
            .eq("status", "published")\
            .execute()

        if not form_result.data:
            raise HTTPException(status_code=404, detail="Form not found")

        form = form_result.data[0]
        form_uuid = form["id"]

        # Check if student exists, create if not
        student_result = db.client.table("students")\
            .select("id")\
            .eq("email", student_info.email.lower())\
            .execute()

        if student_result.data:
            student_uuid = student_result.data[0]["id"]
        else:
            # Create new student
            new_student = db.client.table("students").insert({
                "email": student_info.email.lower(),
                "name": student_info.name
            }).execute()
            student_uuid = new_student.data[0]["id"] if new_student.data else None

        # Create session
        session_data = {
            "form_id": form_uuid,
            "student_name": student_info.name,
            "student_email": student_info.email.lower(),
            "student_id": student_uuid,
            "started_at": datetime.now().isoformat(),
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        }

        session_result = db.client.table("form_sessions").insert(session_data).execute()

        if not session_result.data:
            raise HTTPException(status_code=500, detail="Failed to create session")

        session_uuid = session_result.data[0]["id"]

        # Get form_questions with question IDs
        form_questions_result = db.client.table("form_questions")\
            .select("question_id, order_index")\
            .eq("form_id", form_uuid)\
            .order("order_index")\
            .execute()

        # Fetch full question details from questions table
        questions = []
        for fq in form_questions_result.data:
            question_result = db.client.table("questions")\
                .select("question_id, topic_id, stem, options, answer_index")\
                .eq("id", fq["question_id"])\
                .execute()

            if question_result.data:
                q = question_result.data[0]

                # Get topic name
                topic_result = db.client.table("topics")\
                    .select("name")\
                    .eq("id", q["topic_id"])\
                    .execute()

                topic_name = topic_result.data[0]["name"] if topic_result.data else "Unknown Topic"

                questions.append({
                    "id": q["question_id"],
                    "topic": topic_name,
                    "stem": q["stem"],
                    "options": q["options"],
                    "answerIndex": q["answer_index"]
                })

        return StartSessionResponse(
            session_id=str(session_uuid),
            form_title=form["title"],
            total_questions=len(questions),
            questions=questions
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error starting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{slug}/questions")
async def get_form_questions(slug: str):
    """
    Get questions for a form by slug

    Students can fetch questions after starting a session.

    Args:
        slug: Form slug

    Returns:
        List of questions for the form
    """
    try:
        # Get form by slug
        form_result = db.client.table("forms")\
            .select("id, title")\
            .eq("slug", slug)\
            .eq("status", "published")\
            .execute()

        if not form_result.data:
            raise HTTPException(status_code=404, detail="Form not found")

        form = form_result.data[0]
        form_uuid = form["id"]

        # Get form_questions with question IDs
        form_questions_result = db.client.table("form_questions")\
            .select("question_id, order_index")\
            .eq("form_id", form_uuid)\
            .order("order_index")\
            .execute()

        if not form_questions_result.data:
            return {
                "form_title": form["title"],
                "total_questions": 0,
                "questions": []
            }

        # Fetch full question details from questions table
        questions = []
        for fq in form_questions_result.data:
            question_result = db.client.table("questions")\
                .select("question_id, topic_id, stem, options, answer_index, rationale, difficulty, bloom_level")\
                .eq("id", fq["question_id"])\
                .execute()

            if question_result.data:
                q = question_result.data[0]

                # Get topic name
                topic_result = db.client.table("topics")\
                    .select("name")\
                    .eq("id", q["topic_id"])\
                    .execute()

                topic_name = topic_result.data[0]["name"] if topic_result.data else "Unknown Topic"

                questions.append({
                    "id": q["question_id"],
                    "topic": topic_name,
                    "stem": q["stem"],
                    "options": q["options"],
                    "answerIndex": q["answer_index"],
                    "rationale": q.get("rationale"),
                    "difficulty": q.get("difficulty"),
                    "bloom": q.get("bloom_level")
                })

        return {
            "form_title": form["title"],
            "total_questions": len(questions),
            "questions": questions
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error fetching questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{slug}/submit", response_model=SubmitFormResponse)
async def submit_form(slug: str, submission: SubmitFormRequest):
    """
    Submit completed form answers

    Stores all responses, calculates score, marks session complete.

    Args:
        slug: Form slug
        submission: Session ID and answers

    Returns:
        Score and completion confirmation
    """
    try:
        print(f"[FORMS] Submitting form: {slug}, session: {submission.session_id}")
        print(f"[FORMS] Received {len(submission.answers)} answers")

        # Verify session exists and get student info
        session_result = db.client.table("form_sessions")\
            .select("id, form_id, student_id, student_email")\
            .eq("id", submission.session_id)\
            .execute()

        if not session_result.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session = session_result.data[0]
        session_uuid = session["id"]
        form_uuid = session["form_id"]
        student_id = session.get("student_id")
        student_email = session.get("student_email")

        print(f"[FORMS] Session found: form={form_uuid}, student={student_id}")

        # Process each answer and store response
        correct_count = 0
        total_questions = len(submission.answers)
        responses_to_insert = []

        for answer in submission.answers:
            # Get question details from questions table
            question_result = db.client.table("questions")\
                .select("id, question_id, topic_id, answer_index, options")\
                .eq("question_id", answer.question_id)\
                .execute()

            if not question_result.data:
                print(f"[FORMS WARNING] Question not found: {answer.question_id}")
                continue

            question = question_result.data[0]
            question_uuid = question["id"]
            topic_id = question["topic_id"]
            correct_answer_index = question["answer_index"]
            options = question.get("options", [])

            # Validate selected_index is within bounds of options
            if answer.selected_index >= len(options):
                print(f"[FORMS WARNING] Invalid selected_index {answer.selected_index} for question {answer.question_id} with {len(options)} options")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid answer index {answer.selected_index} for question {answer.question_id}"
                )

            # Check if answer is correct
            is_correct = answer.selected_index == correct_answer_index
            if is_correct:
                correct_count += 1

            # Map answer index to letter (a, b, c, d)
            answer_letters = ['a', 'b', 'c', 'd', 'e', 'f']
            student_answer_letter = answer_letters[answer.selected_index] if answer.selected_index < len(answer_letters) else 'a'

            # Prepare response record
            responses_to_insert.append({
                "form_id": form_uuid,
                "student_id": student_id,
                "student_email": student_email,
                "question_id": question_uuid,
                "topic_id": topic_id,
                "selected_option_index": answer.selected_index,
                "student_answer": student_answer_letter,  # Add letter format
                "is_correct": is_correct,
                "session_id": session_uuid
            })

        # Insert all responses
        if responses_to_insert:
            print(f"[FORMS] Inserting {len(responses_to_insert)} responses")
            db.client.table("responses").insert(responses_to_insert).execute()

        # Calculate score
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0

        print(f"[FORMS] Score: {correct_count}/{total_questions} = {score:.1f}%")

        # Update session as completed
        db.client.table("form_sessions").update({
            "completed_at": datetime.now().isoformat(),
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "score_percentage": score
        }).eq("id", session_uuid).execute()

        # Link student to teacher (if teacher exists for this form)
        if student_id:
            try:
                # Get teacher_id from form
                form_teacher_result = db.client.table("forms")\
                    .select("teacher_id")\
                    .eq("id", form_uuid)\
                    .execute()

                if form_teacher_result.data and form_teacher_result.data[0].get("teacher_id"):
                    teacher_id = form_teacher_result.data[0]["teacher_id"]

                    # Check if relationship already exists
                    existing_link = db.client.table("teacher_students")\
                        .select("id")\
                        .eq("teacher_id", teacher_id)\
                        .eq("student_id", student_id)\
                        .execute()

                    # Create link if it doesn't exist (prevents duplicates)
                    if not existing_link.data:
                        db.client.table("teacher_students").insert({
                            "teacher_id": teacher_id,
                            "student_id": student_id
                        }).execute()
                        print(f"[FORMS] Linked student {student_id} to teacher {teacher_id}")
            except Exception as link_error:
                # Don't fail submission if linking fails
                print(f"[FORMS WARNING] Failed to link student to teacher: {link_error}")

        print(f"[FORMS] Form submission complete")

        # Send email with personalized resources (async, non-blocking)
        try:
            await _send_results_email(
                session_uuid=session_uuid,
                student_email=student_email,
                score_percentage=score,
                correct_answers=correct_count,
                total_questions=total_questions
            )
        except Exception as email_error:
            # Don't fail the submission if email fails
            print(f"[FORMS WARNING] Email sending failed: {email_error}")

        return SubmitFormResponse(
            session_id=str(session_uuid),
            score_percentage=score,
            correct_answers=correct_count,
            total_questions=total_questions,
            message="Thank you for completing the diagnostic! Check your email (including spam folder) for personalized study resources."
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error submitting form: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{slug}/stats")
async def get_form_stats(slug: str):
    """
    Aggregated performance stats for teacher results dashboard.
    """
    try:
        # Resolve slug to form record
        form_result = db.client.table("forms")\
            .select("id, form_id, title, status")\
            .eq("slug", slug)\
            .eq("status", "published")\
            .execute()

        if not form_result.data:
            raise HTTPException(status_code=404, detail="Form not found")

        form = form_result.data[0]
        form_uuid = form["id"]

        # Fetch topic-level stats via DB function
        stats_result = db.client.rpc("get_form_topic_stats", {
            "form_uuid": form_uuid
        }).execute()

        topic_rows = stats_result.data or []
        topics = []
        unique_students = set()

        for row in topic_rows:
            # The SQL function returns: total_questions, correct_answers, accuracy_percentage, total_responses
            total_responses = int(row.get("total_responses") or 0)
            accuracy_pct = row.get("accuracy_percentage") or 0
            try:
                accuracy_pct = float(accuracy_pct)
            except (TypeError, ValueError):
                accuracy_pct = 0.0

            topics.append({
                "topic_id": row.get("topic_id"),
                "topic_name": row.get("topic_name"),
                "num_students": total_responses,  # Total individual responses per topic
                "num_questions": int(row.get("total_questions") or 0),
                "correct_pct": accuracy_pct
            })

        # Get unique student count from form_sessions
        sessions_result = db.client.table("form_sessions")\
            .select("student_id")\
            .eq("form_id", form_uuid)\
            .not_.is_("completed_at", "null")\
            .execute()

        unique_student_count = len(set(s["student_id"] for s in (sessions_result.data or []) if s.get("student_id")))

        return {
            "form_id": form["form_id"],
            "slug": slug,
            "form_title": form["title"],
            "total_responses": unique_student_count,  # Number of students who completed the form
            "topics": topics
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FORMS] Error fetching stats for form {slug}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch form stats")


@router.get("/{form_id}/responses")
async def get_form_responses(form_id: str):
    """
    Get all responses for a form (teacher view)

    Args:
        form_id: Form UUID or form_id

    Returns:
        List of student submissions with scores
    """
    try:
        # Get all sessions for this form
        sessions = db.client.table("form_sessions")\
            .select("*")\
            .eq("form_id", form_id)\
            .order("completed_at", desc=True)\
            .execute()

        return {
            "form_id": form_id,
            "total_submissions": len(sessions.data) if sessions.data else 0,
            "submissions": sessions.data or []
        }

    except Exception as e:
        print(f"[FORMS] Error fetching responses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/all")
async def get_all_students():
    """
    Get all students who have submitted forms

    Returns:
        List of students with their submission counts
    """
    try:
        # Get all students with their submission counts
        students = db.client.table("students")\
            .select("id, email, name, created_at")\
            .order("created_at", desc=True)\
            .execute()

        if not students.data:
            return {"students": []}

        # Get submission counts for each student
        result_students = []
        for student in students.data:
            # Count completed sessions
            sessions = db.client.table("form_sessions")\
                .select("id", count="exact")\
                .eq("student_id", student["id"])\
                .not_.is_("completed_at", "null")\
                .execute()

            result_students.append({
                "id": student["id"],
                "email": student["email"],
                "name": student["name"],
                "created_at": student["created_at"],
                "submissions_count": sessions.count or 0
            })

        return {"students": result_students}

    except Exception as e:
        print(f"[FORMS] Error fetching students: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# HELPER FUNCTIONS FOR EMAIL INTEGRATION
# ============================================================

async def _send_results_email(
    session_uuid: UUID,
    student_email: str,
    score_percentage: float,
    correct_answers: int,
    total_questions: int
):
    """
    Send results email with personalized Khan Academy resources

    Args:
        session_uuid: Session UUID
        student_email: Student's email
        score_percentage: Overall score percentage
        correct_answers: Number of correct answers
        total_questions: Total questions
    """
    print(f"[EMAIL] Preparing results email for {student_email}")

    # Get student name from session
    session_result = db.client.table("form_sessions")\
        .select("student_name")\
        .eq("id", session_uuid)\
        .execute()

    student_name = "Student"
    if session_result.data and session_result.data[0].get("student_name"):
        student_name = session_result.data[0]["student_name"]

    # Identify weak topics (topics where student got less than 60% correct)
    weak_topics = await _identify_weak_topics(session_uuid)

    if not weak_topics:
        print("[EMAIL] No weak topics identified - student performed well!")
        # Still send email but with congratulatory message
        email_service = get_email_service()
        email_service.send_diagnostic_results(
            student_email=student_email,
            student_name=student_name,
            score_percentage=score_percentage,
            correct_answers=correct_answers,
            total_questions=total_questions,
            weak_topics_resources={}
        )
        return

    # Get Khan Academy resources for weak topics
    khan_service = get_khan_academy_service()
    weak_topic_names = [topic['topic_name'] for topic in weak_topics]

    print(f"[EMAIL] Finding Khan Academy resources for {len(weak_topic_names)} weak topics")
    resources = await khan_service.find_resources_for_topics(weak_topic_names)

    # Send email
    email_service = get_email_service()
    result = email_service.send_diagnostic_results(
        student_email=student_email,
        student_name=student_name,
        score_percentage=score_percentage,
        correct_answers=correct_answers,
        total_questions=total_questions,
        weak_topics_resources=resources
    )

    if result['success']:
        print(f"[EMAIL] Successfully sent results to {student_email}")
    else:
        print(f"[EMAIL ERROR] Failed to send email: {result.get('error', 'Unknown error')}")


async def _identify_weak_topics(session_uuid: UUID) -> List[Dict]:
    """
    Identify topics where student performed poorly (< 60% correct)

    Args:
        session_uuid: Session UUID

    Returns:
        List of dicts with topic info: {topic_name, correct, total, percentage}
    """
    # Get all responses for this session with topic information
    responses_result = db.client.table("responses")\
        .select("topic_id, is_correct")\
        .eq("session_id", session_uuid)\
        .execute()

    if not responses_result.data:
        return []

    # Get unique topic IDs
    topic_ids = list(set(r['topic_id'] for r in responses_result.data if r.get('topic_id')))

    if not topic_ids:
        return []

    # Get topic names
    topics_result = db.client.table("topics")\
        .select("id, name")\
        .in_("id", topic_ids)\
        .execute()

    topic_names = {t['id']: t['name'] for t in topics_result.data} if topics_result.data else {}

    # Calculate scores per topic
    topic_scores = {}
    for response in responses_result.data:
        topic_id = response.get('topic_id')
        if not topic_id:
            continue

        if topic_id not in topic_scores:
            topic_scores[topic_id] = {
                'topic_id': topic_id,
                'topic_name': topic_names.get(topic_id, 'Unknown Topic'),
                'total': 0,
                'correct': 0
            }

        topic_scores[topic_id]['total'] += 1
        if response.get('is_correct'):
            topic_scores[topic_id]['correct'] += 1

    # Identify weak topics (< 60% correct)
    weak_topics = []
    for topic_id, scores in topic_scores.items():
        percentage = (scores['correct'] / scores['total']) * 100 if scores['total'] > 0 else 0
        scores['percentage'] = percentage

        # Mark as weak if less than 60% correct
        if percentage < 60:
            weak_topics.append(scores)

    # Sort by percentage (worst first)
    weak_topics.sort(key=lambda x: x['percentage'])

    print(f"[ANALYSIS] Identified {len(weak_topics)} weak topics out of {len(topic_scores)} total")
    for topic in weak_topics:
        print(f"  • {topic['topic_name']}: {topic['percentage']:.0f}% ({topic['correct']}/{topic['total']})")

    return weak_topics
