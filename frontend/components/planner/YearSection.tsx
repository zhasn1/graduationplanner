import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { TermCard } from "./TermCard";
import { yearCredits, type PlannerCourse, type PlanYear } from "./types";

interface YearSectionProps {
  year: PlanYear;
  first: boolean;
  onAddCourse: (termId: string, course: PlannerCourse) => void;
  onRemoveCourse: (termId: string, courseId: string) => void;
}

export function YearSection({
  year,
  first,
  onAddCourse,
  onRemoveCourse,
}: YearSectionProps) {
  return (
    <Box
      mb="28px"
      pt={first ? undefined : "28px"}
      borderTop={first ? undefined : "1px solid"}
      borderColor={first ? undefined : "line.soft"}
    >
      <Flex align="baseline" gap="12px" mb="14px">
        <Text fontFamily="heading" fontSize="19px" fontWeight="600" color="ink">
          {year.label}
        </Text>
        <Text fontFamily="mono" fontSize="12px" color="ink.faint">
          {year.sub} · {yearCredits(year)} cr
        </Text>
      </Flex>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="16px">
        {year.terms.map((term) => (
          <TermCard
            key={term.id}
            term={term}
            onAddCourse={(course) => onAddCourse(term.id, course)}
            onRemoveCourse={(courseId) => onRemoveCourse(term.id, courseId)}
          />
        ))}
      </Grid>
    </Box>
  );
}
