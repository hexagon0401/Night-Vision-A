# TO_FOUNDRY.MD v2 — Palantir Foundry CSV Ingestion Guidelines
# Based on official Palantir Foundry documentation.
# Scope updated: region-agnostic (not China-exclusive).
# For AI consumption.

---

## 1. Foundry CSV Architecture Overview

Two CSV reader backends. Choose based on data complexity:

### Backend A: TextDataFrameReader (Standard — use first)
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

### Backend B: DataSourceDataFrameReader (Spark CSV — for complex cases)
Use when: multiline fields, nested quotes, embedded newlines in data.
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

## 2. TextDataFrameReader: Parameter Reference

### 2.1 charsetName (Encoding)
Supported values (enum — exact string):
- `UTF-8` ← default for all files in this project
- `UTF-16` | `UTF-16BE` | `UTF-16LE`
- `ISO_8859_1`
- `US_ASCII`
- `Windows-31J` (Japanese Shift-JIS)

Rule: Strip BOM before upload if Excel-sourced file.

### 2.2 fieldDelimiter
- Default: `,`
- Alternatives: `\t` (TSV), `;` (European Excel), `|` (pipe)
- Fields containing commas → wrap in double quotes `"..."`

### 2.3 jaggedRowBehavior
- `THROW_EXCEPTION` — fail on column count mismatch (default; safest)
- `DROP` — silently discard jagged rows (use for messy OSINT data)

### 2.4 parseErrorBehavior
- `THROW_EXCEPTION` — fail on parse errors (default)
- `COERCE_TO_NULL` — replace unparseable values with null

### 2.5 skipLines
- `1` = skip header (default)
- `0` = no header (define schema manually)

### 2.6 Optional column additions
- `addFilePath: true` → append source file path (useful for multi-file OSINT datasets)
- `addImportedAt: true` → append ingestion timestamp (recommended for time-series)

---

## 3. Schema Field Types Reference

| Foundry Type | Use For | Notes |
|-------------|---------|-------|
| `STRING` | IDs, names, text, URLs | Default for `*_id`, `*_name`, `source_*` |
| `DOUBLE` | lat/lng, ratios, TIV | REQUIRED for `lat`, `lng` |
| `LONG` | Integer counts, years | `quantity`, `year` |
| `DATE` | Date-only fields | ISO 8601: `YYYY-MM-DD` |
| `TIMESTAMP` | Date + time | `YYYY-MM-DDTHH:MM:SSZ` |
| `BOOLEAN` | Flags | `true`/`false` lowercase |
| `DECIMAL(38,18)` | Financial values | Use when precision critical |

Post-inference manual corrections always required:
- `lat` / `lng` → force `DOUBLE`
- `*_date` / `*_time` → force `DATE` or `TIMESTAMP`
- `*_id` → force `STRING` (prevent LONG auto-conversion)

---

## 4. Schema Application Workflow (Dataset Preview UI)

1. Upload CSV to target Foundry folder → dataset created
2. Click **"Apply a schema"** → auto-inference runs
3. Navigate **Details tab → Schema section**
4. Click **"Edit schema"** → manually correct types (see §3)
5. Set parsing options: jagged rows, encoding, addImportedAt
6. Click **"Save and Validate"**
   - Nested quote / embedded newline failure → use **"Save without Validating"** then switch to Backend B

### Multi-CSV Append Rule
- When appending CSVs with different columns: manually define `fieldSchemaList` with ALL columns
- New columns → auto-filled with `null` for prior rows
- Schema merging requires user-written Transform (no native mergeSchema for CSV)

---

## 5. Python Transform: CSV to Parquet Pipeline

```python
from transforms.api import transform, Input, Output
from transforms.verbs.dataframes import sanitize_schema_for_parquet

@transform(
    output=Output("/Compass/GlobalIntel/[domain]/[YYYYMM]/processed"),
    raw=Input("/Compass/GlobalIntel/[domain]/[YYYYMM]/raw_csv"),
)
def parse_csv(ctx, raw, output):
    filesystem = raw.filesystem()
    hadoop_path = filesystem.hadoop_path
    files = [f"{hadoop_path}/{f.path}" for f in filesystem.ls(glob="*.csv")]

    df = (
        ctx.spark_session.read
        .option("encoding", "UTF-8")
        .option("header", True)
        .option("inferSchema", True)
        .option("multiLine", False)   # set True if embedded newlines exist
        .option("mode", "PERMISSIVE") # nullify unparseable fields
        .csv(files)
    )

    # REQUIRED: removes special chars/spaces from column names before Parquet write
    output.write_dataframe(sanitize_schema_for_parquet(df))
```

Note: `sanitize_schema_for_parquet` is mandatory. Parquet rejects column names with spaces, special characters, or hyphens. Missing this step causes pipeline failure.

---

