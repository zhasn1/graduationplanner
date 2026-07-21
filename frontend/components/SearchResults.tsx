import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import NextLink from "next/link";
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
      <Text fontFamily="mono" fontSize="12.5px" color="ink.muted" mb="20px">
        RESULTS FOR{" "}
        <Box as="span" fontWeight="600" color="ink">
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
                borderColor="line"
                pb="8px"
              >
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="accent"
                >
                  {section.label}
                </Text>
                <Text fontFamily="mono" fontSize="11.5px" color="ink.fainter">
                  {section.items.length}
                </Text>
              </Flex>
              <Flex direction="column">
                {section.items.map((item) => (
                  <Link
                    asChild
                    key={item.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap="12px"
                    py="14px"
                    px="6px"
                    borderBottom="1px solid"
                    borderColor="line.soft"
                    color="ink"
                    transition="background .12s"
                    _hover={{
                      bg: "accent.bg",
                      color: "accent.hover",
                    }}
                  >
                    <NextLink href={`/planner?program_id=${item.id}`}>
                      <Text fontSize="15px" fontWeight="600">
                        {item.name}
                      </Text>
                      <Box flex="none" color="accent.soft">
                        <FiChevronRight size={16} />
                      </Box>
                    </NextLink>
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
          color="ink.muted"
          fontSize="15px"
        >
          No programs match &ldquo;{query}&rdquo;. Try a different major, minor,
          or keyword.
        </Box>
      )}
    </Box>
  );
}
