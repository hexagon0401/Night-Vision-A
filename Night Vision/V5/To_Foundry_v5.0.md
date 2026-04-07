# TO_FOUNDRY.MD v5.0 — Palantir Foundry CSV Ingestion + Map Full Reference
# Source: palantir.com/docs/foundry (dataset-preview, map, geospatial — multiple sub-pages)
# Scope: Global intel / region-agnostic
# For AI consumption. English throughout; Korean used only where UI labels require it.

---

## FILE INDEX

```
§1   CSV Architecture (Backend A / B)
§2   TextDataFrameReader Parameter Reference
§3   Schema Field Types
§4   Schema Application Workflow
§5   Python Transforms (CSV→Parquet, Waypoint→LineString)
§6   Dataset Path Convention
§7   Ontology Object Types (Map-ready)
§8   Common Errors & Fixes
§9   Pre-Upload Validation Checklist
§10  Coordinate Conversion Reference
§11  [MAP] Core Concepts & Architecture
§12  [MAP] Interact with Maps
§13  [MAP] Time & Temporal Visualization
§14  [MAP] Visualize Ontology Data — All Layer Types
§15  [MAP] Integrate Data for the Map
§16  [MAP] Templates, Workshop Widget & Configuration
§17  [MAP] Geospatial Property Type Reference
§18  [MAP] Layer Decision Tree & Domain Matrix
§19  References
```

---

## §1. CSV Architecture Overview

Two reader backends. **Select before upload — cannot change after schema is applied without resetting.**

### Backend A: TextDataFrameReader (default — use first)
```json
{
  "dataFrameReaderClass": "com.palantir.foundry.spark.input.TextDataFrameReader",
  "customMetadata": {
    "textParserParams": {
      "parser": "CSV_PARSER",
      "charsetName": "UTF-8",
      "fieldDelimiter": ",",
      "recordDelimiter": "\n",
      "quoteCharacter": "\"",
      "dateFormat": {},
      "skipLines": 1,
      "jaggedRowBehavior": "THROW_EXCEPTION",
      "parseErrorBehavior": "THROW_EXCEPTION",
      "addFilePath": false,
      "addFilePathInsteadOfUri": false,
      "addImportedAt": false,
      "initialReadTimeout": "1 hour"
    }
  }
}
```

### Backend B: DataSourceDataFrameReader (Spark CSV — complex cases)
```json
{
  "dataFrameReaderClass": "com.palantir.foundry.spark.input.DataSourceDataFrameReader",
  "customMetadata": {
    "format": "csv",
    "options": {
      "header": true,
      "multiLine": true,
      "mode": "PERMISSIVE",
      "unescapedQuoteHandling": "STOP_AT_DELIMITER"
    }
  }
}
```

### Backend Selection Rules
| Condition | Backend |
|-----------|---------|
| Standard structured data | A |
| `geometry_geojson` column present | **B** (GeoJSON contains commas that break A) |
| Embedded newlines (`\n`) inside fields | **B** |
| Nested double-quotes inside fields | **B** |
| Multiline text descriptions | **B** |

**When to use "Save without Validating"**: Switch to Backend B after applying schema if nested quotes or GeoJSON cause validation failure. Set schema manually, then save without validating.

---

## §2. TextDataFrameReader: Parameter Reference

### charsetName (encoding)
Supported values (exact string, case-sensitive):
`UTF-8` (default) | `UTF-16` | `UTF-16BE` | `UTF-16LE` | `ISO_8859_1` | `US_ASCII` | `Windows-31J`

Rule: All files in this project → `UTF-8`. Strip BOM before upload if file is Excel-sourced.

### fieldDelimiter
Default: `,` | Alternatives: `\t` (TSV) | `;` (European Excel) | `|` (pipe)
Fields containing the delimiter character → wrap entire field in `"..."`

### jaggedRowBehavior
- `THROW_EXCEPTION` — fail on column-count mismatch (default; use for structured intel data)
- `DROP` — silently discard jagged rows (use for messy OSINT or free-text web data)

### parseErrorBehavior
- `THROW_EXCEPTION` — fail on parse error (default)
- `COERCE_TO_NULL` — replace unparseable values with null

### skipLines
- `1` — skip header row (default)
- `0` — no header; define schema columns manually

### Optional column additions
- `addFilePath: true` — append source file path column (useful for multi-file OSINT datasets)
- `addImportedAt: true` — append ingestion timestamp column (recommended for time-series data)

