const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ');

const isAsciiControlCharacter = (character: string) => {
  const code = character.charCodeAt(0);
  return (
    (code >= 0 && code <= 8) ||
    code === 11 ||
    code === 12 ||
    (code >= 14 && code <= 31) ||
    code === 127
  );
};

const removeControlCharacters = (value: string, replacement = '') =>
  Array.from(value, (character) =>
    isAsciiControlCharacter(character) ? replacement : character,
  ).join('');

export const sanitizeSingleLineInput = (value: string) =>
  collapseWhitespace(
    removeControlCharacters(value, ' ').replace(/[\r\n]+/g, ' '),
  ).trimStart();

export const sanitizeSingleLineForSubmission = (value: string) =>
  sanitizeSingleLineInput(value).trim();

export const sanitizeMultilineInput = (value: string) =>
  removeControlCharacters(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();

export const sanitizeMultilineForSubmission = (value: string) =>
  sanitizeMultilineInput(value).trim();

export const sanitizeEmailInput = (value: string) =>
  removeControlCharacters(value)
    .replace(/\s+/g, '')
    .toLowerCase();

export const sanitizePhoneInput = (value: string) =>
  removeControlCharacters(value)
    .replace(/\t+/g, ' ')
    .replace(/[^0-9+().\-\s]/g, '')
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .trimStart();

export const sanitizeSearchInput = (value: string) =>
  removeControlCharacters(value).replace(/\s+/g, ' ').trimStart();

export const sanitizePasswordInput = (value: string) =>
  removeControlCharacters(value);
