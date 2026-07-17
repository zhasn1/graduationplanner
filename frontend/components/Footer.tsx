import { Box, Link, Text } from "@chakra-ui/react";
import { FiGithub } from "react-icons/fi";

export function Footer() {
  return (
    <Box
      as="footer"
      position="relative"
      zIndex={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="12px"
      px="24px"
      pt="22px"
      pb="30px"
      fontSize="13px"
      color="oklch(0.60 0.02 262)"
      lineHeight="1.6"
    >
      <Link
        href="https://github.com/samyok/repo"
        target="_blank"
        rel="noopener"
        display="inline-flex"
        alignItems="center"
        gap="8px"
        color="oklch(0.40 0.11 262)"
        fontWeight="500"
        _hover={{ color: "oklch(0.30 0.10 262)" }}
      >
        <FiGithub size={18} />
        View project on GitHub
      </Link>
      <Text>Not affiliated with the University of Minnesota</Text>
    </Box>
  );
}
