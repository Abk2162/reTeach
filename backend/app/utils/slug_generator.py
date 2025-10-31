"""
Slug Generator Utility
Generate URL-safe unique slugs for shareable form links
"""

import secrets
import string
import re
from typing import Optional


def generate_slug(title: str, length: int = 4) -> str:
    """
    Generate a URL-safe slug from a title with random suffix

    Args:
        title: Form title (e.g., "Calculus I Diagnostic")
        length: Length of random suffix (default: 4)

    Returns:
        URL-safe slug (e.g., "calculus-i-diagnostic-a3f2")

    Examples:
        >>> generate_slug("Calculus I Diagnostic")
        'calculus-i-diagnostic-x7k2'

        >>> generate_slug("AP Biology - Cell Structure")
        'ap-biology-cell-structure-m9p4'
    """
    # Convert to lowercase
    slug = title.lower()

    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special chars
    slug = re.sub(r'[-\s]+', '-', slug)  # Replace spaces/multiple hyphens with single hyphen
    slug = slug.strip('-')  # Remove leading/trailing hyphens

    # Truncate if too long (max 50 chars before suffix)
    if len(slug) > 50:
        slug = slug[:50].rstrip('-')

    # Generate random suffix
    chars = string.ascii_lowercase + string.digits
    suffix = ''.join(secrets.choice(chars) for _ in range(length))

    return f"{slug}-{suffix}"


def is_valid_slug(slug: str) -> bool:
    """
    Check if a slug is valid format

    Args:
        slug: Slug to validate

    Returns:
        True if valid, False otherwise

    Examples:
        >>> is_valid_slug("calculus-diagnostic-a3f2")
        True

        >>> is_valid_slug("invalid slug!")
        False
    """
    # Must be lowercase alphanumeric with hyphens only
    pattern = r'^[a-z0-9]+(-[a-z0-9]+)*$'
    return bool(re.match(pattern, slug))


def sanitize_slug(slug: str) -> Optional[str]:
    """
    Sanitize a user-provided slug

    Args:
        slug: User input slug

    Returns:
        Sanitized slug or None if invalid

    Examples:
        >>> sanitize_slug("My Custom Slug")
        'my-custom-slug'

        >>> sanitize_slug("Test@#$Slug")
        'test-slug'
    """
    # Convert to lowercase and remove invalid chars
    slug = slug.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')

    if not slug or not is_valid_slug(slug):
        return None

    return slug


def generate_unique_suffix(existing_slugs: list[str], base: str, length: int = 4) -> str:
    """
    Generate a unique slug ensuring it doesn't exist in the list

    Args:
        existing_slugs: List of existing slugs to avoid
        base: Base slug (without suffix)
        length: Length of random suffix

    Returns:
        Unique slug

    Note:
        In practice, you should check database for uniqueness
        This is just for offline generation
    """
    max_attempts = 100
    for _ in range(max_attempts):
        slug = generate_slug(base, length)
        if slug not in existing_slugs:
            return slug

    # If we can't find unique slug after 100 attempts, increase length
    return generate_slug(base, length + 2)
