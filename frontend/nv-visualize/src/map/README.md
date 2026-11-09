# Map boundary

renderer.ts owns MapLibre/deck.gl, the pinned offline basemap, screen-space candidate clustering, sourced point focusing and inferred dashed links. MapPort isolates WebGL from DOM unit tests. Desktop/mobile Playwright tests exercise the actual renderer. No physical track, live basemap tiles or Trace playback is asserted.
