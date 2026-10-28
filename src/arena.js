// Accepts a full channel URL (https://www.are.na/user/my-channel) or just the slug.
export function arenaSlug(input) {
  return input.trim().replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
}

// Public channels only; the API needs no key and allows browser requests.
export async function fetchArenaImages(input) {
  const slug = arenaSlug(input);
  const per = 100;
  const urls = [];
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://api.are.na/v2/channels/${encodeURIComponent(slug)}/contents?per=${per}&page=${page}`
    );
    if (!res.ok) {
      throw new Error(res.status === 404 ? `Channel "${slug}" not found` : `Are.na error ${res.status}`);
    }
    const { contents } = await res.json();
    // thumb (400px) for distance, display (1200px) swapped in up close
    urls.push(
      ...contents
        .filter((b) => b.image)
        .map((b) => ({ thumb: b.image.thumb.url, display: b.image.display.url }))
    );
    if (contents.length < per) return urls;
  }
}
