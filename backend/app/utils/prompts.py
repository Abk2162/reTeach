"""
LLM Prompt Templates
Centralized prompt definitions for Claude API
"""

from typing import Optional, List


def topic_extraction_prompt(
    syllabus_text: str,
    course_level: Optional[str] = None,
    prerequisites: Optional[List[str]] = None,
    candidate_sections: Optional[List[str]] = None
) -> str:
    """
    Prompt for extracting PREREQUISITE topics from a syllabus

    This extracts what students need to KNOW BEFORE taking the course,
    NOT the topics taught IN the course.

    Args:
        syllabus_text: The course syllabus text
        course_level: Educational level (hs, ug, grad)
        prerequisites: Explicit prerequisites detected in syllabus
        candidate_sections: Ignored (not used for prerequisites)

    Returns:
        Formatted prompt string for LLM
    """
    level_context = f"Course level: {course_level.upper()} (high school/undergraduate/graduate). " if course_level else ""

    return f"""You are analyzing a course syllabus to identify PREREQUISITE knowledge that students must have BEFORE taking this course.

{level_context}

Your task: Extract 6-12 specific prerequisite topics that students are expected to already know on day 1 of this course.

CRITICAL RULES:
1. Extract ONLY prerequisites (prior knowledge required) - NOT topics taught in the course
2. Look for the "Prerequisites:" section in the syllabus
3. Infer foundational skills from course content (e.g., if course uses calculus, then calculus is a prerequisite)
4. Break down broad prerequisites into specific testable skills
5. Order topics from most fundamental to most advanced

EXAMPLE for an AP Physics course:
- "Algebra" → Break into: "Linear equations", "Quadratic equations", "Systems of equations"
- "Trigonometry" → Break into: "Right triangle trigonometry", "Unit circle", "Trigonometric identities"
- "Calculus" → Break into: "Derivatives", "Integrals", "Chain rule"

DO NOT INCLUDE course content like:
- Topics listed under "Course content", "Units covered", "Specific topics include"
- Labs, assignments, or activities
- Skills that will be taught during the course

Return ONLY a JSON array with this EXACT structure:
[
  {{
    "id": "t_001",
    "name": "Linear equations and inequalities",
    "weight": 1.0,
    "prereqs": []
  }},
  {{
    "id": "t_002",
    "name": "Quadratic equations and graphing",
    "weight": 1.2,
    "prereqs": ["t_001"]
  }},
  {{
    "id": "t_003",
    "name": "Right triangle trigonometry",
    "weight": 1.5,
    "prereqs": ["t_001"]
  }},
  {{
    "id": "t_004",
    "name": "Derivatives and differentiation",
    "weight": 2.0,
    "prereqs": ["t_002"]
  }}
]

Field requirements:
- "id": Sequential like "t_001", "t_002", etc.
- "name": Specific, testable prerequisite skill (not vague like "math basics")
- "weight": Importance 0.8-2.0 (higher = more critical for success)
- "prereqs": Array of topic IDs that must be learned first (can be empty for foundational topics)

Output ONLY the JSON array. No markdown, no explanations, no extra text.

SYLLABUS:
{syllabus_text[:4000]}"""


def question_generation_prompt(
    topic: str,
    count: int,
    course_level: Optional[str] = None,
    difficulty: Optional[str] = None,
    context: Optional[str] = None,
) -> str:
    """
    Prompt for generating self-assessment survey items for a topic.
    """
    level_context = f"Audience: {course_level}. " if course_level else ""
    context_note = f"\nContext: {context}\n" if context else ""

    return f"""Create {count} brief self-assessment survey items for the topic "{topic}".

{level_context}{context_note}

Each item should be phrased as a learner-facing statement beginning with "I can...", "I know how to...", or "I understand...".
Focus on concrete skills for this topic. Avoid generic phrasing.

Return ONLY a JSON array of question objects with this EXACT structure:
[
  {{
    "id": "q_001",
    "topic": "{topic}",
    "stem": "I can convert between SI base and derived units without help.",
    "options": ["Yes", "Maybe", "No"],
    "answerIndex": 0,
    "rationale": "Self-assessment: choose Yes if you feel confident, Maybe if you need more practice, or No if you need support.",
    "difficulty": "med",
    "bloom": "understand"
  }}
]

Rules:
- Options MUST be exactly ["Yes", "Maybe", "No"] in that order.
- answerIndex MUST be 0 (representing the desired mastery state "Yes").
- difficulty MUST be EXACTLY one of: "easy", "med", "hard" (use "med" NOT "medium")
- bloom level must be one of: "remember", "understand", "apply", "analyze", "evaluate", "create"
- Provide a short, encouraging rationale indicating this is a self-assessment.
- Keep stems specific to the skills within the topic; reuse wording from the syllabus when possible.
- Use sequential IDs: q_001, q_002, etc.
- Return ONLY the JSON array, no other text or markdown formatting.

Generate {count} learner-facing survey statements now:"""


def fallback_topics_from_headings(syllabus_text: str) -> list:
    """
    Fallback: Extract topics from markdown/text headings
    Used when LLM fails

    Args:
        syllabus_text: The syllabus text

    Returns:
        List of topic dictionaries
    """
    import re

    # Try to find headings (markdown # or numbered lists)
    patterns = [
        r'^#{1,3}\s+(.+)$',  # Markdown headings
        r'^\d+\.\s+(.+)$',    # Numbered lists
        r'^[A-Z][^.!?]*:',    # Lines ending with colon
    ]

    topics = []
    seen = set()
    topic_id = 1

    for line in syllabus_text.split('\n'):
        line = line.strip()
        if not line or len(line) < 3:
            continue

        for pattern in patterns:
            match = re.match(pattern, line, re.MULTILINE)
            if match:
                topic_name = match.group(1).strip().rstrip(':')
                # Clean up
                topic_name = re.sub(r'\s+', ' ', topic_name)

                if topic_name and topic_name not in seen and len(topic_name) < 100:
                    seen.add(topic_name)
                    topics.append({
                        "id": f"t_{topic_id:03d}",
                        "name": topic_name,
                        "weight": 1.0,
                        "prereqs": []
                    })
                    topic_id += 1

                    if len(topics) >= 8:
                        return topics
                break

    # If we found nothing, create a generic topic
    if not topics:
        topics = [{
            "id": "t_001",
            "name": "General Concepts",
            "weight": 1.0,
            "prereqs": []
        }]

    return topics
