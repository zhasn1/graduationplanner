import {
  getCoursesByIds,
  getProgramById,
  getRequirementSections,
  type CourseRow,
} from "./db";
import type {
  Constraints,
  PlannerCourse,
  ProgramPlan,
  RequirementSection,
  RuleNode,
} from "@/components/planner/types";

interface DbConstraints {
  min_courses?: number;
  max_courses?: number;
  min_credits?: number;
  max_credits?: number;
  min_children?: number;
}

interface DbNode {
  kind: "group" | "course_set" | "text";
  name: string | null;
  constraints: DbConstraints;
  children?: DbNode[];
  courses?: string[];
  text?: string;
}

const DEFAULT_TOTAL_CREDITS = 120;

const courseCredits = (row: CourseRow) => row.cred_min ?? row.cred_max ?? 0;

const toPlannerCourse = (row: CourseRow): PlannerCourse => ({
  id: row.id,
  code: `${row.dept} ${row.course_num}`,
  title: row.name,
  cr: courseCredits(row),
});

const toConstraints = (c: DbConstraints = {}): Constraints => ({
  minCourses: c.min_courses,
  maxCourses: c.max_courses,
  minCredits: c.min_credits,
  maxCredits: c.max_credits,
  minChildren: c.min_children,
});

function collectCourseIds(node: DbNode, out: Set<string>) {
  if (node.kind === "course_set") {
    for (const id of node.courses ?? []) out.add(id);
    return;
  }
  for (const child of node.children ?? []) collectCourseIds(child, out);
}

function resolveNode(
  node: DbNode,
  courseById: Map<string, CourseRow>,
): RuleNode {
  const constraints = toConstraints(node.constraints);
  const name = node.name?.trim() || null;
  if (node.kind === "text") {
    return {
      kind: "text",
      name: name,
      constraints,
      text: node.text ?? "",
    };
  }

  if (node.kind === "course_set") {
    const seen = new Set<string>();
    const courses: PlannerCourse[] = [];
    for (const id of node.courses ?? []) {
      const row = courseById.get(id);
      if (row && !seen.has(id)) {
        seen.add(id);
        courses.push(toPlannerCourse(row));
      }
    }
    return { kind: "course_set", name, constraints, courses };
  }

  const children = (node.children ?? []).map((child) =>
    resolveNode(child, courseById),
  );
  return simplifyGroup({
    kind: "group",
    name: name,
    constraints,
    children,
  });
}

function simplifyGroup(group: {
  kind: "group";
  name: string | null;
  constraints: Constraints;
  children: RuleNode[];
}): RuleNode {
  const { children, constraints, name } = group;
  const allAnonymousSets =
    children.length > 0 &&
    children.every((c) => c.kind === "course_set" && c.name === null);
  const requiredPicks = Math.max(
    constraints.minChildren ?? 0,
    constraints.minCourses ?? 0,
  );
  const isElectivePool =
    constraints.minChildren != null && requiredPicks < children.length;

  if (!allAnonymousSets || !isElectivePool) return group;

  const seen = new Set<string>();
  const courses: PlannerCourse[] = [];
  for (const child of children) {
    if (child.kind !== "course_set") continue;
    for (const course of child.courses) {
      if (!seen.has(course.id)) {
        seen.add(course.id);
        courses.push(course);
      }
    }
  }

  return {
    kind: "course_set",
    name,
    constraints: {
      minCourses: constraints.minCourses ?? constraints.minChildren,
      maxCourses: constraints.maxCourses,
      minCredits: constraints.minCredits,
      maxCredits: constraints.maxCredits,
    },
    courses,
  };
}

function hasContent(node: RuleNode): boolean {
  if (node.kind === "course_set") return node.courses.length > 0;
  if (node.kind === "text") return node.text.trim().length > 0;
  return node.children.some(hasContent);
}

export function getProgramPlan(programId: string): ProgramPlan | null {
  const program = getProgramById(programId);
  if (!program) return null;

  const rawSections = getRequirementSections(programId).map((row) => {
    let root: DbNode | null = null;
    try {
      root = JSON.parse(row.rule) as DbNode;
    } catch {
      root = null;
    }
    return { row, root };
  });

  const ids = new Set<string>();
  for (const { root } of rawSections) if (root) collectCourseIds(root, ids);
  const courseById = new Map(
    getCoursesByIds([...ids]).map((row) => [row.id, row]),
  );

  const sections: RequirementSection[] = rawSections
    .filter((s): s is { row: (typeof s)["row"]; root: DbNode } =>
      Boolean(s.root),
    )
    .map(({ row, root }) => ({
      id: row.id,
      name: row.name,
      level:
        row.level === "admission"
          ? ("admission" as const)
          : ("requirement" as const),
      rule: resolveNode(root, courseById),
    }))
    .filter((section) => hasContent(section.rule));

  return {
    programId: program.id,
    programName: program.name,
    career: program.career,
    totalCredits: program.total_credits ?? DEFAULT_TOTAL_CREDITS,
    sections,
  };
}
