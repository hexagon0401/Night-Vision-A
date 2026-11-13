# PR1 — 실행 결과 및 검토 게이트

실행일: 2026-11-12 KST. 기준 main: `819cb224944873f0a23d69f27f04e1d2b74bb170`.
PR0 진단 커밋 위에 별도 PR1 커밋으로 구성하며, 두 PR 모두 검토용 초안이다.

## 변경 경로

- `engine/src/nv_engine/models/ontology.py`: 별도 nv-ontology/2.0 실행 모델, 지오메트리·참조·시각·프라이버시·실행 기록 검사.
- `engine/src/nv_engine/models/ontology_adapter.py`: 명시적 CaseBundle 변환, 원본 보존, 미지원 의미 진단.
- `engine/src/nv_engine/models/__init__.py`: 신규 모델 공개 export만 추가. canonical.py 변경 없음.
- `schemas/ontology-graph.v2.schema.json`, `frontend/nv-visualize/src/contracts/ontology-v2.ts`: 생성된 공통 계약. UI 런타임 코드 변경 없음.
- `tools/generate_contracts.py`, `frontend/nv-visualize/scripts/generate-contracts.mjs`, `schemas/README.md`: 생성/드리프트 검사에 별도 계약 추가.
- `engine/tests/test_ontology_v2.py`, `data/fixtures/synthetic/ontology-v2/handoff.synthetic.json`: 신규 계약 회귀 테스트 및 명시적 합성 fixture.
- `docs/design/nv3.2/PR1_CONTRACT.md`, `0004_ontology_v2.proposed.sql`, 이 결과 문서: 계약·저장 제안·게이트 기록.
- `tools/verify_ontology_d1.mjs`: 운영 계정 바인딩 없는 임시 Miniflare D1 검증 도구.

## 실제 실행 결과

| 명령 | 결과 |
|---|---|
| `.venv/bin/python tools/generate_contracts.py` | 생성 성공. 기존 CaseBundle/OpenAPI/TypeScript 생성물 변경 없음 |
| `.venv/bin/python -m pytest engine/tests/test_ontology_v2.py -q` | 신규 37 passed |
| `.venv/bin/python -m pytest engine/tests services/api/tests` | 최종 190 passed, 기존 Starlette/httpx 예고 경고 1건 |
| `.venv/bin/python tools/generate_contracts.py --check` | Contracts checked |
| `.venv/bin/python tools/verify_migration.py` | 68 원본 파일·7 역사 아카이브 보존 |
| `npm test` (frontend/nv-visualize) | 온톨로지 추가 후 75 passed |
| `npm run build` (frontend/nv-visualize) | 최종 strict type check 및 빌드 성공, 기존 MapLibre 청크 크기 경고 유지 |
| `node scripts/worker-integration.mjs` (frontend/nv-visualize) | 최종 격리 Worker/D1·인증·기존 엔진 통합 성공 |
| `node tools/verify_ontology_d1.mjs` | 빈/기존 스키마 D1 두 경우 모두 12개 nv2_ 테이블, 재적용 성공, FK 위반 0, 기존 sentinel 보존 |
| `git diff --check` | 성공 |

신규 37개에는 JSON Schema metaschema·합성 fixture·모델 왕복, 누락/중복 참조, 출처 계보 순환, 닫히지 않은 다각형과 좌표 범위·NaN·bool, null 지오메트리, 시각 역전·timezone 누락, 인물 위치 공개 방지, 가짜 모듈 완료/영수증 누락·시각 불일치, 잘못된 calibration, 미지원 legacy kind, 기존 disputed 보존, SQLite 새/기존 DB 재적용 검사가 포함된다.

격리 D1의 첫 `node --input-type=module` 실행은 Miniflare worker thread의 require/ESM 실행 문맥 문제로 실패했다. 파일 기반 재실행 및 저장된 `tools/verify_ontology_d1.mjs`는 모두 통과했다. 이 실패를 DB 적용 성공으로 기록하지 않았다.

브라우저 12개 테스트는 PR0에서 실행·통과했다. PR1에는 사용자 UI/Provider 동작 변경이 없으며 새 계약을 사용하는 실제 객체 선택 UI는 아직 검증 대상 구현이 아니다. 원격 CI의 브라우저 재실행 결과는 PR 검사에서 별도로 확인한다.

## 미실행 검증과 이유

- 운영 D1 마이그레이션·원격 DB 적용: 별도 소유자 승인 게이트이며 이번 범위 밖이다.
- 실제 NIM 추론·외부 MCP 모듈·신규 공급원 수집: PR1은 계약 통합 단계다. 가짜 실행 receipt나 공급원 성공을 생성하지 않았다.
- 신규 UI/Provider end-to-end: PR2/PR3 구현 전이다. TypeScript 생성물을 사용할 수 있을 뿐 런타임 연결을 완료했다고 주장하지 않는다.
- 운영 feature flag ON/OFF 전환: 새 운영 endpoint나 flag를 등록·활성화하지 않았다.

## 위험·되돌리기·다음 단계

PR1은 별도 모델과 일방향 어댑터다. 기존 계약으로의 무손실 역변환은 지원하지 않는다. 참조/영수증 구조가 유효해도 출처나 외부 실행의 진실성을 입증하지 않는다. SQL 제안의 다형 참조는 애플리케이션 검증을 계속 필요로 한다.

되돌리기는 PR1 커밋 revert이며, 운영 데이터 복구나 파괴적 SQL은 필요 없다. 계약 검토 후 PR2(UI)와 PR3(Provider)를 독립 소유 경로로 분리할 수 있다. 시작 지침의 'Implement PR0 and PR1 only'에 따라 이 게이트에서 멈춘다. 서브에이전트는 0개 사용했다. 후속 작업을 허용받아도 공통 계약 파일은 주 에이전트가 소유하며 동시 위임은 최대 2개다.
