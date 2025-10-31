"""
AI-Based Section Mapper
Maps course topics to textbook sections using Claude AI for intelligent matching
"""

import asyncio
from typing import List, Dict, Optional
from app.services.llm_service import get_llm_service


class SectionMapper:
    """Maps topics to textbook sections using AI"""

    def __init__(self):
        self.llm = get_llm_service()

    async def map_topics_to_sections(
        self,
        topics: List[Dict],
        textbook_sections: List[Dict],
        textbook_title: str,
        prerequisites: List[str] = None
    ) -> Dict[str, List[Dict]]:
        """
        Use AI to map each topic to relevant textbook sections

        Args:
            topics: List of topic dicts with 'id' and 'name'
            textbook_sections: List of section dicts with 'title', 'page_start', 'page_end'
            textbook_title: Title of the textbook
            prerequisites: Optional list of prerequisite topics for context

        Returns:
            Dict mapping topic_id -> list of relevant sections
        """
        print(f"\n[SECTION MAPPER] Mapping {len(topics)} topics to {len(textbook_sections)} sections using AI...")

        if prerequisites:
            print(f"[SECTION MAPPER] Using prerequisites for context: {', '.join(prerequisites)}")

        topic_mappings = {}

        for i, topic in enumerate(topics):
            topic_id = topic['id']
            topic_name = topic['name']

            print(f"  → Mapping: {topic_name}")

            # Get AI to select relevant sections
            relevant_sections = await self._find_relevant_sections(
                topic_name=topic_name,
                sections=textbook_sections,
                textbook_title=textbook_title,
                prerequisites=prerequisites
            )

            if relevant_sections:
                topic_mappings[topic_id] = relevant_sections
                print(f"    ✓ Found {len(relevant_sections)} relevant section(s)")
            else:
                print(f"    ⚠ No relevant sections found")

            # Rate limiting: wait 2 seconds between AI calls to avoid rate limits
            if i < len(topics) - 1:  # Don't wait after last topic
                await asyncio.sleep(2)

        return topic_mappings

    def _keyword_filter(self, topic_name: str, sections: List[Dict], top_k: int = 50) -> List[Dict]:
        """
        Pre-filter sections using simple keyword matching to reduce AI token usage

        Args:
            topic_name: Topic to search for
            sections: All sections
            top_k: Return top K matches

        Returns:
            Filtered list of potentially relevant sections
        """
        # Extract keywords from topic name
        topic_keywords = set(topic_name.lower().split())

        scored_sections = []
        for i, section in enumerate(sections):
            title_lower = section['title'].lower()
            section_num = section.get('section_number', '').lower()

            # Simple keyword matching
            score = 0
            for keyword in topic_keywords:
                if keyword in title_lower:
                    score += 2  # Title match is strong
                if keyword in section_num:
                    score += 1

            if score > 0:
                scored_sections.append((score, i, section))

        # Sort by score and return top K
        scored_sections.sort(reverse=True, key=lambda x: x[0])

        return [(i, section) for score, i, section in scored_sections[:top_k]]

    async def _find_relevant_sections(
        self,
        topic_name: str,
        sections: List[Dict],
        textbook_title: str,
        max_sections: int = 3,
        prerequisites: List[str] = None
    ) -> List[Dict]:
        """
        Use AI to identify which sections are most relevant to a topic

        Args:
            topic_name: Name of the topic (e.g., "Kinematics")
            sections: All available sections from textbook
            textbook_title: Title of textbook for context
            max_sections: Maximum number of sections to return
            prerequisites: Optional list of prerequisite topics for context

        Returns:
            List of relevant section dicts with page ranges
        """
        # First pass: keyword filtering to reduce token usage
        filtered = self._keyword_filter(topic_name, sections, top_k=50)

        if not filtered:
            print(f"    ⚠ No keyword matches found")
            return []

        print(f"    → Pre-filtered to {len(filtered)} candidate sections")

        # Format filtered sections for AI
        section_list = []
        for i, section in filtered:
            section_info = {
                'index': i,  # Original index in full section list
                'title': section['title'],
                'page_start': section['page_start'],
                'page_end': section.get('page_end', section['page_start'])
            }
            if section.get('section_number'):
                section_info['section_number'] = section['section_number']
            section_list.append(section_info)

        # Build context string
        context = f'Textbook: "{textbook_title}"\nTopic: "{topic_name}"'
        if prerequisites:
            context += f'\nCourse Prerequisites: {", ".join(prerequisites)}'
            context += '\nNote: This topic builds on these prerequisites.'

        prompt = f"""You are helping map a course topic to relevant sections in a textbook.

{context}

Available sections ({len(section_list)} total):
{self._format_sections_for_prompt(section_list)}

Task: Identify which sections are most relevant for learning about "{topic_name}".

Rules:
1. Select 1-3 most relevant sections
2. Prioritize sections that directly cover the topic
3. Choose sections with reasonable page ranges (3-15 pages ideal)
4. If no sections are clearly relevant, return empty array
5. ONLY return the JSON object, no explanatory text before or after

Return ONLY this JSON structure (no other text):
{{
  "relevant_sections": [
    {{"index": 5, "relevance": "Directly covers fundamentals", "confidence": "high"}},
    {{"index": 12, "relevance": "Advanced applications", "confidence": "medium"}}
  ]
}}
"""

        try:
            result = await self.llm.generate_json(prompt, max_tokens=1024)

            # Convert AI results back to full section objects
            relevant_sections = []
            for match in result.get('relevant_sections', [])[:max_sections]:
                idx = match['index']
                if idx < len(sections):
                    section = sections[idx].copy()
                    section['relevance'] = match.get('relevance', '')
                    section['confidence'] = match.get('confidence', 'medium')
                    relevant_sections.append(section)

            return relevant_sections

        except Exception as e:
            print(f"    ✗ Error in AI mapping: {e}")
            return []

    def _format_sections_for_prompt(self, sections: List[Dict]) -> str:
        """Format sections as a numbered list for the AI prompt"""
        lines = []
        for section in sections:
            pages = f"{section['page_start']}-{section['page_end']}"
            section_num = section.get('section_number', '')
            if section_num:
                lines.append(f"{section['index']}. [{section_num}] {section['title']} (pages {pages})")
            else:
                lines.append(f"{section['index']}. {section['title']} (pages {pages})")
        return '\n'.join(lines)


# Global instance
_section_mapper: Optional[SectionMapper] = None


def get_section_mapper() -> SectionMapper:
    """Get or create global section mapper instance"""
    global _section_mapper
    if _section_mapper is None:
        _section_mapper = SectionMapper()
    return _section_mapper
