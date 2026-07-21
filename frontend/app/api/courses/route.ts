import { NextResponse } from "next/server";
import { searchCourses } from "@/lib/db";
import type { PlannerCourse } from "@/components/planner/types";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results: PlannerCourse[] = searchCourses(query).map((row) => ({
    id: row.id,
    code: `${row.dept} ${row.course_num}`,
    title: row.name,
    cr: row.cred_min ?? row.cred_max ?? 0,
  }));
  return NextResponse.json({ courses: results });
}
