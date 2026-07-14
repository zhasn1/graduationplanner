from fetch.umn_courses import current_term, fetch_all_courses
import asyncio
from fetch.coursedog import fetch_catalogs, fetch_all_programs
import os
import dotenv

def main():
    dotenv.load_dotenv()
    term = current_term()
    token = os.environ.get("coursedog_token", "")
    if not token:
        raise Exception("coursedog_token not in env")
    courses = asyncio.run(fetch_all_courses(term))
    print(f"[main]: fetched {len(courses)} courses")
    catalogs = asyncio.run(fetch_catalogs(token))
    programs = asyncio.run(fetch_all_programs(token, catalogs["effectiveStartDate"]))
    print(f"[main]: fetched {len(catalogs)} catalogs and {len(programs)} programs")
    
if __name__ == "__main__":
    main()
