"""Course-related models"""

from enum import Enum


class CourseLevel(str, Enum):
    """Educational level"""
    HIGH_SCHOOL = "hs"
    UNDERGRADUATE = "ug"
    GRADUATE = "grad"
