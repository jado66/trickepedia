import React from "react";

/**
 * Split text on CR/LF variants.
 */
const LINE_SPLIT_REGEX = /\r\n|\n|\r/;

/**
 * Renders a multi-line description preserving line breaks with a configurable line break element.
 * Consecutive blank lines are collapsed to a single blank line by default.
 */
export function renderMultilineDescription(
  text: string | null | undefined,
  options: {
    lineBreakElement?: React.ReactNode; // defaults to <br />
    collapseMultipleBlankLines?: boolean; // default true
    fallback?: string;
  } = {}
): React.ReactNode {
  const {
    lineBreakElement = <br />,
    collapseMultipleBlankLines = true,
    fallback = "No description available.",
  } = options;

  if (!text) return fallback;

  // Normalize line endings first
  const lines = text.split(LINE_SPLIT_REGEX);

  const processed: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (collapseMultipleBlankLines) {
      const prev = processed[processed.length - 1];
      if (line.trim() === "" && prev === "") continue; // skip extra blank
      processed.push(line.trimEnd());
    } else {
      processed.push(line);
    }
  }

  return processed.map((line, idx) => (
    <React.Fragment key={idx}>
      {line}
      {idx < processed.length - 1 && lineBreakElement}
    </React.Fragment>
  ));
}

/**
 * Converts multi-line text into a single line (for compact cards, metadata, etc.)
 * by replacing any sequence of whitespace (including newlines) with a single space.
 * Optionally truncates to `maxLength` and appends ellipsis.
 */
export function getInlineDescription(
  text: string | null | undefined,
  maxLength?: number,
  options: { fallback?: string; ellipsis?: string } = {}
): string {
  const { fallback = "", ellipsis = "..." } = options;
  if (!text) return fallback;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (maxLength && normalized.length > maxLength) {
    return (
      normalized.substring(0, maxLength - ellipsis.length).trimEnd() + ellipsis
    );
  }
  return normalized;
}

/**
 * Utility to strip all newlines but keep single spaces (no truncation).
 * Alias kept for clarity when you only want newline normalization.
 */
export function normalizeDescription(text: string | null | undefined): string {
  return getInlineDescription(text);
}

/**
 * Decide automatically between multi-line or inline rendering based on a flag.
 */
export function formatDescription(
  text: string | null | undefined,
  opts: { multiline?: boolean; maxLength?: number } = {}
): React.ReactNode | string {
  const { multiline = true, maxLength } = opts;
  if (multiline) return renderMultilineDescription(text || "");
  return getInlineDescription(text, maxLength);
}
