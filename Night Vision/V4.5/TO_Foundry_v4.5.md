# TO_FOUNDRY.MD v4.5 — Palantir Foundry CSV Ingestion + Map Full Reference
# Source: palantir.com/docs/foundry (dataset-preview, map — 28 sub-pages)
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

| Foundry Type | Use For | Notes |
|-------------|---------|-------|
| `STRING` | IDs, names, text, URLs, GeoJSON, ISO codes | Default for `*_id`, `*_name`, `source_*`, `geometry_geojson`, `h3_cell_id`, `iso_alpha2` |
| `DOUBLE` | lat/lng, ratios, TIV values, radius | **Required** for `lat`, `lng`, `radius_m`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `LONG` | Integer counts, years, sequence order | `quantity`, `year`, `sequence_order` |
| `DATE` | Date-only fields | ISO 8601: `YYYY-MM-DD` |
| `TIMESTAMP` | Date + time fields | `YYYY-MM-DDTHH:MM:SSZ` — required for event and track columns |
| `BOOLEAN` | Flag columns | `true`/`false` lowercase only |
| `DECIMAL(38,18)` | High-precision financial values | Use when rounding error matters |

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
| `MilitaryFacility` | D3 | Point (icon) | `facility_id`, `lat`, `lng` |
| `StrikeRoute` | D3/D5 | Line (geoshape) | `route_id`, `geometry_geojson` (LineString) |
| `MilitaryAsset` | D2 | Point | `asset_id`, `lat`, `lng` |
| `WeaponsTransfer` | D4 | Line Segment | `transfer_id`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `ConflictEvent` | D5/D11 | Point + Timeline Event | `event_id`, `lat`, `lng`, `event_start_time`, `event_end_time` |
| `ConflictZone` | D11 | Polygon | `zone_id`, `geometry_geojson` (Polygon) |
| `SanctionedEntity` | D6 | Point (if geo) | `entity_id`, `lat`, `lng` (nullable) |
| `SpaceAsset` | D7 | Point (snapshot) | `satellite_id`, `lat_snap`, `lng_snap`, `snapshot_time` |
| `MovingAsset` | D2/D7 | Track | `asset_id`, `timestamp`, `lat`, `lng` (time series dataset) |
| `EnergyInfrastructure` | D8 | Line / Polygon | `infra_id`, `geometry_geojson` |
| `PolicyDocument` | D1 | Non-geo | — |
| `USPosture` | D10 | Point (icon) | `posture_id`, `lat`, `lng` |
| `GlobalConflict` | D11 | Polygon + Choropleth | `conflict_id`, `geometry_geojson` or `iso_alpha2` |
| `OSINTRecord` | D0 | Point (if geo) | `record_id`, `lat`, `lng` (nullable) |

### Cross-domain linking columns
- `facility_id` → D3 ↔ D5 (facility where event occurred)
- `entity_id` → D6 ↔ D5 (sanctioned actor in event)
- `conflict_id` → D11 ↔ D5 (event belongs to conflict)
- `route_id` → D3 StrikeRoute ↔ D5 ConflictEvent (route associated with event)

---

## §8. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Schema inference fails | Nested quotes / `\n` in GeoJSON field | Switch to Backend B → "Save without Validating" |
| Jagged row exception | Column count mismatch between rows | `jaggedRowBehavior: "DROP"` or fix source CSV |
| `lat`/`lng` typed as STRING | Null values present during inference | Manually force to DOUBLE in schema editor |
| Parquet write fails | Special chars or spaces in column names | Apply `sanitize_schema_for_parquet()` in transform |
| Multi-CSV append fails | New file has extra columns | Manually define `fieldSchemaList` with all columns |
| BOM encoding error | Excel "UTF-8 with BOM" format | Re-save without BOM (use Notepad++ or VSCode) |
| Date parse fails | Non-ISO format (e.g. `MM/DD/YYYY`) | Pre-process to `YYYY-MM-DD` before upload |
| ID auto-converted to LONG | Numeric-looking string ID | Force `*_id` column to STRING type |
| OSINT data messy | Irregular fields from web content | `jaggedRowBehavior: "DROP"` + `mode: "PERMISSIVE"` |
| GeoJSON not rendered as line | Column not mapped to `geoshape` property | Set property type to `geoshape` in Ontology Manager |
| Line segment not rendering | origin/target geopoint not set as DOUBLE | Force all four lat/lng columns to DOUBLE |
| Track not animating | Not configured as time series property | Set Track Lat/Lon in Capabilities → Geospatial |
| Choropleth not showing | ISO code not linked to Value Type | Install "Choropleth Value Types" from Marketplace |
| Cluster not grouping | Layer geometry not set to Cluster | Set Cluster geometry in Map layer config |
| H3 hexagon invisible | Property not configured as H3 cell | Set H3 cell in Capabilities → Geospatial |
| Timeline event missing | No event start/end time configured | Set Event start/end time in Capabilities → Event |

