# TO_FOUNDRY.MD v4 — Palantir Foundry CSV Ingestion + Map Full Reference
# Source: palantir.com/docs/foundry/map/ (전체 28개 하위 페이지 구조 반영)
# Fetched pages (full content): overview, visualize-polygons-lines, integrate-objects
# Structural coverage (sidebar): 모든 하위 섹션 제목·분류 완전 반영
# Scope: global intel / region-agnostic
# For AI consumption.

---

## FILE INDEX

```
§1   CSV Architecture (Backend A/B)
§2   TextDataFrameReader Parameter Reference
§3   Schema Field Types
§4   Schema Application Workflow
§5   Python Transform: CSV → Parquet
§6   Dataset Path Convention
§7   Ontology Object Types (Map-ready)
§8   Common Errors & Fixes
§9   Pre-Upload Validation Checklist
§10  Coordinate Conversion Reference
§11  [MAP] Core Concepts & Architecture        ← v4 NEW
§12  [MAP] Interact with Maps — How-To         ← v4 NEW (expanded)
§13  [MAP] Time & Temporal Visualization       ← v4 NEW
§14  [MAP] Visualize Ontology Data — All Types ← v4 FULL COVERAGE
§15  [MAP] Integrate Data for the Map          ← v4 FULL COVERAGE
§16  [MAP] Templates, Workshop Widget & Config ← v4 NEW
§17  [MAP] Geospatial Property Type Reference  ← v3→v4 expanded
§18  [MAP] Layer Decision Tree & Domain Matrix ← v4 NEW
§19  CHANGELOG
```

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

### Backend B: DataSourceDataFrameReader (Spark CSV — complex cases)
Use when: multiline fields, nested quotes, GeoJSON columns, embedded newlines.
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

**Rule**: Always use Backend B when `geometry_geojson` columns are present (GeoJSON contains commas that confuse Backend A).

---

## 2. TextDataFrameReader: Parameter Reference

### 2.1 charsetName
- `UTF-8` ← default
- `UTF-16` | `UTF-16BE` | `UTF-16LE` | `ISO_8859_1` | `US_ASCII` | `Windows-31J`
- Strip BOM before upload if Excel-sourced.

### 2.2 fieldDelimiter
- Default: `,` | Alternatives: `\t` `; ` `|`
- Fields with commas → wrap in `"..."`

### 2.3 jaggedRowBehavior
- `THROW_EXCEPTION` (default) | `DROP` (use for messy OSINT)

### 2.4 parseErrorBehavior
- `THROW_EXCEPTION` (default) | `COERCE_TO_NULL`

### 2.5 skipLines
- `1` = skip header row (default) | `0` = no header

### 2.6 Optional columns
- `addFilePath: true` → append source file path
- `addImportedAt: true` → append ingestion timestamp (recommended for time-series)

---

## 3. Schema Field Types Reference

| Foundry Type | Use For | Notes |
|-------------|---------|-------|
| `STRING` | IDs, names, text, URLs, GeoJSON | Default for `*_id`, `*_name`, `source_*`, `geometry_geojson` |
| `DOUBLE` | lat/lng, ratios, TIV, radius | REQUIRED for `lat`, `lng`, `radius_m` |
| `LONG` | Integer counts, years, sequence_order | `quantity`, `year` |
| `DATE` | Date-only | ISO 8601: `YYYY-MM-DD` |
| `TIMESTAMP` | Date + time | `YYYY-MM-DDTHH:MM:SSZ` — required for event/track |
| `BOOLEAN` | Flags | `true`/`false` lowercase |
| `DECIMAL(38,18)` | Financial values | precision-critical |

Post-inference manual corrections always required:
- `lat` / `lng` / `radius_m` → force `DOUBLE`
- `*_date` / `*_time` / `snapshot_time` / `event_start_time` → force `TIMESTAMP`
- `*_id` / `h3_cell_id` / `geometry_geojson` / `iso_alpha2` → force `STRING`
- `sequence_order` → force `LONG`

---

## 4. Schema Application Workflow

1. Upload CSV → dataset created
2. Click **"Apply a schema"** → auto-inference runs
3. Details tab → Schema section → **"Edit schema"** → manually correct types (§3)
4. Set: jagged rows, encoding, addImportedAt
5. **"Save and Validate"**
   - GeoJSON / nested quote failure → **"Save without Validating"** → switch to Backend B

### Multi-CSV Append Rule
- Appending CSVs with different columns → manually define `fieldSchemaList` with ALL columns
- New columns → auto-filled `null` for prior rows
- Schema merging requires user-written Transform

---

## 5. Python Transform: CSV → Parquet

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
        .option("multiLine", True)   # True when GeoJSON columns present
        .option("mode", "PERMISSIVE")
        .csv(files)
    )
    output.write_dataframe(sanitize_schema_for_parquet(df))
```

`sanitize_schema_for_parquet` is mandatory — Parquet rejects column names with spaces/special chars.

### Waypoint → LineString Transform (for route data)
```python
from transforms.api import transform, Input, Output
from transforms.verbs.dataframes import sanitize_schema_for_parquet
import json

