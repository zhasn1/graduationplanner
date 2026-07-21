"use client";

import { useEffect, useState } from "react";
import { Flex, Box, Button } from "@chakra-ui/react";
import { PlannerHeader } from "./PlannerHeader";
import { Requirements } from "./Requirements";
import { YearSection } from "./YearSection";
import { FiPlus } from "react-icons/fi";
import { Footer } from "../Footer";
import {
  emptyPlan,
  makeYear,
  plannedCourseStatuses,
  type PlanYear,
  type ProgramPlan,
  type PlannerCourse,
} from "./types";

interface PlannerBoardProps {
  plan: ProgramPlan;
}

const storageKey = (programId: string) => `gradplanner:plan:${programId}`;
const CURR_YEAR = 2025;

export function PlannerBoard({ plan }: PlannerBoardProps) {
  const [years, setYears] = useState<PlanYear[]>(() => emptyPlan(CURR_YEAR));

  useEffect(() => {
    const savedPlan = localStorage.getItem(storageKey(plan.programId));
    if (savedPlan) {
      setYears(JSON.parse(savedPlan) as PlanYear[]);
    }
  }, [plan.programId]);

  useEffect(() => {
    localStorage.setItem(storageKey(plan.programId), JSON.stringify(years));
  }, [years, plan.programId]);

  const courseStatuses = plannedCourseStatuses(years);
  const creditsEarned = years.reduce(
    (sum, year) =>
      sum +
      year.terms.reduce(
        (s, term) => s + term.courses.reduce((n, c) => n + c.cr, 0),
        0,
      ),
    0,
  );

  const addCourse = (termId: string, course: PlannerCourse) => {
    setYears((prev) =>
      prev.map((year) => ({
        ...year,
        terms: year.terms.map((term) =>
          term.id === termId && !term.courses.some((c) => c.id === course.id)
            ? { ...term, courses: [...term.courses, course] }
            : term,
        ),
      })),
    );
  };

  const removeCourse = (termId: string, courseId: string) => {
    setYears((prev) =>
      prev.map((year) => ({
        ...year,
        terms: year.terms.map((term) =>
          term.id === termId
            ? {
                ...term,
                courses: term.courses.filter((c) => c.id !== courseId),
              }
            : term,
        ),
      })),
    );
  };

  const addYear = () =>
    setYears((prev) => [...prev, makeYear(prev.length, CURR_YEAR)]);

  return (
    <Flex direction="column" minH="100vh" bg="canvas">
      <PlannerHeader
        program={plan.programName}
        creditsEarned={creditsEarned}
        totalCredits={plan.totalCredits}
      />
      <Flex flex="1" minH="0">
        <Requirements
          sections={plan.sections}
          courseStatuses={courseStatuses}
        />
        <Box
          as="main"
          className="scrl"
          flex="1"
          px="30px"
          py="26px"
          overflowY="auto"
        >
          {years.map((year, index) => (
            <YearSection
              key={year.id}
              year={year}
              first={index === 0}
              onAddCourse={addCourse}
              onRemoveCourse={removeCourse}
            />
          ))}
          <Button
            onClick={addYear}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="8px"
            w="100%"
            mt="8px"
            p="16px"
            h="auto"
            border="1.5px dashed"
            borderColor="acent.border"
            borderRadius="6px"
            bg="panel"
            color="accent"
            fontFamily="mono"
            fontSize="13px"
            fontWeight="600"
            letterSpacing="0.03em"
            textTransform="uppercase"
            _hover={{
              borderColor: "accent",
              bg: "accent.bg",
            }}
          >
            <FiPlus size={17} />
            Add another Year
          </Button>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}
