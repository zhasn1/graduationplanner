import { Flex, Link, Text } from "@chakra-ui/react";
import { FiGithub } from "react-icons/fi";

export function Footer() {
  return (
    <Flex
      as="footer"
      flex="none"
      align="center"
      justify="center"
      gap="16px"
      bg="panel"
      borderTop="1px solid"
      borderColor="line"
      px="24px"
      py="18px"
      fontSize="13px"
      color="ink.muted"
    >
      <Link
        href="https://github.com/zhasn1/graduationplanner"
        target="_blank"
        rel="noopener"
        display="inline-flex"
        alignItems="accent"
        gap="8px"
        color="accent"
        fontWeight="500"
        _hover={{ color: "accent.hover" }}
      >
        <FiGithub size={18} />
        View project on GitHub
      </Link>
      <Text as="span">Not affiliated with the University of Minnesota</Text>
    </Flex>
  );
}
