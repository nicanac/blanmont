// utils/string.utils.ts
export const stripSuffix = (value: string | null | undefined, separator: string = '#'): string => {
  if (!value) return '';
  return value.indexOf(separator) > -1 
    ? value.substring(0, value.indexOf(separator)) 
    : value;
};