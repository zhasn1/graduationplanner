"use client";

import { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { CourseChip } from "./CourseChip";
import { constraintLabel, evaluate } from "./ruleEval"
import type { RequirementSection, RuleNode, CourseStatus } from "./types";

const COLLAPSED_COUNT = 4;

function ConstraintTag({ label }: { label: string }) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      flex="none"
      fontFamily="mono"
      fontSize="10px"
      fontWeight="600"
      letterSpacing="0.04em"
      textTransform="uppercase"
      color="accent"
      bg="accent.bg"
      px="6px"
      py="1px"
      borderRadius="3px"
    >
      {label}
    </Text>
  );
}

function CheckMark() {
  return (
    <Box flex="none" color="accent" display="inline-flex">
      <FiCheck size={13} strokeWidth={3} />
    </Box>
  );
}

function CourseSetView({
  node,
  planned,
  statuses,
  hideName,
}: {
  node: Extract<RuleNode, { kind: "course_set" }>;
  planned: Set<string>;
  statuses: Map<string, CourseStatus>;
  hideName?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const evalResult = evaluate(node, planned);
  const label = constraintLabel(node, node.courses.length);
  const name = hideName ? null : node.name;
  const hasMore = node.courses.length > COLLAPSED_COUNT;
  const visible =
    expanded || !hasMore
      ? node.courses
      : node.courses.slice(0, COLLAPSED_COUNT);

  return (
    <Box>
      {(name || label) && (
        <Flex align="center" gap="8px" mb="4px">
          {name && (
            <Text
              fontSize="12.5px"
              fontWeight="600"
              color="ink"
              lineHeight="1.3"
            >
              {name}
            </Text>
          )}
          {label && <ConstraintTag label={label} />}
          {evalResult.satisfied && evalResult.tracked && <CheckMark />}
        </Flex>
      )}
      <Flex
        direction="column"
        borderTop="1px solid"
        borderColor="line.faint"
      >
        {visible.map((course) => (
          <CourseChip
            key={course.id}
            code={course.code}
            title={course.title}
            cr={course.cr}
            status={statuses.get(course.id) ?? "unplanned"}
            variant="rail"
          />
        ))}
      </Flex>
      {hasMore && (
        <Button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          variant="plain"
          h="auto"
          mt="4px"
          p="0"
          fontFamily="mono"
          fontSize="10.5px"
          fontWeight="600"
          letterSpacing="0.02em"
          color="accent"
        >
          {expanded ? "Show fewer" : `Show more`}
        </Button>
      )}
    </Box>
  );
}

function TextView({
  node,
  hideName,
}: {
  node: Extract<RuleNode, { kind: "text" }>;
  hideName?: boolean;
}) {
  const label = constraintLabel(node, 0);
  const name = hideName ? null : node.name;
  return (
    <Box
      borderLeft="2px solid"
      borderColor="line"
      pl="10px"
      py="2px"
    >
      <Flex align="center" gap="8px" mb="2px">
        {name && (
          <Text
            fontSize="12.5px"
            fontWeight="600"
            color="ink"
          >
            {name}
          </Text>
        )}
        {label && <ConstraintTag label={label} />}
      </Flex>
      <Text
        fontSize="12px"
        fontStyle="italic"
        color="ink.muted"
        lineHeight="1.4"
      >
        {node.text}
      </Text>
    </Box>
  );
}

function GroupView({
  node,
  planned,
  statuses,
  depth,
  hideName,
}: {
  node: Extract<RuleNode, { kind: "group" }>;
  planned: Set<string>;
  statuses: Map<string, CourseStatus>;
  depth: number;
  hideName?: boolean;
}) {
  const [showAlts, setShowAlts] = useState(false);
  const evalResult = evaluate(node, planned);
  const label = constraintLabel(node, node.children.length);
  const name = hideName ? null : node.name;
  const showHeader = Boolean(name || label);

  const isAlternatives =
    node.constraints.minChildren === 1 && node.children.length > 1;
  const hiddenSatisfied =
    isAlternatives &&
    node.children.slice(1).some((c) => {
      const r = evaluate(c, planned);
      return r.satisfied && r.tracked;
    });
  const expanded = showAlts || hiddenSatisfied;
  const visibleChildren =
    isAlternatives && !expanded ? node.children.slice(0, 1) : node.children;
  const hiddenCount = node.children.length - 1;

  return (
    <Box>
      {showHeader && (
        <Flex align="center" gap="8px" mb="8px">
          {name && (
            <Text
              fontSize="13px"
              fontWeight="700"
              color="ink"
            >
              {name}
            </Text>
          )}
          {label && <ConstraintTag label={label} />}
          {evalResult.satisfied && evalResult.tracked && <CheckMark />}
        </Flex>
      )}
      <Flex
        direction="column"
        gap="14px"
        pl={showHeader ? "12px" : "0"}
        borderLeft={showHeader ? "1px solid" : "none"}
        borderColor="line.faint"
      >
        {visibleChildren.map((child, i) => (
          <NodeView
            key={i}
            node={child}
            planned={planned}
            statuses={statuses}
            depth={depth + 1}
            hideName={name != null && child.name === name}
          />
        ))}
        {isAlternatives && !hiddenSatisfied && (
          <Button
            onClick={() => setShowAlts((v) => !v)}
            aria-expanded={expanded}
            variant="plain"
            alignSelf="flex-start"
            h="auto"
            p="0"
            fontFamily="mono"
            fontSize="10.5px"
            fontWeight="600"
            letterSpacing="0.02em"
            color="accent"
          >
            {expanded
              ? "Hide alternatives"
              : `Show ${hiddenCount} alternative${hiddenCount === 1 ? "" : "s"}`}
          </Button>
        )}
      </Flex>
    </Box>
  );
}

function NodeView({
  node,
  planned,
  statuses,
  depth,
  hideName,
}: {
  node: RuleNode;
  planned: Set<string>;
  statuses: Map<string, CourseStatus>;
  depth: number;
  hideName?: boolean;
}) {
  if (node.kind === "course_set")
    return (
      <CourseSetView
        node={node}
        planned={planned}
        statuses={statuses}
        hideName={hideName}
      />
    );
  if (node.kind === "text") return <TextView node={node} hideName={hideName} />;
  return (
    <GroupView
      node={node}
      planned={planned}
      statuses={statuses}
      depth={depth}
      hideName={hideName}
    />
  );
}

function SectionCard({
  section,
  planned,
  statuses,
}: {
  section: RequirementSection;
  planned: Set<string>;
  statuses: Map<string, CourseStatus>;
}) {
  const root = section.rule;
  const rootEval = evaluate(root, planned);
  const pct = rootEval.need > 0 ? (rootEval.have / rootEval.need) * 100 : 0;
  const bodyNodes =
    root.kind === "group" && !root.name && root.constraints.minChildren == null
      ? root.children
      : [root];

  return (
    <Box mb="26px">
      <Flex align="center" justify="space-between" gap="10px" mb="6px">
        <Text
          fontSize="13.5px"
          fontWeight="700"
          color="ink"
          letterSpacing="-0.01em"
        >
          {section.name}
        </Text>
        {rootEval.tracked && (
          <Text
            as="span"
            display="inline-flex"
            alignItems="center"
            flex="none"
            fontFamily="mono"
            fontSize="11px"
            fontWeight="600"
            color="accent"
            bg="accent.bg"
            px="7px"
            py="2px"
            borderRadius="3px"
          >
            {rootEval.satisfied
              ? "Done"
              : `${rootEval.have} / ${rootEval.need}`}
          </Text>
        )}
      </Flex>
      <Box
        h="4px"
        borderRadius="2px"
        bg="line.soft"
        overflow="hidden"
        mb="12px"
      >
        <Box w={`${pct}%`} h="100%" bg="accent" />
      </Box>
      <Flex direction="column" gap="14px">
        {bodyNodes.map((node, i) => (
          <NodeView
            key={i}
            node={node}
            planned={planned}
            statuses={statuses}
            depth={0}
            hideName={node.name != null && node.name === section.name}
          />
        ))}
      </Flex>
    </Box>
  );
}

function Bucket({
  title,
  sections,
  planned,
  statuses,
  defaultOpen = true,
}: {
  title: string;
  sections: RequirementSection[];
  planned: Set<string>;
  statuses: Map<string, CourseStatus>;
  defaultOpen?: boolean;
}) {
  const satisfied = sections.filter(
    (s) => evaluate(s.rule, planned).satisfied,
  ).length;
  const allDone = sections.length > 0 && satisfied === sections.length;
  const [open, setOpen] = useState(defaultOpen && !allDone);

  return (
    <Box mb="20px">
      <Flex
        as="button"
        onClick={() => setOpen((v) => !v)}
        align="center"
        gap="8px"
        w="100%"
        textAlign="left"
        bg="transparent"
        cursor="pointer"
        pb="10px"
        borderBottom="1px solid"
        borderColor="line"
      >
        <Box
          flex="none"
          color="ink.faint"
          display="inline-flex"
          transform={open ? "rotate(0deg)" : "rotate(-90deg)"}
          transition="transform .15s ease"
        >
          <FiChevronDown size={15} />
        </Box>
        <Text
          flex="1"
          fontSize="12px"
          fontWeight="700"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="ink"
        >
          {title}
        </Text>
        <Text
          flex="none"
          fontFamily="mono"
          fontSize="11px"
          color="line.soft"
        >
          {satisfied}/{sections.length}
        </Text>
      </Flex>
      {open && (
        <Box mt="18px">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              planned={planned}
              statuses={statuses}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

interface RequirementsProps {
  sections: RequirementSection[];
  courseStatuses: Map<string, CourseStatus>;
}

export function Requirements({ sections, courseStatuses }: RequirementsProps) {
  const admission = sections.filter((s) => s.level === "admission");
  const requirements = sections.filter((s) => s.level !== "admission");
  const plannedIds = new Set(courseStatuses.keys());

  return (
    <Box
      as="aside"
      className="scrl"
      w="352px"
      flex="none"
      bg="panel"
      borderRight="1px solid"
      borderColor="line"
      p="22px"
      overflowY="auto"
    >
      {sections.length === 0 ? (
        <Text fontSize="13px" color="ink.muted">
          No published requirements are available for this program yet.
        </Text>
      ) : (
        <>
          {admission.length > 0 && (
            <Bucket
              title="Admission Requirements"
              sections={admission}
              planned={plannedIds}
              statuses={courseStatuses}
            />
          )}
          {requirements.length > 0 && (
            <Bucket
              title="Program Requirements"
              sections={requirements}
              planned={plannedIds}
              statuses={courseStatuses}
            />
          )}
        </>
      )}
    </Box>
  );
}
