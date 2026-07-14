from fetch.umn_courses import current_term, fetch_all_courses
import asyncio


def main():
    term = current_term()
    courses = asyncio.run(fetch_all_courses(term))
    print(f"[umn_course]: fetched {len(courses)} courses")


if __name__ == "__main__":
    main()