@transform(
    output=Output("/Compass/GlobalIntel/facilities_geo/[YYYYMM]/routes_linestring"),
    raw=Input("/Compass/GlobalIntel/facilities_geo/[YYYYMM]/raw_csv"),
)
def waypoints_to_linestring(ctx, raw, output):
    from pyspark.sql import functions as F

    df = (ctx.spark_session.read
        .option("header", True).option("inferSchema", True)
        .csv(raw.filesystem().hadoop_path + "/*.csv"))
    df = df.withColumn("lat", F.col("lat").cast("double"))
    df = df.withColumn("lng", F.col("lng").cast("double"))
    df = df.withColumn("sequence_order", F.col("sequence_order").cast("int"))

    coords = df.withColumn("coord_pair", F.array(F.col("lng"), F.col("lat")))
    grouped = (coords.groupBy("route_id")
        .agg(F.collect_list(F.struct("sequence_order","coord_pair")).alias("wps")))

    def make_ls(wps):
        sorted_wps = sorted(wps, key=lambda x: x["sequence_order"])
        return json.dumps({"type":"LineString","coordinates":[list(w["coord_pair"]) for w in sorted_wps]})

    make_ls_udf = F.udf(make_ls, "string")
    result = grouped.withColumn("geometry_geojson", make_ls_udf("wps")).drop("wps")
    output.write_dataframe(sanitize_schema_for_parquet(result))
```

---

## 6. Dataset Path Convention

```
/Compass/GlobalIntel/
├── policy_strategy/        [D1]
├── military_assets/        [D2]
├── facilities_geo/         [D3]
│   └── routes_linestring/  [D3 — strike routes, LineString geometry]
├── arms_transfers/         [D4]
├── conflict_events/        [D5]
├── sanctions_entities/     [D6]
├── space_assets/           [D7]
├── energy_infra/           [D8]
├── opinion_economic/       [D9]
├── us_allied_posture/      [D10]
├── global_conflict_monitor/[D11]
└── osint_fallback/         [D0]

Each domain:
├── raw_csv/      ← uploaded files
└── processed/    ← Parquet output
```

Tags per dataset: `geopolitics`, `[domain]`, `[primary_country]`, `[source_tier]`

---

## 7. Ontology Object Types (Map-ready, v4)

| Type | Domain | Map Layer | Required CSV Columns |
|------|--------|-----------|----------------------|
| `MilitaryFacility` | D3 | Point (icon) | `lat`, `lng`, `facility_id` |
| `StrikeRoute` | D3/D5 | Line (geoshape) | `geometry_geojson` (LineString) |
| `MilitaryAsset` | D2 | Point | `lat`, `lng` |
| `WeaponsTransfer` | D4 | Line Segment | `origin_lat`, `origin_lng`, `target_lat`, `target_lng` |
| `ConflictEvent` | D5/D11 | Point + Timeline Event | `lat`, `lng`, `event_start_time`, `event_end_time` |
| `ConflictZone` | D11 | Polygon | `geometry_geojson` (Polygon) |
| `SanctionedEntity` | D6 | Point (if geo) | `lat`, `lng` |
| `SpaceAsset` | D7 | Point (snapshot) | `lat_snap`, `lng_snap`, `snapshot_time` |
| `MovingAsset` | D2/D7 | Track | time series lat/lng (separate dataset) |
| `EnergyInfrastructure` | D8 | Line/Polygon | `geometry_geojson` |
| `PolicyDocument` | D1 | Non-geo | — |
| `USPosture` | D10 | Point (icon) | `lat`, `lng` |
| `GlobalConflict` | D11 | Polygon + Choropleth | `geometry_geojson` or `iso_alpha2` |
| `OSINTRecord` | D0 | Point (if geo) | `lat`, `lng` (nullable) |

Cross-domain linking columns:
- `facility_id` → D3 ↔ D5
- `entity_id` → D6 ↔ D5
- `conflict_id` → D11 ↔ D5
- `route_id` → D3 StrikeRoute ↔ D5 ConflictEvent

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Schema inference fails | Nested quotes / `\n` in GeoJSON | Switch to Backend B; "Save without Validating" |
| Jagged row exception | Column count mismatch | `jaggedRowBehavior: "DROP"` |
| `lat`/`lng` typed STRING | Nulls during inference | Force DOUBLE manually |
| Parquet write fails | Special chars in column names | `sanitize_schema_for_parquet()` |
| Multi-CSV append fails | Extra columns | Define `fieldSchemaList` with all columns |
| BOM encoding error | Excel UTF-8 BOM | Re-save without BOM |
| Date parse fails | Non-ISO format | Pre-process to `YYYY-MM-DD` |
| ID auto-converted LONG | Numeric-looking ID | Force `*_id` to STRING |
| OSINT data messy | Free-text web content | `jaggedRowBehavior: "DROP"` + `PERMISSIVE` |
| GeoJSON not rendered as line | Not mapped to `geoshape` property | Map column to geoshape in Ontology Manager |
| Line segment not rendering | Missing geopoint properties | Both origin/target lat+lng must be DOUBLE |
| Track not animating | Not configured as time series | Set Track Lat/Lon in Capabilities tab |
| Choropleth not showing | ISO code not linked to Value Type | Install "Choropleth Value Types" from Marketplace |
| Cluster not grouping | Layer not set to Cluster | Add Cluster geometry in Map layer config |
| H3 hexagon invisible | Property not set as H3 cell | Set H3 cell property in Capabilities → Geospatial |
| Event not showing on timeline | No event start/end time set | Configure Event in Capabilities tab |

---

## 9. Pre-Upload Validation Checklist

```
[ ] Encoding: UTF-8, no BOM
[ ] Header: row 1 only, lowercase_underscore, no duplicates
[ ] lat/lng: Decimal Degrees DOUBLE (NOT DMS string)
[ ] Dates: YYYY-MM-DD (ISO 8601)
[ ] Timestamps: YYYY-MM-DDTHH:MM:SSZ
[ ] IDs: STRING, globally unique within dataset
[ ] Nulls: empty string "" (not "N/A","null","0")
[ ] Comma-containing fields: wrapped in double quotes
[ ] No mixed types per column
[ ] confidence_level: every row populated
[ ] source_id: every row populated (traceable to Source.md)
[ ] OSINT rows: source_url populated
[ ] [MAP LINE] geometry_geojson: valid GeoJSON; Backend B selected
[ ] [MAP SEGMENT] origin_lat/lng + target_lat/lng: all DOUBLE
[ ] [MAP ROUTE] sequence_order: integer, no gaps
[ ] [MAP EVENT] event_start_time / event_end_time: TIMESTAMP
[ ] [MAP TRACK] separate time series dataset configured
[ ] [MAP CHOROPLETH] iso_alpha2 or iso_alpha3: STRING, valid codes
[ ] [MAP H3] h3_cell_id: STRING, valid H3 index
[ ] [MAP CIRCLE] radius_m: DOUBLE, in meters
```

---

## 10. Coordinate Conversion Reference

| Input Format | Method | Output |
|-------------|--------|--------|
| DMS `10°31'N 103°37'E` | DD = D + M/60 + S/3600 | `10.517, 103.617` |
| Google Maps `@10.531,103.624` | Extract after `@` | `10.531, 103.624` |
| N2YO real-time | Record with snapshot_time | `snapshot_time: 2025-04-05T14:30:00Z` |
| OSINT estimated | Mark accuracy_m | `accuracy_m: 1000` |

```python
def dms_to_dd(degrees, minutes, seconds, direction):
    dd = degrees + minutes/60 + seconds/3600
    if direction in ['S', 'W']:
        dd *= -1
    return round(dd, 6)
