"use client"

import { Box, IconButton, Input } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  searching: boolean;
}

export function SearchBar({ value, onChange, onClear, searching }: SearchBarProps) {
  return (
    <Box
      as="label"
      display="flex"
      alignItems="center"
      gap="14px"
      borderBottom="2px solid"
      borderColor="oklch(0.87 0.012 80)"
      px="4px"
      h="58px"
      maxW="600px"
      mx="auto"
      transition="border-color .15s"
      _focusWithin={{ borderColor: "oklch(0.40 0.11 262)" }}
    >
      <Box flex="none" color="oklch(0.60 0.02 262)" display="flex">
        <FiSearch size={20} />
      </Box>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for a major to get started…"
        variant="flushed"
        border="none"
        outline="none"
        bg="transparent"
        flex="1"
        fontSize="17px"
        color="oklch(0.22 0.025 262)"
        h="100%"
        px="0"
        _focus={{ boxShadow: "none" }}
        _placeholder={{ color: "oklch(0.68 0.015 262)" }}
      />
      {searching && (
        <IconButton
          onClick={onClear}
          aria-label="Clear search"
          variant="ghost"
          size="sm"
          flex="none"
          color="oklch(0.60 0.02 262)"
        >
          <FiX size={17} />
        </IconButton>
      )}
    </Box>
  );
}
