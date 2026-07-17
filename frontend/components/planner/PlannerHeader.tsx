import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { FiChevronLeft } from "react-icons/fi";

interface PlannerHeaderProps {
  program: string;
  creditsEarned: number;
  totalCredits: number;
}

export function PlannerHeader({
  program,
  creditsEarned,
  totalCredits,
}: PlannerHeaderProps) {
  const pct = Math.min(100, Math.round((creditsEarned / totalCredits) * 100));

  return (
    <Flex
      as="header"
      flex="none"
      align="center"
      justify="space-between"
      gap="24px"
      bg="oklch(0.99 0.004 85)"
      borderBottom="1px solid"
      borderColor="oklch(0.87 0.012 80)"
      px="34px"
      py="16px"
    >
      <Flex align="center" gap="16px">
        <Link
          href="/"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="36px"
          h="36px"
          borderRadius="4px"
          border="1px solid"
          borderColor="oklch(0.87 0.012 80)"
          color="oklch(0.40 0.11 262)"
          flex="none"
        >
          <FiChevronLeft size={16} />
        </Link>
        <Box>
          <Text
            fontFamily="var(--font-newsreader), serif"
            fontSize="23px"
            fontWeight="600"
            color="oklch(0.22 0.025 262)"
            lineHeight="1"
          >
            {program}
          </Text>
          <Flex align="center" gap="8px" mt="10px" wrap="wrap">
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              gap="7px"
              fontFamily="var(--font-ibm-plex-mono), monospace"
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.04em"
              textTransform="uppercase"
              color="oklch(0.99 0.004 85)"
              bg="oklch(0.40 0.11 262)"
              px="11px"
              py="5px"
              borderRadius="4px"
            >
              {program}
            </Box>
            <Button
              display="inline-flex"
              alignItems="center"
              gap="5px"
              fontFamily="var(--font-ibm-plex-mono), monospace"
              fontSize="11px"
              fontWeight="600"
              letterSpacing="0.04em"
              textTransform="uppercase"
              color="oklch(0.40 0.11 262)"
              bg="transparent"
              border="1px dashed"
              borderColor="oklch(0.70 0.05 262)"
              px="11px"
              py="5px"
              h="auto"
              borderRadius="4px"
            >
              + Add minor or major
            </Button>
          </Flex>
        </Box>
      </Flex>

      <Box flex="none">
        <Text
          fontSize="11px"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="oklch(0.92 0.008 80)"
        >
          Credits
        </Text>
        <Flex align="baseline" gap="8px" mt="4px">
          <Text
            fontFamily="var(--font-ibm-plex-mono), monospace"
            fontSize="22px"
            fontWeight="600"
            color="oklch(0.40 0.11 262)"
            lineHeight="1"
          >
            {creditsEarned}
          </Text>
          <Text
            fontFamily="var(--font-ibm-plex-mono), monospace"
            fontSize="13px"
            color="oklch(0.92 0.008 80)"
          >
            / {totalCredits}
          </Text>
        </Flex>
        <Box
          w="220px"
          h="5px"
          borderRadius="2px"
          bg="oklch(0.90 0.01 80)"
          mt="8px"
          overflow="hidden"
        >
          <Box
            w={`${pct}%`}
            h="100%"
            bg="oklch(0.40 0.11 262)"
            borderRadius="2px"
          />
        </Box>
      </Box>
    </Flex>
  );
}
