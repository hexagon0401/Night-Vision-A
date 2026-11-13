# PR0 — v3.2 진단 기록

진단 시각: 2026-11-12 20:53 KST (11:53 UTC). 이 기록은 진단 시점의 관측이며 공급원의 현재 상태를 보장하지 않는다.

## 범위·보존

사용자가 지정한 `CODEX_START_V3_2.md`를 이번 작업의 진입 지침으로 읽었다. 저장소 AGENTS.md와 기존 README/승인 핸드오프를 확인했다. 첨부 파일은 `/tmp`의 별도 디렉터리에 검증 후 풀었으며 기존 코드·설정에 일괄 덮어쓰지 않았다. ZIP SHA256: `115dbd6adb36dddca0f45eadb95067fc62797a1c234ccfd31fc41d9cc542a47e`.

첨부 MANIFEST_SHA256.txt의 111개 파일은 모두 해시가 일치했다. 시작 checkout은 `fix/nv-engine-readability`, HEAD `c05838ab090a9eb712767c1b479b0aeaf50db755`였고 미커밋 변경은 없었다. 원격 main `819cb224944873f0a23d69f27f04e1d2b74bb170`은 해당 커밋을 병합한 버전이다. 진단 브랜치는 이 main에서 생성했다. 기존 브랜치는 보존했다.

## 확인 사실

| 검사 | 실제 결과 |
|---|---|
| 일반 `python -m pytest engine/tests services/api/tests` | 실패: 기본 Python에 pytest 없음 |
| `.venv/bin/python -m pytest engine/tests services/api/tests` | 153 passed, Starlette/httpx 사용 중단 예고 1건 |
| `npm test` (frontend/nv-visualize) | 75 passed |
| `npm run build` | 성공. MapLibre 청크 500KB 초과 경고 존재 |
| `node scripts/worker-integration.mjs` | 성공: 격리된 D1·게시·인증·NIM 모의 응답·엔진 경계 |
| `NV_BROWSER_PATH=/usr/bin/chromium npm run test:e2e` | 12 passed, 데스크톱·모바일·합성 응답 기반 |
| `.venv/bin/python tools/generate_contracts.py --check` | Contracts checked |
| `.venv/bin/python tools/verify_migration.py` | 68개 원본 파일·7개 역사 아카이브 보존 |
| 운영 `/api/v2/status` (읽기만) | runs_per_day=12, stale=true, ai_enabled=true, UCDP coverage_end=2026-10-04 |
| 운영 마지막 성공 표시 | 2026-11-12 07:42:33 KST (2026-11-11T22:42:33Z) |
| 운영 선박 조회 상태 | key_required, AISSTREAM_API_KEY. 키 값 조회·변경 없음 |

실제 NIM 추론·AIS 수신·추가 수집·운영 D1 변경은 실행하지 않았다. 기존 자동화의 설정 상태를 실제 모델 또는 외부 모듈 실행 성공으로 해석하지 않았다.

## 사실과 가설의 구분

- 사실: 현행 CaseBundle(2.0.0), EventRecord, nearby_context.v1, event_context.v1, nv-investigation/2.0은 서로 다른 구조다. 새 온톨로지를 대체 형식으로 일괄 적용하면 호환성이 깨진다.
- 사실: 기존 canonical EvidenceStatus는 disputed/unverified를, 제안 온톨로지는 refuted/unresolved를 쓴다. 기존 ID와 새 `@version` ID 규칙도 다르다.
- 결정: `nv-ontology/2.0`을 독립 계약으로 추가하고 기존 모델·ID·상태를 보존하는 어댑터를 둔다. 역변환은 자동 제공하지 않는다. 별도 네임스페이스이므로 기존 계약 교체를 요구하는 스키마 충돌은 없다.
- 가설: stale 표시의 원인은 수집 일정 지연·제공처 지연·게시 실패일 수 있다. 상태 API만으로 원인을 확정할 수 없다. 실행 이력·로그 검토가 후속 과제다.
- 가설: 지도 객체 선택 불일치는 임시 callsign/list ID와 영속 객체 ID 혼용에서 생길 수 있다. PR0에서는 실제 장애 재현이나 UI 수정을 수행하지 않았다.

## PR1 변경 제안과 게이트

추가 모델/교차 참조 검증기, JSON Schema·TypeScript 계약 생성, 합성 fixture·호환 어댑터 테스트, 계약 결정 문서를 작성한다. 기존 CaseBundle 생성물은 바뀌지 않아야 한다. 제안 SQL은 docs에만 보관하고 임시 SQLite에서 기존 0001~0003과 함께 검증한다. 활성 migrations·Worker·워크플로·권한·비밀은 변경하지 않는다.

PR0 위험은 문서의 관측 시점이 오래될 수 있다는 것이다. 되돌리기는 이 문서 커밋만 되돌리면 된다. PR1 후 중단하며 UI(PR2)·Provider(PR3) 작업/서브에이전트는 아직 실행하지 않는다. 계약 승인 후 독립 경로 작업에만 최대 두 개를 사용한다.
