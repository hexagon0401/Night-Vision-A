# PR1 — 온톨로지 공통 계약 확정안

계약 식별자: `nv-ontology/2.0`, 이번 통합 리비전 `nv32-contract:1`.
진입 지침은 [CODEX_START_V3_2.md](CODEX_START_V3_2.md)이며, 이번 범위는 PR0·PR1이다.
이 문서는 후속 UI·Provider가 공유할 필드·의미를 고정한다. 운영 배포 승인을 뜻하지 않는다.

## 정본과 호환성

- 실행 정본: `engine/src/nv_engine/models/ontology.py`. 생성물은 `schemas/ontology-graph.v2.schema.json`, `frontend/nv-visualize/src/contracts/ontology-v2.ts`이다. `tools/generate_contracts.py`로 생성/드리프트 검사를 수행한다.
- 기존 `canonical.py`, CaseBundle `2.0.0`, EventRecord, nearby_context.v1, event_context.v1, nv-investigation/2.0을 교체하지 않는다. 기존 JSON/TypeScript 계약도 그대로 유지한다.
- 첨부 스키마의 상위 레코드와 필드 이름을 유지한다. 구조 검사는 JSON Schema로, 그래프 참조·시각·공간·프라이버시·실행 진실성 검사는 Python 모델로 수행한다. 새 계약은 기존 엔진의 `Entity/Claim` 클래스와 이름 충돌을 피하도록 `OntologyEntity/OntologyClaim` 등을 사용한다.
- 구조 제한을 명시적으로 강화했다: 출처 URL은 자격증명 없는 HTTP(S) 또는 null, 알려진 해시는 SHA256 64자리, 좌표는 유한한 2차원 WGS84, 다각형은 비어 있지 않은 닫힌 고리, 중복/누락 참조는 오류다. 기존 첨부의 합성 fixture는 이 계약에서도 통과해야 한다.

## 공유할 데이터 의미

1. 객체는 `entity_id`, 식별자는 `identifier_id`+`namespace/value`, 관측은 `observation_id`로 분리한다. callsign·이름·표제의 유사성만으로 객체를 병합하지 않는다. 불확실한 ID 대응은 `POSSIBLY_SAME_AS`의 proposed 상태로 남기며 자동 accepted를 거부한다.
2. ID는 3~256자, `[A-Za-z][A-Za-z0-9:._@-]+` 규칙이다. UCDP 버전 기록은 `event:ucdp:<id>@<version>`, 항공기·선박은 검증된 ICAO24/MMSI 식별 범위, 장면은 STAC collection:item, 카메라는 공급원 catalog ID를 사용한다. 실제 Provider 변환은 PR3이다.
3. 상태는 `observed/documented/reported/inferred/scenario/refuted/unresolved`다. 문서가 언급했다는 것과 현장에서 관측됐다는 것은 다르다. AI 추론·시나리오를 source_verified 또는 accepted 관계로 자동 승격하지 않는다.
4. 관측·원문 발행·검색 색인·NV 취득·DB 기록·유효 기간의 시각을 구분한다. 시각은 timezone을 요구하고 UTC로 정규화한다. 알 수 없는 값은 null이다. 취득 시각을 사건 시각으로 채우지 않는다. 관측→취득→기록의 10분 초과 역전을 거부한다.
5. 좌표는 `[longitude, latitude]`. 출처와 연결된 Point/Polygon/MultiPolygon 또는 null만 허용한다. null이면 geometry_source_id·precision_m도 null이고 geometry_role은 unlocated다. `[0,0]` 대체는 없다. 양끝 없는 관계와 자기 관계를 거부한다.
6. 공개 인물의 지오메트리는 public/delayed_public/aggregated_only로 내보낼 수 없다. 제한된 객체의 관측도 제한 상태를 유지한다. 프런트엔드 선택 동작으로 이 정책을 변경하지 않는다. 실제 지도 공개 필터는 후속 서버 read model에서도 적용해야 한다.
7. 파생 출처의 원출처 참조와 비순환 계보가 필요하다. claim.source_ids와 evidence_link의 출처가 일치해야 한다. URL 개수나 publisher 개수를 독립 증거 개수로 사용하지 않는다.
8. 탐지 결과는 `candidate_id`, 원관측 ID, 출처 ID, 기준선과 calibration을 보존한다. 점수는 위협 확률이 아니다. 검증 없이 calibrated_with_validation으로 표시하지 않는다.
9. module_runs는 실제 실행 기록이다. not_executed를 completed로 바꿀 수 없다. completed에는 시작/완료·입출력 해시가 필요하고, mcp_remote_verified는 도구명·호출 ID·완료 시각 receipt가 필요하다. receipt 구조 검증만으로 외부 도구 영수증의 진위를 보증하지 않는다. 영수증 신뢰 검증은 PR4 서버 경계의 책임이다.

