export function mount(root: HTMLElement): void {
  root.innerHTML = `
    <header><a class="brand" href="/" aria-label="Night Vision 홈"><img src="/branding/night-vision-logo.png" alt="네 개 렌즈의 NV 헬멧"/><span>NIGHT VISION</span></a><span class="pill">FOUNDATION · 2.0</span></header>
    <main aria-labelledby="title"><p class="eyebrow">DETECT / CONNECT / EXPLAIN</p><h1 id="title">Night Vision 2.0</h1><p>출처를 연결하고, 변화의 맥락을 읽다.</p><p class="notice">현재는 프로젝트 기반 단계입니다. 지도·실시간 수집·Trace는 아직 연결되지 않았습니다.</p></main>
    <footer role="status"><span>NO FEED CONNECTED</span><span>PHASE 0 · NO CASE LOADED</span></footer>`;
}