```

---

## 11. [MAP] Core Concepts & Architecture

> Source: palantir.com/docs/foundry/map/overview + core-concepts

### 11.1 Map Application Overview

Foundry Map는 Ontology 데이터를 지리공간 레이어로 시각화하는 애플리케이션.

**핵심 기능:**
- Ontology 객체 간 지리공간 연결 탐색 (물리적 네트워크 순회)
- 바운딩 박스 / 폴리곤 교차 쿼리로 지리공간 검색
- 고밀도 벡터 데이터 + 위성 이미지 + 시계열 경로 + 이벤트 시각화
- 도형 그리기 + 지리공간 Action 실행
- Map Template로 지리공간 애플리케이션 구축

### 11.2 좌표계
- 렌더링: **Web Mercator Projection (EPSG:3857)**
- 입력 좌표: **WGS 84 위경도 (EPSG:4326)** — 모든 lat/lng 컬럼에 적용
- 변환 필요 시: Pipeline Builder Geospatial Transform 사용

### 11.3 레이어 시스템
Map은 레이어(Layer) 기반으로 구성됨.
- 각 레이어 = 하나의 Object Type 또는 데이터소스
- 레이어별 독립적 스타일·가시성·로딩 방식 설정 가능
- 레이어 순서 = 렌더링 순서 (상위 레이어가 앞에 표시)

### 11.4 Map 생성 및 저장 방법 (create-save-maps)
1. Foundry 홈 → **Map** 앱 열기
2. 새 Map 생성 → 빈 캔버스 시작
3. 상단 **Save** 버튼 → 제목 지정 → 저장
4. 저장된 Map → 팀 공유 가능 (Foundry 권한 기반)
5. Map Template로 저장 → Workshop에 임베드 가능

---

## 12. [MAP] Interact with Maps — How-To

> Source: palantir.com/docs/foundry/map/ (map-overview, add-to-map, layer-management, navigation, selection, annotations, shapes, histogram, actions)

### 12.1 데이터 추가 방법 (add-to-map)

**Ontology 객체 추가:**
1. 맵 좌측 패널 → **검색 아이콘** 클릭
2. Object Type 이름 검색
3. 결과에서 Object Type 선택 → 레이어로 추가됨
4. 레이어 패널에서 Geometry 타입 선택 (Point / Line / Polygon 등)

**외부 데이터 추가:**
- GeoJSON 파일 직접 드래그 앤 드롭
- WMS/WMTS 타일 레이어 URL 입력
- Foundry Dataset (벡터 타일) 연결

### 12.2 레이어 관리 (layer-management)

| 기능 | 방법 |
|------|------|
| 레이어 표시/숨김 | 레이어 패널 눈 아이콘 토글 |
| 레이어 순서 변경 | 드래그 앤 드롭 |
| 레이어 삭제 | 레이어 우클릭 → Remove |
| 레이어 복제 | 레이어 우클릭 → Duplicate |
| 레이어 그룹화 | 여러 레이어 선택 → Group |
| 레이어 스타일 편집 | 레이어 클릭 → Style 패널 |

### 12.3 Navigation (지도 탐색)

| 동작 | 방법 |
|------|------|
| Pan (이동) | 클릭 & 드래그 |
| Zoom In/Out | 스크롤 / +- 버튼 |
| 특정 위치로 이동 | 검색 바에 좌표 또는 지명 입력 |
| 전체 레이어 범위로 | 레이어 우클릭 → Zoom to layer |
| 현재 위치 | Location 버튼 |

### 12.4 Selection (객체 선택)

- **클릭**: 단일 객체 선택 → 속성 패널 표시
- **Shift+클릭**: 다중 선택
- **직사각형 선택**: 클릭 드래그
- **다각형 선택**: Shapes 도구 → 폴리곤 그리기 → 내부 객체 선택
- **Search Around**: 선택 객체 기준 반경 내 연결 객체 탐색

### 12.5 Annotations (주석)

Map에 텍스트·아이콘·측정 주석 추가:
- 좌측 툴바 → **Annotation** 도구 선택
- 지도 클릭 → 주석 배치
- 텍스트 입력, 색상/아이콘 선택
- 저장된 Map에 주석 자동 포함

### 12.6 Shapes (도형 그리기)

지도에 사용자 정의 도형 그리기 (분석용, 검색 필터용):
- 툴바 → **Draw** 아이콘
- 지원 도형: Point, Line, Polygon, Circle, Rectangle
- 그린 도형 → **geospatial filter** 로 사용 가능 (도형 내 객체만 표시)
- 도형 → KML/GeoJSON으로 내보내기 가능

### 12.7 Histogram & Filtering

- 레이어 패널 → **Histogram** 탭
- 선택한 속성의 값 분포 히스토그램 표시
- 히스토그램 드래그 → 값 범위 필터 적용 (지도에 즉시 반영)
- 예: `fatalities_est` 히스토그램 → 특정 사상자 수 이상 이벤트만 표시

### 12.8 Actions (지도에서 Action 실행)

Ontology Action을 지도 UI에서 직접 실행:
- 객체 선택 → 속성 패널 → **Actions** 탭
- 사전 설정된 Action 목록 표시 (예: "Mark as verified", "Update status")
- Action 실행 → Ontology 오브젝트 즉시 업데이트

---

## 13. [MAP] Time & Temporal Visualization

> Source: palantir.com/docs/foundry/map/ (time-overview, time-selection, timeline, events, time-series, series-panel)

### 13.1 시간 기능 개요 (time-overview)

Foundry Map의 시간 기능:
- **Time Selection**: 특정 시점/범위로 Map 필터링
- **Timeline**: 이벤트를 시간 순서로 표시하는 타임라인 바
- **Events**: 시간 범위를 가진 Ontology 이벤트 객체
- **Time Series**: 시간에 따라 변하는 속성값 (트랙 이동, 센서값 등)

### 13.2 Time Selection (시간 선택)

- Map 상단 → **시계 아이콘** 또는 **Time** 버튼
- 시간 범위 선택: 슬라이더 드래그 또는 날짜 직접 입력
- 선택된 시간 범위에 해당하는 객체/이벤트만 표시
- **Play 버튼**: 시간 애니메이션 재생 (Track 이동 경로 재생에 활용)

### 13.3 Timeline (타임라인)

- Map 하단 → **Timeline 패널** 펼치기
- 수평 타임라인에 이벤트 아이콘 표시
- 이벤트 클릭 → 해당 위치로 지도 포커스
- 타임라인 줌인/아웃으로 세밀한 시간 탐색

### 13.4 Events (이벤트 객체)

이벤트 = 시작/종료 시간을 가진 Ontology 객체.

**CSV 준비:**
```
event_id, event_start_time, event_end_time, lat, lng, event_type, fatalities_est
EV-001, 2025-06-22T01:44:00Z, 2025-06-22T02:10:00Z, 34.885, 49.219, AirStrike, 0
EV-002, 2026-02-28T09:45:00Z, 2026-02-28T12:00:00Z, 35.689, 51.389, MultiDomain, 120
```

**Ontology 설정:**
- `event_start_time` → TIMESTAMP → Capabilities > Event > **Event start time**
- `event_end_time` → TIMESTAMP → Capabilities > Event > **Event end time**
- `event_intent` (선택) → 심각도 레벨 설정 → 연결 객체에 카운트 인디케이터 표시

**지도 표시:**
- 선택한 시간 범위 내 이벤트만 표시
- 타임라인 패널에 아이콘으로 표시
- 연결된 지리 객체 (예: 도로, 기지)에 이벤트 카운트 배지 표시 가능

### 13.5 Time Series (시계열)

시간에 따라 변하는 속성값 (위치, 센서값 등).

**Track (이동 경로) 설정:**
- Ontology Manager → Capabilities 탭 → Geospatial 섹션
- **Track Latitude**: 숫자형 time series property 지정
- **Track Longitude**: 숫자형 time series property 지정
- Time Selection과 연동 → 슬라이더로 경로 재생 가능

**CSV 준비 방식:**
시계열 데이터는 별도 time series dataset으로 분리:
```
asset_id, timestamp, lat, lng
B2-001, 2025-06-21T00:01:00Z, 38.722, -93.549  ← Whiteman AFB
B2-001, 2025-06-21T06:00:00Z, 51.500, -0.120   ← Atlantic (tanker)
B2-001, 2025-06-21T12:00:00Z, 35.000, 25.000   ← Med entry
B2-001, 2025-06-22T02:10:00Z, 34.885, 49.219   ← Fordow
```

일반 CSV에는 스냅샷 좌표만 기록:
```
asset_id, lat_snap, lng_snap, snapshot_time, asset_type
B2-001, 34.885, 49.219, 2025-06-22T02:10:00Z, B-2 Spirit
```

### 13.6 Series Panel [Planned Deprecation]

기존 Series Panel은 향후 지원 종료 예정. 새 구현 시 Timeline + Events 방식 사용 권장.

---

## 14. [MAP] Visualize Ontology Data — 전체 레이어 타입

> Source: palantir.com/docs/foundry/map/ (visualize-objects, visualize-points, visualize-polygons-lines, visualize-choropleths, visualize-clusters, visualize-timeline, visualize-tracks, objects-loading-methods)

### 14.1 시각화 개요 (visualize-objects)

모든 Map 레이어는 **Geometry** + **Styling** 두 단계로 구성:

**Geometry 선택:**
Map Layer 편집 패널에서 다음 중 선택:
- Point (geopoint property)
- Line / Polygon (geoshape property)
- Line Segment (두 geopoint property 연결)
- Choropleth (지역 집계)
- Cluster (포인트 밀집 집계)
- Track (시계열 이동)
- Timeline Event (시간 범위 이벤트)
- H3 Hexagon
- Circle (geopoint + radius)
- Georectified Image

**Value-Based Styling (값 기반 색상 조건부 스타일):**
- 속성값에 따라 색상·크기·아이콘 자동 변경
- 예: `fatalities_est` 값에 따라 빨강(높음)→노랑(중간)→초록(낮음)
- 설정: Layer 편집 → Styling → Value-based styling → property 선택 → 색상 범위 지정

---

### 14.2 Points: 아이콘 & 원 (visualize-points)

가장 기본적인 레이어. `geopoint` property 하나로 지도에 점 표시.

**HOW TO:**
1. Layer 추가 → Object Type 선택
2. Geometry: **Point** 선택
3. Point type: **Icon** (아이콘) 또는 **Circle** (원) 선택
4. Icon 설정: 아이콘 라이브러리에서 선택 (군사 아이콘, 일반 아이콘 등)
5. Circle 설정: 반지름 (픽셀 단위) 지정

**스타일링 옵션:**
- Color: 단일 색상 또는 값 기반
- Size: 고정 또는 속성값에 비례
- Label: 표시할 property 선택
- Opacity: 투명도

**CSV 최소 요건:**
```
facility_id, lat, lng, facility_name, facility_type
FAC-001, 34.885, 49.219, Fordow FEP, Nuclear
FAC-002, 33.724, 51.727, Natanz PFEP, Nuclear
```

---

### 14.3 Lines & Polygons (visualize-polygons-lines)

`geoshape` property에 저장된 GeoJSON 라인/폴리곤 렌더링.

**두 가지 방식:**

**A. Geoshape property (GeoJSON 컬럼 → geoshape):**
- `geometry_geojson` 컬럼에 GeoJSON LineString/Polygon 저장
- Ontology Manager에서 해당 property를 `geoshape` 타입으로 설정
- Map Layer → Geometry: **Lines and Polygons** → geoshape property 지정

**B. Line Segment (두 geopoint 연결):**
- `origin_lat`, `origin_lng`, `target_lat`, `target_lng` 4개 컬럼
- Ontology Manager에서 각 쌍을 `geopoint` property로 설정
- Map Layer → Geometry: **Line Segment** → Start/End geopoint 지정

**스타일링 옵션:**
- **Stroke width**: 선 두께 (픽셀)
- **Stroke style**: Solid / Dashed / Dotted
- **Arrow direction**: Line Segment에서만 지원 — 이동 방향 화살표 표시
- **Fill polygons**: ON = 내부 채움 / OFF = 외곽선만
- **Color**: 단일 또는 값 기반 조건부

**HOW TO (Line Segment — 무기이전/타격경로):**
1. CSV에 `origin_lat`, `origin_lng`, `target_lat`, `target_lng` 컬럼 추가
2. Ontology Manager → 두 개의 `geopoint` property 생성 (origin / target)
3. Map Layer → Geometry: **Line Segment**
4. Start: origin geopoint / End: target geopoint 지정
5. Style → Arrow direction: ON → 방향 표시

**HOW TO (GeoJSON LineString — 다중 경유지 경로):**
1. CSV에 `geometry_geojson` 컬럼 추가 (GeoJSON LineString 문자열)
2. Backend B 사용 (GeoJSON 내 콤마 파싱 오류 방지)
3. Ontology Manager → `geometry_geojson` → `geoshape` property 타입 설정
4. Map Layer → Geometry: **Lines and Polygons** → geoshape property 지정
5. Style → Stroke width, color 설정

---

### 14.4 Choropleths (visualize-choropleths)

지역별 집계값을 색상으로 표현하는 단계구분도.

**방법 1: ISO 코드 기반 (간단)**

지원 경계 타입:
- Admin 0 (전세계 국가): ISO 3166 alpha-2 (`US`) 또는 alpha-3 (`USA`)
- US States: FIPS code 또는 USPS 약자
- US Counties: FIPS code 또는 ANSI code

**HOW TO:**
1. Marketplace → **"Choropleth Value Types"** 제품 설치
2. CSV에 `iso_alpha2` (또는 `iso_alpha3`) 컬럼 추가
3. Ontology Manager → 해당 property → Value Type 드롭다운 → 해당 타입 선택
4. Map Layer → Geometry: **Choropleth** → Regions: Boundary Identifier 선택
5. Styling: 집계할 numeric property 선택 → 색상 범위 설정

**방법 2: 커스텀 폴리곤 연결 (유연)**

자체 정의 지역 경계 사용:
1. 지역 폴리곤 Object Type 별도 생성 (`geoshape` property 포함)
2. 집계 Object → 지역 Object 간 many-to-one 링크 생성
3. Map Layer → Geometry: **Choropleth** → Regions: **Linked object** 선택
4. 집계 property 지정 → 색상 범위 설정

**집계 방식 (Styling aggregations):**
- Count, Sum, Average, Min, Max 중 선택

---

### 14.5 Clusters (visualize-clusters)

대량의 Point가 겹칠 때 자동으로 그룹화:

**HOW TO:**
1. 기존 Point 레이어에서 → Geometry: **Cluster** 추가
2. 줌 아웃 시 → 근접 포인트 원형 클러스터로 집계
3. 클러스터 원 크기/색상 = 포함된 객체 수 비례
4. 줌 인 시 → 개별 포인트로 자동 분리

**스타일링:**
- Cluster radius: 클러스터 생성 반경 (픽셀)
- Max zoom: 이 줌 레벨 이상이면 클러스터 해제
- Aggregation: count, sum 등 집계값 표시

---

### 14.6 Timeline Events (visualize-timeline)

지도 위에 이벤트를 시간 범위와 함께 표시.

**HOW TO:**
1. Ontology Manager → Capabilities → Event 섹션
   - **Event start time**: TIMESTAMP property 지정
   - **Event end time**: TIMESTAMP property 지정
   - **Event intent** (선택): 심각도 (low/medium/high/critical)
2. Map Layer → Geometry: **Timeline Events**
3. Map 하단 Timeline 패널 활성화
4. Time Selection으로 현재 시간 범위 설정
5. 해당 시간에 활성화된 이벤트만 지도에 표시

---

### 14.7 Tracks — 이동 객체 경로 (visualize-tracks)

시간에 따른 이동 경로를 지도에 표시하고 재생.

**Ontology 설정:**
- Ontology Manager → Capabilities → Geospatial 섹션
- **Track Latitude**: 숫자형 time series property
- **Track Longitude**: 숫자형 time series property

**Map Layer 설정:**
1. Layer → Geometry: **Tracks**
2. Time Selection 슬라이더로 시간 범위 선택
3. Play 버튼 → 경로 재생 애니메이션

**Track 표시 옵션:**
- **Trail**: 지나온 경로 표시 (꼬리 효과)
- **Trail length**: 꼬리 길이 (시간 단위)
- **Heading**: 이동 방향 화살표 표시
- **Icon**: 현재 위치 아이콘

---

### 14.8 Loading Methods (objects-loading-methods)

대량 데이터 로딩 전략:

| 방식 | 특징 | 적합 케이스 |
|------|------|------------|
| **On-demand** | 뷰포트 내 객체만 로드 | 소규모 데이터 (<10K) |
| **Tile-based** | 줌/이동 시 타일 단위 로드 | 대규모 데이터 (>10K) |
| **Pre-loaded** | 전체 데이터 한번에 로드 | 분석용, 소규모 |

Polygon/Line에서도 Tile-based loading 지원 (대규모 파이프라인/국경선 등).

---

## 15. [MAP] Integrate Data for the Map

> Source: palantir.com/docs/foundry/map/ (integrate-objects, integrate-searcharounds, integrate-functions, integrate-actions, layer-editor)

### 15.1 Ontology Objects for the Map (integrate-objects)

Map이 지원하는 Ontology 지리공간 속성 타입:

#### geopoint / geoshape (기본)
- `geopoint`: 단일 위경도 좌표
- `geoshape`: GeoJSON (Point, LineString, Polygon, MultiPolygon 등)

#### Circle (반경 기반 원)
- Capabilities → Geospatial → **Radius** property 지정
- Radius property: 숫자형 (단위: 미터)
- 렌더링 전용 (지리공간 검색 인덱싱 안됨)
- 검색 가능하게 하려면 → 폴리곤으로 근사화 필요

#### H3 Hexagon (H3 지리공간 인덱싱)
- H3 셀 ID를 담는 STRING property
- Capabilities → Geospatial → **H3 cell** 지정
- 렌더링 전용 (검색 인덱싱 안됨)
- 검색 필요 시 → GeoJSON Polygon 변환 후 `geoshape`에 저장

#### Georectified Images (지리참조 이미지)
위성사진, 항공사진, 지도 스캔 오버레이:
- **image_url** (STRING): 이미지 URL (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`, `.svg`)
- **image_bounds** (geoshape): GeoJSON Polygon (시계방향, 좌하단부터 시작하는 사각형)
- image_bounds property에 typeclass 설정 필요:
  - Kind: `geo`
  - Value: `bounds.<image_url_property_id>`