---

## §9. Pre-Upload Validation Checklist

```
GENERAL
[ ] Encoding: UTF-8, no BOM
[ ] Header: row 1 only, lowercase_underscore names, no duplicate column names
[ ] Null representation: empty string "" consistently (never "N/A", "null", "0", "-")
[ ] No mixed types within any single column
[ ] Fields containing delimiter: wrapped in double quotes
[ ] confidence_level: populated for every row
[ ] source_id: populated for every row (traceable to Source.md)
[ ] OSINT-sourced rows: source_url populated

COORDINATES
[ ] lat/lng: Decimal Degrees float format (NOT DMS string)
[ ] Decimal Degrees: negative for South (lat) and West (lng)
[ ] accuracy_m: populated for GEO rows

DATES & TIMES
[ ] Date columns: YYYY-MM-DD (ISO 8601)
[ ] Timestamp columns: YYYY-MM-DDTHH:MM:SSZ (UTC)

IDs
[ ] *_id columns: STRING type, globally unique within dataset

MAP-SPECIFIC
[ ] [LINE/POLY]  geometry_geojson: valid GeoJSON string; Backend B selected
[ ] [SEGMENT]    origin_lat/lng + target_lat/lng: all DOUBLE
[ ] [ROUTE]      sequence_order: integer, no gaps, per route_id
[ ] [EVENT]      event_start_time / event_end_time: TIMESTAMP format
[ ] [TRACK]      separate time series dataset configured with asset_id + timestamp
[ ] [CHOROPLETH] iso_alpha2 or iso_alpha3: STRING, valid ISO 3166 codes
[ ] [H3]         h3_cell_id: STRING, valid H3 cell index
[ ] [CIRCLE]     radius_m: DOUBLE, value in meters
[ ] [IMAGE]      image_url: accessible URL; image_bounds: clockwise Polygon from lower-left
```

---

## §10. Coordinate Conversion Reference

| Input Format | Conversion Method | Example Output |
|-------------|------------------|----------------|
| DMS `10°31'N 103°37'E` | DD = D + M/60 + S/3600; negative if S or W | `10.517, 103.617` |
| Google Maps URL `@10.531,103.624` | Extract values after `@` | `10.531, 103.624` |
| N2YO real-time snapshot | Record timestamp alongside coordinates | `snapshot_time: 2026-04-06T14:30:00Z` |
| OSINT estimated location | Record estimated precision radius | `accuracy_m: 1000` |

```python
def dms_to_dd(degrees: float, minutes: float, seconds: float, direction: str) -> float:
    dd = degrees + minutes / 60 + seconds / 3600
    if direction in ('S', 'W'):
        dd *= -1
    return round(dd, 6)
```

**GeoJSON coordinate order**: `[longitude, latitude]` — opposite of CSV `lat, lng` convention.
Always verify this when building GeoJSON strings manually.

---

## §11. [MAP] Core Concepts & Architecture

### 11.1 Map Application Overview
Foundry Map visualizes Ontology data as geospatial layers.

Core capabilities:
- Explore geospatial connections between Ontology objects (physical network traversal)
- Bounding box / polygon intersection queries for geospatial search
- High-density vector data + satellite imagery + time-series tracks + event visualization
- Draw shapes → use as geospatial filters or Action inputs
- Build geospatial applications using Map Templates

### 11.2 Coordinate Reference Systems
- Rendering projection: **Web Mercator (EPSG:3857)**
- Input coordinates: **WGS 84 decimal degrees (EPSG:4326)** — applies to all `lat`/`lng` columns
- Conversion required for other CRS: use Pipeline Builder Geospatial Transform

