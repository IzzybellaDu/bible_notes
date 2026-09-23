import { formatPassageRef } from './overlap';

const CACHE_PREFIX = 'bible_cache_v2_';

/**
 * Fetches Bible passage text.
 * 1. Checks LocalStorage cache first.
 * 2. Tries ESV API if VITE_ESV_API_KEY is available.
 * 3. Falls back to bible-api.com (WEB translation).
 */
export async function fetchPassageText(book, cStart, vStart, cEnd, vEnd, apiKeyOverride = '') {
  const refStr = formatPassageRef(book, cStart, vStart, cEnd, vEnd);
  if (!refStr) return { text: '', source: 'none' };

  const cacheKey = `${CACHE_PREFIX}${refStr}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const esvKey = apiKeyOverride || import.meta.env.VITE_ESV_API_KEY || '';

  // Try ESV API first if key is present
  if (esvKey) {
    try {
      const url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(refStr)}&include-passage-references=false&include-verse-numbers=true&include-first-verse-numbers=true&include-footnote-body=false&include-footnotes=false&include-headings=false&include-short-copyright=false`;
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Token ${esvKey}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.passages && data.passages.length > 0) {
          const result = {
            text: data.passages.join('\n\n').trim(),
            translation: 'ESV',
            source: 'ESV API (Crossway)'
          };
          localStorage.setItem(cacheKey, JSON.stringify(result));
          return result;
        }
      }
    } catch (err) {
      console.warn('ESV API fetch failed, falling back to WEB:', err);
    }
  }

  // Fallback to bible-api.com (WEB translation)
  try {
    const webUrl = `https://bible-api.com/${encodeURIComponent(refStr)}`;
    const resp = await fetch(webUrl);
    if (resp.ok) {
      const data = await resp.json();
      if (data.text) {
        const result = {
          text: data.text.trim(),
          translation: 'WEB',
          source: 'World English Bible (bible-api.com)'
        };
        localStorage.setItem(cacheKey, JSON.stringify(result));
        return result;
      }
    }
  } catch (err) {
    console.error('Bible API fallback failed:', err);
  }

  return {
    text: `[Passage text for ${refStr} could not be loaded. Please check your internet connection or ESV API key in Settings.]`,
    translation: 'Unavailable',
    source: 'Error'
  };
}