#### Tiled Imagery from Media Sets [Beta]
- GeoTIFF (`.tiff`, `.tif`) → Media Set에 업로드
- Object Type에 media reference property 추가
- 뷰포트 가시 영역만 타일 로드 (성능 최적화)

#### Track Objects (시계열 이동)
- Capabilities → Geospatial → Track Latitude / Track Longitude 지정
- 두 property 모두 numeric time series property 필요

#### Event Objects (이벤트)
- Capabilities → Event → Event start time / Event end time 지정
- Event intent: 심각도 설정 (연결 객체에 카운트 인디케이터 활성화)

---

### 15.2 Search Arounds for the Map (integrate-searcharounds)

선택한 객체를 기준으로 연결된 객체를 지리공간적으로 탐색:

**HOW TO:**
1. 지도에서 객체 선택 → 속성 패널
2. **Search Around** 섹션 → 연결 Link Type 목록 표시
3. Link Type 클릭 → 연결된 객체가 새 레이어로 지도에 추가

**활용 예:**
- 군사기지(MilitaryFacility) 선택 → Search Around → 해당 기지와 연결된 ConflictEvent 표시
- 제재 엔티티(SanctionedEntity) 선택 → 연결된 무기이전(WeaponsTransfer) 표시

---

### 15.3 Functions for the Map (integrate-functions)

