import Database from "better-sqlite3";
import path from "path";

export interface Program {
  id: string;
  name: string;
  college: string;
  type: string;
  total_credits: number | null;
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
