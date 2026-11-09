# Phase 0 migration map

Base/main: `19e6b81a4ce228f3ce9318ef60e668781981b274`. Branch: `refactor/nv2-foundation`.

The inventory was created before any move. All 68 original tracked files, including metadata, ZIPs, skills, CSVs and research documents, are preserved byte-for-byte via git mv. No tags, data repairs, deletes, third-party code imports or deployment were performed. New README replaces the landing page; the original remains archived.

- [x] All Claude v1–v3 and global/China prompt packs preserved.
- [x] Directives v1–v6, including v4.5, preserved.
- [x] Legacy case and experimental data separated and marked unverified.
- [x] Unrelated PDF/RTF and uncategorized metadata retained in archive/miscellaneous.
- [x] New package boundaries and validation commands documented.

## Compatibility

Consumers using old paths must use the map below. No duplicate active source or symlink tree is added. Historical prompt file names and intra-pack imports remain unchanged; historical instructions may refer to external companion files (for example Navigator.md) and are not a new runnable engine. All old Markdown bytes remain intact. New relative links are checked separately; no local relative Markdown links in the historical files required rewriting. Physical folder moves do not repair semantic references across historical versions.

## Known limitations / decisions

Legacy CSVs remain unverified. Existing field-count defects in conflict_zones (7 records) and strike_targets (16) are intentionally preserved. PDF/RTF classification and dataset provenance require manual review. Project license, first real Alpha case, private-data scope and extension import compatibility with external consumers remain unresolved; none blocks Phase 0.

## Exact file map

Machine-readable SHA-256 inventory: [manifest.csv](manifest.csv). Recheck with `python3 tools/verify_migration.py` from the repository root.

