import asyncio
import aiohttp

API_URL = "https://app.coursedog.com/api/v1/cm/umn_umntc_peoplesoft"
CATALOGS_URL = "https://app.coursedog.com/api/v1/ca/umn_umntc_peoplesoft/catalogs"


def auth_headers(token):
    if token:
        return {"Cookie": f"token={token}"}
    return {}


def date_params(effective_date):
    """without this, the API returns whatever revision is effective today, which
    can lag the published catalog by an academic year"""
    if effective_date:
        return {"effectiveDatesRange": f"{effective_date},{effective_date}"}
    return {}


async def fetch_catalogs(token):
    async with aiohttp.ClientSession() as session:
        async with session.get(CATALOGS_URL, headers=auth_headers(token)) as resp:
            if resp.status != 200:
                raise Exception(f"catalogs fetch failed: {resp.status}")
            data = await resp.json()
    if not data:
        raise Exception("no data returned")
    catalog = max(data, key=lambda c: c.get("effectiveStartDate") or "")
    return {
        "displayName": catalog["displayName"],
        "effectiveStartDate": catalog["effectiveStartDate"],
    }


async def fetch_all_programs(token, effective_date=None):
    """returns the raw dict program id to program, unfiltered"""
    page = 500
    programs = {}
    async with aiohttp.ClientSession() as session:
        skip = 0
        while True:
            params = {"limit": page, "skip": skip, **date_params(effective_date)}
            async with session.get(
                f"{API_URL}/programs/", headers=auth_headers(token), params=params
            ) as resp:
                if resp.status != 200:
                    raise Exception(f"failed to fetch programs: {resp.status}")
                data = await resp.json()
            if not data:
                break
            programs.update(data)
            if len(data) < page:
                break
            skip += page
    return programs


async def fetch_courses_by_group_ids(token, group_ids, effective_date=None, size=50):
    group_ids = sorted(group_ids)
    batches = [group_ids[i : i + size] for i in range(0, len(group_ids), size)]

    async def fetch_batch(session, batch):
        params = {
            "courseGroupIds": ",".join(batch),
            "limit": len(batch),
            **date_params(effective_date),
        }
        try:
            async with session.get(
                f"{API_URL}/courses/", headers=auth_headers(token), params=params
            ) as resp:
                if resp.status != 200:
                    print(f"coursedog courses fetch failed: {resp.status}")
                    return None
                return await resp.json()
        except Exception as e:
            print(f"coursedog courses fetch failed: {e}")
            return None

    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *(fetch_batch(session, batch) for batch in batches)
        )
    failed_batches = sum(1 for r in results if r is None)
    if failed_batches:
        print(f"{failed_batches} batches failed to fetch")

    courses = {}
    for res in results:
        for course in (res or {}).values():
            group_id = course.get("courseGroupId")
            if group_id:
                courses[group_id] = course
    print(f"fetched {len(courses)} backfill courses")
    return courses