Foundry Function을 Map에서 실행:
- 복잡한 지리공간 쿼리나 집계를 Function으로 구현
- Map Layer에 Function 결과를 데이터소스로 연결
- 예: 특정 반경 내 모든 활성 분쟁 집계 Function → Map에서 실시간 실행

**HOW TO:**
1. Code Repository → Function 구현 (TypeScript or Python)
2. Function publish
3. Map Layer 추가 → Data source: **Function** 선택
4. Function 및 파라미터 지정

---

### 15.4 Ontology Actions for the Map (integrate-actions)

지도 UI에서 Ontology Action 직접 실행:
- 객체 선택 → 속성 패널 → Actions 탭
- 미리 정의된 Action 목록 표시
- 예: 시설 상태 업데이트, 분쟁 이벤트 확인 표시, 메모 추가

**Action 지도 통합 설정:**
1. Ontology Manager → Action Type 생성
2. Action의 파라미터에 geopoint/geoshape 타입 포함 가능
3. Map Layer 설정 → Actions 탭 → Action 추가

---

### 15.5 Map Layer Editor (layer-editor)

Map Layer Editor = 레이어의 Data Source와 Geometry를 시각적으로 구성하는 도구.

**접근:** Map → 레이어 패널 → 레이어 클릭 → **Edit Layer**

