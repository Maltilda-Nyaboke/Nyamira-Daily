// Videos (decision #117): one list, from the Google Sheet's videos tab via `npm run living:sync`
// (src/data/living/videos.json). Each video names the places it covers and the site pages with its figures.
import videos from '../data/living/videos.json' with { type: 'json' };

export const videoPath = (id) => `/watch/${id}/`;
export const allVideos = [...videos].sort((a, b) => b.published_on.localeCompare(a.published_on));
export const videoById = new Map(allVideos.map((v) => [v.id, v]));
export const videoByYoutube = new Map(allVideos.map((v) => [v.youtube_id, v]));
export const videosForPlace = (placeId) => allVideos.filter((v) => v.places.includes(placeId));