## 기존 CaseBundle 어댑터

`from_case_bundle`은 정규화된 그래프, 검증된 원본 CaseBundle 복사본, 진단을 반환한다. 원본 입력은 변경하지 않으며 역변환은 제공하지 않는다.

- 기존 ID는 source:legacy/entity:legacy/... 네임스페이스에 보존한다. 안전하게 표현할 수 없는 ID는 원문을 해시하며, 이름 기반 조인은 수행하지 않는다.
- disputed/unverified는 새 그래프에서 unresolved로 표현하되 legacy_status/진단과 원본 복사본에 원래 상태를 보존한다. disputed를 refuted로 바꾸지 않는다.
- 알 수 없는 entity_type은 kind_overrides가 없으면 실패한다. 알 수 없는 relation_type은 명시적 매핑이 없으면 제외하고 진단에 기록한다. 전체 원본 관계는 원본 복사본에 남는다.
- symbolic 위치는 공간 관측으로 내보내지 않는다. 취득/DB 기록 시각·발행일·계보·라이선스 승인 상태를 추측해 채우지 않는다.
- 가져온 지오메트리는 제한 상태로 남긴다. 단순한 provenance 연결의 evidence_link는 MENTIONS이며, 실제 지지·반증 구간 검토 전 SUPPORTS로 승격하지 않는다. module_runs는 비워 두어 실행을 꾸미지 않는다.

## 저장소 제안과 배포 경계

[0004_ontology_v2.proposed.sql](0004_ontology_v2.proposed.sql)은 첨부의 SQL을 검토한 **제안서**다. 활성 migrations 디렉터리·Worker 초기화에는 등록하지 않는다. 기존 0001~0003은 수정하지 않는다. 알 수 없는 시각의 null을 허용하고, SQL NULL 검사 때문에 반쪽 좌표가 통과하는 문제 및 검토자 없는 identity 승인 문제를 보완했다. 출처 연결 기본 역할도 MENTIONS로 설정했다.

향후 저장 시 필드 매핑은 다음과 같다: source.url→canonical_url, original_or_derived→source_kind, identifier.value→identifier_value, module→module_id, module status→state, result_hash→output_hash, claim.quote_span→examined_span. 목록 필드는 nv2_record_sources와 nv2_anomaly_observations에 보존한다. 그 외 JSON 메타데이터도 보존해야 한다. 다형 record_sources 참조는 DB FK만으로 충분하지 않으므로 애플리케이션 검증을 필수로 한다.

검증은 빈/기존 스키마가 있는 임시 DB에서만 수행한다. 실제 D1 적용·마이그레이션 등록·새 API 연결·워크플로·비밀·운영 권한 변경은 별도 검토/승인 게이트다. 신규 런타임 엔드포인트와 UI는 이 PR에 없으며 기능은 운영 경로에서 활성화되지 않는다. 향후 공개 경로는 `NV_ONTOLOGY_V2_ENABLED=false` 기본 게이트와 구버전 fallback을 갖춰야 한다.

## 위험·되돌리기·다음 단계

스키마 검증은 사실의 진위를 입증하지 않는다. 기존 계약으로의 무손실 역변환은 지원하지 않는다. 기존 이벤트/소스가 아직 graph로 운영 적재되지 않았으므로 UI/Provider가 적용됐다고 표시하면 안 된다.

되돌리기는 PR1 커밋을 revert하면 된다. 운영 DB·활성 Worker에는 변경이 없다. PR1 검토가 끝난 뒤 PR2 UI와 PR3 Provider를 독립 경로로 나눌 수 있다. 이 게이트까지는 서브에이전트 0개이며, 후속 위임에는 계약 버전·경로 범위·금지 경로·실제 테스트·결과 형식을 명시하고 동시 최대 2개를 유지한다.