### 11.3 Layer System
- Each layer = one Object Type or data source
- Layers have independent style, visibility, and loading settings
- Layer rendering order = stack order in panel (top layer renders in front)

### 11.4 Create and Save Maps
1. Open **Map** application from Foundry home
2. Create new Map → blank canvas
3. Top bar → **Save** → set title → save
4. Saved Map → shareable with team via Foundry permissions
5. Save as **Template** → embeddable in Workshop

---

## §12. [MAP] Interact with Maps

### 12.1 Add Data to Map
**Add Ontology objects:**
1. Left panel → search icon
2. Search for Object Type name
3. Select Object Type → added as a new layer
4. In layer panel → select Geometry type (Point / Line / Polygon etc.)

**Add external data:**
- GeoJSON file → drag and drop directly onto map
- WMS/WMTS tile layer → enter URL in external layer dialog
- Foundry Dataset (vector tiles) → connect via layer data source

### 12.2 Layer Management
| Action | Method |
|--------|--------|
| Show / hide | Toggle eye icon in layer panel |
| Reorder | Drag and drop in layer panel |
| Delete | Right-click → Remove |
| Duplicate | Right-click → Duplicate |
| Group | Select multiple → Group |
| Edit style | Click layer → Style panel |

### 12.3 Navigation
| Action | Method |
|--------|--------|
| Pan | Click and drag |
| Zoom | Scroll wheel or +/- buttons |
| Jump to location | Enter coordinates or place name in search bar |
| Zoom to layer extent | Right-click layer → Zoom to layer |
| Current location | Location button |

### 12.4 Selection
- **Click**: select single object → properties panel opens
- **Shift+click**: multi-select
- **Click-drag rectangle**: area select
- **Polygon selection**: Draw tool → draw polygon → selects objects inside
- **Search Around**: from selected object → explore connected objects within radius

### 12.5 Annotations
Add text, icons, and measurement annotations to map:
1. Left toolbar → **Annotation** tool
2. Click on map → place annotation
3. Enter text, choose color/icon
4. Annotations are saved with the Map

### 12.6 Draw Shapes
Draw custom shapes for analysis or as geospatial filters:
- Toolbar → **Draw** icon
- Supported: Point, Line, Polygon, Circle, Rectangle
- Drawn shape → apply as **geospatial filter** (show only objects inside shape)
- Export drawn shape as KML or GeoJSON

### 12.7 Histogram & Filtering
- Layer panel → **Histogram** tab
- Shows value distribution for a selected property
- Drag histogram range → applies value filter immediately to map
- Example: `fatalities_est` histogram → show only events above threshold

### 12.8 Actions from Map
Execute Ontology Actions directly from map UI:
- Select object → properties panel → **Actions** tab
- Predefined action list appears (e.g. "Mark as verified", "Update status")
- Execute action → Ontology object updates immediately

---

## §13. [MAP] Time & Temporal Visualization

### 13.1 Time Feature Overview
| Feature | Purpose |
|---------|---------|
| Time Selection | Filter map to a specific time point or range |
| Timeline | Horizontal timeline bar showing events chronologically |
| Events | Ontology objects with start/end timestamps |
| Time Series | Properties that change value over time (tracks, sensors) |

### 13.2 Time Selection
- Map top bar → clock icon or **Time** button
- Set time range: drag slider or enter dates directly
- Only objects/events within selected range are shown
- **Play button**: animate time progression (use for track playback)

### 13.3 Timeline Panel
- Map bottom → expand **Timeline** panel
- Events displayed as icons on horizontal timeline
- Click event icon → map pans to that location
- Zoom timeline in/out for finer time resolution

### 13.4 Event Objects
Events = Ontology objects with explicit start and end timestamps.

**Required CSV columns:**
```
event_id, event_start_time,        event_end_time,          lat,    lng,  event_type,    fatalities_est
EV-001,   2025-06-22T01:44:00Z,    2025-06-22T02:10:00Z,    34.885, 49.219, AirStrike,   0
EV-002,   2026-02-28T09:45:00Z,    2026-02-28T12:00:00Z,    35.689, 51.389, MultiDomain, 120
```

