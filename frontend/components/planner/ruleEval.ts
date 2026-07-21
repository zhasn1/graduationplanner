import type { Constraints, RuleNode } from "./types";

const fmtCr = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const pos = (n: number | undefined): n is number => n != null && n > 0;

function creditLabel(c: Constraints): string {
  const mr = pos(c.minCredits) ? c.minCredits : null;
  const xr = c.maxCredits ?? null;
  if (mr != null && xr != null) {
    return mr === xr ? `${fmtCr(mr)} cr` : `${fmtCr(mr)}–${fmtCr(xr)} cr`;
  }
  if (mr != null) return `${fmtCr(mr)}+ cr`;
  if (xr != null) return `up to ${fmtCr(xr)} cr`;
  return "";
}

function courseOrCreditLabel(c: Constraints, count: number): string | null {
  const { minCourses: mc, maxCourses: xc } = c;

  if (pos(mc)) {
    if (xc != null && xc === mc) {
      return count > mc ? `choose ${mc}` : `${mc} course${mc === 1 ? "" : "s"}`;
    }
    if (xc != null) return `${mc}–${xc} courses`;
    return count > mc ? `choose ${mc}` : `${mc} course${mc === 1 ? "" : "s"}`;
  }
  if (mc === 0) {
    if (xc != null) return `up to ${xc} course${xc === 1 ? "" : "s"}`;
    if (c.maxCredits != null) return `up to ${fmtCr(c.maxCredits)} cr`;
    return "optional";
  }
  const credit = creditLabel(c);
  if (credit) return credit;
  if (xc != null) return `up to ${xc} course${xc === 1 ? "" : "s"}`;
  return null;
}

export function constraintLabel(
  node: RuleNode,
  poolOrChildCount: number,
): string | null {
  return courseOrCreditLabel(node.constraints, poolOrChildCount);
}

export interface NodeEval {
  satisfied: boolean;
  tracked: boolean;
  have: number;
  need: number;
  unit: "courses" | "credits" | "children";
}

const collectPlanned = (
  node: RuleNode,
  planned: Set<string>,
  out: Map<string, number>,
) => {
  if (node.kind === "course_set") {
    for (const c of node.courses) if (planned.has(c.id)) out.set(c.id, c.cr);
  } else if (node.kind === "group") {
    for (const child of node.children) collectPlanned(child, planned, out);
  }
};

export function evaluate(node: RuleNode, planned: Set<string>): NodeEval {
  if (node.kind === "text") {
    return {
      satisfied: false,
      tracked: false,
      have: 0,
      need: 0,
      unit: "courses",
    };
  }

  if (node.kind === "course_set") {
    const picked = node.courses.filter((c) => planned.has(c.id));
    const { minCourses: mc, minCredits: mr } = node.constraints;
    if (pos(mc)) {
      return {
        satisfied: picked.length >= mc,
        tracked: true,
        have: Math.min(picked.length, mc),
        need: mc,
        unit: "courses",
      };
    }
    if (pos(mr)) {
      const have = picked.reduce((sum, c) => sum + c.cr, 0);
      return {
        satisfied: have >= mr,
        tracked: true,
        have: Math.min(have, mr),
        need: mr,
        unit: "credits",
      };
    }
    return {
      satisfied: true,
      tracked: false,
      have: 0,
      need: 0,
      unit: "courses",
    };
  }

  const childEvals = node.children.map((c) => evaluate(c, planned));
  const tracked = childEvals.filter((e) => e.tracked);
  const need = node.constraints.minChildren ?? node.children.length;
  const satChildren = childEvals.filter((e) => e.tracked && e.satisfied).length;

  let satisfied = satChildren >= need;
  const { minCourses: mc, minCredits: mr } = node.constraints;
  if (pos(mc) || pos(mr)) {
    const picked = new Map<string, number>();
    collectPlanned(node, planned, picked);
    if (pos(mc)) satisfied = satisfied && picked.size >= mc;
    if (pos(mr)) {
      const credits = [...picked.values()].reduce((sum, cr) => sum + cr, 0);
      satisfied = satisfied && credits >= mr;
    }
    if (pos(mc) && mc > need) {
      return {
        satisfied,
        tracked: tracked.length > 0,
        have: Math.min(picked.size, mc),
        need: mc,
        unit: "courses",
      };
    }
  }
  return {
    satisfied,
    tracked: tracked.length > 0,
    have: Math.min(satChildren, need),
    need,
    unit: "children",
  };
}
