import os
import dotenv
import asyncio
from fetch.umn_courses import current_term, fetch_all_courses
from fetch.coursedog import (
    fetch_catalogs,
    fetch_all_programs,
    fetch_courses_by_group_ids,
)
from transform.coursedog import normalize_programs, backfill_course
from transform.umn_courses import normalize_courses
from models import iter_course_ids, remap_course_ids
from db.write import build_db

db_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "procesedData.db")
)


def merge_courses(umn_courses, coursedog_backfill):
    by_key = {(c.dept, c.course_num): c for c in umn_courses if c.dept and c.course_num}
    ids = {c.id for c in umn_courses}
    merged = list(umn_courses)
    alias = {}
    added = 0

    for course in coursedog_backfill:
        if course.id in ids:
            continue
        key = (course.dept, course.course_num)
        if course.dept and course.course_num and key in by_key:
            existing = by_key[key]
            alias[course.id] = existing.id
            continue
        merged.append(course)
        ids.add(course.id)
        added += 1
        if course.dept and course.course_num:
            by_key[key] = course
    return merged, alias


def main():
    dotenv.load_dotenv()
    term = current_term()
    token = os.environ.get("coursedog_token", "")
    if not token:
        raise Exception("coursedog_token not in env")

    raw_courses = asyncio.run(fetch_all_courses(term))
    catalog = asyncio.run(fetch_catalogs(token))
    raw_programs = asyncio.run(fetch_all_programs(token, catalog["effectiveStartDate"]))
    courses = normalize_courses(raw_courses)
    programs = normalize_programs(raw_programs)

    referenced_courses = {
        cid
        for prog in programs
        for sec in prog.sections
        for cid in iter_course_ids(sec.rule)
    }
    missing_courses = referenced_courses - {c.id for c in courses}
    backfill = {}
    if missing_courses:
        print(f"[main] - fetching {len(missing_courses)} missing courses")
        backfill = asyncio.run(
            fetch_courses_by_group_ids(
                token, missing_courses, catalog["effectiveStartDate"]
            )
        )
    backfill_courses = [
        course
        for course in (backfill_course(c) for c in backfill.values())
        if course is not None
    ]
    courses, alias = merge_courses(courses, backfill_courses)
    if alias:
        for prog in programs:
            for sec in prog.sections:
                remap_course_ids(sec.rule, alias)

    print(f"[main]: building {db_path}")
    build_db(db_path, courses, programs)


if __name__ == "__main__":
    main()
