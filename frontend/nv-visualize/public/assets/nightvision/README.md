# Night Vision — AIS + ADS-B Vector Icons v1

**목표:** 검은 지도 위에서 수십~수백 개의 객체가 동시에 존재해도 정보 구분을 방해하지 않는 탑다운 지도 아이콘. 모든 그림은 개별 SVG 벡터로 직접 작성되었으며 PNG 배율별 파일을 제공한다. **디자인 시안 이미지를 그대로 잘라 쓰지 않았음.**

## 구성

- `svg/map/`: 지도용 단순한 실루엣 (64×64 viewBox, 실제 렌더링 크기 18–28 CSS px 권장)
- `svg/detail/`: 객체 패널용 디테일 버전 (40–72 CSS px)
- `png/1x/`, `2x/`, `3x/`: 각각 64 / 128 / 192 px, 투명 배경, 고밀도 디스플레이용
- `status/svg/`: 상태 오버레이 (default/selected/investigating/caution/alert/verified)
- `manifest.json`: 파일·카테고리·팔레트 인덱스
- `integration/classification.mjs`: AIS numeric Type와 ADS-B `t` ICAO type designator를 SVG/PNG ID로 연결
- `integration/maplibre.mjs`: MapLibre `addImage` 로드 예시 (v2 예시이며 프로젝트 버전에 맞춰 검증)
- `integration/classification.test.mjs`: `node --test`로 오프라인 분류 회귀 테스트
- `preview/index.html`: 브라우저 로컬 미리보기 (브라우저의 보안 정책에 따라 정적 서버 권장)
- `preview/contact-sheet.png`, `preview/map-density.png`: 검수용 PNG

## 중요: AIS 코드는 실제 선박 형태의 세부 구분을 보장하지 않는다

AIS `70–79`는 **cargo**이지 `container / bulk / ro-ro` 여부를 제공하지 않는다. `60–69`는 **passenger**이지 `cruise / ferry`가 아니다. `80–89`는 **tanker**이며 유류·화학·LNG의 정확한 종류는 다른 선박 등록·검증 자료가 필요하다. 상세 분류가 확인되기 전까지 반드시 범주 기본 아이콘을 사용한다.

또한 `71`과 `70`은 다른 시각적 선종이 아니라 적재물 분류 범주가 다를 수 있다. 숫자 끝자리로 배의 형태를 바꾸지 않는다. 특수 코드 `30/31/32/33/34/35/36/37/40–49/50..59`는 개별 처리한다.

## 중요: ADS-B `t` 필드는 ICAO 항공기 형식 코드

기종 코드 예: A320, A20N, B738, B77W, A359, A388, C172, DH8D, R44. 정확한 모델/크기/용도는 별도 기종 사전과 검증된 등록 정보로 보강. ICAO type만으로 **화물 운송 중인지** 또는 **군 임무인지** 판단할 수 없다. 코드 미상인 경우 반드시 `aircraft-unknown` 사용. 매핑 표는 예시 중심이고 완전한 ICAO 목록이 아니다.

## UI 규칙

1. 아이콘 방향은 **위쪽 = 기수 / 선수**, 실제 `true_heading` 또는 `track`이 확인된 경우에만 회전. 항공기 `track`, 선박 COG와 heading은 다른 속성이므로 원자료와 시간·정밀도를 함께 보존.
2. 색상은 선종·기종을 뜻하지 않는다. **상태 오버레이**에서만 caution, alert 등 사용. 위험/위협 상태는 별도 증거와 정책을 검증한 경우에만 허용.
3. 지도 중첩 시 clustering/priority/decluttering 적용. 지도용 `icon-allow-overlap=false`, 선택된 객체 별도 레이어로 강조. 지도에서 아이콘의 픽셀 크기는 실제 선박 길이·항공기 날개폭을 의미하지 않는다.
4. 정보가 불확실하거나 API가 최신이 아니면 상태 `unknown`/`stale`; 진짜 위치·물체를 추론해 표시하지 않는다. 군용/민감 객체는 공개·합법적으로 접근 가능한 집계/과거 정보에 한정하여 취급한다.
5. 공개용 UI에서는 각 데이터 공급자의 이용 약관, 라이선스, 출처 및 관측 시각을 별도로 표시한다.

## 통합 예시

```js
import {iconFromAIS, iconFromICAOType} from './integration/classification.mjs';
console.log(iconFromAIS(70));                        // vessel-cargo
console.log(iconFromAIS(70,'container'));            // vessel-container (verified registry only)
console.log(iconFromICAOType('B77W'));                // aircraft-widebody
console.log(iconFromICAOType('B763','cargo'));        // aircraft-cargo (verified role only)
```

## 적용 위치

현재 Night Vision 프로젝트의 `frontend/nv-visualize/src/map/`에서 기존 이벤트 아이콘과 AIS/ADS-B 아이콘 등록을 분리하고, Worker/Engine 객체 레이어에서 추출된 `icon_id`를 GeoJSON 속성으로 전달한다. `frontend/nv-visualize/public/assets/nightvision/`에 `png/`, `svg/`, `manifest.json`을 복사한다. `MapLibre`에 레이어/스타일을 추가하기 전에 기존 렌더러의 함수와 테스트를 검사한다.

## 라이선스 및 이미지 퀄리티

아이콘은 Night Vision용 독립 벡터 아트워크다. `preview/`에 포함한 장면은 **합성 예시**이며 실제 AIS/ADS-B 위치나 비행 자료가 아니다. 앱 로고/표장과 해당 아이콘 세트는 사용자 프로젝트용으로 설계되었다. 원본 AIS/ADS-B 데이터의 라이선스는 이 아이콘 라이선스와 무관하다.
