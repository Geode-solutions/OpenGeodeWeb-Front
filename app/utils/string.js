const DEFAULT_MAX_LENGTH = 20;
const DEFAULT_START_CHARS = 8;
const DEFAULT_END_CHARS = 6;

/**
 * Truncates a string in the middle.
 * @param {string} text - The string to truncate.
 * @param {number} maxLength - The maximum length of the string before truncation.
 * @param {number} startChars - Number of characters to keep at the beginning.
 * @param {number} endChars - Number of characters to keep at the end.
 * @returns {string} The truncated string.
 */
export function middleTruncate(
  text,
  maxLength = DEFAULT_MAX_LENGTH,
  startChars = DEFAULT_START_CHARS,
  endChars = DEFAULT_END_CHARS,
) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const start = text.slice(0, startChars);
  const end = text.slice(-endChars);
  return `${start}...${end}`;
}
