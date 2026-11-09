# Source manifests — bounded, opt-in acquisition

All four checked-in manifests default to `enabled: false` and `rights.reviewed: false`. Offline replay ignores those live gates and always produces synthetic records. No worker, scheduler or poller is started by installation, imports or the API.

| Manifest | Adapter | Live prerequisites |
|---|---|---|
| gdelt.json | GDELT DOC artlist JSON, one bounded query | Review index/article reuse terms; no article pages are fetched |
| ucdp.json | UCDP GED 26.1 Result page | UCDP access approval/token via UCDP_ACCESS_TOKEN; header x-ucdp-access-token |
| firms.json | NASA FIRMS VIIRS S-NPP NRT area CSV | FIRMS_MAP_KEY and product/attribution review; one configured area/day |
| rss.json | NASA RSS 2.0 (Atom also supported) | Review feed/content/media terms and publisher metadata |

The defaults are examples, not audited redistribution grants. To use live collection, review the actual endpoint, scope, provider limits and rights; set enabled and rights.reviewed deliberately. Keep redistribution restrictions in the manifest. Credentials belong in secure environment bindings, never JSON files or chat. The engine currently finds neither optional UCDP/FIRMS key in this environment; no key is needed for fixture tests. A proxy placeholder may not be usable for a key embedded in a URL path; verify the provider-specific credential route before enabling FIRMS live access.

`source_id` is a stable lowercase registry ID (max 32 characters); `publisher_family` and publisher_families mappings are editorial-family IDs, not confidence scores. GDELT original publisher families derive from article domains or registered overrides, never from GDELT itself. RSS external links use their own domain/family unless explicitly registered. Same-family articles are not automatically independent corroboration.

Local policy defaults: 100 parsed records, 2 MB decoded response, 20-second HTTP timeout, 3 attempts, 5 seconds minimum between attempts per provider across threads/processes using the same state directory, 300-second cache TTL and at most 60 seconds automatic retry delay. These are local conservative settings, not claims about provider-approved quotas. Hard configuration bounds limit records to 250, retries to 4 and a batch to 32 sources/4 workers. Adjust stricter limits where the provider requires them.

TTL hits reuse the original acquisition timestamp. Expiry uses ETag/Last-Modified conditional requests; 304 updates cache freshness without inventing a new source acquisition. Retry-After (seconds or HTTP date) is respected; long delays persist a quota floor and return a deferred error instead of retrying early. Redirects are not followed, including authenticated requests. HTTPX uses inherited proxy/CA trust with TLS verification enabled.

UCDP paging is deliberately explicit: NextPageUrl is reported, never blindly followed. A record cap, UCDP continuation or GDELT query limit marks partial coverage. CLI exits 2 for partial results and retains the report; exit 0 does not mean global coverage or factual verification. CLI exits 1 for failed acquisition/document parsing. Legitimate empty provider pages produce an empty report and no invented case.

Provider API docs reviewed 2026-11-09: [GDELT DOC](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/), [UCDP API](https://ucdp.uu.se/apidocs/), [FIRMS area](https://firms.modaps.eosdis.nasa.gov/api/area/), [NASA media use](https://www.nasa.gov/nasa-brand-center/images-and-media/). UCDP now documents authenticated access; anonymous access must not be assumed.