**Ontology Manager configuration:**
- `event_start_time` (TIMESTAMP) → Capabilities → Event → **Event start time**
- `event_end_time` (TIMESTAMP) → Capabilities → Event → **Event end time**
- `event_intent` (STRING, optional) → Event intent → severity level: `low` / `medium` / `high` / `critical`

**Map behavior:**
- Only events within the selected time range are displayed
- Events appear as icons on Timeline panel
- Connected geographic objects (e.g. facilities) can show event count badges

### 13.5 Time Series (Track data)
Use a **separate time series dataset** — do not mix with main object dataset.

**Time series CSV format:**
```
asset_id, timestamp,           lat,    lng
B2-001,   2025-06-21T00:01:00Z, 38.722, -93.549
B2-001,   2025-06-21T06:00:00Z, 51.500, -0.120
B2-001,   2025-06-22T02:10:00Z, 34.885,  49.219
```

**Main object CSV (snapshot only — no time series rows):**
```
asset_id, lat_snap, lng_snap, snapshot_time,       asset_type
B2-001,   34.885,   49.219,   2025-06-22T02:10:00Z, B-2 Spirit
```

**Ontology Manager configuration:**
- Capabilities → Geospatial → **Track Latitude**: numeric time series property
- Capabilities → Geospatial → **Track Longitude**: numeric time series property
- Time Selection slider → plays back track movement

### 13.6 Series Panel
**Deprecated** — do not use for new implementations. Use Timeline + Events pattern instead.

---

## §14. [MAP] Visualize Ontology Data — All Layer Types

### 14.1 Visualization Overview
Every Map layer = **Geometry selection** + **Styling**.

Available geometry types:
`Point` | `Line/Polygon` | `Line Segment` | `Choropleth` | `Cluster` | `Track` | `Timeline Event` | `H3 Hexagon` | `Circle` | `Georectified Image`

**Value-based styling** (conditional color/size by property value):
- Layer edit → Styling → Value-based styling → select property → set color range
- Example: `fatalities_est` → red (high) → yellow (medium) → green (low)

---

### 14.2 Points (Icon & Circle)
Basic layer. Single `geopoint` property → point on map.

**Setup:**
1. Add layer → select Object Type
2. Geometry: **Point**
3. Point type: **Icon** (symbol from icon library) or **Circle** (pixel radius)

**Styling options:** Color (solid or value-based) | Size (fixed or property-proportional) | Label (property to display) | Opacity

**Minimum CSV columns:**
```
facility_id, lat,    lng,    facility_name,  facility_type
FAC-001,     34.885, 49.219, Fordow FEP,     Nuclear
```

---

### 14.3 Lines & Polygons
Two methods for rendering line and polygon geometries.

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

---

### 14.4 Choropleths
Color regions by aggregated values.

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

---

### 14.5 Clusters
Automatically groups dense point sets.

Setup:
1. Existing Point layer → Geometry: **Cluster**
2. Zoomed out → nearby points group into circle clusters
3. Cluster circle size/color = proportional to object count
4. Zoomed in → individual points separate automatically

**Styling:** Cluster radius (pixels) | Max zoom for cluster dissolution | Aggregation display (count, sum)

---

### 14.6 Timeline Events
Display Ontology events with time range on map + timeline panel.

Setup:
1. Ontology Manager → Capabilities → Event section:
   - **Event start time**: assign TIMESTAMP property
   - **Event end time**: assign TIMESTAMP property
   - **Event intent** (optional): severity level (`low`/`medium`/`high`/`critical`)
2. Map Layer → Geometry: **Timeline Events**
3. Enable Timeline panel (map bottom)
4. Set Time Selection range
5. Only events active within range are shown on map

---

### 14.7 Tracks (Moving Objects)
Display and animate time-series movement paths.

**Ontology Manager setup:**
- Capabilities → Geospatial → **Track Latitude**: numeric time series property
- Capabilities → Geospatial → **Track Longitude**: numeric time series property

**Map Layer setup:**
1. Layer → Geometry: **Tracks**
2. Set Time Selection range
3. Play button → animated path playback

**Track display options:**
- Trail: show historical path (tail effect)
- Trail length: duration of tail shown
- Heading: directional arrow at current position
- Icon: symbol at current position

---

