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
    case "in progress":
      return { bg: "oklch(0.62 0.135 78)", border: "oklch(0.62 0.135 78)" };
    case "planned":
      return { bg: "oklch(0.40 0.11 262)", border: "oklch(0.40 0.11 262)" };
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
  const muted = status === "not planned";

  return (
    <Flex
      align="center"
      gap={rail ? "8px" : "10px"}
      px="2px"
      py={rail ? "5px" : "7px"}
      w="100%"
      role="group"
      opacity={muted ? 0.72 : 1}
    >
      <Box
        flex="none"
        w="8px"
        h="8px"
        borderRadius="2px"
        bg={dot.bg}
        border="1.5px solid"
        borderColor={dot.border}
      />
      <Text
        flex="none"
        fontFamily="var(--font-ibm-plex-mono), monospace"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="-0.01em"
        color="oklch(0.22 0.025 262)"
      >
        {code}
      </Text>
      <Text
        flex="1"
        minW="0"
        fontSize={fontSize}
        color="oklch(0.52 0.02 262)"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {title}
      </Text>
      {onRemove ? (
        <>
          <Text
            flex="none"
            fontFamily="var(--font-ibm-plex-mono), monospace"
            fontSize="11px"
            color="oklch(0.70 0.015 262)"
            _groupHover={{ display: "none" }}
          >
            {cr}cr
          </Text>
          <IconButton
            aria-label={`Remove ${code}`}
            onClick={onRemove}
            variant="ghost"
            size="2xs"
            flex="none"
            minW="auto"
            h="auto"
            p="1px"
            color="oklch(0.70 0.015 262)"
            display="none"
            _groupHover={{ display: "inline-flex" }}
            _hover={{ color: "oklch(0.40 0.11 262)" }}
          >
            <FiX size={13} />
          </IconButton>
        </>
      ) : (
        <Text
          flex="none"
          fontFamily="var(--font-ibm-plex-mono), monospace"
          fontSize="11px"
          color="oklch(0.70 0.015 262)"
        >
          {cr}cr
        </Text>
      )}
    </Flex>
  );
}