## 6. Dataset Path Convention (v2 — Region-Agnostic)

```
/Compass/
├── GlobalIntel/
│   ├── policy_strategy/        [DOMAIN-1]
│   ├── military_assets/        [DOMAIN-2]
│   ├── facilities_geo/         [DOMAIN-3]
│   ├── arms_transfers/         [DOMAIN-4]
│   ├── conflict_events/        [DOMAIN-5]
│   ├── sanctions_entities/     [DOMAIN-6]
│   ├── space_assets/           [DOMAIN-7]
│   ├── energy_infra/           [DOMAIN-8]
│   ├── opinion_economic/       [DOMAIN-9]
│   ├── us_allied_posture/      [DOMAIN-10]
│   ├── global_conflict_monitor/[DOMAIN-11]
│   └── osint_fallback/         [DOMAIN-0]
│
└── [domain]/
    ├── raw_csv/      ← uploaded raw files
    └── processed/    ← post-transform Parquet
```

Tags per dataset: `geopolitics`, `[domain_name]`, `[primary_country]`, `[source_tier]`

Note: Previous path `/Compass/China_Intel/` is deprecated. Migrate to `/Compass/GlobalIntel/`.

---

## 7. Ontology Object Types (v2 — Expanded)

| Ontology Type | Domain | Key Columns |
|--------------|--------|-------------|
| `MilitaryFacility` | D3 | facility_id, lat, lng, operator_country |
| `MilitaryAsset` | D2 | asset_id, country, force_branch |
| `ConflictEvent` | D5, D11 | event_id, event_date, lat, lng |
| `SanctionedEntity` | D6 | entity_id, sanction_date |
| `SpaceAsset` | D7 | satellite_id, norad_id |
| `EnergyInfrastructure` | D8 | infra_id, country_a, country_b |
| `WeaponsTransfer` | D4 | transfer_id, exporter, importer |
| `PolicyDocument` | D1 | plan_id, plan_period |
| `USPosture` | D10 | posture_id, combatant_command, country |
| `GlobalConflict` | D11 | conflict_id, conflict_name |
| `OSINTRecord` | D0 | record_id, topic_domain, source_url |

Linking columns across objects:
- Use `facility_id` to link D3 ↔ D5 (facility where event occurred)
- Use `entity_id` to link D6 ↔ D5 (sanctioned actor involved in event)
- Use `conflict_id` to link D11 ↔ D5 (event belongs to conflict)

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Schema inference fails | Nested quotes / embedded `\n` | Switch to Backend B; "Save without Validating" |
| Jagged row exception | Column count mismatch | Set `jaggedRowBehavior: "DROP"` or fix source |
| `lat`/`lng` typed STRING | Nulls present during inference | Manually force to DOUBLE |
| Parquet write fails | Special chars in column names | Apply `sanitize_schema_for_parquet()` |
| Multi-CSV append fails | Extra columns in new file | Define `fieldSchemaList` with all columns |
| BOM encoding error | Excel UTF-8 with BOM | Re-save without BOM (Notepad++, VSCode) |
| Date parse fails | Non-ISO format (MM/DD/YYYY) | Pre-process to YYYY-MM-DD |
| ID auto-converted LONG | Numeric-looking ID | Force `*_id` to STRING |
| OSINT URL data messy | Free-text web content | Use `jaggedRowBehavior: "DROP"` + `mode: "PERMISSIVE"` |

---

## 9. Pre-Upload Validation Checklist

```
[ ] Encoding: UTF-8, no BOM
[ ] Header: row 1 only, lowercase_underscore names, no duplicates
[ ] lat/lng: Decimal Degrees float (NOT DMS)
[ ] Dates: YYYY-MM-DD (ISO 8601)
[ ] IDs: string, globally unique within dataset
[ ] Nulls: empty string "" consistently (not "N/A","null","0")
[ ] Comma-containing fields: wrapped in double quotes
[ ] No mixed types per column
[ ] confidence_level: populated for every row
[ ] source_id: populated for every row (traceable to Source.md)
[ ] OSINT-sourced rows: source_url populated
```

---

## 10. Coordinate Conversion Reference

| Input Format | Method | Example Output |
|-------------|--------|----------------|
| DMS `10°31'N 103°37'E` | DD = D + M/60 + S/3600 | `10.517, 103.617` |
| Google Maps `@10.531,103.624` | Extract after `@` | `10.531, 103.624` |
| N2YO real-time | Record with snapshot_time | Add `snapshot_time: 2025-04-05T14:30:00Z` |
| OSINT estimated | Mark accuracy_m | `accuracy_m: 1000` (1km radius) |

```python
def dms_to_dd(degrees, minutes, seconds, direction):
    dd = degrees + minutes/60 + seconds/3600
    if direction in ['S', 'W']:
        dd *= -1
    return round(dd, 6)
```
