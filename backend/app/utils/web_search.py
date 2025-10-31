"""
Web Search Utilities
Search for Khan Academy resources with caching
"""

import json
import hashlib
from pathlib import Path
from typing import List, Dict
from datetime import datetime, timedelta


# Cache directory for Khan Academy URLs
CACHE_DIR = Path(__file__).parent.parent.parent / ".cache" / "khan_academy"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Cache expiry: 30 days
CACHE_EXPIRY_DAYS = 30


def _get_cache_key(topic: str) -> str:
    """Generate cache key for a topic"""
    normalized = topic.lower().strip()
    return hashlib.md5(normalized.encode()).hexdigest()[:8]


def _read_cache(topic: str) -> List[Dict]:
    """Read Khan Academy resources from cache"""
    cache_key = _get_cache_key(topic)
    cache_file = CACHE_DIR / f"{cache_key}.json"

    if not cache_file.exists():
        return []

    try:
        with open(cache_file, 'r') as f:
            data = json.load(f)

        # Check expiry
        cached_time = datetime.fromisoformat(data['cached_at'])
        if datetime.now() - cached_time > timedelta(days=CACHE_EXPIRY_DAYS):
            print(f"    [CACHE EXPIRED] Khan Academy cache for '{topic}'")
            return []

        print(f"    [CACHE HIT] Using cached Khan Academy resources for '{topic}'")
        return data['resources']

    except Exception as e:
        print(f"    [CACHE ERROR] Failed to read cache: {e}")
        return []


def _write_cache(topic: str, resources: List[Dict]):
    """Write Khan Academy resources to cache"""
    cache_key = _get_cache_key(topic)
    cache_file = CACHE_DIR / f"{cache_key}.json"

    try:
        data = {
            'topic': topic,
            'cached_at': datetime.now().isoformat(),
            'resources': resources
        }

        with open(cache_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"    [CACHE WRITE] Cached {len(resources)} Khan Academy resources for '{topic}'")

    except Exception as e:
        print(f"    [CACHE ERROR] Failed to write cache: {e}")


async def search_khan_academy(topic: str, max_results: int = 3) -> List[Dict]:
    """
    Search for Khan Academy resources on a topic

    Args:
        topic: Topic to search for (e.g., "Algebra", "Calculus")
        max_results: Maximum number of results to return

    Returns:
        List of Khan Academy resource dicts with type, title, url, estimated_minutes
    """
    # Check cache first
    cached = _read_cache(topic)
    if cached:
        return cached[:max_results]

    # If not in cache, use AI with web search to find resources
    try:
        from app.services.llm_service import get_llm_service

        llm = get_llm_service()

        # Use Claude to search knowledge base for Khan Academy URLs
        prompt = f"""Find 2-3 specific Khan Academy resources for learning about "{topic}".

IMPORTANT:
1. Provide REAL, working Khan Academy URLs from your training data (https://www.khanacademy.org/...)
2. Only return URLs you are confident exist
3. Include a mix of articles/videos and practice exercises if available
4. Estimate time in minutes for each resource
5. ONLY return the JSON object, no other text

Return ONLY this JSON (no other text):
{{
  "resources": [
    {{
      "type": "khan_academy",
      "title": "Clear descriptive title",
      "url": "https://www.khanacademy.org/specific/path/to/resource",
      "estimated_minutes": 20
    }}
  ]
}}

If you cannot find confident matches, return an empty array.
"""

        result = await llm.generate_json(prompt, max_tokens=1024)
        resources = result.get('resources', [])

        # Clean and deduplicate URLs
        seen_urls = set()
        unique_resources = []
        for res in resources:
            url = res.get('url', '')

            # Clean Khan Academy URLs - remove internal encoding flags
            if 'khanacademy.org' in url:
                # Remove x2f8bb... style internal IDs from URLs
                import re
                # Pattern: /x[0-9a-f]{8,}:
                url = re.sub(r'/x[0-9a-f]{8,}:', '/', url)
                # If URL becomes too short or broken, skip it
                if url.count('/') < 4:  # Minimum valid Khan URL depth
                    continue
                res['url'] = url

            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_resources.append(res)

        # Cache the results
        if unique_resources:
            _write_cache(topic, unique_resources)

        return unique_resources[:max_results]

    except Exception as e:
        print(f"    ✗ Error searching Khan Academy: {e}")
        return []