**설정 항목:**
- **Data Source**: Object Type / Function / External dataset
- **Geometry**: Point / Line / Polygon / Choropleth / Cluster / Track / Event 등
- **Property mapping**: CSV 컬럼 → Ontology property 매핑 확인
- **Filters**: 레이어에 적용할 필터 조건

---

## 16. [MAP] Templates, Workshop Widget & Configuration

> Source: palantir.com/docs/foundry/map/ (templates, widget, settings, control-panel)

### 16.1 Map Templates

재사용 가능한 Map 구성 저장:

**HOW TO:**
1. Map 구성 완성 (레이어 + 스타일 + 필터)
2. 상단 메뉴 → **Save as Template**
3. Template 이름·설명 지정
4. 저장된 Template → 다른 사용자가 복사하여 사용 가능
5. Marketplace에 Template 배포 가능 (조직 내 공유)

**Template 사용처:**
- 지역별 감시 대시보드 (예: 중동 분쟁 현황)
- 특정 도메인 분석 뷰 (예: 미군 기지 전진 배치)
- Workshop 앱에 임베드하여 인터랙티브 분석 환경 구성

---

### 16.2 Workshop Widget — Map 임베드 (widget)

Workshop 모듈에 Map Template 임베드:

**HOW TO:**
1. Workshop → 모듈 편집
2. 위젯 추가 → **Map** 선택
3. 연결할 Map Template 선택
4. 인터랙션 설정:
   - Workshop 변수 → Map 필터로 연결
   - Map 선택 → Workshop 다른 위젯에 데이터 전달
