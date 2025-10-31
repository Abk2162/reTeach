"""
Diagnostic Survey Router
Endpoints for creating diagnostic surveys and analyzing responses
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.models.survey import GenerateSurveyRequest, GenerateSurveyResponse, Survey, SurveyQuestion, CognitiveLevel
from app.services.llm_service import get_llm_service

router = APIRouter(prefix="/api/survey", tags=["surveys"])


@router.post("/generate", response_model=GenerateSurveyResponse)
async def generate_survey(request: GenerateSurveyRequest):
    """
    Generate diagnostic survey with Yes/No questions for topics

    Args:
        request: GenerateSurveyRequest with topic IDs and questions per topic

    Returns:
        GenerateSurveyResponse with generated survey
    """
    try:
        llm = get_llm_service()
        all_questions = []
        question_counter = 1

        for topic_id in request.topics:
            # Generate yes/no questions for this topic
            prompt = f"""Generate {request.questions_per_topic} simple Yes/No diagnostic questions for topic: "{topic_id}"

These questions should:
1. Be answerable with just Yes or No
2. Test basic understanding at different levels
3. Be clear and unambiguous
4. Help identify if student knows this topic

Return ONLY a JSON array:
[
  {{
    "text": "Do you understand how to...",
    "cognitive_level": "understand"
  }}
]

Cognitive levels: remember, understand, apply, analyze
"""

            questions_data = await llm.generate_json(prompt, max_tokens=1024)

            for q in questions_data:
                all_questions.append(
                    SurveyQuestion(
                        id=f"sq_{question_counter:03d}",
                        topic_id=topic_id,
                        text=q["text"],
                        cognitive_level=CognitiveLevel(q.get("cognitive_level", "understand"))
                    )
                )
                question_counter += 1

        survey = Survey(
            id=f"survey_{len(all_questions)}q",
            course_id="default",
            title="Diagnostic Survey",
            description="Assess your current knowledge",
            questions=all_questions,
            total_questions=len(all_questions)
        )

        return GenerateSurveyResponse(survey=survey)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate survey: {str(e)}"
        )
