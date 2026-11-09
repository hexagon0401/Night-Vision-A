# Basemap provenance

Natural Earth admin 0 country polygons, 1:110m, v5.1.2. Downloaded unchanged from:
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson

SHA-256: 6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f
838726 bytes; 177 features. This is real generalized cartography, not generated imagery, authoritative surveying or intelligence. Boundaries do not imply endorsement of disputed claims. Original license retained alongside the data. The maintainers describe this dataset as public domain in the pinned README/LICENSE. The main website terms page returned HTTP 406 during review; the pinned repository license was readable.

MapLibre/deck.gl render these local polygons and source-backed/synthetic overlay points. No external tile/font endpoint or API key is needed for the offline demo. OpenFreeMap integration is deferred until live basemap selection is needed. Do not derive GIS coordinates from concept PNGs.
