# Persistent map and UI workbench

Baseline cloud Chromium: cold detail ~4.1s, reload ~2.6s (software GPU; not a user-device guarantee). Pin the OpenFreeMap Liberty style as a local versioned module with source hash, upstream BSD/CC BY attribution and license. Remove unused raster/sprites/POI, reduce font stacks and use local ideographs. TileJSON and vector tile cache policy remains upstream-controlled.

Initialize the detailed map once, fall back only on error. Overlay/deck.gl is a dynamic import only when data or Trace needs it. MapLibre owns the app-lifetime canvas; view leases replace callbacks and move the same canvas host without deleting the underlying map. Camera is stored separately from login/data and restored before requests. API refresh never recreates a map. Authentication is not stored in browser localStorage or map cache.

UI uses Lucide MIT icons and Primer Octicons' MIT GitHub mark. Account states are checked once with a shared short-lived session promise, not inferred from cookies. Main shell handles same-origin view navigation; source/external/auth/download links retain normal behavior. Monitoring drawer is on demand. Utility menus hold labs, refresh and diagnostics. Keyboard names, source uncertainty, inferred status, and mobile interaction remain visible.

Run 5 cold / 5 reload browser measurements against the hosted build; record time to map usability and detailed road/label completion separately. Targets are median cold <=3s and reload <=1.5s in the same environment, not an external tile-provider SLA. Verify native canvas identity through view switches and no more than one overlay canvas.
