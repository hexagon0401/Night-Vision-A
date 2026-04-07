# TO_FOUNDRY.MD v6.0 — Palantir Foundry CSV Ingestion + Map Full Reference
# Major Architecture Update — fully deprecates v4.5 and v5.0
# Source: palantir.com/docs/foundry (dataset-preview, map, geospatial — full coverage)
# Scope: Global intel / region-agnostic
# For AI consumption. English throughout; Korean used only in final user-facing narrative output.

---

## FILE INDEX

```
§1   CSV Architecture — Backend Selection & MULTILINE_CSV_PARSER (v6 REWRITE)
§2   Spatial Data Formatting & Escaping Protocols (v6 NEW — replaces §2)
§3   Schema Field Types
§4   Schema Application Workflow
§5   Python Transforms
     §5.1  Standard CSV → Parquet
     §5.2  Waypoint CSV → LineString GeoJSON
     §5.3  CRS Normalization: Non-WGS84 → EPSG:4326 (v6 NEW)
§6   Dataset Path Convention
§7   Ontology Object Types (Map-ready)
§8   Geotemporal Track Modeling (v6 NEW — replaces static coordinate approach)
§9   H3 Dual-Indexing Protocol (v6 NEW — replaces single H3 string output)
§10  Pipeline Builder: Logical Type Cast & Data Lineage (v6 NEW)
§11  Common Errors & Fixes (v6 EXPANDED)
§12  Pre-Upload Validation Checklist (v6 EXPANDED)
§13  Coordinate Conversion Reference
§14  [MAP] Core Concepts & Architecture
§15  [MAP] Interact with Maps
§16  [MAP] Time & Temporal Visualization
§17  [MAP] Visualize Ontology Data — All Layer Types
§18  [MAP] Integrate Data for the Map
§19  [MAP] Templates, Workshop Widget & Configuration
§20  [MAP] Geospatial Property Type Reference
§21  [MAP] Layer Decision Tree & Domain Matrix
```

---

## §1. CSV Architecture — Backend Selection & Parser Configuration

**This directive completely deprecates TO_Foundry v4.5 and v5.0.**
Three parser configurations are now defined. Select based on data complexity before upload.
Parser cannot be changed after schema is applied without a full schema reset.

---

### Parser A: TextDataFrameReader / CSV_PARSER (simple structured data — no GeoJSON)
Use when: standard tabular data with no complex geometry columns.
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
      "addImportedAt": false,
      "initialReadTimeout": "1 hour"
    }
  }
}
```

---

### Parser B: TextDataFrameReader / MULTILINE_CSV_PARSER (v6 PRIMARY — GeoJSON present)
**Use when:** `geoshape_geojson` or `h3_geojson` columns are present.
This is the **default parser for all geospatial intelligence datasets** in v6.0.
Fixes the THROW_EXCEPTION failures caused by unescaped internal quotes in GeoJSON fields (v4.5/v5.0 critical flaw).

```json
{
  "dataFrameReaderClass": "com.palantir.foundry.spark.input.TextDataFrameReader",
  "customMetadata": {
    "textParserParams": {
      "parser": "MULTILINE_CSV_PARSER",
      "charsetName": "UTF-8",
      "fieldDelimiter": ",",
      "recordDelimiter": "\n",
      "quoteCharacter": "\"",
      "escapeCharacter": "\"",
      "jaggedRowBehavior": "DROP_ROW",
      "parseErrorBehavior": "THROW_EXCEPTION",
      "skipLines": 1
    }
  }
}
```

**Key changes from v4.5/v5.0:**
- `parser`: `CSV_PARSER` → `MULTILINE_CSV_PARSER` (handles embedded newlines in GeoJSON)
- `escapeCharacter`: `"\""` explicitly defined (was absent in v5.0 — root cause of jagged row failures)
- `jaggedRowBehavior`: `THROW_EXCEPTION` → `DROP_ROW` (pipeline survives corrupt OSINT narrative fields)

---

### Parser C: DataSourceDataFrameReader (Spark CSV — legacy fallback only)
Use only when Parsers A/B both fail (e.g., extremely irregular file formats).
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

---

### Parser Selection Rules
| Condition | Parser |
|-----------|--------|
| Standard tabular data, no geometry | A |
| Any `geoshape_geojson` or `h3_geojson` column present | **B** (v6 default for all geo datasets) |
| Embedded newlines (`\n`) inside narrative fields | **B** |
| Geotemporal track rows (lat/lng per timestamp) | **B** |
| Both A and B fail on malformed source file | C |

---

## §2. Spatial Data Formatting & Escaping Protocols

### Rule 2.1 — Geopoint: Static Coordinate Handling
For entities with a fixed location (military installation, port, factory, detected event):
- Generate two columns: `latitude` (DOUBLE, range -90.0 to 90.0) and `longitude` (DOUBLE, range -180.0 to 180.0)
- All coordinates must be in **WGS 84 (EPSG:4326)**
- Coordinate projection standard: Web Mercator (EPSG:3857) is the rendering engine's internal format — Foundry MapboxGL converts automatically; **never input EPSG:3857 values into CSV**

**Hallucination Prevention Override (MANDATORY):**
If verified coordinates are not available from source (Source.md tier A–C), do not generate coordinates from memory or approximation.
- Leave `latitude` and `longitude` entirely **NULL** (empty cell, not "0" or "N/A")
- Set `geo_status` column to `"pending_verification"`
- Foundry Pipeline Builder handles NULL DOUBLE cast safely without crashing

**Coordinate validity ranges enforced by Foundry Logical Type Cast:**
- `latitude` outside [-90, 90] → auto-nullified
- `longitude` outside [-180, 180] → auto-nullified
- Invalid GeoJSON string → auto-nullified, does not corrupt ontology index

---

### Rule 2.2 — Geoshape: GeoJSON Boundaries and Complex Areas
For territorial data (maritime exclusion zones, combat frontlines, buffer zones, administrative boundaries):
- Use column name `geoshape_geojson` (STRING type in Foundry schema)
- Geometry must comply with **RFC 7946 GeoJSON specification**
- Polygon exterior ring winding order: **counter-clockwise (CCW)** — clockwise rings will cause rendering failures
- No self-intersecting geometries

**CRITICAL CSV ESCAPING RULE (v6 — fixes v4.5/v5.0 root cause failure):**

Every internal double-quote within the GeoJSON string must be **doubled** (`""`), and the entire GeoJSON string must be wrapped in outer double-quotes.

```
# INVALID (v4.5/v5.0 format — causes Spark THROW_EXCEPTION):
{"type": "Polygon", "coordinates": [[[49.0, 34.0],[50.0, 34.0],[50.0, 35.0],[49.0, 34.0]]]}

