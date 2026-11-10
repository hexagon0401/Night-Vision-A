# Map reliability repair — 2026-11-10

The previous monochrome style painted both land background and water `#050505`. Country borders and labels could load normally while the coastline disappeared. Land now uses `#202020`, ocean `#050505`; source geography is unchanged.

The pinned OpenFreeMap/OSM vector style keeps roads, rivers, boundaries, towns and country labels in 18 layers (previously 102). No satellite imagery, terrain, buildings, road casings or sprites. Existing CC BY 4.0/OSM attribution remains. MapLibre renders candidates, approximate event rings, relation dashes, cluster labels and Trace in one WebGL context. There is no deck.gl runtime import or second canvas; archived packages remain intact. Trace arcs express relationships, never observed tracks.

Pixel ratio is capped at 2 and tile fade is disabled. A missing font or isolated tile no longer immediately replaces a healthy map. A failed TileJSON switches to local Natural Earth; unresolved source failures have a 12-second grace period. The offline map has the same visible land/ocean contrast and an explicit degraded-state notice.

Verification: 18 unit tests and 9 desktop/mobile Playwright tests pass, including native marker picking, Trace, view reuse, synthetic event uncertainty, and ZIP download. Navigation tests now require exactly one canvas. Real OpenFreeMap browser checks loaded the detailed map in 10 visits with no JavaScript errors. Those local development-server measurements are not comparable to previous deployed production measurements; deployed measurements are recorded separately after merging.

Live-data follow-up: an empty-feed measurement is not a loaded-data result. At 500 loaded records, measured cold/revisit medians were 2,569/2,269ms in the same cloud browser. Limit initial unfiltered detail to 100 visible records (full counts unchanged), expand to 500 on country/period selection, and avoid resubmitting static event geometry on camera movement. Record a new production measurement after deployment; do not present the earlier empty-feed 1,478ms revisit as the loaded result.