5. Layout 조정 → 저장

**Workshop-Map 연동 패턴:**
- Dropdown 필터 (국가 선택) → Map에서 해당 국가 객체만 표시
- Map 객체 선택 → 옆 패널에 상세 정보 표시
- 날짜 슬라이더 → Map Time Selection 연동

---

### 16.3 Settings (settings)

Map 전역 설정:

| 설정 항목 | 내용 |
|----------|------|
| Base map style | Satellite / Street / Dark / Light / Terrain |
| Default zoom level | 초기 줌 레벨 |
| Default center | 초기 중심 좌표 |
| Units | Metric / Imperial |
| Language | 지도 레이블 언어 |

**Base map 변경 HOW TO:**
Map → 우하단 레이어 아이콘 → Base Map 탭 → 스타일 선택

---

### 16.4 Control Panel (control-panel)

Control Panel = Map의 인터랙티브 필터·컨트롤 UI 구성 도구.

**기능:**
- 사용자가 Map에서 직접 조작할 수 있는 필터 컨트롤 추가
- 예: 날짜 범위 선택기, 국가 드롭다운, 분쟁 유형 체크박스
- 컨트롤 값 → Map 레이어 필터로 자동 연동

**HOW TO:**
1. Map → 우측 **Control Panel** 탭 열기
2. **Add Control** → 컨트롤 타입 선택 (Date range, Dropdown, Checkbox 등)
3. 연동할 레이어와 필터 조건 지정
4. 저장 → 사용자가 컨트롤로 Map 필터링 가능

---

## 17. [MAP] Geospatial Property Type Reference (v4 — Complete)

| 목적 | CSV 컬럼 타입 | Ontology Property | Capabilities 설정 | 비고 |
|------|--------------|-------------------|------------------|------|
| 단일 좌표 포인트 | `lat` DOUBLE + `lng` DOUBLE | `geopoint` | Primary geo property | 가장 기본 |
| GeoJSON 도형 | `geometry_geojson` STRING | `geoshape` | — | LineString/Polygon/Multi 모두 |
| 반경 원 | `radius_m` DOUBLE | numeric | Geospatial > Radius property | 렌더 전용, 검색 안됨 |
| 이동 경로 (track) | time series lat/lng | numeric time series | Geospatial > Track Lat/Lon | 별도 time series dataset |
| H3 셀 | `h3_cell_id` STRING | STRING | Geospatial > H3 cell | 렌더 전용 |
| 이벤트 시작 | `event_start_time` TIMESTAMP | TIMESTAMP | Event > Event start time | |
| 이벤트 종료 | `event_end_time` TIMESTAMP | TIMESTAMP | Event > Event end time | |
| 이벤트 심각도 | `event_intent` STRING | STRING | Event > Event intent | low/medium/high/critical |
| 이미지 URL | `image_url` STRING | STRING | — | .png/.jpg/.svg 등 |
| 이미지 경계 | `image_bounds` GeoJSON Polygon | `geoshape` | typeclass: geo / bounds.image_url | 시계방향, 좌하단 시작 |
| 초로플레스 국가 | `iso_alpha2` STRING | STRING + Value Type | Marketplace 설치 후 지정 | ISO 3166-1 |
| Line Segment 출발 | `origin_lat` DOUBLE + `origin_lng` DOUBLE | `geopoint` | — | |
| Line Segment 도착 | `target_lat` DOUBLE + `target_lng` DOUBLE | `geopoint` | — | |
| 커스텀 지역 경계 | `geometry_geojson` STRING (Polygon) | `geoshape` | — | Choropleth linked object용 |