# VALID (v6.0 mandatory format):
"{""type"": ""Polygon"", ""coordinates"": [[[49.0, 34.0],[50.0, 34.0],[50.0, 35.0],[49.0, 34.0]]]}"
```

**GeoJSON coordinate order:** always `[longitude, latitude]` — reversed from CSV `lat, lng` convention.
This is the single most common source of geometry misalignment.

**Polygon winding order example (CCW — valid):**
```python
# Vertices listed counter-clockwise when viewed from above (north up)
# Lower-left → Lower-right → Upper-right → Upper-left → close
coords = [[49.0, 34.0], [50.0, 34.0], [50.0, 35.0], [49.0, 35.0], [49.0, 34.0]]
```

---

### Rule 2.3 — H3 Dual-Indexing (v6 NEW — replaces single H3 string output)
**Critical flaw in v5.0:** Outputting only the `h3_cell_id` STRING causes Foundry's Search Around engine and bounding box queries to completely skip those objects (Ghost Data phenomenon). H3 strings are not indexed by Foundry's geospatial search engine.

**v6.0 mandatory dual-column output:**

| Column | Type | Purpose |
|--------|------|---------|
| `h3_cell_id` | STRING | Rapid hex-grid map rendering (render-only, not searchable) |
| `h3_geojson` | STRING | GeoJSON Polygon of the H3 cell vertices → stored as `geoshape` → **fully indexed for spatial search** |

`h3_geojson` must follow the same CSV escaping rule as Rule 2.2.

```python
# Generate both columns from a coordinate pair
import h3

def generate_h3_dual(lat: float, lng: float, resolution: int = 8) -> dict:
    cell_id = h3.latlng_to_cell(lat, lng, resolution)
    boundary = h3.cell_to_boundary(cell_id)  # returns [(lat,lng), ...]
    # GeoJSON uses [lng, lat] order
    coords = [[b[1], b[0]] for b in boundary]
    coords.append(coords[0])  # close the ring
    geojson = {"type": "Polygon", "coordinates": [coords]}
    import json
    # Apply v6.0 CSV escaping
    raw = json.dumps(geojson)
    escaped = '"' + raw.replace('"', '""') + '"'
    return {"h3_cell_id": cell_id, "h3_geojson": escaped}
```

**Ontology mapping:**
- `h3_cell_id` → Capabilities → Geospatial → **H3 cell** (render only)
- `h3_geojson` → property type `geoshape` → **fully spatially indexed**

---

## §3. Schema Field Types Reference

| Foundry Type | Use For | Notes |
|-------------|---------|-------|
| `STRING` | IDs, names, text, URLs, `geoshape_geojson`, `h3_geojson`, `h3_cell_id`, `iso_alpha2`, `geo_status` | Default for all `*_id` and all GeoJSON columns |
| `DOUBLE` | `latitude`, `longitude`, `radius_m`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng`, `track_latitude`, `track_longitude` | All coordinate columns — force manually after inference |
| `LONG` | Integer counts, years, `sequence_order` | `quantity`, `year` |
| `DATE` | Date-only fields | ISO 8601: `YYYY-MM-DD` |
| `TIMESTAMP` | `timestamp`, `event_start_time`, `event_end_time`, `snapshot_time` | `YYYY-MM-DDTHH:MM:SSZ` — required for all track and event columns |
| `BOOLEAN` | Flag columns | `true`/`false` lowercase only |
| `DECIMAL(38,18)` | High-precision financial values | When rounding error is unacceptable |

### Post-inference corrections (mandatory — always verify after auto-inference)
- `latitude`, `longitude`, `track_latitude`, `track_longitude`, `radius_m`, `origin_*`, `target_*` → force `DOUBLE`
- `timestamp`, `event_start_time`, `event_end_time`, `snapshot_time` → force `TIMESTAMP`
- `*_id`, `geoshape_geojson`, `h3_geojson`, `h3_cell_id`, `iso_alpha2`, `geo_status` → force `STRING`
- `sequence_order` → force `LONG`

---

## §4. Schema Application Workflow

1. Upload CSV → dataset created in target folder
2. Click **"Apply a schema"** → Foundry runs auto-inference
3. **Details tab → Schema section → "Edit schema"**
4. Manually correct field types per §3
5. Set parser configuration per §1 (Parser B for all geospatial datasets)
6. **"Save and Validate"**
   - GeoJSON field validation failure → click **"Save without Validating"** → verify escaping per Rule 2.2 → retry

