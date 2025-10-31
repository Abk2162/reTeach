"""
Textbook Parser Service
Register textbooks and extract structure (ToC, chapters, sections) with caching
"""

from typing import List, Dict, Optional
from uuid import uuid4
from pathlib import Path
import json
import hashlib
from datetime import datetime

from app.models.resource import Resource, ResourceType
from app.utils.pdf_utils import parse_textbook_structure, get_pdf_metadata, extract_text_from_pdf
from app.database import db

# Cache directory for textbook structures
CACHE_DIR = Path(__file__).parent.parent.parent / ".cache" / "textbooks"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class TextbookParser:
    """Service for parsing and registering textbooks"""

    def _get_cache_key(self, pdf_path: str) -> str:
        """Generate cache key from PDF path and file modification time"""
        path_obj = Path(pdf_path)
        if not path_obj.exists():
            return None

        # Use file path + modification time for cache key
        mtime = path_obj.stat().st_mtime
        key_str = f"{pdf_path}_{mtime}"
        return hashlib.md5(key_str.encode()).hexdigest()[:16]

    def _read_cache(self, pdf_path: str) -> Optional[Dict]:
        """Read cached textbook structure"""
        cache_key = self._get_cache_key(pdf_path)
        if not cache_key:
            return None

        cache_file = CACHE_DIR / f"{cache_key}.json"
        if not cache_file.exists():
            return None

        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
            print(f"[TEXTBOOK CACHE HIT] Using cached structure for textbook")
            return data
        except Exception as e:
            print(f"[TEXTBOOK CACHE ERROR] Failed to read: {e}")
            return None

    def _write_cache(self, pdf_path: str, textbook_data: Dict):
        """Write textbook structure to cache"""
        cache_key = self._get_cache_key(pdf_path)
        if not cache_key:
            return

        cache_file = CACHE_DIR / f"{cache_key}.json"

        try:
            # Add cache metadata
            cache_data = {
                **textbook_data,
                'cached_at': datetime.now().isoformat(),
                'cache_version': '1.0'
            }

            with open(cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)

            print(f"[TEXTBOOK CACHE WRITE] Cached structure with {len(textbook_data['sections'])} sections")
        except Exception as e:
            print(f"[TEXTBOOK CACHE ERROR] Failed to write: {e}")

    async def register_textbook(
        self,
        pdf_path: str,
        title: Optional[str] = None,
        subject: Optional[str] = None
    ) -> Dict:
        """
        Register a new textbook in the library with caching

        Args:
            pdf_path: Path to textbook PDF
            title: Optional title (defaults to filename)
            subject: Optional subject (e.g., "Calculus")

        Returns:
            Dict with textbook info and parsed structure
        """
        print(f"\n[TEXTBOOK PARSER] Registering textbook: {pdf_path}")

        # Check cache first
        cached_data = self._read_cache(pdf_path)
        if cached_data:
            # Update title if provided
            if title:
                cached_data['title'] = title
            print(f"\n[TEXTBOOK PARSER] ✓ Loaded from cache: {cached_data['title']}")
            print(f"[TEXTBOOK PARSER]   Pages: {cached_data['total_pages']}")
            print(f"[TEXTBOOK PARSER]   Sections: {len(cached_data['sections'])}")
            print(f"[TEXTBOOK PARSER]   Method: {cached_data['parsing_method']}")
            return cached_data

        # Not in cache - parse the textbook
        print(f"[TEXTBOOK PARSER] Cache miss - parsing textbook structure...")

        # Extract metadata
        metadata = get_pdf_metadata(pdf_path)

        # Use provided title or fallback to PDF title/filename
        final_title = title or metadata['title']

        # Parse structure (this is the slow part - 716 sections)
        structure = parse_textbook_structure(pdf_path)

        # Prepare textbook data
        textbook_data = {
            'id': str(uuid4()),
            'title': final_title,
            'file_path': pdf_path,
            'total_pages': metadata['total_pages'],
            'file_size_mb': metadata['file_size_mb'],
            'parsed': True,
            'parsing_method': structure['parsing_method'],
            'sections': structure['sections']
        }

        # Cache the structure
        self._write_cache(pdf_path, textbook_data)

        print(f"\n[TEXTBOOK PARSER] ✓ Registered: {final_title}")
        print(f"[TEXTBOOK PARSER]   Pages: {metadata['total_pages']}")
        print(f"[TEXTBOOK PARSER]   Sections: {len(structure['sections'])}")
        print(f"[TEXTBOOK PARSER]   Method: {structure['parsing_method']}")

        return textbook_data

    def get_section_by_keywords(
        self,
        textbook: Dict,
        keywords: List[str],
        top_k: int = 3
    ) -> List[Dict]:
        """
        Find sections matching keywords

        Args:
            textbook: Textbook dict with sections
            keywords: List of keywords to search
            top_k: Return top K matches

        Returns:
            List of matching sections with scores
        """
        sections = textbook.get('sections', [])
        scored_sections = []

        keywords_lower = [k.lower() for k in keywords]

        for section in sections:
            section_keywords = section.get('keywords', [])

            # Count keyword matches
            match_count = sum(1 for k in keywords_lower if k in section_keywords)

            if match_count > 0:
                confidence = match_count / len(keywords_lower)
                scored_sections.append({
                    **section,
                    'match_count': match_count,
                    'confidence': round(confidence, 2)
                })

        # Sort by match count (descending)
        scored_sections.sort(key=lambda x: x['match_count'], reverse=True)

        return scored_sections[:top_k]


# Global instance
_textbook_parser: Optional[TextbookParser] = None


def get_textbook_parser() -> TextbookParser:
    """Get or create global textbook parser instance"""
    global _textbook_parser
    if _textbook_parser is None:
        _textbook_parser = TextbookParser()
    return _textbook_parser
