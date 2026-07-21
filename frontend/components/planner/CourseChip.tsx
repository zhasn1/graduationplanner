import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import type { CourseStatus } from "./types";

interface CourseChipProps {
  code: string;
  title: string;
  cr: number;
  status: CourseStatus;
  variant?: "default" | "rail";
  onRemove?: () => void;
}

function dotColors(status: CourseStatus) {
  switch (status) {
    case "done":
      return { bg: "oklch(0.40 0.11 262)", border: "oklch(0.40 0.11 262)" };
    case "current":
      return { bg: "oklch(0.62 0.135 78)", border: "oklch(0.62 0.135 78)" };
    case "planned":
      return { bg: "transparent", border: "oklch(0.92 0.008 80)" };
    default:
      return { bg: "transparent", border: "oklch(0.87 0.012 80)" };
  }
}

export function CourseChip({
  code,
  title,
  cr,
  status,
  variant = "default",
  onRemove,
}: CourseChipProps) {
  const rail = variant === "rail";
  const dot = dotColors(status);
  const fontSize = rail ? "12px" : "12.5px";
  const muted = status === "unplanned";

  return (
    <Flex
      align="center"
      gap={rail ? "8px" : "10px"}
      px="2px"
      py={rail ? "5px" : "7px"}
      w="100%"
      opacity={muted ? 0.72 : 1}
    >
      {onRemove ? (
        <IconButton
          aria-label={`Remove ${code}`}
          onClick={onRemove}
          variant="plain"
          flex="none"
          minW="auto"
          w="14px"
          h="14px"
          p="0"
          color="line.faint"
          _hover={{ color: "accent" }}
        >
          <FiX size={13} />
        </IconButton>
      ) : (
        <Box
          flex="none"
          w="8px"
          h="8px"
          borderRadius="2px"
          bg={dot.bg}
          border="1.5px solid"
          borderColor={dot.border}
        />
      )}
      <Text
        flex="none"
        fontFamily="mono"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="-0.01em"
        color="ink"
      >
        {code}
      </Text>
      <Text
        flex="1"
        minW="0"
        fontSize={fontSize}
        color="ink.soft"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {title}
      </Text>
      <Text
        flex="none"
        fontFamily="mono"
        fontSize="11px"
        color="ink.fainter"
      >
        {cr}cr
      </Text>
    </Flex>
  );
}