### Multi-CSV Append Rule
- Appending CSVs with different column sets → manually define `fieldSchemaList` with ALL columns
- Absent columns in older files → auto-filled with `NULL`
- Schema merging across CSV files requires a user-written Transform (`mergeSchema` is Parquet-only, not available for CSV)

---

## §5. Python Transforms

### §5.1 Standard CSV → Parquet
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
        .option("multiLine", True)    # required when geoshape_geojson or h3_geojson present
        .option("mode", "PERMISSIVE") # nullify unparseable fields; do not crash pipeline
        .csv(files)
    )
    # REQUIRED: Parquet rejects column names with spaces or special characters
    output.write_dataframe(sanitize_schema_for_parquet(df))
```

---

### §5.2 Waypoint CSV → LineString GeoJSON
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
        .option("header", True).option("inferSchema", True)
        .csv(raw.filesystem().hadoop_path + "/*.csv")
    )
    df = (df
        .withColumn("latitude", F.col("latitude").cast("double"))
        .withColumn("longitude", F.col("longitude").cast("double"))
        .withColumn("sequence_order", F.col("sequence_order").cast("int"))
    )
    # GeoJSON coordinate order: [longitude, latitude] — not [lat, lng]
    df = df.withColumn("coord_pair", F.array(F.col("longitude"), F.col("latitude")))
    grouped = (
        df.groupBy("route_id")
        .agg(F.collect_list(F.struct("sequence_order", "coord_pair")).alias("wps"))
    )

    def make_linestring(wps: list) -> str:
        sorted_wps = sorted(wps, key=lambda x: x["sequence_order"])
        coords = [list(w["coord_pair"]) for w in sorted_wps]
        return json.dumps({"type": "LineString", "coordinates": coords})

    make_ls_udf = F.udf(make_linestring, StringType())
    result = grouped.withColumn("geoshape_geojson", make_ls_udf("wps")).drop("wps")
    output.write_dataframe(sanitize_schema_for_parquet(result))
```

---

### §5.3 CRS Normalization: Non-WGS84 → EPSG:4326 (v6 NEW)
Use when raw source files use a non-standard coordinate reference system (e.g., NAD83, local Shapefiles).
Failure to convert results in positional errors of up to tens of kilometers.

```python
from transforms.api import transform_df, Input, Output
from geospatial_tools import geospatial
from geospatial_tools.functions import clean_geometry, geojson_to_geohash, centroid

@geospatial()
@transform_df(
    Output('/Compass/GlobalIntel/Domain_Output/clean_wgs84_geo'),
    raw_df=Input('/Compass/GlobalIntel/Domain_Input/raw_geo_ingest')
)
def process_spatial_data(raw_df):
    # Strict conversion of any input CRS to WGS 84 (EPSG:4326)
    normalized_df = raw_df.withColumn(
        'geoshape_geojson',
        clean_geometry('raw_geometry', 'EPSG:4326', output_format='geojson')
    )
    # Generate Geohash fallback column for rapid point-based heatmap clustering
    final_df = normalized_df.withColumn(
        'centroid_geohash',
        geojson_to_geohash(centroid('geoshape_geojson'))
    )
    return final_df
```

**When to use §5.3:**
- Source data from national mapping agencies using local CRS (NAD83, GK, etc.)
- Shapefiles or raster imports with embedded CRS metadata
- Any data where coordinate values are in meters rather than decimal degrees

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

## §7. Ontology Object Types (Map-ready, v6)

