"""
PDF Utilities
Functions for extracting text and structure from PDF files
"""

from pathlib import Path
from typing import List, Dict, Optional, Tuple
import re


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract all text from a PDF file

    Args:
        pdf_path: Path to PDF file

    Returns:
        Extracted text as string

    Raises:
        FileNotFoundError: If PDF doesn't exist
        Exception: If extraction fails
    """
    try:
        import pdfplumber
    except ImportError:
        raise ImportError("pdfplumber not installed. Run: pip install pdfplumber")

    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    text_parts = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"[PDF] Extracting text from {len(pdf.pages)} pages...")

            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    text_parts.append(text)

                if page_num % 50 == 0:
                    print(f"[PDF] Processed {page_num}/{len(pdf.pages)} pages...")

    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {e}")

    full_text = "\n\n".join(text_parts)
    print(f"[PDF] ✓ Extracted {len(full_text)} characters from PDF")

    return full_text


def parse_textbook_structure(pdf_path: str, max_pages_to_scan: int = 50) -> Dict:
    """
    Parse textbook structure by extracting headers from pages

    Strategy:
    1. Look for ToC (Table of Contents) in first 20 pages
    2. If found, parse ToC for chapter/section structure
    3. If not found, scan pages for large text (headers)

    Args:
        pdf_path: Path to textbook PDF
        max_pages_to_scan: Max pages to scan for headers (default: 50)

    Returns:
        Dict with textbook structure
    """
    try:
        import pdfplumber
    except ImportError:
        raise ImportError("pdfplumber not installed. Run: pip install pdfplumber")

    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    print(f"\n[TEXTBOOK PARSER] Analyzing textbook structure...")
    print(f"[TEXTBOOK PARSER] File: {pdf_file.name}")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"[TEXTBOOK PARSER] Total pages: {total_pages}")

            # Try to find and parse ToC first
            toc_data = _extract_toc(pdf)

            if toc_data:
                print(f"[TEXTBOOK PARSER] ✓ Found Table of Contents with {len(toc_data)} entries")
                return {
                    'title': pdf_file.stem,
                    'total_pages': total_pages,
                    'parsing_method': 'toc',
                    'sections': toc_data
                }

            # Fallback: Scan pages for headers
            print(f"[TEXTBOOK PARSER] ToC not found, scanning pages for headers...")
            header_data = _scan_for_headers(pdf, max_pages_to_scan)

            print(f"[TEXTBOOK PARSER] ✓ Found {len(header_data)} sections via header scanning")
            return {
                'title': pdf_file.stem,
                'total_pages': total_pages,
                'parsing_method': 'headers',
                'sections': header_data
            }

    except Exception as e:
        raise Exception(f"Failed to parse textbook structure: {e}")


def _extract_toc(pdf) -> Optional[List[Dict]]:
    """
    Try to extract Table of Contents from first 20 pages

    Looks for patterns like:
    - "Chapter 1: Title .................. 10"
    - "1.1 Section Title .................. 15"
    - "1. Topic Name    page 10"
    """
    print("[TEXTBOOK PARSER] Searching for Table of Contents...")

    toc_entries = []

    # Common ToC indicators
    toc_keywords = ['table of contents', 'contents', 'overview']

    # Scan first 20 pages
    for page_num, page in enumerate(pdf.pages[:20], 1):
        text = page.extract_text()
        if not text:
            continue

        text_lower = text.lower()

        # Check if this looks like a ToC page
        is_toc_page = any(keyword in text_lower for keyword in toc_keywords)

        if is_toc_page or page_num > 2:  # Start checking after page 2
            # Try to parse ToC entries
            entries = _parse_toc_text(text, page_num)
            if entries:
                toc_entries.extend(entries)

    # Filter and validate entries
    valid_entries = []
    for entry in toc_entries:
        # Must have page number and reasonable title
        if entry.get('page_start') and entry.get('title') and len(entry['title']) > 2:
            valid_entries.append(entry)

    # If we found at least 5 entries, assume we have a valid ToC
    if len(valid_entries) >= 5:
        return valid_entries

    return None


def _parse_toc_text(text: str, page_num: int) -> List[Dict]:
    """
    Parse ToC text to extract chapter/section entries

    Patterns to match:
    - "Chapter 1: Introduction .......... 10"
    - "1. Introduction    10"
    - "1.1 Basic Concepts    15"
    """
    entries = []

    # Pattern: Captures section number, title, and page
    patterns = [
        # "Chapter 1: Title .... 10" or "1. Title .... 10"
        r'(?:Chapter\s+)?(\d+(?:\.\d+)*)[:\.\s]+([^\.]{3,}?)[\s\.]{2,}(\d+)',
        # "1.1 Title    page 10" or "1.1 Title (10)"
        r'(\d+\.\d+)\s+([^(\n]{3,}?)[\s\(]*(?:page\s+)?(\d+)',
        # Simpler: "Chapter 1    10"
        r'(?:Chapter\s+)?(\d+)\s+([^0-9\n]{5,}?)\s+(\d+)$',
    ]

    lines = text.split('\n')

    for line in lines:
        line = line.strip()
        if not line or len(line) < 10:
            continue

        for pattern in patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                section_number = match.group(1)
                title = match.group(2).strip()
                page = match.group(3)

                # Clean title (remove excessive dots/spaces)
                title = re.sub(r'[\s\.]{3,}', ' ', title).strip()

                # Validate
                if len(title) > 2 and page.isdigit():
                    # Determine level (0=book, 1=chapter, 2=section, etc.)
                    level = section_number.count('.') + 1

                    entries.append({
                        'section_number': section_number,
                        'title': title,
                        'page_start': int(page),
                        'page_end': None,  # Will be filled later
                        'level': level,
                        'keywords': _extract_keywords(title)
                    })
                    break

    # Fill in page_end values
    for i in range(len(entries) - 1):
        entries[i]['page_end'] = entries[i+1]['page_start'] - 1

    # Last entry: estimate end as +10 pages
    if entries:
        entries[-1]['page_end'] = entries[-1]['page_start'] + 10

    return entries


def _scan_for_headers(pdf, max_pages: int) -> List[Dict]:
    """
    Scan pages for headers by detecting large/bold text

    Fallback when ToC is not available
    """
    print(f"[TEXTBOOK PARSER] Scanning first {max_pages} pages for headers...")

    sections = []
    current_section = None
    section_counter = 1

    pages_to_scan = min(max_pages, len(pdf.pages))

    for page_num, page in enumerate(pdf.pages[:pages_to_scan], 1):
        # Extract text with layout info
        text = page.extract_text()
        if not text:
            continue

        # Look for chapter/section patterns
        lines = text.split('\n')

        for line in lines:
            line = line.strip()

            # Skip short lines
            if len(line) < 5:
                continue

            # Check if line looks like a header
            is_header = _is_likely_header(line)

            if is_header:
                # Save previous section
                if current_section:
                    current_section['page_end'] = page_num - 1
                    sections.append(current_section)

                # Start new section
                current_section = {
                    'section_number': str(section_counter),
                    'title': line[:100],  # Limit title length
                    'page_start': page_num,
                    'page_end': None,
                    'level': 1,  # Assume chapter level
                    'keywords': _extract_keywords(line)
                }
                section_counter += 1

    # Save last section
    if current_section:
        current_section['page_end'] = pages_to_scan
        sections.append(current_section)

    return sections


def _is_likely_header(line: str) -> bool:
    """
    Heuristics to detect if a line is likely a chapter/section header
    """
    # All caps (but not too long)
    if line.isupper() and 5 < len(line) < 60:
        return True

    # Starts with "Chapter"
    if re.match(r'^Chapter\s+\d+', line, re.IGNORECASE):
        return True

    # Starts with section number like "1.", "1.1", "Section 1"
    if re.match(r'^(?:Section\s+)?\d+(?:\.\d+)*[\.\:\s]', line):
        return True

    # Short line that's not all lowercase (likely title case)
    if 10 < len(line) < 80 and not line.islower():
        # Check if it looks like a title (has uppercase letters)
        if any(c.isupper() for c in line):
            return True

    return False


def _extract_keywords(title: str) -> List[str]:
    """
    Extract keywords from a section title

    Simple approach: lowercase, split by spaces, remove short words
    """
    # Lowercase and clean
    clean_title = re.sub(r'[^\w\s]', ' ', title.lower())

    # Split and filter
    words = clean_title.split()

    # Remove common stop words and short words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    keywords = [w for w in words if len(w) > 2 and w not in stop_words]

    return keywords[:10]  # Limit to 10 keywords


def get_pdf_metadata(pdf_path: str) -> Dict:
    """
    Extract metadata from PDF
    """
    try:
        import pdfplumber
    except ImportError:
        raise ImportError("pdfplumber not installed")

    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    with pdfplumber.open(pdf_path) as pdf:
        metadata = pdf.metadata or {}

        return {
            'title': metadata.get('Title', pdf_file.stem),
            'author': metadata.get('Author', 'Unknown'),
            'total_pages': len(pdf.pages),
            'file_size_mb': round(pdf_file.stat().st_size / (1024 * 1024), 2)
        }
