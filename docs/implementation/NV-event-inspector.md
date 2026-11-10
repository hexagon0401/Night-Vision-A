# Monitoring event inspector

The monitor remains map-first. Its optional panel separates overview, event cards and AI interpretation with keyboard-accessible tabs. Selecting a source event adds a persistent double outline to the native MapLibre overlay, marks its event card as pressed and opens a structured inspector. Closing or pressing Escape clears selection. Filtering clears a selection that no longer appears.

The **사건 표시** control offers muted red, amber and monochrome palettes, plus three marker sizes, persisted locally. Color and size encode UCDP best fatality estimates in the explicit bins unknown / 0 / 1–9 / 10–49 / 50+. They do not encode conflict-wide severity, risk, confidence or geographic uncertainty. Unknown and rejected estimates remain distinct from zero. Approximate locations retain their precision notice. No new canvas, animation loop or mapping dependency is introduced.

The inspector uses existing reported fields: title, actors, conflict type, date range, low/best/high estimates, dataset/version and source identifiers. Its expandable incident explanation restates those fields without inventing an official incident name, narrative, cause, ongoing protest or current activity status. Current records do not contain verified live status; the badge explicitly says **현재 상태 미확인**. Collection success is separate from incident activity. The AI action is explicitly a country-level series analysis, not a factual reconstruction of the selected incident.

Source hashes, preserved invalid estimates and technical metadata remain available in the verification disclosure. Provider links retain HTTPS validation. Labels and fields use text nodes, including source titles and actor names. Free-map attribution and existing AI authentication/quotas are preserved.

Validation covers known/unknown/zero magnitude boundaries, source classifications and dates, native map selection/picking, event text injection, desktop/mobile inspector interaction, disclosures, palette/size selection, Escape and the existing map/Trace/export/navigation suite.
