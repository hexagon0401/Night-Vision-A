# Night Vision — Minimal AIS / ADS-B v2.0

Replaces the ornate v1.0 vector art with **23 original, flat, top-down category silhouettes**.
**12 vessels + 11 aircraft**. Each has one crisp 64×64 SVG and pre-rendered PNG at 24/48/96px.

- Map: default 24px, 18px in high density; no shadows, no detailed decks/windows. Pointer to north in source art.
- Detail: 48px version. Use the right-side ontology inspector for types, identifiers, records, evidence, NOT within the icon.
- Color is **not vessel type**: white shape indicates class; purple selection halo and amber/red statuses belong on separate map layers.
- AIS type is not enough to identify a container vs bulk carrier or cruise vs ferry: detailed subtype icons require *independently provided subtype metadata*.
- ADS-B `t` / ICAO aircraft type designator can help with airframe family, but cannot alone establish passenger/cargo/military role. The type/role remains unknown without corroborating metadata.
- If course/track is absent, keep marker north-up and state orientation unknown; do not invent a heading.
- For privacy and non-targeting: do not infer private persons or current tactical objectives from movements.

## Integration

Use `integration/classify.mjs` and `integration/maplibre.mjs`. The classifier always has an `unknown` fallback and remains separate from SVG asset IDs.

## Semantics

- AIS 60–69 passenger, 70–79 cargo, 80–89 tanker; 30 fishing; 31/32 tow, 52 tug, 33/34 specialized, 36 sailing, 35 military, 37 pleasure, 40–49 high-speed, 50–59 public-service types. Exact categories per USCG AIS encoding guide.
- Only subtype hints from a trusted provider activate container, bulk, etc. A tanker code does not tell you gas/chemical type.
- Aircraft model mappings in this example are illustrative families, not a guaranteed manufacturer database. Check type designators and model properties against validated aircraft registries.

## Credits

All SVG artwork generated for Night Vision in this package. No third-party aircraft or shipping icons are included.
