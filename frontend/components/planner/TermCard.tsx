"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Input, Spinner, Text, chakra } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { CourseChip } from "./CourseChip";
import {
  termCredits,
  termStatus,
  type PlannerCourse,
  type PlanTerm,
  type TermStatus,
} from "./types";

interface TermCardProps {
  term: PlanTerm;
  onAddCourse: (course: PlannerCourse) => void;
  onRemoveCourse: (courseId: string) => void;
}

const TERM_TAGS: Record<
  TermStatus,
  { label: string; color: string; bg: string }
> = {
  done: {
    label: "Completed",
    color: "accent",
    bg: "accent.bg",
  },
  current: {
    label: "In progress",
    color: "gold.text",
    bg: "gold.bg",
  },
  planned: {
    label: "Planned",
    color: "ink.muted",
    bg: "line.faint",
  },
};

function termTag(term: PlanTerm, status: TermStatus) {
  if (term.isSummer || term.courses.length === 0) return null;
  return TERM_TAGS[status];
}

export function TermCard({ term, onAddCourse, onRemoveCourse }: TermCardProps) {
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<PlannerCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const status = termStatus(term);
  const tag = termTag(term, status);
  const inPlan = new Set(term.courses.map((c) => c.id));

  useEffect(() => {
    const q = draft.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/courses?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { courses: PlannerCourse[] };
        setResults(data.courses);
      } catch {
        // Aborted by a newer keystroke, or the request failed
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [draft]);

  const add = (course: PlannerCourse) => {
    onAddCourse(course);
    setDraft("");
    setResults([]);
    setOpen(false);
  };

  const cancelClose = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  return (
    <Flex
      direction="column"
      gap="10px"
      bg="panel"
      border="1px solid"
      borderColor="line"
      borderRadius="6px"
      p="14px"
      minH="250px"
      minW="0"
    >
      <Flex align="flex-start" justify="space-between">
        <Box>
          <Text fontSize="14px" fontWeight="700" color="ink">
            {term.name}
          </Text>
          {tag && (
            <Box
              as="span"
              display="inline-block"
              mt="6px"
              fontFamily="mono"
              fontSize="10px"
              fontWeight="600"
              letterSpacing="0.03em"
              textTransform="uppercase"
              px="7px"
              py="2px"
              borderRadius="3px"
              color={tag.color}
              bg={tag.bg}
            >
              {tag.label}
            </Box>
          )}
        </Box>
        <Text fontFamily="vmono" fontSize="11px" color="ink.faint">
          {termCredits(term)} cr
        </Text>
      </Flex>

      <Flex direction="column" borderTop="1px solid" borderColor="line.faint">
        {term.courses.map((course) => (
          <CourseChip
            key={course.id}
            code={course.code}
            title={course.title}
            cr={course.cr}
            status={status}
            onRemove={() => onRemoveCourse(course.id)}
          />
        ))}
      </Flex>

      <Box position="relative" mt="auto">
        <Flex
          as="label"
          align="center"
          gap="8px"
          borderBottom="1.5px solid"
          borderColor="line"
          px="2px"
          h="34px"
        >
          <Box flex="none" color="ink.faint" display="flex">
            <FiSearch size={14} />
          </Box>
          <Input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 120);
            }}
            aria-label={`Add course to ${term.name}`}
            placeholder="Add course"
            variant="flushed"
            border="none"
            bg="transparent"
            flex="1"
            fontSize="13px"
            color="ink"
            h="100%"
            px="0"
            _focus={{ boxShadow: "none" }}
            _placeholder={{ color: "ink.faint" }}
          />
          {loading && <Spinner size="xs" color="ink.faint" />}
        </Flex>

        {open && draft.trim() && (
          <Box
            position="absolute"
            top="calc(100% + 4px)"
            left="0"
            right="0"
            zIndex={20}
            bg="panel"
            border="1px solid"
            borderColor="line"
            borderRadius="6px"
            boxShadow="overlay"
            maxH="260px"
            overflowY="auto"
            className="scrl"
            onMouseDown={() => {
              cancelClose();
            }}
            onFocusCapture={() => {
              cancelClose();
            }}
          >
            {results.length === 0 && !loading ? (
              <Text px="12px" py="10px" fontSize="12.5px" color="ink.soft">
                No courses match &ldquo;{draft.trim()}&rdquo;.
              </Text>
            ) : (
              results.map((course) => {
                const already = inPlan.has(course.id);
                return (
                  <chakra.button
                    key={course.id}
                    disabled={already}
                    onClick={() => add(course)}
                    display="flex"
                    alignItems="center"
                    gap="8px"
                    w="100%"
                    textAlign="left"
                    px="12px"
                    py="8px"
                    bg="transparent"
                    cursor={already ? "default" : "pointer"}
                    opacity={already ? 0.5 : 1}
                    _hover={already ? undefined : { bg: "accent.bg" }}
                  >
                    <Text
                      flex="none"
                      fontFamily="mono"
                      fontWeight="600"
                      fontSize="12px"
                      color="ink"
                    >
                      {course.code}
                    </Text>
                    <Text
                      flex="1"
                      minW="0"
                      fontSize="12.5px"
                      color="ink.soft"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {course.title}
                    </Text>
                    <Text
                      flex="none"
                      fontFamily="mono"
                      fontSize="11px"
                      color="ink.faint"
                    >
                      {already ? "added" : `${course.cr}cr`}
                    </Text>
                  </chakra.button>
                );
              })
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
}
