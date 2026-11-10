# Event Context operations and provider review

The sidecar is independent of CaseBundle and country-series AI. No NIM inference, additional map canvas, image/video proxy, paid fallback or always-on relay is used. Synthetic test fixtures remain under tests/fixtures only.

## Provider review, 2026-11-10 KST

- **UCDP existing**: canonical D1 record/head only, no new token use; official source link is context, not independent confirmation. https://ucdp.uu.se/downloads/
- **Element 84 Earth Search**: official service page explicitly describes a free-to-use STAC API. Root, Sentinel-2 collection and historical POST search returned HTTP 200. Enabled for metadata and source links only; Copernicus Sentinel / Element 84 attribution retained. No pixels, signed assets, previews or thumbnails redistributed. https://element84.com/earth-search/
- **GDELT**: official DOC API documentation returned 200; actual bounded historical article query returned 503 (upstream timeout). Adapter implemented, default disabled pending successful live probe. `CONTEXT_GDELT_ENABLED=true` and `CONTEXT_GDELT_TERMS_REVIEWED=true` enable an owner-reviewed retry; not automatically enabled or substituted. No original article text or images copied. https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- **Caltrans**: official district 4 catalog, CWWP page and privacy policy returned 200. Catalog response about 2.5 MB. Public accessibility does not establish media redistribution rights; catalog/media activation remains pending terms review. https://cwwp2.dot.ca.gov/ / https://dot.ca.gov/privacy-policy
- **Panoramax**: public API 200; image-specific attribution/terms not yet established. Remains terms_pending. Mapillary/Windy additionally require provider credentials and plan review.
- **NOAA AIS**: official historical archive landing page 200. No geographically/time-bounded approved subset registered. No archive observations or transport counts claimed. https://coast.noaa.gov/digitalcoast/tools/ais.html
- **OpenSky**: official API docs 200; no historical research permission/credentials established. ADS-B and AIS sources are skipped unless source-backed event text establishes aviation/maritime relevance. Actor names alone never qualify. No live track replacement.

All disabled providers expose their policy link and reason. `CONTEXT_DISABLED_PROVIDERS` can disable any listed source immediately. Missing keys, terms pending, irrelevant, archive unavailable, disabled, empty, upstream failure and quota/concurrency limits are different states.

## Endpoints and limits

`GET /api/v2/events/{id}` resolves the current canonical record. `GET .../context`, `.../context/status`, `.../context/provider/{provider}` return event-specific bundles. include accepts registered provider IDs only. Unknown events produce 404 before provider requests. Public requests cannot inject coordinates, hosts or URLs. POST `.../context/refresh` requires the existing allowlisted GitHub session and same-origin check, maximum 10 refreshes/account/UTC day. No refresh through a public GET flag. Metadata adapters have 50 executions/provider/UTC day, three D1-backed global leases, 10-second/1MB upstream caps, redirects rejected, failure cooldown five minutes, success TTL one hour. Hash + snapshot + adapter version invalidate cache; old revisions retained at most 30 days with bounded pruning. Stale data are marked when retained on failure. Media embedding remains off and CSP is unchanged.

POST `.../context/review` stores a manually requested source-bound review sidecar for an authenticated owner. It does not invoke external modules or promote evidence. JSON download preserves the event hash, evidence roles and timestamps; existing ZIP/Trace exports remain unchanged. Fifteen independent NV specialist modules are not reimplemented or silently invoked.

## References

Reviewed pinned WorldMonitor imagery source at 2fa7368b696b38840ee752673b11e1d78c565459 (AGPL-3.0-only) as architecture reference only. No AGPL code copied. Reviewed God's Eye View LICENSE, DATA_SOURCES.md, THIRD_PARTY_NOTICES.md and SECURITY.md at bb40ac5e5477f355b05fcffa9fb3ba3507797f7f. Its MIT code license does not license third-party media. Implementation here is independent.