| Object Type | Domain | Map Layer | Required CSV Columns |
|------------|--------|-----------|----------------------|
| `MilitaryFacility` | D3 | Point (icon) | `facility_id`, `latitude`, `longitude`, `geo_status` |
| `StrikeRoute` | D3/D5 | Line (geoshape) | `route_id`, `geoshape_geojson` (LineString, v6 escaped) |
| `MilitaryAsset` | D2 | Point | `asset_id`, `latitude`, `longitude`, `geo_status` |
| `MovingAsset` | D2/D7 | Track | `object_id`, `timestamp`, `track_latitude`, `track_longitude` |
| `WeaponsTransfer` | D4 | Line Segment | `transfer_id`, `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `ConflictEvent` | D5/D11 | Point + Timeline Event | `event_id`, `latitude`, `longitude`, `event_start_time`, `event_end_time` |
| `ConflictZone` | D11 | Polygon | `zone_id`, `geoshape_geojson` (Polygon, CCW winding, v6 escaped) |
| `SanctionedEntity` | D6 | Point (if geo) | `entity_id`, `latitude`, `longitude`, `geo_status` |
| `SpaceAsset` | D7 | Point (snapshot) | `satellite_id`, `latitude`, `longitude`, `snapshot_time` |
| `EnergyInfrastructure` | D8 | Line / Polygon | `infra_id`, `geoshape_geojson` |
| `DensityCell` | D0/D11 | H3 Hexagon | `object_id`, `h3_cell_id`, `h3_geojson` (dual-index per §9) |
| `PolicyDocument` | D1 | Non-geo | — |
| `USPosture` | D10 | Point (icon) | `posture_id`, `latitude`, `longitude`, `geo_status` |
| `GlobalConflict` | D11 | Polygon + Choropleth | `conflict_id`, `geoshape_geojson` or `iso_alpha2` |
| `OSINTRecord` | D0 | Point (if geo) | `record_id`, `latitude`, `longitude`, `geo_status` |

**Column naming change from v4.5:** `lat`/`lng` → `latitude`/`longitude` (aligns with Foundry constructGeoPointV1 expression inputs and reduces schema ambiguity).

### Cross-domain linking columns
- `facility_id` → D3 ↔ D5 (facility where event occurred)
- `entity_id` → D6 ↔ D5 (sanctioned actor in event)
- `conflict_id` → D11 ↔ D5 (event belongs to conflict)
- `route_id` → D3 StrikeRoute ↔ D5 ConflictEvent
- `object_id` → D2/D7 MovingAsset ↔ time series track dataset

---

## §8. Geotemporal Track Modeling (v6 NEW)

**This section replaces all static coordinate approaches for moving objects used in v4.5 and v5.0.**

### The v4.5/v5.0 failure modes (both deprecated)
- **Mode 1 (v4.5):** Overwriting a single `latitude`/`longitude` with the latest position → permanently destroys movement history
- **Mode 2 (v5.0):** Creating one new object row per position update → same vessel appears as thousands of disconnected points on map; Timeline interpolation completely fails

### v6.0 mandatory architecture: discrete rows + time series properties

**Track CSV format** (separate dataset from main object):
```
object_id,  timestamp,              track_latitude, track_longitude
CVN-78,     2026-03-15T00:01:00Z,   36.8, -76.3
CVN-78,     2026-03-15T06:00:00Z,   35.2, -70.1
CVN-78,     2026-03-15T12:00:00Z,   33.7, -64.8
CVN-78,     2026-03-16T00:00:00Z,   32.1, -52.4
```

**Main object CSV** (snapshot only — no time series rows mixed in):
```
object_id, latitude, longitude, snapshot_time,       object_type,  geo_status
CVN-78,    32.1,     -52.4,     2026-03-16T00:00:00Z, Carrier_CVN, verified
```

### Ontology Manager track configuration
- `track_latitude` (DOUBLE) → Capabilities → Geospatial → **Track Latitude** (numeric time series)
- `track_longitude` (DOUBLE) → Capabilities → Geospatial → **Track Longitude** (numeric time series)

### Track interpolation modes (Foundry Map Timeline settings)
| Mode | Behavior | Use When |
|------|----------|----------|
| `Linear` | Smooth path between recorded points | Regular reporting interval, continuous movement |
| `Last known` | Object stays at last position until next update | Infrequent reporting, stationary periods |

### Max time gap setting (critical)
If interval between two consecutive rows exceeds the configured **Max time gap** threshold, Foundry intentionally breaks the track line — signals communication loss or sensor gap, prevents false interpolation over data voids.
- Set per asset type: aircraft (recommend 2h), naval vessel (recommend 12h), ground convoy (recommend 6h)

### Required columns for track dataset
```
object_id    STRING     — primary grouping key; must match main object dataset
timestamp    TIMESTAMP  — ISO 8601: YYYY-MM-DDTHH:MM:SSZ
track_latitude   DOUBLE — WGS 84
track_longitude  DOUBLE — WGS 84
```

Do not pre-merge track points into a static LineString GeoJSON — Foundry requires discrete rows to apply opacity fading, interpolation, and Max time gap correctly.

---

## §9. H3 Dual-Indexing Protocol (v6 NEW)

**Critical flaw in v5.0:** Single `h3_cell_id` STRING column.
H3 strings are rendered on the map but are NOT indexed by Foundry's geospatial search engine.
Result: objects appear visually but are completely invisible to Search Around, bounding box, and polygon intersection queries — Ghost Data.

### v6.0 mandatory dual-column output

Always generate both columns simultaneously:

```
h3_cell_id,        h3_geojson
82f25ffffffffff,   "{""type"":""Polygon"",""coordinates"":[[[12.1,48.3],[12.8,48.3],[13.1,47.9],[12.9,47.5],[12.2,47.5],[11.9,47.9],[12.1,48.3]]]}"
```

### Ontology mapping for dual-index
```
h3_cell_id  → STRING property → Capabilities → Geospatial → H3 cell   [render only]
h3_geojson  → STRING property → type: geoshape                          [spatially indexed]
```

### When to use H3 dual-indexing
- Density / heatmap analysis (conflict event clustering per region)
- Coverage modeling (radar range, EW jamming zones)
- Large-scale data aggregation where individual point rendering is too slow (>100K objects)

### Resolution guidance
| H3 Resolution | Approx. Cell Area | Use For |
|--------------|-------------------|---------|
| 5 | ~252 km² | Country-level strategic overview |
| 7 | ~5.2 km² | Operational area analysis |
| 8 | ~0.74 km² | Tactical engagement zone |
| 10 | ~0.015 km² | Facility / installation level |

---

## §10. Pipeline Builder: Logical Type Cast & Data Lineage (v6 NEW)

### Logical Type Cast (replaces manual PySpark type correction in many cases)
When v6.0-compliant escaped GeoJSON flows into Foundry via CSV upload, Pipeline Builder can cast directly without custom PySpark scripts:

- `geoshape_geojson` (STRING) → **Logical Type Cast: Geometry** → `geoshape` property
- `latitude` + `longitude` (DOUBLE pair) → **Expression: `constructGeoPointV1(latitude, longitude)`** → `geopoint` property

**Auto-nullification behavior (built-in validation):**
- `latitude` outside [-90, 90] → auto-nullified, does not crash pipeline
- `longitude` outside [-180, 180] → auto-nullified
- Malformed GeoJSON string → auto-nullified
- NULL coordinates with `geo_status: "pending_verification"` → safely pass through

### Data Lineage integration
- All `pending_verification` flagged records are immediately traceable in the Lineage graph
- Analysts can identify source ID, tier (A/B/C/D/E/W), and extraction timestamp per record
- CASE J (OSINT Fallback / W-Tier) records are flagged automatically; manual review before map layer promotion
- After manual verification: apply Foundry Rules to update `geo_status` from `"pending_verification"` to `"verified"` → object becomes visible in map layer

### constructGeoPointV1 expression (Pipeline Builder)
```
constructGeoPointV1(latitude, longitude)
```
- Inputs: two DOUBLE columns (WGS 84 decimal degrees)
- Output: `geopoint` property on the Ontology object
- Valid range enforced automatically; out-of-range values → NULL

---

## §11. Common Errors & Fixes (v6 Expanded)

| Error | Root Cause | Fix |
|-------|-----------|-----|
| Spark `THROW_EXCEPTION` on GeoJSON column | Unescaped internal quotes (v4.5/v5.0 flaw) | Apply v6 Rule 2.2 double-escaping; switch to Parser B |
| Jagged row exception | Column count mismatch (GeoJSON comma splitting) | `jaggedRowBehavior: "DROP_ROW"` in Parser B; verify GeoJSON escaping |
| `latitude`/`longitude` typed STRING | Null values during auto-inference | Manually force to DOUBLE in schema editor |
| Parquet write fails | Special chars or spaces in column names | Apply `sanitize_schema_for_parquet()` |
| Multi-CSV append fails | New file has extra columns | Manually define `fieldSchemaList` with all columns |
| BOM encoding error | Excel "UTF-8 with BOM" | Re-save without BOM (Notepad++, VSCode) |
| Date/timestamp parse fails | Non-ISO format | Pre-process to `YYYY-MM-DDTHH:MM:SSZ` before upload |
| ID auto-converted to LONG | Numeric-looking ID string | Force `*_id` to STRING type |
| OSINT narrative field breaks CSV | Free-text with commas/newlines | Parser B + `DROP_ROW` |
| GeoJSON not rendered as line/polygon | Not mapped to `geoshape` property | Set property type to `geoshape` in Ontology Manager |
| **Ghost Data: H3 objects visible but not searchable** | **Single h3_cell_id STRING (v5.0 flaw)** | **Apply §9 dual-index: add h3_geojson column as geoshape** |
| **Track appears as scattered points** | **Separate object row per position (v5.0 flaw)** | **Apply §8: single object_id + timestamp + track_lat/lng rows** |
| **Coordinate positional error (km-scale)** | **Non-WGS84 CRS in source data** | **Apply §5.3 CRS normalization transform** |
| Track not animating | Track Lat/Lon not configured as time series | Set in Capabilities → Geospatial → Track Latitude/Longitude |
| Choropleth not showing | ISO code not linked to Value Type | Install "Choropleth Value Types" from Marketplace |
| Cluster not grouping | Layer geometry not set to Cluster | Set Cluster geometry in Map layer config |
| H3 hexagon visible but not searchable | H3 cell not mapped to geoshape | Add `h3_geojson` column per §9; map to `geoshape` |
| Timeline event missing | No event start/end time configured | Set Event start/end time in Capabilities → Event |
| Polygon renders as filled when outline needed | Fill polygons: ON by default | Layer style → Fill polygons: OFF |
| Polygon winding causes rendering artifact | Clockwise exterior ring | Reverse to counter-clockwise per RFC 7946 |

---

## §12. Pre-Upload Validation Checklist (v6 Expanded)

```
GENERAL
[ ] Encoding: UTF-8, no BOM
[ ] Header: row 1 only, lowercase_underscore names, no duplicate columns
[ ] Null representation: empty cell (not "N/A", "null", "0", "-")
[ ] No mixed types within any single column
[ ] Fields containing delimiter: wrapped in double quotes
[ ] confidence_level: populated for every row (0.0–1.0 or High/Medium/Low/Unverified)
[ ] source_id: populated for every row (traceable to Source.md)
[ ] OSINT-sourced rows: source_url populated
[ ] geo_status: populated for every row ("verified" or "pending_verification")

