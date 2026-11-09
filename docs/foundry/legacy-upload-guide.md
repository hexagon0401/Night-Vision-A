# Palantir Foundry + AIP: CSV 업로드 → 온톨로지 → 지도 시각화 가이드
## (이란-미국 분쟁 지정학 데이터 기준)

---

## 1. CSV 파일 구성 개요

| 파일명 | 오브젝트 타입 | 행 수 | 핵심 필드 |
|---|---|---|---|
| `01_US_Military_Bases_Middle_East.csv` | `US_MILITARY_BASE`, `CARRIER_STRIKE_GROUP` | 10 | latitude, longitude, status_2026, personnel_est |
| `02_Iran_Military_Naval_Facilities.csv` | `IRAN_NAVAL_BASE`, `IRAN_NUCLEAR_STRIKE_TARGET`, `IRAN_STRIKE_TARGET` | 10 | latitude, longitude, threat_type, status_2026 |
| `03_Iran_Oil_Export_Ports_Chokepoints.csv` | `IRAN_OIL_EXPORT`, `CHOKEPOINT` | 7 | latitude, longitude, capacity_bpd, export_share_pct |
| `04_China_Iran_Oil_Import_Routes.csv` | `CHINA_OIL_IMPORT_PORT`, `STS_TRANSSHIPMENT_HUB` | 8 | latitude, longitude, iran_oil_volume_2025_kbd |
| `05_Gulf_Ports_At_Risk.csv` | `GULF_PORT_AT_RISK` | 8 | latitude, longitude, attack_status |

---

## 2. Foundry 데이터셋 업로드 (Dataset Upload)

### Step 1: Foundry 접속 → Datasets 탭
1. `foundry.palantir.com` 접속 후 로그인
2. 왼쪽 사이드바 **"Datasets"** 클릭
3. **"New Dataset"** → **"Upload Files"** 선택
4. 각 CSV 파일 드래그 앤 드롭

### Step 2: 스키마 확인
- 업로드 후 **"Preview"** 탭에서 컬럼 타입 자동 감지 확인
- `latitude`, `longitude`는 반드시 **Double / Float** 타입으로 지정
- `facility_id`는 **String (Primary Key 후보)** 로 지정
- **"Save Schema"** 클릭

### Step 3: Dataset 이름 지정 (권장)
```
/Projects/Iran-US-Conflict/raw/us_military_bases
/Projects/Iran-US-Conflict/raw/iran_naval_facilities
/Projects/Iran-US-Conflict/raw/iran_oil_ports
/Projects/Iran-US-Conflict/raw/china_oil_import_ports
/Projects/Iran-US-Conflict/raw/gulf_ports_at_risk
```

---

## 3. 온톨로지(Ontology) 오브젝트 타입 생성

### Ontology Manager 접속
1. Foundry 메인 → **"Ontology"** → **"Object Types"**
2. **"New Object Type"** 클릭

### 오브젝트 타입 설계 (5개 타입 권장)

#### ① `MilitaryFacility` (미군 기지 + 이란 군사시설 통합)
| Foundry Property | CSV 컬럼 | 타입 |
|---|---|---|
| `facilityId` | `facility_id` | String (Primary Key) |
| `facilityName` | `facility_name` | String |
| `country` | `country` | String |
| `latitude` | `latitude` | Double |
| `longitude` | `longitude` | Double |
| `objectType` | `object_type` | String |
| `status2026` | `status_2026` | String |
| `notes` | `notes` | String |
| `source` | `source` | String |

> **GeoPoint 설정**: Property → `latitude` + `longitude` → **"Geo Point"** 체크 → Foundry가 자동으로 지도 핀 생성

#### ② `OilPort` (이란 수출항 + 걸프 위험 항구)
| Property | CSV 컬럼 | 타입 |
|---|---|---|
| `portId` | `facility_id` | String (PK) |
| `portName` | `facility_name` / `port_name` | String |
| `country` | `country` | String |
| `latitude` | `latitude` | Double |
| `longitude` | `longitude` | Double |
| `capacityBpd` | `capacity_bpd` | Long |
| `exportSharePct` | `export_share_pct` | String |
| `primaryBuyer` | `primary_buyer` | String |
| `attackStatus` | `attack_status` / `status_2026` | String |

#### ③ `EnergyChokepoint` (호르무즈 해협, 바브엘만데브 등)
| Property | CSV 컬럼 | 타입 |
|---|---|---|
| `chokeId` | `facility_id` | String (PK) |
| `name` | `facility_name` | String |
| `latitude` | `latitude` | Double |
| `longitude` | `longitude` | Double |
| `normalFlowBpd` | `capacity_bpd` | Long |
| `status2026` | `status_2026` | String |

#### ④ `ChinaImportPort` (중국 이란산 원유 수입항)
| Property | CSV 컬럼 | 타입 |
|---|---|---|
| `portId` | `facility_id` | String (PK) |
| `portName` | `port_name` | String |
| `country` | `country` | String |
| `province` | `province` | String |
| `latitude` | `latitude` | Double |
| `longitude` | `longitude` | Double |
| `iranOilVolumeKbd` | `iran_oil_volume_2025_kbd` | String |
| `sanctionStatus` | `status_2026` | String |

#### ⑤ `CarrierStrikeGroup` (항모전단)
- `01_US_Military_Bases_Middle_East.csv`에서 `object_type = CARRIER_STRIKE_GROUP` 행 필터링
- 위와 동일한 `MilitaryFacility` 오브젝트 타입 공유 가능 (object_type 속성으로 분류)

---

## 4. 오브젝트 타입 ↔ 데이터셋 연결 (Object Type Backing Dataset)

