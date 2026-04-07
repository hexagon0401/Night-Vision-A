# TO_Foundry_v5.md Improvements Summary

## 1. CSV Format & Ingestion
- **Geopoint Format**: Clarified that `geopoint` properties in Ontology should be a single string `"latitude,longitude"` (e.g., `"34.885,49.219"`) or a Geohash. The previous version used separate `lat` and `lng` columns which are good for raw data but need to be combined for the `geopoint` property.
- **Geoshape (GeoJSON)**: Emphasized that `geoshape` must be a GeoJSON Geometry string (LineString, Polygon, etc.) and NOT a Feature or FeatureCollection.
- **CSV Parsing**: Added `MULTILINE_CSV_PARSER` as a specific option for GeoJSON columns to handle potential newlines.

## 2. Route Tracking & Visualization
- **Track Objects**: Added detailed configuration for "Track Latitude" and "Track Longitude" in the Geospatial section of Capabilities. These must be **numeric time series properties**.
- **Interpolation & Gap**: Added "Interpolation mode" (Linear vs Last known) and "Max time gap" settings for smoother route visualization.
- **Track Displays**: Added "Track lines" and "Track breadcrumbs" as distinct display types.

## 3. Category-Specific Details
- **Points**: Icons and Circles.
- **Routes/Areas**: Lines and Polygons (via `geoshape` or multiple `geopoint` properties).
- **Choropleths**: Added "Boundary identifiers" (ISO codes) vs "Linked objects" methods.
- **Events**: Added "Event start time", "Event end time", and "Event intent" (severity) for temporal analysis.

## 4. Technical Corrections
- **Coordinate Order**: Re-confirmed GeoJSON uses `[longitude, latitude]` while Foundry `geopoint` string uses `"latitude,longitude"`.
- **Type Classes**: Added specific type class requirements for Georectified Images (`Kind: geo`, `Value: bounds.<image_url_id>`).
- **H3 Hexagons**: Added H3 cell ID configuration in Capabilities.

## 5. Workflow Optimization
- **Pipeline Builder**: Noted that `geospatial-tools` library is legacy; Pipeline Builder is now the preferred way for geospatial transforms.
- **Ontology Mapping**: Clearer mapping between CSV columns -> Spark Types -> Ontology Properties -> Map Layers.
