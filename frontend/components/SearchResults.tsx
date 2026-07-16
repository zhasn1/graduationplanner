import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import type { Program } from "../lib/db";

export interface ProgramSection {
  label: string;
  items: Program[];
}

interface SearchResultsProps {
  query: string;
  sections: ProgramSection[];
  noResults: boolean;
}

export function SearchResults({
  query,
  sections,
  noResults,
}: SearchResultsProps) {
  return (
    <Box maxW="600px" mx="auto" mt="30px" textAlign="left">
      <Text
        fontFamily="var(--font-ibm-plex-mono), monospace"
        fontSize="12.5px"
        color="oklch(0.60 0.02 262)"
        mb="20px"
      >
        RESULTS FOR{" "}
        <Box as="span" fontWeight="600" color="oklch(0.22 0.025 262)">
          &ldquo;{query}&rdquo;
        </Box>
      </Text>

      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <Box key={section.label} mb="30px">
              <Flex
                align="baseline"
                gap="10px"
                mb="10px"
                borderBottom="1px solid"
                borderColor="oklch(0.87 0.012 80)"
                pb="8px"
              >
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="oklch(0.40 0.11 262)"
                >
                  {section.label}
                </Text>
                <Text
                  fontFamily="var(--font-ibm-plex-mono), monospace"
                  fontSize="11.5px"
                  color="oklch(0.70 0.015 262)"
                >
                  {section.items.length}
                </Text>
              </Flex>
              <Flex direction="column">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/planner?program_id=${item.id}`}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="12px"
                    py="14px"
                    px="6px"
                    borderBottom="1px solid"
                    borderColor="oklch(0.90 0.01 80)"
                    color="oklch(0.22 0.025 262)"
                    transition="background .12s"
                    _hover={{
                      bg: "oklch(0.94 0.02 262)",
                      color: "oklch(0.30 0.10 262)",
                    }}
                  >
                    <Text fontSize="15px" fontWeight="600">
                      {item.name}
                    </Text>
                    <Box flex="none" color="oklch(0.55 0.05 262)">
                      <FiChevronRight size={16} />
                    </Box>
                  </Link>
                ))}
              </Flex>
            </Box>
          ),
      )}

      {noResults && (
        <Box
          textAlign="center"
          py="36px"
          px="20px"
          color="oklch(0.60 0.02 262)"
          fontSize="15px"
        >
          No programs match &ldquo;{query}&rdquo;. Try a different major, minor,
          or keyword.
        </Box>
      )}
    </Box>
  );
}
