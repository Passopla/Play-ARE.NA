// Accepts a full channel URL (https://www.are.na/user/my-channel) or just the slug.
export function arenaSlug(input) {
  return input.trim().replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
}

// Images are fetched this many blocks at a time, as the viewer nears rooms that are still empty
export const PAGE_SIZE = 25;

// Goes through /arena (our own server), which adds the API token; see vite.config.js and api/arena.js.
// The GitHub Pages build has no server: deploy.sh sets VITE_ARENA_API to the Amanzi site's
// /api/arena, which adds the token there (ARENA_TOKEN in that Vercel project).
async function arena(path) {
  const res = await fetch(`${import.meta.env.VITE_ARENA_API ?? '/arena'}/v2/channels/${path}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404 ? 'Channel not found'
        : res.status === 429 ? 'Are.na is limiting requests, try again in a minute'
        : `Are.na error ${res.status}`
    );
  }
  return res.json();
}

// Number of blocks in the channel (images and otherwise), without fetching them
export async function fetchChannelLength(slug) {
  const { length } = await arena(`${encodeURIComponent(slug)}?per=1`);
  return length;
}

// One page of PAGE_SIZE blocks, keeping the images: thumb (400px) for distance, display (1200px) up close
export async function fetchArenaPage(slug, page) {
  const { contents } = await arena(`${encodeURIComponent(slug)}/contents?per=${PAGE_SIZE}&page=${page}`);
  return contents
    .filter((b) => b.image)
    .map((b) => ({ thumb: b.image.thumb.url, display: b.image.display.url }));
}
