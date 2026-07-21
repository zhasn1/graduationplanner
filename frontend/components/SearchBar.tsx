"use client";

import { Box, IconButton, Input } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  searching: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  searching,
}: SearchBarProps) {
  return (
    <Box
      as="label"
      display="flex"
      alignItems="center"
      gap="14px"
      borderBottom="2px solid"
      borderColor="line"
      px="4px"
      h="58px"
      maxW="600px"
      mx="auto"
      transition="border-color .15s"
      _focusWithin={{ borderColor: "accent" }}
    >
      <Box flex="none" color="ink.muted" display="flex">
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
        color="ink"
        h="100%"
        px="0"
        _focus={{ boxShadow: "none" }}
        _placeholder={{ color: "ink.faint" }}
      />
      {searching && (
        <IconButton
          onClick={onClear}
          aria-label="Clear search"
          variant="ghost"
          size="sm"
          flex="none"
          color="ink.muted"
        >
          <FiX size={17} />
        </IconButton>
      )}
    </Box>
  );
}
