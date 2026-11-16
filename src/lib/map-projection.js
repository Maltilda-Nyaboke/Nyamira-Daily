// Longitude and latitude to the county map's SVG coordinates (src/data/geo.json). Used by the town marks.
import geo from '../data/geo.json' with { type: 'json' };

export function project(lon, lat) {
  const p = geo.proj;
  return [(lon - p.minx) * p.k * p.sc, (p.maxy - lat) * p.sc];
}