---

## §3. Schema Field Types Reference

Palantir Foundry supports various data types for schema fields, which are crucial for correct data interpretation and visualization, especially for geospatial data. [1]

| Foundry Type | Use For | Notes |
|-------------|---------|-------|
| `STRING` | IDs, names, text, URLs, GeoJSON, ISO codes | Default for `*_id`, `*_name`, `source_*`, `geometry_geojson`, `h3_cell_id`, `iso_alpha2` |
| `DOUBLE` | lat/lng, ratios, TIV values, radius | **Required** for `lat`, `lng`, `radius_m`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `LONG` | Integer counts, years, sequence order | `quantity`, `year`, `sequence_order` |
| `DATE` | Date-only fields | ISO 8601: `YYYY-MM-DD` |
| `TIMESTAMP` | Date + time fields | `YYYY-MM-DDTHH:MM:SSZ` — required for event and track columns |
| `BOOLEAN` | Flag columns | `true`/`false` lowercase only |
| `DECIMAL(38,18)` | High-precision financial values | Use when rounding error matters |

### Geospatial Property Types

For map-ready objects, specific geospatial property types are essential:

*   **`geopoint`**: Represents a single point on the map. The CSV column for a `geopoint` property should be a single `STRING` containing `"latitude,longitude"` (e.g., `"34.885,49.219"`) or a [Geohash](https://www.palantir.com/docs/foundry/geospatial/ontology/#points) [2]. Separate `lat` and `lng` columns are suitable for raw data but need to be combined into a single `geopoint` string for Ontology mapping.
*   **`geoshape`**: Represents lines or polygons. The CSV column for a `geoshape` property must be a `STRING` containing a [GeoJSON Geometry string](https://www.palantir.com/docs/foundry/geospatial/ontology/#polygons-and-lines) [2]. It must be a LineString, Polygon, MultiLineString, MultiPolygon, or MultiPoint. It must **not** be a Feature, FeatureCollection, or GeometryCollection, and must comply with the [GeoJSON Specification (RFC 7946)](https://www.rfc-editor.org/rfc/rfc7946) [2]. GeoJSON coordinates are always `[longitude, latitude]`.
*   **H3 Hexagon**: A `STRING` property holding an H3 cell index. This is rendered on the map but not indexed for geospatial search. For searchable areas, convert to GeoJSON Polygon and store as `geoshape` [2].
*   **Circle**: Defined by a numeric `Radius` property (in meters) in the Ontology's Geospatial capabilities. This is render-only and not indexed for search [2].

### Post-inference corrections (always verify manually after auto-inference)
- `lat`, `lng`, `radius_m`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` → force `DOUBLE`
- `*_date`, `*_time`, `snapshot_time`, `event_start_time`, `event_end_time` → force `TIMESTAMP`
- `*_id`, `h3_cell_id`, `geometry_geojson`, `iso_alpha2`, `iso_alpha3` → force `STRING`
- `sequence_order` → force `LONG`

---

## §4. Schema Application Workflow

1. Upload CSV → dataset is created in target folder
2. Click **"Apply a schema"** → Foundry runs auto-inference on a data subset
3. Navigate: **Details tab → Schema section → "Edit schema"**
4. Manually correct field types per §3
5. Set parsing options: jagged row behavior, encoding, addImportedAt
6. Click **"Save and Validate"**
   - If validation fails (GeoJSON / nested quotes): click **"Save without Validating"** → switch to Backend B in schema JSON → save again

### Multi-CSV Append Rule
When appending CSVs with different column sets:
- Manually define `fieldSchemaList` to include ALL columns across all files
- Columns absent in older files → auto-filled with `null`
- Schema merging across CSV files requires a user-written Transform (no native `mergeSchema` for CSV; that option is Parquet-only)

---

## §5. Python Transforms

### 5.1 Standard CSV → Parquet
```python
from transforms.api import transform, Input, Output
from transforms.verbs.dataframes import sanitize_schema_for_parquet

@transform(
    output=Output("/Compass/GlobalIntel/[domain]/[YYYYMM]/processed"),
    raw=Input("/Compass/GlobalIntel/[domain]/[YYYYMM]/raw_csv"),
)
def parse_csv(ctx, raw, output):
    filesystem = raw.filesystem()
    files = [f"{filesystem.hadoop_path}/{f.path}" for f in filesystem.ls(glob="*.csv")]
    df = (
        ctx.spark_session.read
        .option("encoding", "UTF-8")
        .option("header", True)
        .option("inferSchema", True)
        .option("multiLine", True)    # set True when geometry_geojson columns are present
        .option("mode", "PERMISSIVE") # nullify unparseable fields instead of failing
        .csv(files)
    )
    # REQUIRED: Parquet rejects column names containing spaces or special characters.
    # sanitize_schema_for_parquet strips/replaces those characters automatically.
    output.write_dataframe(sanitize_schema_for_parquet(df))
```

### 5.2 Waypoint CSV → LineString GeoJSON (for multi-stop routes)
Use when route data is stored as individual waypoint rows rather than pre-built GeoJSON.
```python
from transforms.api import transform, Input, Output
from transforms.verbs.dataframes import sanitize_schema_for_parquet
from pyspark.sql import functions as F
from pyspark.sql.types import StringType
import json

@transform(
    output=Output("/Compass/GlobalIntel/facilities_geo/[YYYYMM]/routes_linestring"),
    raw=Input("/Compass/GlobalIntel/facilities_geo/[YYYYMM]/raw_csv"),
)
def waypoints_to_linestring(ctx, raw, output):
    df = (
        ctx.spark_session.read
        .option("header", True)
        .option("inferSchema", True)
        .csv(raw.filesystem().hadoop_path + "/*.csv")
    )
    # Explicit casts prevent type inference issues
    df = (df
        .withColumn("lat", F.col("lat").cast("double"))
        .withColumn("lng", F.col("lng").cast("double"))
        .withColumn("sequence_order", F.col("sequence_order").cast("int"))
    )
    # Build coordinate pairs [lng, lat] (GeoJSON convention: longitude first)
    df = df.withColumn("coord_pair", F.array(F.col("lng"), F.col("lat")))
    grouped = (
        df.groupBy("route_id")
        .agg(F.collect_list(F.struct("sequence_order", "coord_pair")).alias("wps"))
    )

    def make_linestring(wps: list) -> str:
        sorted_wps = sorted(wps, key=lambda x: x["sequence_order"])
        coords = [list(w["coord_pair"]) for w in sorted_wps]
        return json.dumps({"type": "LineString", "coordinates": coords})

    make_ls_udf = F.udf(make_linestring, StringType())
    result = grouped.withColumn("geometry_geojson", make_ls_udf("wps")).drop("wps")
    output.write_dataframe(sanitize_schema_for_parquet(result))
```

**GeoJSON coordinate order**: always `[longitude, latitude]` — reversed from CSV convention of `lat, lng`.

---

## §6. Dataset Path Convention

```
/Compass/GlobalIntel/
├── policy_strategy/              [D1]
├── military_assets/              [D2]
├── facilities_geo/               [D3]
│   └── routes_linestring/        [D3 — multi-stop route LineStrings]
├── arms_transfers/               [D4]
├── conflict_events/              [D5]
├── sanctions_entities/           [D6]
├── space_assets/                 [D7]
├── energy_infra/                 [D8]
├── opinion_economic/             [D9]
├── us_allied_posture/            [D10]
├── global_conflict_monitor/      [D11]
└── osint_fallback/               [D0]

Each domain subfolder:
├── raw_csv/      ← uploaded source files
└── processed/    ← Parquet output from transforms
```

Tags per dataset: `geopolitics`, `[domain_name]`, `[primary_country]`, `[source_tier]`

---

## §7. Ontology Object Types (Map-ready)

| Object Type | Domain | Map Layer | Required CSV Columns |
|------------|--------|-----------|----------------------|
| `MilitaryFacility` | D3 | Point (icon) | `facility_id`, `geopoint` (e.g., `"34.885,49.219"`) |
| `StrikeRoute` | D3/D5 | Line (geoshape) | `route_id`, `geometry_geojson` (LineString GeoJSON) |
| `MilitaryAsset` | D2 | Point | `asset_id`, `geopoint` |
| `WeaponsTransfer` | D4 | Line Segment | `transfer_id`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `ConflictEvent` | D5/D11 | Point + Timeline Event | `event_id`, `geopoint`, `event_start_time`, `event_end_time` |
| `ConflictZone` | D11 | Polygon | `zone_id`, `geometry_geojson` (Polygon GeoJSON) |
| `TrackedObject` | D2/D3 | Track | `object_id`, `track_latitude_timeseries`, `track_longitude_timeseries` |

---

## §8. Common Errors & Fixes

(Content from v4.5 to be reviewed and updated if necessary)

---

## §9. Pre-Upload Validation Checklist

(Content from v4.5 to be reviewed and updated if necessary)

---

## §10. Coordinate Conversion Reference

(Content from v4.5 to be reviewed and updated if necessary)

---

## §11. [MAP] Core Concepts & Architecture

(Content from v4.5 to be reviewed and updated if necessary)

---

## §12. [MAP] Interact with Maps

(Content from v4.5 to be reviewed and updated if necessary)

---

## §13. [MAP] Time & Temporal Visualization

The Map application offers robust features for visualizing and interacting with time-varying data, including time series, events, and tracks [3].

### 13.1 Time Series
Time series represent measured values that change over time. These can be configured as [time series properties](https://www.palantir.com/docs/foundry/object-link-types/properties-overview/#time-series-properties) in the Ontology and used to style objects or viewed in the timeline [3].

### 13.2 Events
Event objects are Ontology objects associated with a specific time or time range. They can control object opacity on the map and are visualized in the timeline [3].

**Ontology Manager configuration:**
- `event_start_time` (TIMESTAMP) → Capabilities → Event → **Event start time**
- `event_end_time` (TIMESTAMP) → Capabilities → Event → **Event end time**
- `event_intent` (STRING, optional) → Event intent → severity level: `low` / `medium` / `high` / `critical`

**Map behavior:**
- Only events within the selected time range are displayed
- Events appear as icons on Timeline panel
- Connected geographic objects (e.g. facilities) can show event count badges

### 13.3 Tracks (Moving Objects)
Tracks visualize objects whose position changes over time, allowing for animation and path analysis [4].

**Ontology Manager setup:**
- Capabilities → Geospatial → **Track Latitude**: numeric time series property
- Capabilities → Geospatial → **Track Longitude**: numeric time series property

**Map Layer setup:**
1. Layer → Geometry: **Tracks**
2. Set Time Selection range
3. Play button → animated path playback

**Track display options:**
- **Interpolation mode**: Defines how the map interprets point locations between recorded track points [4].
    - `Linear`: Smoothly interpolate between known points.
    - `Last known`: Show the object at the last recorded position before the selected time.
- **Max time gap**: If the time difference between two consecutive track points exceeds this value, no line will be drawn between them [4].
- Trail: show historical path (tail effect)
- Trail length: duration of tail shown
- Heading: directional arrow at current position
- Icon: symbol at current position

### 13.4 Track Lines
Track lines connect adjacent recorded positions with a line, visualizing the object's path. Gaps are introduced if the `Max time gap` is exceeded [4].

### 13.5 Track Breadcrumbs
Track breadcrumbs visualize exact recorded positions as a series of small circles. They also appear in the timeline, showing precise timings of movements [4].

### 13.6 Series Panel
**Deprecated** — do not use for new implementations. Use Timeline + Events pattern instead.

---

## §14. [MAP] Visualize Ontology Data — All Layer Types

Every Map layer = **Geometry selection** + **Styling**. [5]

Available geometry types:
`Point` | `Line/Polygon` | `Line Segment` | `Choropleth` | `Cluster` | `Track` | `Timeline Event` | `H3 Hexagon` | `Circle` | `Georectified Image`

**Value-based styling** (conditional color/size by property value):
- Layer edit → Styling → Value-based styling → select property → set color range
- Example: `fatalities_est` → red (high) → yellow (medium) → green (low)

### 14.1 Points (Icon & Circle)
Basic layer. Single `geopoint` property → point on map. [5]

**Setup:**
1. Add layer → select Object Type
2. Geometry: **Point**
3. Point type: **Icon** (symbol from icon library) or **Circle** (pixel radius)

**Styling options:** Color (solid or value-based) | Size (fixed or property-proportional) | Label (property to display) | Opacity

**Minimum CSV columns:**
```
facility_id, geopoint,           facility_name,  facility_type
FAC-001,     "34.885,49.219",    Fordow FEP,     Nuclear
```

### 14.2 Lines & Polygons
Two methods for rendering line and polygon geometries. [5]

**Method A — Geoshape property (GeoJSON column):**
- Add `geometry_geojson` column (STRING) containing GeoJSON LineString or Polygon
- Use Backend B (GeoJSON contains commas)
- Ontology Manager → set property type to `geoshape`
- Map Layer → Geometry: **Lines and Polygons** → select geoshape property

**Method B — Line Segment (two geopoint properties):**
- Add `origin_lat`, `origin_lng`, `target_lat`, `target_lng` columns (all DOUBLE)
- Ontology Manager → create two `geopoint` properties (origin, target)
- Map Layer → Geometry: **Line Segment** → assign start/end geopoints
- Style → **Arrow direction: ON** to show movement direction

**Styling options:**
- Stroke width (pixels) | Stroke style: Solid / Dashed / Dotted
- Arrow direction (Line Segment only) | Fill polygons: ON = filled / OFF = outline only
- Color: solid or value-based conditional

**When to use which:**
- Simple A→B connection (weapons transfer, supply route): **Line Segment**
- Multi-waypoint route (strike path, patrol route): **Method A** with LineString GeoJSON (build via §5.2 transform)

### 14.3 Choropleths
Color regions by aggregated values. [5]

**Method 1 — ISO code (simple, for country/state/county boundaries):**

Supported boundary types:
- Country (global): ISO 3166 alpha-2 (`US`) or alpha-3 (`USA`)
- US States: FIPS code or USPS abbreviation
- US Counties: FIPS or ANSI code

Setup:
1. Install **"Choropleth Value Types"** from Foundry Marketplace
2. Add `iso_alpha2` (or `iso_alpha3`) column (STRING) to CSV
3. Ontology Manager → property → Value Type dropdown → select boundary type
4. Map Layer → Geometry: **Choropleth** → Regions: Boundary Identifier
5. Styling: select numeric property to aggregate → set color range

**Method 2 — Custom polygon boundaries (flexible):**
1. Create a separate polygon Object Type with `geoshape` property
2. Create many-to-one link: aggregate object → polygon object
3. Map Layer → Geometry: **Choropleth** → Regions: **Linked object**
4. Select aggregate property → set color range

**Aggregation options:** Count | Sum | Average | Min | Max

### 14.4 Clusters
Automatically groups dense point sets. [5]

Setup:
1. Existing Point layer → Geometry: **Cluster**
2. Zoomed out → nearby points group into circle clusters
3. Cluster circle size/color = proportional to object count
4. Zoomed in → individual points separate automatically

**Styling:** Cluster radius (pixels) | Max zoom for cluster dissolution | Aggregation display (count, sum)

### 14.5 Timeline Events
Display Ontology events with time range on map + timeline panel. [5]

Setup:
1. Ontology Manager → Capabilities → Event section:
   - **Event start time**: assign TIMESTAMP property
   - **Event end time**: assign TIMESTAMP property
   - **Event intent** (optional): severity level (`low`/`medium`/`high`/`critical`)
2. Map Layer → Geometry: **Timeline Events**
3. Enable Timeline panel (map bottom)
4. Set Time Selection range
5. Only events active within range are shown on map

### 14.6 Loading Methods for Large Datasets

| Method | Behavior | Best For |
|--------|----------|----------|
| On-demand | Load only objects in current viewport | Small datasets (<10K objects) |
| Tile-based | Load in tiles as user pans/zooms | Large datasets (>10K objects) |
| Pre-loaded | Load all data at once | Small analytical datasets |

Tile-based loading supported for Polygon and Line layers (e.g. pipelines, borders, patrol zones).

---

## §15. [MAP] Integrate Data for the Map

### 15.1 Ontology Geospatial Property Types

#### geopoint / geoshape (core)
- `geopoint`: single `"latitude,longitude"` coordinate pair or Geohash string [2].
- `geoshape`: GeoJSON (Point, LineString, Polygon, MultiPolygon, etc.) [2].

#### Circle (radius-based)
- Capabilities → Geospatial → **Radius** property (numeric, unit: meters) [2].
- Render-only: not indexed for geospatial search queries [2].
- For searchable radius areas → approximate as Polygon and store as `geoshape` [2].

#### H3 Hexagon
- STRING property holding H3 cell index [2].
- Capabilities → Geospatial → **H3 cell** [2].
- Render-only: not indexed for geospatial search [2].
- For searchable areas → convert to GeoJSON Polygon and store as `geoshape` [2].

#### Georectified Images (satellite / aerial photo overlay)
- `image_url` (STRING): accessible image URL — supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`, `.svg` [2].
- `image_bounds` (geoshape): GeoJSON Polygon defining image corners [2].
  - Must be **clockwise** winding order
  - Must start from **lower-left** corner
  - typeclass must be set: Kind = `geo`, Value = `bounds.<image_url_property_id>`

#### Tiled Imagery from Media Sets [Beta]
- Upload GeoTIFF (`.tiff`, `.tif`) to Media Set [2].
- Add media reference property to Object Type
- Only visible tiles within viewport are loaded (performance-optimized)

#### Track Objects (time-series movement)
- Capabilities → Geospatial → **Track Latitude** / **Track Longitude** [2].
- Both properties must be numeric time series type.

#### Event Objects
- Capabilities → Event → **Event start time** / **Event end time** [2].
- Event intent: sets severity → enables count indicator on connected objects.

### 15.2 Search Arounds for the Map
Explore connected objects geospatially from a selected object:

1. Select object on map → properties panel opens
2. **Search Around** section → list of connected Link Types appears
3. Click a Link Type → connected objects added as a new layer on map

**Use cases:**
- Select `MilitaryFacility` → Search Around → show linked `ConflictEvent` objects
- Select `SanctionedEntity` → show linked `WeaponsTransfer` objects

### 15.3 Functions for the Map
Execute Foundry Functions as a Map layer data source:

1. Code Repository → implement Function (TypeScript or Python)
2. Publish Function
3. Map Layer → Data source: **Function** → select Function + set parameters
4. Map displays Function output as a live layer

Use case: real-time count of active conflicts within a drawn polygon.

### 15.4 Ontology Actions for the Map
Execute Ontology Actions directly from map object selection:

1. Ontology Manager → create Action Type (can include geopoint/geoshape parameters)
2. Map Layer → Actions tab → add Action
3. Select object on map → properties panel → **Actions** tab → execute

### 15.5 Map Layer Editor
Visual tool for configuring a layer's data source and geometry.

Access: Map → layer panel → click layer → **Edit Layer**

Settings:
- **Data Source**: Object Type / Function / External dataset
- **Geometry**: Point / Line / Polygon / Choropleth / Cluster / Track / Event etc.
- **Property mapping**: verify CSV column → Ontology property assignments
- **Filters**: filter conditions applied to this layer

---

## §16. [MAP] Templates, Workshop Widget & Configuration

### 16.1 Map Templates
Save reusable Map configurations:

1. Complete Map setup (layers + styles + filters)
2. Top menu → **Save as Template**
3. Set template name and description
4. Saved templates → other users can copy and use
5. Templates can be published to Marketplace (org-wide sharing)

Use cases: Regional conflict monitoring dashboards | Domain-specific analysis views | Workshop app embeds

### 16.2 Workshop Widget — Embed Map
Embed Map Template in a Workshop module:

1. Workshop → edit module
2. Add widget → **Map**
3. Select Map Template to connect
4. Configure interactions:
   - Workshop variables → Map filters
   - Map object selection → pass data to other Workshop widgets
5. Adjust layout → save

**Common Workshop-Map patterns:**
- Country dropdown → show only that country's objects on map
- Map object click → display detail panel beside map
- Date range slider → sync with Map Time Selection

### 16.3 Map Settings
| Setting | Options |
|---------|---------|
| Base map style | Satellite / Street / Dark / Light / Terrain |
| Default zoom level | Initial zoom

---

## §17. [MAP] Geospatial Property Type Reference

(Content from v4.5 to be reviewed and updated if necessary)

---

## §18. [MAP] Layer Decision Tree & Domain Matrix

(Content from v4.5 to be reviewed and updated if necessary)

---

## §19. References

[1] Palantir. (n.d.). *Dataset Preview • CSV parsing*. Retrieved from https://www.palantir.com/docs/foundry/dataset-preview/csv-parsing/
[2] Palantir. (n.d.). *Geospatial and geotemporal • Use geospatial data in the Ontology*. Retrieved from https://www.palantir.com/docs/foundry/geospatial/ontology/
[3] Palantir. (n.d.). *Map • Time • Overview*. Retrieved from https://www.palantir.com/docs/foundry/map/time-overview/
[4] Palantir. (n.d.). *Map • Visualize Ontology data • Tracks (moving objects)*. Retrieved from https://www.palantir.com/docs/foundry/map/visualize-tracks/
[5] Palantir. (n.d.). *Map • Visualize Ontology data • Overview*. Retrieved from https://www.palantir.com/docs/foundry/map/visualize-objects/
