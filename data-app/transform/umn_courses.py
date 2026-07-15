import re
from mappings import libed_mapping
from models import Course

libed_attr = {}
for k, v in libed_mapping.items():
    m = re.match(r"(\w+) - (\S+)", k)
    if m:
        libed_attr[(m.group(1), m.group(2))] = v


def normalize_courses(raw_courses):
    """Convert from umn classSearch to Course objects. Coursedog's courseGroupId for
    a course is the ClassSearch course_id with "1" appended"""
    courses = []
    seen = set()
    for course in raw_courses:
        course_id = course.get("course_id")
        dept = (course.get("subject") or {}).get("subject_id")
        course_num = course.get("catalog_number")
        if not course_id or not dept or not course_num:
            continue
        key = (dept, course_num)
        if key in seen:
            continue
        seen.add(key)

        libeds = []
        for attr in course.get("course_attributes") or []:
            name = libed_attr.get((attr.get("family"), attr.get("attribute_id")))
            if name and name not in libeds:
                libeds.append(name)
        cred_min = course.get("credits_minimum")
        cred_max = course.get("credits_maximum")
        courses.append(
            Course(
                id=course_id + "1",
                dept=dept,
                course_num=course_num,
                name=course.get("title") or "",
                descr=course.get("description") or None,
                cred_min=float(cred_min) if cred_min is not None else None,
                cred_max=float(cred_max) if cred_max is not None else None,
                active=True,
                libeds=libeds,
            )
        )
    return courses
