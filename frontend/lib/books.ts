export const MAX_BOOKS = 19;

export function titleFromFilename(filename: string) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}


const bookColors = [
  "var(--sage)",
  "var(--navy)",
  "var(--brown)",
  "var(--plum)",
  "var(--teal)",
  "var(--moss)",
  "var(--amber)",
];

export function getBookColor(index: number) {
  return bookColors[index % bookColors.length];
}

