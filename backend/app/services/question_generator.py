"""
Question Generator Service
Generates MCQ diagnostic questions using LLM
"""

from typing import List, Optional
from uuid import UUID

from app.models.question import Question, Difficulty, GenerateQuestionsRequest
from app.models.course import CourseLevel
from app.services.llm_service import get_llm_service
from app.utils.prompts import question_generation_prompt
from app.database import db


class QuestionGeneratorService:
    """Service for generating diagnostic questions"""

    def __init__(self):
        self.llm = get_llm_service()

    async def generate_questions(
        self,
        topics: List[str],
        count_per_topic: int = 5,
        difficulty: Optional[Difficulty] = None,
        course_level: Optional[CourseLevel] = None,
        context: Optional[str] = None,
    ) -> List[Question]:
        """
        Generate MCQ questions for given topics

        Args:
            topics: List of topic names
            count_per_topic: Number of questions per topic
            difficulty: Target difficulty level
            course_level: Educational level
            context: Additional context (e.g., textbook information)

        Returns:
            List of generated Question objects

        Raises:
            ValueError: If generation fails
        """
        print(f"\n[QUESTION GEN] Generating {count_per_topic} questions for {len(topics)} topics...")
        if context:
            print(f"[QUESTION GEN] Using context: {context}")

        all_questions = []
        question_counter = 1

        for topic_name in topics:
            print(f"\n[QUESTION GEN] Generating questions for topic: {topic_name}")

            try:
                # Create prompt for this topic
                prompt = question_generation_prompt(
                    topic=topic_name,
                    count=count_per_topic,
                    course_level=course_level.value if course_level else None,
                    difficulty=difficulty.value if hasattr(difficulty, 'value') else difficulty,
                    context=context,
                )

                # Call LLM
                questions_data = await self.llm.generate_json(prompt, max_tokens=4096)

                # Validate and convert to Question objects
                if not isinstance(questions_data, list):
                    raise ValueError(f"LLM response for {topic_name} is not a list")

                topic_questions = []
                for item in questions_data:
                    try:
                        # Ensure the question has the topic field set
                        if "topic" not in item or not item["topic"]:
                            item["topic"] = topic_name

                        # Renumber question IDs to be sequential
                        item["id"] = f"q_{question_counter:03d}"
                        question_counter += 1

                        question = Question(**item)

                        # Validation happens automatically in Pydantic model

                        # Quality check
                        if len(question.options) < 2 or len(question.options) > 6:
                            print(f"[QUESTION GEN WARNING] Question {question.id} has invalid number of options: {len(question.options)}")
                            continue

                        if not question.stem or len(question.stem) < 5:
                            print(f"[QUESTION GEN WARNING] Question {question.id} has invalid stem")
                            continue

                        topic_questions.append(question)

                    except Exception as e:
                        print(f"[QUESTION GEN WARNING] Skipping invalid question: {e}")
                        continue

                if not topic_questions:
                    print(f"[QUESTION GEN WARNING] No valid questions generated for {topic_name}")
                else:
                    print(f"[QUESTION GEN] Generated {len(topic_questions)} questions for {topic_name}")
                    all_questions.extend(topic_questions)

            except Exception as e:
                print(f"[QUESTION GEN ERROR] Failed to generate questions for {topic_name}: {e}")
                # Continue to next topic rather than failing completely
                continue

        if not all_questions:
            raise ValueError("No valid questions were generated for any topic")

        print(f"\n[QUESTION GEN] Successfully generated {len(all_questions)} total questions")
        return all_questions

    async def save_questions_to_db(
        self,
        questions: List[Question],
        topic_name_to_uuid: dict[str, UUID],
    ) -> List[dict]:
        """
        Save generated questions to Supabase

        Args:
            questions: List of Question objects
            topic_name_to_uuid: Mapping of topic names to their UUIDs

        Returns:
            List of inserted question records

        Raises:
            ValueError: If any questions reference unknown topics
        """
        print(f"\n[QUESTION GEN] Saving {len(questions)} questions to database...")

        # Prepare question records
        question_records = []
        for question in questions:
            # Look up topic UUID
            topic_uuid = topic_name_to_uuid.get(question.topic)
            if not topic_uuid:
                print(f"[QUESTION GEN WARNING] Unknown topic '{question.topic}' for question {question.id}")
                continue

            question_records.append({
                "question_id": question.id,
                "topic_id": str(topic_uuid),
                "stem": question.stem,
                "options": question.options,  # JSONB field
                "answer_index": question.answerIndex,
                "rationale": question.rationale,
                "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else question.difficulty,
                "bloom_level": question.bloom,
                "metadata": {},  # Extensibility
            })

        if not question_records:
            raise ValueError("No valid questions to save (all had unknown topics)")

        try:
            # Insert questions
            result = db.client.table("questions").insert(question_records).execute()
            inserted_questions = result.data

            print(f"[QUESTION GEN] Saved {len(inserted_questions)} questions")
            return inserted_questions

        except Exception as e:
            print(f"[QUESTION GEN ERROR] Failed to save questions: {e}")
            raise

    def validate_question_quality(self, question: Question) -> tuple[bool, Optional[str]]:
        """
        Validate MCQ question quality

        Args:
            question: Question to validate

        Returns:
            (is_valid, error_message)
        """
        # Check stem length
        if len(question.stem) < 10:
            return False, "Stem too short"

        # Check options count
        if len(question.options) < 2:
            return False, "Not enough options"
        if len(question.options) > 6:
            return False, "Too many options"

        # Check for duplicate options
        if len(set(question.options)) != len(question.options):
            return False, "Duplicate options"

        # Check answer index bounds
        if question.answerIndex >= len(question.options):
            return False, "Answer index out of bounds"

        # Check rationale
        if not question.rationale or len(question.rationale) < 5:
            return False, "Rationale too short"

        return True, None


# Global instance
_question_generator: Optional[QuestionGeneratorService] = None


def get_question_generator() -> QuestionGeneratorService:
    """Get or create global question generator instance"""
    global _question_generator
    if _question_generator is None:
        _question_generator = QuestionGeneratorService()
    return _question_generator
