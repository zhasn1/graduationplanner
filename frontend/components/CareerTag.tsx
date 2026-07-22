import { Text } from "@chakra-ui/react";

export function careerLabel(career: string): string | null {
  if (career === "Undergraduate") return null;
  if (career === "Graduate") return "Grad";
  return career;
}

const careerRank = (career: string) =>
  career === "Undergraduate" ? 0 : career === "Graduate" ? 1 : 2;

export const byCareer = (a: { career: string }, b: { career: string }) =>
  careerRank(a.career) - careerRank(b.career);

export function CareerTag({ career }: { career: string }) {
  const label = careerLabel(career);
  if (!label) return null;
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
      color="gold.text"
      bg="gold.bg"
      px="6px"
      py="1px"
      borderRadius="3px"
    >
      {label}
    </Text>
  );
}
