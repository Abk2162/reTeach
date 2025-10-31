"""
Topic Mapper Service
Maps course topics to textbook sections
"""

from typing import List, Dict, Optional

from app.models.topic import Topic
from app.services.llm_service import get_llm_service
from app.utils.pdf_utils import _extract_keywords


class TopicMapper:
    """Service for mapping topics to textbook sections"""

    def __init__(self):
        self.llm = get_llm_service()

    async def auto_map_topics(
        self,
        topics: List[Topic],
        textbook: Dict
    ) -> Dict[str, List[Dict]]:
        """
        Automatically map topics to textbook sections

        Args:
            topics: List of course topics
            textbook: Textbook with parsed sections

        Returns:
            Dict mapping topic_id to list of matched sections
        """
        print(f"\n[TOPIC MAPPER] Mapping {len(topics)} topics to textbook sections...")

        mappings = {}

        for topic in topics:
            print(f"  → Mapping: {topic.name}")

            # Extract keywords from topic name
            topic_keywords = _extract_keywords(topic.name)

            # Find matching sections
            matches = self._find_matching_sections(
                topic_keywords=topic_keywords,
                sections=textbook['sections']
            )

            if matches:
                # Use Claude to pick the best match(es)
                best_matches = await self._refine_matches_with_llm(
                    topic=topic,
                    candidate_sections=matches[:5]  # Top 5 candidates
                )
                mappings[topic.id] = best_matches
                print(f"    ✓ Mapped to {len(best_matches)} section(s)")
            else:
                print(f"    ⚠ No matching sections found")
                mappings[topic.id] = []

        return mappings

    def _find_matching_sections(
        self,
        topic_keywords: List[str],
        sections: List[Dict]
    ) -> List[Dict]:
        """
        Find sections matching topic keywords

        Uses simple keyword overlap
        """
        scored_sections = []

        for section in sections:
            section_keywords = section.get('keywords', [])

            # Count keyword overlaps
            overlap = sum(1 for kw in topic_keywords if kw in section_keywords)

            if overlap > 0:
                confidence = overlap / len(topic_keywords)
                scored_sections.append({
                    **section,
                    'match_score': overlap,
                    'confidence': round(confidence, 2)
                })

        # Sort by match score
        scored_sections.sort(key=lambda x: x['match_score'], reverse=True)

        return scored_sections

    async def _refine_matches_with_llm(
        self,
        topic: Topic,
        candidate_sections: List[Dict]
    ) -> List[Dict]:
        """
        Use Claude to pick the best section(s) for a topic

        Args:
            topic: Course topic
            candidate_sections: List of candidate sections

        Returns:
            Refined list of best matching sections
        """
        if not candidate_sections:
            return []

        # Prepare section summaries for Claude
        sections_summary = "\n".join([
            f"{i+1}. Section {s.get('section_number', '?')}: {s['title']} (pages {s['page_start']}-{s.get('page_end', '?')})"
            for i, s in enumerate(candidate_sections)
        ])

        prompt = f"""Given the course topic "{topic.name}", which textbook section(s) are most relevant?

Candidate sections:
{sections_summary}

Return ONLY a JSON array of section numbers (1-based index) that are relevant:
{{
  "relevant_sections": [1, 3],
  "reasoning": "Brief explanation"
}}

Pick 1-2 most relevant sections. If none are truly relevant, return empty array."""

        try:
            result = await self.llm.generate_json(prompt, max_tokens=512)

            selected_indices = result.get('relevant_sections', [])

            # Return selected sections
            selected = []
            for idx in selected_indices:
                if 1 <= idx <= len(candidate_sections):
                    selected.append(candidate_sections[idx - 1])

            return selected

        except Exception as e:
            print(f"    [TOPIC MAPPER] LLM refinement failed: {e}")
            # Fallback: return top candidate
            return [candidate_sections[0]] if candidate_sections else []


# Global instance
_topic_mapper: Optional[TopicMapper] = None


def get_topic_mapper() -> TopicMapper:
    """Get or create global topic mapper instance"""
    global _topic_mapper
    if _topic_mapper is None:
        _topic_mapper = TopicMapper()
    return _topic_mapper
