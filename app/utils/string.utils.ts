// utils/string.utils.ts
/**
 * Removes a suffix from a string starting with a given separator.
 * Useful for cleaning up trace names that have versions attached (e.g., "Ride #123").
 * 
 * @param value - The input string to process.
 * @param separator - The character that marks the start of the suffix (default: '#').
 * @returns The clean string with the suffix removed, or an empty string if input is null/undefined.
 */
export const stripSuffix = (value: string | null | undefined, separator: string = '#'): string => {
  if (!value) return '';
  return value.indexOf(separator) > -1 
    ? value.substring(0, value.indexOf(separator)) 
    : value;
};