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
    catalog = max(data, key=lambda c: c.get("effectiveStartDate", ""))
    return {
        "id": catalog["id"],
        "displayName": catalog["displayName"],
        "effectiveStartDate": catalog["effectiveStartDate"],
    }


async def fetch_all_programs(token, effective_date=None):
    """returns a dict of program id to program"""
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
