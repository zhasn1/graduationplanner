export type CourseStatus = "done" | "current" | "planned" | "unplanned";

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

export function makeYear(index: number, startYear: number): PlanYear {
  const fallYear = startYear + index;
  return {
    id: `year-${fallYear}`,
    label: `Year ${index + 1}`,
    sub: `${fallYear} – ${fallYear + 1}`,
    terms: [
      { id: `term-fall-${fallYear}`, name: `Fall ${fallYear}`, courses: [] },
      {
        id: `term-spring-${fallYear + 1}`,
        name: `Spring ${fallYear + 1}`,
        courses: [],
      },
      {
        id: `term-summer-${fallYear + 1}`,
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

export type TermStatus = "done" | "current" | "planned";
const TERM_MONTHS: Record<string, [start: number, end: number]> = {
  Spring: [0, 4], // Jan – May
  Summer: [5, 7], // Jun – Aug
  Fall: [8, 11], // Sep – Dec
};

export function termStatus(term: PlanTerm, now = new Date()): TermStatus {
  const match = term.name.match(/\b(Spring|Summer|Fall)\s+(\d{4})\b/);
  if (!match) return "planned";
  const [, season, yearStr] = match;
  const year = Number(yearStr);
  const [startMonth, endMonth] = TERM_MONTHS[season];
  if (now.getFullYear() > year) return "done";
  if (now.getFullYear() < year) return "planned";
  if (now.getMonth() > endMonth) return "done";
  return now.getMonth() >= startMonth ? "current" : "planned";
}

export const plannedCourseStatuses = (plan: PlanYear[], now = new Date()) => {
  const statuses = new Map<string, CourseStatus>();
  for (const year of plan) {
    for (const term of year.terms) {
      const status = termStatus(term, now);
      for (const course of term.courses) statuses.set(course.id, status);
    }
  }
  return statuses;
};
