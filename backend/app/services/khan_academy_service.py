"""
Khan Academy Resource Finder Service
Uses LLM to find relevant Khan Academy links for topics
"""

from typing import List, Dict, Optional
from app.services.llm_service import get_llm_service


class KhanAcademyService:
    """Service for finding Khan Academy resources for topics"""

    def __init__(self):
        self.llm = get_llm_service()

    async def find_resources_for_topics(
        self,
        topic_names: List[str],
        subject_context: str = "Physics"
    ) -> Dict[str, Dict[str, any]]:
        """
        Find Khan Academy resources for a list of topics

        Args:
            topic_names: List of topic names to find resources for
            subject_context: Subject area (e.g., "Physics", "Math")

        Returns:
            Dict mapping topic name to resource info with keys:
                - khan_academy_url: Direct link to Khan Academy content
                - textbook_pages: Suggested textbook page range
                - description: Brief description of the resource
        """
        if not topic_names:
            return {}

        print(f"\n[KHAN ACADEMY] Finding resources for {len(topic_names)} topics...")

        topics_list = "\n".join([f"- {topic}" for topic in topic_names])

        prompt = f"""You are helping students learn {subject_context}. Given these topics they struggled with, find the most relevant Khan Academy resources.

Topics:
{topics_list}

For each topic, provide:
1. The most relevant Khan Academy URL (be specific - use actual Khan Academy article/video URLs)
2. Estimated textbook page ranges (if this were a standard {subject_context} textbook)
3. A brief helpful description

Return ONLY valid JSON in this exact format:
{{
  "resources": [
    {{
      "topic": "Newton's Laws",
      "khan_academy_url": "https://www.khanacademy.org/science/physics/forces-newtons-laws",
      "textbook_pages": "120-145",
      "description": "Review Newton's three laws of motion with interactive examples"
    }}
  ]
}}

IMPORTANT:
- Use real Khan Academy URLs from khanacademy.org
- Be specific with URLs (target the exact topic, not just the subject homepage)
- For {subject_context} topics, focus on the most foundational resources
- Keep descriptions under 100 characters
"""

        try:
            result = await self.llm.generate_json(prompt, max_tokens=2048)

            resources_list = result.get('resources', [])

            # Convert list to dict keyed by topic name
            resources_dict = {}
            for resource in resources_list:
                topic = resource.get('topic', '')
                if topic:
                    resources_dict[topic] = {
                        'khan_academy_url': resource.get('khan_academy_url', ''),
                        'textbook_pages': resource.get('textbook_pages', 'N/A'),
                        'description': resource.get('description', 'Study resource for this topic')
                    }

            print(f"[KHAN ACADEMY] Found resources for {len(resources_dict)} topics")
            return resources_dict

        except Exception as e:
            print(f"[KHAN ACADEMY ERROR] Failed to find resources: {e}")
            # Fallback: return generic Khan Academy physics page for each topic
            return {
                topic: {
                    'khan_academy_url': 'https://www.khanacademy.org/science/physics',
                    'textbook_pages': 'N/A',
                    'description': 'Khan Academy Physics resources'
                }
                for topic in topic_names
            }


# Global instance
_khan_academy_service: Optional[KhanAcademyService] = None


def get_khan_academy_service() -> KhanAcademyService:
    """Get or create global Khan Academy service instance"""
    global _khan_academy_service
    if _khan_academy_service is None:
        _khan_academy_service = KhanAcademyService()
    return _khan_academy_service