| Original | Destination |
|---|---|
| `.DS_Store` | `archive/miscellaneous/.DS_Store` |
| `00_Palantir_Foundry_Upload_Guide.md` | `docs/foundry/legacy-upload-guide.md` |
| `NV_Alpha(Finetuned)/.DS_Store` | `archive/miscellaneous/NV_Alpha(Finetuned)/.DS_Store` |
| `NV_Alpha(Finetuned)/V1/Connector.md` | `extensions/promptpacks/global-v1/Connector.md` |
| `NV_Alpha(Finetuned)/V1/MasterPrompt.md` | `extensions/promptpacks/global-v1/MasterPrompt.md` |
| `NV_Alpha(Finetuned)/V1/Navigator.md` | `extensions/promptpacks/global-v1/Navigator.md` |
| `NV_Alpha(Finetuned)/V2_CHN_Finetuned/.DS_Store` | `extensions/promptpacks/china-v2/.DS_Store` |
| `NV_Alpha(Finetuned)/V2_CHN_Finetuned/Connector_CHN.md` | `extensions/promptpacks/china-v2/Connector_CHN.md` |
| `NV_Alpha(Finetuned)/V2_CHN_Finetuned/Navigator_CHN.md` | `extensions/promptpacks/china-v2/Navigator_CHN.md` |
| `NV_Alpha(Finetuned)/V2_CHN_Finetuned/Source_Finetuned_CHN.md` | `extensions/promptpacks/china-v2/Source_Finetuned_CHN.md` |
| `Night Vision for Claude/.DS_Store` | `archive/miscellaneous/Night Vision for Claude/.DS_Store` |
| `Night Vision for Claude/V1/.DS_Store` | `extensions/claude/v1/.DS_Store` |
| `Night Vision for Claude/V1/NightVisionForClaude/Framework.md` | `extensions/claude/v1/NightVisionForClaude/Framework.md` |
| `Night Vision for Claude/V1/NightVisionForClaude/Output from Claude.ai.md` | `extensions/claude/v1/NightVisionForClaude/Output from Claude.ai.md` |
| `Night Vision for Claude/V1/NightVisionForClaude/SKILL.md` | `extensions/claude/v1/NightVisionForClaude/SKILL.md` |
| `Night Vision for Claude/V1/night-vision for claude V1.zip` | `extensions/claude/v1/night-vision for claude V1.zip` |
| `Night Vision for Claude/V2/.DS_Store` | `extensions/claude/v2/.DS_Store` |
| `Night Vision for Claude/V2/night_vision.skill` | `extensions/claude/v2/night_vision.skill` |
| `Night Vision for Claude/V2/night_vision/.DS_Store` | `extensions/claude/v2/night_vision/.DS_Store` |
| `Night Vision for Claude/V2/night_vision/SKILL.md` | `extensions/claude/v2/night_vision/SKILL.md` |
| `Night Vision for Claude/V2/night_vision/references/framework.md` | `extensions/claude/v2/night_vision/references/framework.md` |
| `Night Vision for Claude/V2/night_vision/references/output.md` | `extensions/claude/v2/night_vision/references/output.md` |
| `Night Vision for Claude/V3/night_vision_v3.skill` | `extensions/claude/v3/night_vision_v3.skill` |
| `Night Vision/.DS_Store` | `archive/miscellaneous/Night Vision/.DS_Store` |
| `Night Vision/Result/.DS_Store` | `data/legacy-cases/.DS_Store` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/.DS_Store` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/.DS_Store` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package.zip` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package.zip` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_conflict_zones.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_conflict_zones.csv` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_iran_retaliation.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_iran_retaliation.csv` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_op_timeline.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_op_timeline.csv` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_strike_routes.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_strike_routes.csv` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_strike_targets.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_strike_targets.csv` |
| `Night Vision/Result/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_us_force_posture.csv` | `data/legacy-cases/EPIC FURY PACKAGE(4.5)/Epic_Fury_Package/epic_fury_us_force_posture.csv` |
| `Night Vision/V1/files.zip` | `archive/directives/v1/files.zip` |
| `Night Vision/V2/files.zip` | `archive/directives/v2/files.zip` |
| `Night Vision/V3/.DS_Store` | `archive/directives/v3/.DS_Store` |
| `Night Vision/V3/files.zip` | `archive/directives/v3/files.zip` |
| `Night Vision/V3/files/Master_Directive.md` | `archive/directives/v3/files/Master_Directive.md` |
| `Night Vision/V3/files/Relation.md` | `archive/directives/v3/files/Relation.md` |
| `Night Vision/V3/files/Source.md` | `archive/directives/v3/files/Source.md` |
| `Night Vision/V3/files/TO_Foundry.md` | `archive/directives/v3/files/TO_Foundry.md` |
| `Night Vision/V4.5/TO_Foundry_v4.5.md` | `archive/directives/v4.5/TO_Foundry_v4.5.md` |
| `Night Vision/V4/TO_Foundry_v4 (1).md` | `archive/directives/v4/TO_Foundry_v4 (1).md` |
| `Night Vision/V4/TO_Foundry_v4.md` | `archive/directives/v4/TO_Foundry_v4.md` |
| `Night Vision/V5/TO_Foundry_v5.md Improvements Summary.md` | `archive/directives/v5/TO_Foundry_v5.md Improvements Summary.md` |
| `Night Vision/V5/To_Foundry_v5.0.md` | `archive/directives/v5/To_Foundry_v5.0.md` |
| `Night Vision/V6/TO_Foundry_v6.0.md` | `archive/directives/v6/TO_Foundry_v6.0.md` |
| `Night Vision/V6/팔란티어 파운드리 데이터 통합 및 시각화 업데이트.md` | `archive/directives/v6/팔란티어 파운드리 데이터 통합 및 시각화 업데이트.md` |
| `README.md` | `archive/README-pre-v2.md` |
| `TMP/.DS_Store` | `archive/miscellaneous/TMP/.DS_Store` |
| `TMP/Source.txt.rtf` | `archive/miscellaneous/TMP/Source.txt.rtf` |
| `TMP/V1/.DS_Store` | `data/fixtures/legacy/V1/.DS_Store` |
| `TMP/V1/Data v1 -claude/01_US_Military_Bases_Middle_East.csv` | `data/fixtures/legacy/V1/Data v1 -claude/01_US_Military_Bases_Middle_East.csv` |
| `TMP/V1/Data v1 -claude/02_Iran_Military_Naval_Facilities.csv` | `data/fixtures/legacy/V1/Data v1 -claude/02_Iran_Military_Naval_Facilities.csv` |
| `TMP/V1/Data v1 -claude/03_Iran_Oil_Export_Ports_Chokepoints.csv` | `data/fixtures/legacy/V1/Data v1 -claude/03_Iran_Oil_Export_Ports_Chokepoints.csv` |
| `TMP/V1/Data v1 -claude/04_China_Iran_Oil_Import_Routes.csv` | `data/fixtures/legacy/V1/Data v1 -claude/04_China_Iran_Oil_Import_Routes.csv` |
| `TMP/V1/Data v1 -claude/05_Gulf_Ports_At_Risk_FIXED.csv` | `data/fixtures/legacy/V1/Data v1 -claude/05_Gulf_Ports_At_Risk_FIXED.csv` |
| `TMP/V1/Data v2 -claude edit/01_US_Military_Bases_Middle_East_GEO.csv` | `data/fixtures/legacy/V1/Data v2 -claude edit/01_US_Military_Bases_Middle_East_GEO.csv` |
| `TMP/V1/Data v2 -claude edit/02_Iran_Military_Naval_Facilities_GEO.csv` | `data/fixtures/legacy/V1/Data v2 -claude edit/02_Iran_Military_Naval_Facilities_GEO.csv` |
| `TMP/V1/Data v2 -claude edit/03_Iran_Oil_Export_Ports_Chokepoints_GEO.csv` | `data/fixtures/legacy/V1/Data v2 -claude edit/03_Iran_Oil_Export_Ports_Chokepoints_GEO.csv` |
| `TMP/V1/Data v2 -claude edit/04_China_Iran_Oil_Import_Routes_GEO.csv` | `data/fixtures/legacy/V1/Data v2 -claude edit/04_China_Iran_Oil_Import_Routes_GEO.csv` |
| `TMP/V1/Data v2 -claude edit/05_Gulf_Ports_At_Risk_FIXED_GEO.csv` | `data/fixtures/legacy/V1/Data v2 -claude edit/05_Gulf_Ports_At_Risk_FIXED_GEO.csv` |
| `TMP/v0_test/CHN ports.csv` | `data/fixtures/legacy/v0_test/CHN ports.csv` |
| `TMP/v0_test/IRN ports.csv` | `data/fixtures/legacy/v0_test/IRN ports.csv` |
| `TMP/v0_test/Ports.csv` | `data/fixtures/legacy/v0_test/Ports.csv` |
| `TMP/v0_test/UAE ports.csv` | `data/fixtures/legacy/v0_test/UAE ports.csv` |
| `TMP/v0_test/USA foriegn ports.csv` | `data/fixtures/legacy/v0_test/USA foriegn ports.csv` |
| `TMP/v0_test/현대사회와철학_개요.pdf` | `archive/miscellaneous/TMP/v0_test/현대사회와철학_개요.pdf` |
