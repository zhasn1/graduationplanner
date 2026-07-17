export type CourseStatus = "done" | "in progress" | "planned" | "not planned";

export interface PlannerCourse {
  id: string;
  code: string;
  title: string;
  cr: number;
}

export interface Constraints {
  minCourses?: number;
  maxCourses?: number;
  minCredits?: number;
  maxCredits?: number;
  minChildren?: number;
}

export type RuleNode =
  | {
      kind: "group";
      name: string | null;
      constraints: Constraints;
      children: RuleNode[];
    }
  | {
      kind: "course_set";
      name: string | null;
      constraints: Constraints;
      courses: PlannerCourse[];
    }
  | {
      kind: "text";
      name: string | null;
      constraints: Constraints;
      text: string;
    };

export type RequirementLevel = "admission" | "requirement";

export interface RequirementSection {
  id: number;
  name: string;
  level: RequirementLevel;
  rule: RuleNode;
}

export interface ProgramPlan {
  programId: string;
  programName: string;
  totalCredits: number;
  sections: RequirementSection[];
}

export interface PlanTerm {
  id: string;
  name: string;
  courses: PlannerCourse[];
  isSummer?: boolean;
}

export interface PlanYear {
  id: string;
  label: string;
  sub: string;
  terms: PlanTerm[];
}

export const termCredits = (term: PlanTerm) =>
  term.courses.reduce((sum, course) => sum + course.cr, 0);

export const yearCredits = (year: PlanYear) =>
  year.terms.reduce((sum, term) => sum + termCredits(term), 0);

let idCount = 0;

const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(idCount++).toString(36)}`;

export function makeYear(index: number, startYear: number): PlanYear {
  const fallYear = startYear + index;
  return {
    id: nextId("year"),
    label: `Year ${index + 1}`,
    sub: `${fallYear} – ${fallYear + 1}`,
    terms: [
      { id: nextId("term"), name: `Fall ${fallYear}`, courses: [] },
      { id: nextId("term"), name: `Spring ${fallYear + 1}`, courses: [] },
      {
        id: nextId("term"),
        name: `Summer ${fallYear + 1}`,
        courses: [],
        isSummer: true,
      },
    ],
  };
}

export function emptyPlan(startYear = new Date().getFullYear()): PlanYear[] {
  return Array.from({ length: 4 }, (_, i) => makeYear(i, startYear));
}

export const plannedCourseIds = (plan: PlanYear[]) =>
  new Set(
    plan.flatMap((year) =>
      year.terms.flatMap((term) => term.courses.map((c) => c.id)),
    ),
  );
