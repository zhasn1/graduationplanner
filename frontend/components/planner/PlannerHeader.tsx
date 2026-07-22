import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { FiChevronLeft } from "react-icons/fi";
import NextLink from "next/link";
import { careerLabel } from "../CareerTag";

interface PlannerHeaderProps {
  program: string;
  career: string;
  creditsEarned: number;
  totalCredits: number;
}

export function PlannerHeader({
  program,
  career,
  creditsEarned,
  totalCredits,
}: PlannerHeaderProps) {
  const pct =
    totalCredits > 0
      ? Math.min(100, Math.round((creditsEarned / totalCredits) * 100))
      : 0;

  return (
    <Flex
      as="header"
      flex="none"
      align="center"
      justify="space-between"
      gap="24px"
      bg="panel"
      borderBottom="1px solid"
      borderColor="line"
      px="34px"
      py="16px"
    >
      <Flex align="center" gap="16px">
        <Link
          asChild
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="36px"
          h="36px"
          borderRadius="4px"
          border="1px solid"
          borderColor="line"
          color="accent"
          flex="none"
        >
          <NextLink href="/" aria-label="Back to program search">
            <FiChevronLeft size={16} />
          </NextLink>
        </Link>
        <Box>
          <Text
            fontFamily="heading"
            fontSize="23px"
            fontWeight="600"
            color="ink"
            lineHeight="1"
          >
            {program}
          </Text>
          <Flex align="center" gap="8px" mt="10px" wrap="wrap">
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              flex="none"
              gap="7px"
              fontFamily="mono"
              fontSize="10px"
              fontWeight="600"
              letterSpacing="0.04em"
              textTransform="uppercase"
              color="panel"
              bg="accent"
              px="11px"
              py="5px"
              borderRadius="4px"
            >
              {program}
              {careerLabel(career) && ` · ${careerLabel(career)}`}
            </Box>
            {/* <Button
              display="inline-flex"
              alignItems="center"
              gap="5px"
              fontFamily="mono"
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.04em"
              textTransform="uppercase"
              color="accent"
              bg="transparent"
              border="1px dashed"
              borderColor="accent.border"
              px="11px"
              py="5px"
              h="auto"
              borderRadius="4px"
            >
              + Add minor or major
            </Button> */}
          </Flex>
        </Box>
      </Flex>

      <Box flex="none">
        <Text
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="ink.faint"
        >
          Credits
        </Text>
        <Flex align="baseline" gap="8px" mt="4px">
          <Text
            fontFamily="mono"
            fontSize="22px"
            fontWeight="600"
            color="accent"
            lineHeight="1"
          >
            {creditsEarned}
          </Text>
          <Text
            fontFamily="mono"
            fontSize="13px"
            color="ink.faint"
          >
            / {totalCredits}
          </Text>
        </Flex>
        <Box
          w="220px"
          h="5px"
          borderRadius="2px"
          bg="line.soft"
          mt="8px"
          overflow="hidden"
        >
          <Box
            w={`${pct}%`}
            h="100%"
            bg="accent"
            borderRadius="2px"
          />
        </Box>
      </Box>
    </Flex>
  );
}