### 14.8 Loading Methods for Large Datasets

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
- `geopoint`: single lat/lng coordinate pair
- `geoshape`: GeoJSON (Point, LineString, Polygon, MultiPolygon, etc.)

#### Circle (radius-based)
- Capabilities → Geospatial → **Radius** property (numeric, unit: meters)
- Render-only: not indexed for geospatial search queries
- For searchable radius areas → approximate as Polygon and store as `geoshape`

#### H3 Hexagon
- STRING property holding H3 cell index
- Capabilities → Geospatial → **H3 cell**
- Render-only: not indexed for geospatial search
- For searchable areas → convert to GeoJSON Polygon and store as `geoshape`

#### Georectified Images (satellite / aerial photo overlay)
- `image_url` (STRING): accessible image URL — supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`, `.svg`
- `image_bounds` (geoshape): GeoJSON Polygon defining image corners
  - Must be **clockwise** winding order
  - Must start from **lower-left** corner
  - typeclass must be set: Kind = `geo`, Value = `bounds.<image_url_property_id>`

#### Tiled Imagery from Media Sets [Beta]
- Upload GeoTIFF (`.tiff`, `.tif`) to Media Set
- Add media reference property to Object Type
- Only visible tiles within viewport are loaded (performance-optimized)

#### Track Objects (time-series movement)
- Capabilities → Geospatial → Track Latitude / Track Longitude
- Both properties must be numeric time series type

#### Event Objects
- Capabilities → Event → Event start time / Event end time
- Event intent: sets severity → enables count indicator on connected objects

---

### 15.2 Search Arounds for the Map
Explore connected objects geospatially from a selected object:

1. Select object on map → properties panel opens
2. **Search Around** section → list of connected Link Types appears
3. Click a Link Type → connected objects added as a new layer on map

**Use cases:**
- Select `MilitaryFacility` → Search Around → show linked `ConflictEvent` objects
- Select `SanctionedEntity` → show linked `WeaponsTransfer` objects

---

### 15.3 Functions for the Map
Execute Foundry Functions as a Map layer data source:

1. Code Repository → implement Function (TypeScript or Python)
2. Publish Function
3. Map Layer → Data source: **Function** → select Function + set parameters
4. Map displays Function output as a live layer

Use case: real-time count of active conflicts within a drawn polygon.

---

### 15.4 Ontology Actions for the Map
Execute Ontology Actions directly from map object selection:

1. Ontology Manager → create Action Type (can include geopoint/geoshape parameters)
2. Map Layer → Actions tab → add Action
3. Select object on map → properties panel → **Actions** tab → execute

---

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
| Default zoom level | Initial zoom on open |
| Default center | Initial center coordinates |
| Units | Metric / Imperial |
| Language | Map label language |

Access: Map → bottom-right layer icon → **Base Map** tab → select style

### 16.4 Control Panel
Add interactive filter controls to Map UI:

1. Map → right side → **Control Panel** tab
2. **Add Control** → select control type (Date range / Dropdown / Checkbox etc.)
3. Assign to target layer and filter condition
4. Save → users can filter the map using controls

---

## §17. [MAP] Geospatial Property Type Reference (Complete)

| Purpose | CSV Column(s) | Foundry Type | Ontology Property | Capabilities Setting | Notes |
|---------|--------------|-------------|-------------------|--------------------|-------|
| Single point | `lat` DOUBLE + `lng` DOUBLE | DOUBLE × 2 | `geopoint` | Primary geo property | Most common |
| GeoJSON geometry | `geometry_geojson` STRING | STRING | `geoshape` | — | LineString / Polygon / Multi* |
| Radius circle | `radius_m` DOUBLE | DOUBLE | numeric | Geospatial → Radius | Render-only; not searchable |
| Movement track | time series `lat` + `lng` | numeric time series | — | Geospatial → Track Lat/Lon | Separate dataset required |
| H3 hex cell | `h3_cell_id` STRING | STRING | STRING | Geospatial → H3 cell | Render-only; not searchable |
| Event start | `event_start_time` TIMESTAMP | TIMESTAMP | TIMESTAMP | Event → Event start time | |
| Event end | `event_end_time` TIMESTAMP | TIMESTAMP | TIMESTAMP | Event → Event end time | |
| Event severity | `event_intent` STRING | STRING | STRING | Event → Event intent | `low`/`medium`/`high`/`critical` |
| Image URL | `image_url` STRING | STRING | STRING | — | .png/.jpg/.svg etc. |
| Image bounds | `image_bounds` GeoJSON Polygon | STRING → geoshape | `geoshape` | typeclass: geo / bounds.image_url | Clockwise, start lower-left |
| Country choropleth | `iso_alpha2` STRING | STRING | STRING + Value Type | Marketplace install required | ISO 3166-1 alpha-2 |
| Line segment origin | `origin_lat` DOUBLE + `origin_lng` DOUBLE | DOUBLE × 2 | `geopoint` | — | |
| Line segment target | `target_lat` DOUBLE + `target_lng` DOUBLE | DOUBLE × 2 | `geopoint` | — | |
| Custom region boundary | `geometry_geojson` STRING (Polygon) | STRING → geoshape | `geoshape` | — | For choropleth linked objects |

### GeoJSON CSV encoding rules
- Wrap the entire GeoJSON string in outer double quotes: `"..."`
- Escape internal double quotes by doubling them: `""` inside the outer quotes
- Always use Backend B when this column is present
```
geometry_geojson
"{""type"":""LineString"",""coordinates"":[[-93.5491,38.7219],[49.2194,34.8850]]}"
```

---

## §18. [MAP] Layer Decision Tree & Domain Matrix

### 18.1 Layer Selection Decision Tree

```
What is the nature of the data?
│
├─ Single location (one lat/lng pair per record)
│   ├─ Basic display                → POINT (icon or circle)
│   ├─ Dense distribution           → CLUSTER
│   ├─ Show radius / influence area → CIRCLE (add radius_m column)
│   └─ Time-based movement          → TRACK (requires separate time series dataset)
│
├─ A → B connection
│   ├─ Simple two-point line        → LINE SEGMENT (origin/target lat+lng)
│   └─ Multi-waypoint route         → GEOSHAPE LineString (GeoJSON or §5.2 waypoint transform)
│
├─ Area / region
│   ├─ Simple polygon               → POLYGON (geoshape)
│   ├─ Country or region aggregate  → CHOROPLETH (ISO code or linked polygon object)
│   └─ Density analysis             → H3 HEXAGON
│
├─ Time-bounded event
│   └─ Has start + end time         → TIMELINE EVENT
│
└─ Image overlay
    └─ Satellite / aerial photo     → GEORECTIFIED IMAGE
