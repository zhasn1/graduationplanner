import asyncio
import aiohttp
from datetime import datetime
from mappings import dept_mapping

CAMPUS = "umntc"
CAMPUS_KEY = "UMNTC"


def current_term():
    now = datetime.now()
    if now.month <= 5:
        term = "3"  # spring
    elif now.month <= 8:
        term = "5"  # summer
    else:
        term = "9"  # fall
    return f"{now.year - 1900}{term}"


async def fetch_dept_courses(session, dept, term, sem):
    url = f"https://courses.umn.edu/campuses/{CAMPUS}/terms/{term}/courses.json?q=subject_id={dept}"
    for i in range(3):
        try:
            async with sem:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        raise Exception(f"http: {resp.status}")
                    data = await resp.json()
                    return data.get("courses", [])
        except Exception as e:
            if i == 2:
                print(f"[umn_course]: {dept} fetch failed: {e}")
                return None
        await asyncio.sleep(1)


async def fetch_all_courses(term):
    depts = list(dept_mapping[CAMPUS_KEY].keys())
    sem = asyncio.Semaphore(10)
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *(fetch_dept_courses(session, dept, term, sem) for dept in depts)
        )
        courses_by_dept = dict(zip(depts, results))
    courses = [
        course
        for dept_courses in courses_by_dept.values()
        if dept_courses
        for course in dept_courses
    ]
    return courses
