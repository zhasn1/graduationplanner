"use client";

import { useEffect, useMemo, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { PlannerHeader } from "./PlannerHeader";
import {
  emptyPlan,
  plannedCourseIds,
  type PlanYear,
  type ProgramPlan,
} from "./types";

interface PlannerBoardProps {
  plan: ProgramPlan;
}

const storageKey = (programId: string) => `gradplanner:plan:${programId}`;
const CURR_YEAR = new Date().getFullYear();

export function PlannerBoard({ plan }: PlannerBoardProps) {
  const [years, setYears] = useState<PlanYear[]>(() => emptyPlan(CURR_YEAR));

  useEffect(() => {
    const savedPlan = localStorage.getItem(storageKey(plan.programId));
    if (savedPlan) {
      setYears(JSON.parse(savedPlan) as PlanYear[]);
    } else {
      setYears(emptyPlan(CURR_YEAR));
    }
  }, [plan.programId]);

  useEffect(() => {
    localStorage.setItem(storageKey(plan.programId), JSON.stringify(years));
  }, [years, plan.programId]);

  const plannedIds = useMemo(() => plannedCourseIds(years), [years]);
  const creditsEarned = useMemo(
    () =>
      years.reduce(
        (sum, year) =>
          sum +
          year.terms.reduce(
            (s, term) => s + term.courses.reduce((n, c) => n + c.cr, 0),
            0,
          ),
        0,
      ),
    [years],
  );

  return (
    <Flex direction="column" minH="100vh" bg={"oklch(0.975 0.008 85)"}>
      <PlannerHeader
        program={plan.programName}
        creditsEarned={creditsEarned}
        totalCredits={plan.totalCredits}
      />
    </Flex>
  );
}