```

### 18.2 Domain-to-Layer Mapping Matrix

| Domain | Data | Layer Type | Key CSV Columns | Ontology Property |
|--------|------|-----------|-----------------|-------------------|
| D3 Facilities | Military base location | Point (icon) | `lat`, `lng` | `geopoint` |
| D3 Strike routes | Multi-waypoint flight path | Line (geoshape) | `geometry_geojson` LineString | `geoshape` |
| D3 Strike routes (simple) | Direct A→B connection | Line Segment | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D4 Arms transfers | Export/import flow | Line Segment + Arrow | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D5 Conflict events | Individual incidents | Point + Timeline Event | `lat`, `lng`, `event_start_time` | `geopoint` + Event config |
| D5 Combat zones | Battle area boundary | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D6 Sanctions | Sanctioned entity (if geo) | Point | `lat`, `lng` | `geopoint` |
| D7 Satellite snapshot | Current position | Point | `lat_snap`, `lng_snap` | `geopoint` |
| D7 Satellite orbit | Movement track | Track | time series lat/lng | numeric time series |
| D8 Pipelines | Energy infrastructure | Line (geoshape) | `geometry_geojson` LineString | `geoshape` |
| D8 Project zones | Energy region | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D10 US bases | Base location | Point (icon) | `lat`, `lng` | `geopoint` |
| D10 Combatant commands | Operational area | Polygon / Choropleth | `geometry_geojson` or `iso_alpha2` | `geoshape` or Value Type |
| D11 Global conflicts (aggregate) | Conflicts by country | Choropleth | `iso_alpha2`, `conflict_count` | Value Type |
| D11 Conflict zones | Active conflict boundary | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D0 OSINT | Location record (if geo) | Point (nullable) | `lat`, `lng` (nullable) | `geopoint` |
