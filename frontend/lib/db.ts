import Database from "better-sqlite3";
import path from "path";

export interface Program {
  id: string;
  name: string;
  college: string;
  career: string;
  type: string;
  total_credits: number | null;
}

export interface RequirementSectionRow {
  id: number;
  name: string;
  level: string;
  rule: string;
}

export interface CourseRow {
  id: string;
  dept: string;
  course_num: string;
  name: string;
  cred_min: number | null;
  cred_max: number | null;
}

const dbPath = path.join(process.cwd(), "..", "procesedData.db");
const db = new Database(dbPath, { readonly: true, fileMustExist: true });

export function getPrograms(): Program[] {
  return db
    .prepare(
      "SELECT id, name, college, career, type, total_credits FROM programs ORDER BY name",
    )
    .all() as Program[];
}

export function getProgramById(id: string): Program | undefined {
  return db
    .prepare(
      "SELECT id, name, college, career, type, total_credits FROM programs WHERE id = ?",
    )
    .get(id) as Program | undefined;
}

export function getRequirementSections(
  programId: string,
): RequirementSectionRow[] {
  return db
    .prepare(
      "SELECT id, name, level, rule FROM requirement_sections WHERE program_id = ? ORDER BY id",
    )
    .all(programId) as RequirementSectionRow[];
}

export function getCoursesByIds(ids: string[]): CourseRow[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return db
    .prepare(
      `SELECT id, dept, course_num, name, cred_min, cred_max FROM courses WHERE id IN (${placeholders})`,
    )
    .all(...ids) as CourseRow[];
}

export function searchCourses(query: string, limit = 20): CourseRow[] {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q.replace(/\s+/g, "%")}%`;
  const nameLike = `%${q}%`;
  return db
    .prepare(
      `SELECT id, dept, course_num, name, cred_min, cred_max
       FROM courses
       WHERE active = 1
         AND ((dept || ' ' || course_num) LIKE ? OR name LIKE ?)
       ORDER BY dept, course_num
       LIMIT ?`,
    )
    .all(like, nameLike, limit) as CourseRow[];
}
