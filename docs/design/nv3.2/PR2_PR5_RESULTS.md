# PR2–PR5 통합 결과와 적용 경계

계약 nv-ontology/2.0; nv32-contract:1. PR2 객체 선택·5탭 dossier·이미지 해제·모바일·기존 화면 fallback. PR3 ICAO24/MMSI·AIS static cache·GDELT 시각/범위 정규화. PR4 출처·보고된 주장·관련 기사 후보·NIM proposed 분석·실제 로컬 실행 receipt. 외부15개 플러그인 실행을 주장하지 않는다. PR5 격리 D1 테스트와 기본 dry-run backfill 도구.

Python193개와 기존 브라우저16개 통과. 최종 프런트엔드 및 Worker 회귀 결과는 PR에 기록한다. 기존68파일·7역사 아카이브와 생성 계약 보존 검사 통과. 테스트는 합성 입력과 모의 NIM이며 실제 공급원 자료 검증과 구분한다.

## 등록된 키와 실제 상태 (2026-11-13 KST)

사용자 화면상 AISstream·Copernicus·GitHub·Mapillary·NIM A/B·OpenSky·Windy가 등록되어 있다. 재입력 불필요. 부산 주변 운영 API: AIS key_required/AISSTREAM_API_KEY, 웹캠 empty(키 누락 아님), 위성 ok/4건. AIS 등록과 Worker 바인딩 불일치의 원인은 미확정이며 전체 변수명과 활성 배포 반영을 확인해야 한다. 키 값은 조회하지 않았다.

운영 최근 정상 수집 2026-11-13 05:51:11 KST, stale=false. NIM super 대체 모델 available, lightning 인용 검증 실패로 withheld, llama 과거410. 상태 기록은 현재 모델 접근이나 사실 검증 보증이 아니다.

Cloudflare 실행 비밀 이름: AISSTREAM_API_KEY, WINDY_API_KEY, MAPILLARY_ACCESS_TOKEN, NVIDIA_API_KEY_A/B, GITHUB_CLIENT_SECRET. GITHUB_CLIENT_ID 및 GITHUB_ALLOWED_USER_IDS 유지. GitHub Actions UCDP_ACCESS_TOKEN과 기존 OIDC 게시 유지. NV_INGEST_TOKEN은 기존 OIDC의 선택 대안이다.

선택 원문 추출만 FIRECRAWL_API_KEY + NV_EVIDENCE_EXTRACTION_ENABLED=true + NV_EVIDENCE_ALLOWED_DOMAINS(정확한 HTTPS 호스트)이 추가로 필요하다. 하루10회, 12000자 제한이며 무료 범위 검토 후 활성화한다. 없어도 지도/탐지/메타데이터 분석 동작. EarthSearch·ADSB.lol·GDELT·지도는 추가 키 불필요. 등록된 Copernicus/OpenSky 키가 현재 이 경로에서 사용됨을 뜻하지 않는다.

## 승인 후 단계와 롤백

운영 DB·배포·비밀·워크플로는 변경하지 않는다. NV_ONTOLOGY_V2_ENABLED는 기본 OFF. 소유자 승인 후 스테이징 D1에 0004_ontology_v2.sql 수동 적용, 플래그 ON, 인증된 적재 및 화면을 검증한다. database.js 자동 적용에 포함하지 않는다.

`python -m services.worker.ontology_sync`는 네트워크 없는 dry-run. 승인된 환경에서 --execute --max-batches 25로 최대50기존 레코드 변환, .local checkpoint로 재개한다. 하루500요청 제한. 새 수집이나 자동 cron이 아니며 nearby는 최근 정상 cache만 변환한다. 최대20000객체, 최신 transport 관측만 유지, 오래된 미참조 source/실행로그 정리.

실서비스 로그인·사진 실제 표시·공급원 권한·성능 실측을 확인한 후 운영에 적용한다. 플래그 OFF로 구버전 화면 복귀; 새 테이블은 삭제하지 않는다. 장기 보유 정책과 실제 키 검증은 운영 확인 대기다.