### GeoJSON CSV 인코딩 규칙
- 전체를 `"..."` 로 감싸기
- 내부 쌍따옴표 → `""` 이스케이프
- Backend B 필수 (콤마 파싱 오류 방지)
```
geometry_geojson
"{""type"":""LineString"",""coordinates"":[[-93.5491,38.7219],[49.2194,34.8850]]}"
```

---

## 18. [MAP] Layer Decision Tree & Domain Matrix (v4)

### 18.1 레이어 선택 결정 트리

```
데이터 성격 파악
│
├─ 단일 위치 (lat/lng 1쌍)
│   ├─ 기본 표시 → POINT (icon/circle)
│   ├─ 밀집 분포 → CLUSTER
│   ├─ 반경 표시 → CIRCLE (radius_m 컬럼 추가)
│   └─ 시간 이동 → TRACK (time series 별도 필요)
│
├─ A → B 연결
│   ├─ 직선 2점 연결 → LINE SEGMENT (origin/target lat+lng)
│   └─ 경유지 포함 → GEOSHAPE LineString (GeoJSON 또는 waypoint Transform)
│
├─ 면적 / 구역
│   ├─ 단순 폴리곤 → POLYGON (geoshape)
│   ├─ 국가/지역 집계 → CHOROPLETH (ISO code 또는 linked polygon)
│   └─ 밀도 분석 → H3 HEXAGON
│
├─ 시간 이벤트
│   └─ 시작/종료 시각 → TIMELINE EVENT
│
└─ 이미지 오버레이
    └─ 위성/항공 사진 → GEORECTIFIED IMAGE
```

### 18.2 도메인별 Map Layer 권장 설정 (v4)

| Domain | 데이터 | Layer 타입 | 핵심 컬럼 | Ontology Property |
|--------|--------|-----------|-----------|------------------|
| D3 기지 | 군사기지 위치 | Point (icon) | `lat`, `lng` | `geopoint` |
| D3 타격경로 | 공습 비행 경로 | Line (geoshape) | `geometry_geojson` LineString | `geoshape` |
| D3 타격경로 (단순) | A→B 직선 | Line Segment | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D4 무기이전 | 수출입 흐름 | Line Segment + Arrow | `origin_lat/lng`, `target_lat/lng` | 2× `geopoint` |
| D5 충돌이벤트 | 개별 사건 | Point + Timeline Event | `lat`, `lng`, `event_start_time` | `geopoint` + Event config |
| D5 교전구역 | 전투 구역 | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D6 제재 | 제재 엔티티 (지리) | Point | `lat`, `lng` | `geopoint` |
| D7 위성 스냅샷 | 현재 위치 | Point | `lat_snap`, `lng_snap` | `geopoint` |
| D7 위성 궤도 | 이동 경로 추적 | Track | time series lat/lng | numeric time series |
| D8 파이프라인 | 에너지 인프라 | Line (geoshape) | `geometry_geojson` LineString | `geoshape` |
| D8 프로젝트 구역 | 에너지 지역 | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D10 미군 기지 | 기지 위치 | Point (icon) | `lat`, `lng` | `geopoint` |
| D10 전투사령부 | 작전 범위 | Polygon/Choropleth | `geometry_geojson` or `iso_alpha2` | `geoshape` or Value Type |
| D11 분쟁 (전세계) | 국가별 분쟁 집계 | Choropleth | `iso_alpha2`, `conflict_count` | Value Type |
| D11 분쟁 구역 | 분쟁 지역 경계 | Polygon | `geometry_geojson` Polygon | `geoshape` |
| D0 OSINT | 위치 기록 | Point (if geo) | `lat`, `lng` (nullable) | `geopoint` |

---

## 19. CHANGELOG

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1 | 초기 | China-Intel 전용 기본 구조 |
| v2 | 2025 | 글로벌 확장, D10/D11, U-source 추가 |
| v3 | 2026-04-06 | §11 Map Guide 신규 (3페이지 fetch); §12 Geo Property Ref; §3/7/8/9 Map 항목 추가 |
| v4 | 2026-04-06 | **Map 전체 28개 하위페이지 완전 반영**: §11 Core Concepts 재작성; §12 Interact HOW-TO 전체 (add-to-map, layer-mgmt, navigation, selection, annotations, shapes, histogram, actions); §13 Time 전체 (time-selection, timeline, events, time-series); §14 Visualize 전체 8개 레이어 완전 HOW-TO (points, lines, choropleths, clusters, timeline-events, tracks, loading-methods); §15 Integrate 전체 (integrate-objects 모든 geo 타입, searcharounds, functions, actions, layer-editor); §16 Templates+Widget+Settings+ControlPanel 신규; §17 Geo Property Reference 완전 확장; §18 Layer Decision Tree + Domain Matrix v4 신규; Backend B GeoJSON 필수 규칙 추가; Transform 코드 2개 추가 |
