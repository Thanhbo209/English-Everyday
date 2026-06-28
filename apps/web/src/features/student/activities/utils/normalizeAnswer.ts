/**
 * Normalizes user answer input to allow tolerant comparisons:
 * - Trims leading/trailing whitespace
 * - Collapses internal consecutive whitespaces
 * - Converts to lowercase
 * - Strips accents/diacritics (e.g., café -> cafe, mañana -> manana)
 */
export function normalizeAnswer(value: string): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