COORDINATES (v6 naming)
[ ] latitude/longitude: Decimal Degrees float (NOT DMS string, NOT EPSG:3857 meters)
[ ] latitude range: -90.0 to 90.0
[ ] longitude range: -180.0 to 180.0
[ ] Unverifiable coordinates: leave NULL + set geo_status="pending_verification"
[ ] accuracy_m: populated for GEO rows where precision is known

DATES & TIMES
[ ] Date columns: YYYY-MM-DD
[ ] Timestamp columns: YYYY-MM-DDTHH:MM:SSZ (UTC, not local time)

IDs
[ ] *_id columns: STRING type, globally unique within dataset
[ ] object_id in track dataset: matches object_id in main object dataset exactly

GEOJSON (v6 CRITICAL — all GeoJSON columns)
[ ] geoshape_geojson: uses double-escaped internal quotes ("" not \")
[ ] geoshape_geojson: entire string wrapped in outer double quotes
[ ] geoshape_geojson: valid RFC 7946 GeoJSON
[ ] Polygon exterior ring: counter-clockwise winding order
[ ] No self-intersecting polygon geometries
[ ] GeoJSON coordinate order: [longitude, latitude] (NOT [lat, lng])
[ ] Parser B (MULTILINE_CSV_PARSER) selected when geoshape_geojson present

H3 DUAL-INDEX (v6)
[ ] h3_cell_id: valid H3 index string
[ ] h3_geojson: GeoJSON Polygon of H3 cell, double-escaped per Rule 2.2
[ ] Both columns present — never h3_cell_id alone

TRACK DATA (v6)
[ ] Track dataset is separate from main object dataset
[ ] object_id column present as grouping key
[ ] timestamp: TIMESTAMP format YYYY-MM-DDTHH:MM:SSZ
[ ] track_latitude / track_longitude: DOUBLE, WGS 84
[ ] No pre-merged LineString GeoJSON in track dataset
[ ] Main object dataset contains snapshot coordinates only (latitude, longitude, snapshot_time)

MAP-SPECIFIC
[ ] [SEGMENT]     origin_lat/lng + target_lat/lng: all DOUBLE
[ ] [ROUTE]       sequence_order: integer, no gaps, per route_id
[ ] [EVENT]       event_start_time / event_end_time: TIMESTAMP
[ ] [CHOROPLETH]  iso_alpha2 or iso_alpha3: STRING, valid ISO 3166 codes
[ ] [CIRCLE]      radius_m: DOUBLE, value in meters
[ ] [IMAGE]       image_url: accessible URL; image_bounds: clockwise Polygon from lower-left
```

---

## §13. Coordinate Conversion Reference

| Input Format | Conversion Method | Example Output |
|-------------|------------------|----------------|
| DMS `34°53'06"N 49°13'09"E` | DD = D + M/60 + S/3600; negative if S or W | `34.885, 49.219` |
| Google Maps URL `@34.885,49.219` | Extract values after `@` | `34.885, 49.219` |
| N2YO real-time snapshot | Record with snapshot_time | add `snapshot_time: 2026-04-06T14:30:00Z` |
| OSINT estimated location | Record estimated precision | `accuracy_m: 1000` |
| Non-WGS84 source (NAD83, local CRS) | Apply §5.3 CRS normalization transform | Full EPSG:4326 conversion |

```python
def dms_to_dd(degrees: float, minutes: float, seconds: float, direction: str) -> float:
    """Convert DMS coordinates to decimal degrees (WGS 84)."""
    dd = degrees + minutes / 60 + seconds / 3600
    if direction in ('S', 'W'):
        dd *= -1
    return round(dd, 6)
```

**GeoJSON coordinate order reminder:** `[longitude, latitude]` — opposite of the CSV `latitude, longitude` convention used in this project. This inversion is the single most common cause of geometry misalignment.

---

## §14. [MAP] Core Concepts & Architecture

### Map Application Overview
Foundry Map visualizes Ontology data as geospatial layers.

Core capabilities:
- Explore geospatial connections between Ontology objects (physical network traversal)
- Bounding box and polygon intersection queries for geospatial search
- High-density vector data + satellite imagery + time-series tracks + event visualization
- Draw shapes → use as geospatial filters or Action inputs
- Build geospatial applications using Map Templates

### Coordinate Reference Systems
- Rendering: **Web Mercator (EPSG:3857)** — MapboxGL converts automatically; never input EPSG:3857 into CSV
- Data input: **WGS 84 decimal degrees (EPSG:4326)** — applies to all latitude/longitude columns
- CRS conversion for non-standard sources: use §5.3 geospatial_tools transform

### Layer System
- Each layer = one Object Type or data source
- Layers have independent style, visibility, and loading settings
- Layer rendering order = stack order in panel (top layer renders in front)

### Create and Save Maps
1. Open **Map** application from Foundry home
2. Create new Map → blank canvas
3. Top bar → **Save** → set title → save
4. Saved Map → shareable via Foundry permissions
5. Save as **Template** → embeddable in Workshop

---

## §15. [MAP] Interact with Maps

### Add Data to Map
**Ontology objects:**
1. Left panel → search icon → search Object Type name
2. Select Object Type → added as new layer
3. Select Geometry type in layer panel (Point / Line / Polygon etc.)

**External data:**
- GeoJSON file → drag and drop onto map
- WMS/WMTS tile layer → enter URL in external layer dialog
- Foundry Dataset (vector tiles) → connect via layer data source

### Layer Management
| Action | Method |
|--------|--------|
| Show / hide | Toggle eye icon in layer panel |
| Reorder | Drag and drop |
| Delete | Right-click → Remove |
| Duplicate | Right-click → Duplicate |
| Group | Select multiple → Group |
| Edit style | Click layer → Style panel |

### Navigation
| Action | Method |
|--------|--------|
| Pan | Click and drag |
| Zoom | Scroll wheel or +/- buttons |
| Jump to location | Enter coordinates or place name in search bar |
| Zoom to layer extent | Right-click layer → Zoom to layer |

### Selection
- **Click**: single object → properties panel
- **Shift+click**: multi-select
- **Click-drag**: rectangle area select
- **Draw polygon**: Shapes tool → select objects inside
- **Search Around**: explore connected objects within radius from selected object

### Histogram & Filtering
- Layer panel → **Histogram** tab
- Drag range on histogram → immediate value filter applied to map
- Example: `fatalities_est` histogram → show only events above threshold

### Actions from Map
- Select object → properties panel → **Actions** tab → execute predefined Ontology Actions

---

## §16. [MAP] Time & Temporal Visualization

### Time Feature Overview
| Feature | Purpose |
|---------|---------|
| Time Selection | Filter map to a specific time point or range |
| Timeline | Horizontal bar showing events chronologically |
| Events | Ontology objects with start/end timestamps |
| Time Series | Properties that change value over time (tracks) |

### Time Selection
- Map top bar → clock icon or **Time** button
- Set range: drag slider or enter dates
- Only objects/events within range are shown
- **Play button**: animate time progression for track playback

### Timeline Panel
- Map bottom → expand **Timeline** panel
- Events displayed as icons on timeline
- Click event icon → map pans to that location

### Event Objects
Required CSV columns:
```
event_id, event_start_time,        event_end_time,          latitude, longitude, event_type
EV-001,   2025-06-22T01:44:00Z,    2025-06-22T02:10:00Z,    34.885,   49.219,   AirStrike
```

Ontology Manager:
- `event_start_time` (TIMESTAMP) → Capabilities → Event → **Event start time**
- `event_end_time` (TIMESTAMP) → Capabilities → Event → **Event end time**
- `event_intent` (STRING, optional): `low` / `medium` / `high` / `critical`

### Time Series / Track Playback
See §8 for full track modeling specification.
- Time Selection slider → plays back track movement
- Play button → animates object movement along track path
- Max time gap → breaks track line when data gap exceeds threshold

### Series Panel
**Deprecated** — do not use in new implementations. Use Timeline + Events pattern instead.

---

## §17. [MAP] Visualize Ontology Data — All Layer Types

### Layer Overview
Every Map layer = **Geometry selection** + **Styling**.

Available geometry types:
`Point` | `Line/Polygon (geoshape)` | `Line Segment` | `Choropleth` | `Cluster` | `Track` | `Timeline Event` | `H3 Hexagon` | `Circle` | `Georectified Image`

**Value-based styling:** Layer edit → Styling → Value-based styling → select property → set color range

### Points (Icon & Circle)
Single `geopoint` property → point on map.
Setup: Layer → Point → Icon or Circle → set styling (color, size, label, opacity)

Minimum CSV: `facility_id, latitude, longitude, facility_name`

### Lines & Polygons
**Method A — geoshape (GeoJSON column):**
- `geoshape_geojson` → STRING → `geoshape` property → Parser B mandatory
- Layer → Geometry: Lines and Polygons → select geoshape property

**Method B — Line Segment (two geopoint properties):**
- `origin_lat`, `origin_lng`, `target_lat`, `target_lng` → 4 DOUBLE columns
- Layer → Geometry: Line Segment → Start/End geopoints
- Style → Arrow direction: ON for flow/direction visualization

**When to use:**
- Simple A→B: Line Segment (weapons transfer, supply link)
- Multi-waypoint route: Method A with LineString GeoJSON (use §5.2 transform)

### Choropleths
**ISO code method:** Add `iso_alpha2` STRING → install Choropleth Value Types from Marketplace → set boundary type in Ontology Manager → Layer → Choropleth
**Custom polygon method:** Separate polygon Object Type → many-to-one link → Layer → Choropleth → Linked object
Aggregation options: Count | Sum | Average | Min | Max

### Clusters
Dense point sets → auto-group.
Layer → Geometry: Cluster → zoom out groups, zoom in separates.
Style: cluster radius, max zoom for dissolution, aggregation display.

### Timeline Events
Layer → Geometry: Timeline Events → enable Timeline panel → Time Selection range
Only events active within range shown on map.

### Tracks (Moving Objects)
See §8 for data format. Layer → Geometry: Tracks.
Display options: Trail (historical path) | Trail length | Heading arrow | Current position icon.

### Loading Methods
| Method | Best For |
|--------|----------|
| On-demand | <10K objects |
| Tile-based | >10K objects |
| Pre-loaded | Small analytical sets |

---

## §18. [MAP] Integrate Data for the Map

### Geospatial Property Types
| Property | Type | Notes |
|----------|------|-------|
| `geopoint` | lat/lng DOUBLE pair | Core — spatially indexed |
| `geoshape` | GeoJSON STRING | Core — spatially indexed; use v6 escaping |
| Circle radius | DOUBLE (meters) | Render-only; not spatially indexed |
| H3 cell | STRING | Render-only; use dual-index per §9 for searchability |
| Track Lat/Lon | numeric time series | Requires separate time series dataset |
| Event start/end | TIMESTAMP | Configured in Capabilities → Event |
| Georectified image | image_url STRING + image_bounds geoshape | Clockwise Polygon, lower-left start |

### Search Arounds
Select object on map → properties panel → **Search Around** → click Link Type → connected objects load as new layer.
Example: `MilitaryFacility` → Search Around → linked `ConflictEvent` objects appear.

### Functions for Map
Code Repository Function → publish → Map Layer → Data source: Function → configure parameters.

### Ontology Actions from Map
Object selected → properties panel → Actions tab → execute Action.

---

## §19. [MAP] Templates, Workshop Widget & Configuration

### Map Templates
1. Complete Map setup (layers + styles + filters)
2. Top menu → Save as Template → set name
3. Publish to Marketplace for org-wide sharing

### Workshop Widget
1. Workshop → edit module → Add widget → **Map**
2. Select Map Template → configure interactions (Workshop variable → Map filter)
3. Pattern: country dropdown → filter map; date slider → sync Time Selection

### Map Settings
| Setting | Options |
|---------|---------|
| Base map style | Satellite / Street / Dark / Light / Terrain |
| Default zoom | Initial zoom level |
| Default center | Initial center coordinates |
| Units | Metric / Imperial |

### Control Panel
Map → right side → Control Panel tab → Add Control → select type (Date range / Dropdown / Checkbox) → assign to layer filter.

---

## §20. [MAP] Geospatial Property Type Reference (v6 Complete)

| Purpose | CSV Column(s) | Foundry Type | Ontology Property | Capabilities | Notes |
|---------|--------------|-------------|-------------------|-------------|-------|
| Single point | `latitude` DOUBLE + `longitude` DOUBLE | DOUBLE × 2 | `geopoint` | Primary geo property | Core; fully indexed |
| GeoJSON geometry | `geoshape_geojson` STRING | STRING | `geoshape` | — | v6 escaping required; fully indexed |
| H3 render | `h3_cell_id` STRING | STRING | STRING | Geospatial → H3 cell | Render-only |
| H3 search | `h3_geojson` STRING | STRING | `geoshape` | — | Spatially indexed; pair with h3_cell_id |
| Radius circle | `radius_m` DOUBLE | DOUBLE | numeric | Geospatial → Radius | Render-only |
| Track movement | `track_latitude` + `track_longitude` | numeric time series | — | Geospatial → Track Lat/Lon | Separate dataset |
| Event start | `event_start_time` TIMESTAMP | TIMESTAMP | TIMESTAMP | Event → Event start time | |
| Event end | `event_end_time` TIMESTAMP | TIMESTAMP | TIMESTAMP | Event → Event end time | |
| Event severity | `event_intent` STRING | STRING | STRING | Event → Event intent | low/medium/high/critical |
| Image URL | `image_url` STRING | STRING | STRING | — | .png/.jpg/.svg etc. |
| Image bounds | `image_bounds` STRING (GeoJSON Polygon) | STRING → geoshape | `geoshape` | typeclass: geo / bounds.image_url | Clockwise, lower-left start |
| Country choropleth | `iso_alpha2` STRING | STRING | STRING + Value Type | Marketplace install | ISO 3166-1 alpha-2 |
| Segment origin | `origin_lat` DOUBLE + `origin_lng` DOUBLE | DOUBLE × 2 | `geopoint` | — | |
| Segment target | `target_lat` DOUBLE + `target_lng` DOUBLE | DOUBLE × 2 | `geopoint` | — | |
| Coordinate status | `geo_status` STRING | STRING | STRING | — | "verified" or "pending_verification" |

### GeoJSON CSV encoding (v6 rule — applies to all GeoJSON columns)
```
# Internal double-quotes → doubled ("" not \")
# Entire string → wrapped in outer double-quotes
"{""type"":""LineString"",""coordinates"":[[-76.3,36.8],[-70.1,35.2],[-64.8,33.7]]}"
```

---

## §21. [MAP] Layer Decision Tree & Domain Matrix

### Layer Selection Decision Tree
```
What is the nature of the data?
│
├─ Single location (one latitude/longitude per record)
│   ├─ Basic display                → POINT (icon or circle)
│   ├─ Dense distribution           → CLUSTER
│   ├─ Radius / influence area      → CIRCLE (add radius_m column)
│   └─ Time-based movement          → TRACK (§8 — separate time series dataset)
│
├─ A → B connection
│   ├─ Simple two-point line        → LINE SEGMENT (origin/target lat+lng)
│   └─ Multi-waypoint route         → GEOSHAPE LineString (§5.2 transform)
│
├─ Area / region
│   ├─ Simple polygon               → POLYGON (geoshape_geojson, CCW winding)
│   ├─ Country/region aggregate     → CHOROPLETH (iso_alpha2 or linked polygon)
│   └─ Density / coverage analysis  → H3 HEXAGON (§9 dual-index mandatory)
│
├─ Time-bounded event
│   └─ Has start + end time         → TIMELINE EVENT (event_start_time / event_end_time)
│
└─ Image overlay
    └─ Satellite / aerial photo     → GEORECTIFIED IMAGE (image_url + image_bounds)
```

### Domain-to-Layer Matrix (v6)

| Domain | Data | Layer Type | Key CSV Columns | Ontology Property |
|--------|------|-----------|-----------------|-------------------|
| D3 Facilities | Military base location | Point (icon) | `latitude`, `longitude`, `geo_status` | `geopoint` |
| D3 Strike routes | Multi-waypoint flight path | Line (geoshape) | `geoshape_geojson` LineString | `geoshape` |
| D3 Strike routes (simple) | Direct A→B connection | Line Segment | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D4 Arms transfers | Export/import flow | Line Segment + Arrow | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D5 Conflict events | Individual incidents | Point + Timeline Event | `latitude`, `longitude`, `event_start_time` | `geopoint` + Event config |
| D5 Combat zones | Battle area boundary | Polygon | `geoshape_geojson` Polygon (CCW) | `geoshape` |
| D6 Sanctions | Geo-tagged entity | Point | `latitude`, `longitude`, `geo_status` | `geopoint` |
| D7 Satellite snapshot | Current position | Point | `latitude`, `longitude`, `snapshot_time` | `geopoint` |
| D7 Satellite / vessel track | Movement path | Track | `object_id`, `timestamp`, `track_latitude`, `track_longitude` | numeric time series |
| D8 Pipelines | Energy route | Line (geoshape) | `geoshape_geojson` LineString | `geoshape` |
| D8 Project zones | Energy region | Polygon | `geoshape_geojson` Polygon (CCW) | `geoshape` |
| D10 US bases | Base location | Point (icon) | `latitude`, `longitude`, `geo_status` | `geopoint` |
| D10 Combatant commands | Operational area | Polygon / Choropleth | `geoshape_geojson` or `iso_alpha2` | `geoshape` or Value Type |
| D11 Conflicts (aggregate) | Per-country conflict count | Choropleth | `iso_alpha2`, `conflict_count` | Value Type |
| D11 Conflict zones | Active conflict boundary | Polygon | `geoshape_geojson` Polygon (CCW) | `geoshape` |
| D11 Density analysis | Event/threat concentration | H3 Hexagon | `h3_cell_id` + `h3_geojson` | STRING + `geoshape` |
| D0 OSINT | Location record (if geo) | Point (nullable) | `latitude`, `longitude`, `geo_status` | `geopoint` |