1. Ontology Manager → 해당 Object Type 클릭
2. **"Backing Datasets"** 탭 → **"Add Backing Dataset"** 클릭
3. 업로드한 Dataset 경로 선택 (예: `/Projects/Iran-US-Conflict/raw/us_military_bases`)
4. **컬럼 매핑**: CSV 컬럼 → Ontology Property 매핑
5. **Primary Key** 지정: `facility_id`
6. **"Save"** → **"Sync"** 클릭 → 오브젝트 생성 시작

> ⚠️ **팁**: `object_type` 컬럼을 기반으로 단일 데이터셋에서 여러 오브젝트 타입을 생성하려면 **Foundry Transform** 또는 **PySpark** 로 사전 필터링 후 각각 별도 데이터셋으로 분리 권장

---

## 5. 지도 시각화: Workshop에서 Map View 생성

### Step 1: Workshop 앱 생성
1. Foundry → **"Workshop"** → **"New Application"**
2. 레이아웃에서 **"Map"** 위젯 추가

### Step 2: 레이어 추가
1. Map 위젯 → **"Add Layer"** → **"Object Type Layer"** 선택
2. Object Type: `MilitaryFacility` 선택
3. **GeoPoint Property**: `latitude + longitude` 선택 (또는 Geopoint 복합 속성)
4. **Color by**: `object_type` 또는 `country` 속성으로 색상 구분

```
추천 색상 매핑:
US_MILITARY_BASE      → 파란색 (#1E88E5)
CARRIER_STRIKE_GROUP  → 진청색 (#0D47A1)
IRAN_NAVAL_BASE       → 빨간색 (#E53935)
IRAN_NUCLEAR_STRIKE_TARGET → 주황색 (#FF6F00)
IRAN_OIL_EXPORT       → 검정색 (#212121)
CHOKEPOINT            → 보라색 (#8E24AA)
CHINA_OIL_IMPORT_PORT → 초록색 (#43A047)
GULF_PORT_AT_RISK     → 노란색 (#FDD835)
STS_TRANSSHIPMENT_HUB → 하늘색 (#00ACC1)
```

5. **"Icon by"**: object_type에 따라 아이콘 변경 (군사 기지, 선박, 오일드럼 등 SVG 아이콘 업로드 가능)

### Step 3: 툴팁(Tooltip) 설정
Map 레이어 → **"Tooltip Properties"** 에서 표시할 속성 선택:
```
facility_name / port_name
country
status_2026 / attack_status
notes
source
```

### Step 4: 여러 레이어 추가
같은 Map 위젯에 레이어 반복 추가:
- Layer 1: `MilitaryFacility` (미군 + 이란 군사시설)
- Layer 2: `OilPort` (원유 수출입항)
- Layer 3: `EnergyChokepoint` (해협)
- Layer 4: `ChinaImportPort` (중국 수입항)
- Layer 5: `CarrierStrikeGroup` (항모전단 현재 위치)

레이어별 **표시/숨기기 토글** 자동 생성됨

---

## 6. AIP (AI Platform) 연동: 지정학 분석 자동화

### AIP Logic에서 분석 트리거 설정 예시
```python
# AIP Logic (Python 기반)
from foundry import ontology

# 공격받은 항구 필터링
attacked_ports = ontology.search(
    object_type="GulfPort",
    filter={"attack_status": {"contains": "ATTACKED"}}
)

# 위험도 점수 계산
for port in attacked_ports:
    risk_score = calculate_risk(
        capacity=port.capacity_bpd,
        attack_count=port.attack_count,
        proximity_to_hormuz=port.distance_to_hormuz_km
    )
    port.risk_score = risk_score
    port.save()
```

### AIP Copilot에서 자연어 질의 예시
```
"Show me all Iranian naval bases within 100km of the Strait of Hormuz"
"Which US military bases have been attacked since February 28, 2026?"
"What is the total Iranian oil export capacity currently at risk?"
"Which Chinese ports received the most Iranian crude in 2025?"
```

---

## 7. 링크(Link) 설정: 오브젝트 간 관계 시각화

Ontology에서 **Link Types** 추가:
```
OilPort ──[EXPORTS_TO]──→ ChinaImportPort
  (Kharg Island → Qingdao, Zhoushan, Dalian 등)

EnergyChokepoint ──[CONTROLS_ACCESS_TO]──→ OilPort
  (Strait of Hormuz → Kharg Island, Bandar Abbas 등)

MilitaryFacility ──[THREATENS]──→ OilPort
  (Iran Naval Base → Strait of Hormuz)

MilitaryFacility ──[DEFENDS]──→ EnergyChokepoint
  (USS Abraham Lincoln → Strait of Hormuz)
```

Workshop Graph View에서 이 링크들을 **Force-Directed Graph** 또는 **Arc Map** 으로 시각화 가능

---

## 8. 주요 출처

| 기관 | URL | 활용 데이터 |
|---|---|---|
| CSIS | https://www.csis.org | 미군 자산 규모, 항모전단 |
| CFR Global Conflict Tracker | https://www.cfr.org/global-conflict-tracker | 분쟁 타임라인, 공격 위치 |
| International Crisis Group | https://www.crisisgroup.org | 걸프 항구 피해, 호르무즈 상황 |
| Kpler | https://www.kpler.com | 원유 수출입 물동량 실데이터 |
| Columbia CGEP | https://www.energypolicy.columbia.edu | 중국 이란 원유 수입 분석 |
| Reuters | https://www.reuters.com | 항구 제재, 우회 경로 |
| TIME / ABC News | https://time.com / https://abcnews.com | 카르그섬 상세 |
| Wikipedia (2026 Iran war) | https://en.wikipedia.org/wiki/2026_Iran_war | 공격 위치 목록 |
| Middle East Forum | https://www.meforum.org | 군사기지 상세 |
| AJC | https://www.ajc.org | 걸프 피해 상세 |
