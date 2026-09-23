/**
 * Determines if two Bible passage references overlap.
 */
export function doPassagesOverlap(noteA, noteB) {
  if (!noteA || !noteB) return false;
  if ((noteA.book || '').trim().toLowerCase() !== (noteB.book || '').trim().toLowerCase()) {
    return false;
  }

  const startA = (noteA.chapter_start || 1) * 1000 + (noteA.verse_start || 1);
  const endA = (noteA.chapter_end || noteA.chapter_start || 1) * 1000 + (noteA.verse_end || 999);

  const startB = (noteB.chapter_start || 1) * 1000 + (noteB.verse_start || 1);
  const endB = (noteB.chapter_end || noteB.chapter_start || 1) * 1000 + (noteB.verse_end || 999);

  return startA <= endB && startB <= endA;
}

/**
 * Format a structured passage reference into a human readable string.
 * e.g., "John 3:16", "John 3:16–21", "Genesis 1:26–2:3"
 */
export function formatPassageRef(book, cStart, vStart, cEnd, vEnd) {
  if (!book) return '';
  const cS = cStart || 1;
  const vS = vStart || 1;
  const cE = cEnd || cS;
  const vE = vEnd || vS;

  if (cS === cE) {
    if (vS === vE) {
      return `${book} ${cS}:${vS}`;
    }
    return `${book} ${cS}:${vS}–${vE}`;
  }
  return `${book} ${cS}:${vS}–${cE}:${vE}`;
}

/**
 * Parse a passage reference string like "John 3:16", "John 3:16-21", "Gen 1:26-2:3"
 */
export function parsePassageRef(refStr) {
  if (!refStr) return null;
  const trimmed = refStr.trim();
  const match = trimmed.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:\s*[-–]\s*(?:(\d+):)?(\d+))?$/);
  if (!match) return null;

  const book = match[1];
  const cStart = parseInt(match[2], 10);
  const vStart = parseInt(match[3], 10);

  let cEnd = cStart;
  let vEnd = vStart;

  if (match[5]) {
    if (match[4]) {
      cEnd = parseInt(match[4], 10);
    }
    vEnd = parseInt(match[5], 10);
  }

  return { book, chapter_start: cStart, verse_start: vStart, chapter_end: cEnd, verse_end: vEnd };
}
