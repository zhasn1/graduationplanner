"use client";

import { useState } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { Program } from "@/lib/db";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { Footer } from "./Footer";

interface LandingProps {
  programs: Program[];
}

function matchesQuery(program: Program, query: string) {
  return program.name.toLowerCase().includes(query);
}

export function HomePage({ programs }: LandingProps) {
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  const q = query.trim().toLowerCase();
  const matched = q ? programs.filter((p) => matchesQuery(p, q)) : [];
  const sections = [
      {
        label: "Majors",
        items: matched.filter((p) => p.type === "Bachelor's"),
      },
      { label: "Minors", items: matched.filter((p) => p.type === "Minor") },
      {
        label: "Other programs",
        items: matched.filter(
          (p) => p.type !== "Bachelor's" && p.type !== "Minor",
        ),
      },
    ];

  const noResults = searching && sections.every((s) => s.items.length === 0);

  return (
    <Flex
      position="relative"
      h="100vh"
      w="100%"
      direction="column"
      overflow="hidden"
      bg="canvas"
      backgroundImage="repeating-linear-gradient(to bottom, transparent, transparent 35px, oklch(0.90 0.012 80 / 0.55) 35px, oklch(0.90 0.012 80 / 0.55) 36px)"
    >
      <Box
        position="relative"
        zIndex={1}
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent={searching ? "flex-start" : "center"}
        textAlign="center"
        px="24px"
        pt="8vh"
        pb="40px"
        overflowY="auto"
      >
        <Box maxW="640px" w="100%">
          <Box
            overflow="hidden"
            transition="max-height .4s ease, opacity .3s ease, transform .4s ease"
            maxH={searching ? "0" : "400px"}
            opacity={searching ? 0 : 1}
            transform={searching ? "translateY(-16px)" : "none"}
          >
            <Flex align="center" gap="16px" mb="26px">
              <Box flex="1" h="1px" bg="line" />
            </Flex>
            <Heading
              as="h1"
              fontFamily={{ base: "48px", md: "72px" }}
              fontWeight="500"
              fontSize="72px"
              lineHeight="1.02"
              letterSpacing="-0.02em"
              m="0 0 20px"
              color="maroon"
              textAlign="left"
            >
              Graduation Planner
            </Heading>
            <Text
              fontSize="19px"
              lineHeight="1.5"
              color="ink.soft"
              m="0 0 44px"
              maxW="520px"
              textAlign="left"
            >
              View major requirements, plan courses, and stay on track for
              graduation.
            </Text>
          </Box>

          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            searching={searching}
          />

          {searching && (
            <SearchResults
              query={query}
              sections={sections}
              noResults={noResults}
            />
          )}
        </Box>
      </Box>
      <Footer />
    </Flex>
  );
}
