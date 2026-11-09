import {
  createElement,
  Activity,
  Map as MapIcon,
  Layers,
  Search,
  RefreshCw,
  BrainCircuit,
  Settings,
  FlaskConical,
  FileArchive,
  ListFilter,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserRound,
  Menu,
  type IconNode,
} from "lucide";
const icons: Record<string, IconNode> = {
  Trace: Play,
  Explore: MapIcon,
  현황: Activity,
  "지속 감시": Activity,
  "실행 이력": Activity,
  Layers: Layers,
  Cases: ListFilter,
  Sources: Search,
  Export: FileArchive,
  새로고침: RefreshCw,
  "NIM 연결 진단": BrainCircuit,
  설정: Settings,
  실험실: FlaskConical,
  로그아웃: LogOut,
  메뉴: Menu,
  "←": ChevronLeft,
  "→": ChevronRight,
  Play: Play,
  Pause: Pause,
};
export function icon(node: IconNode) {
  return createElement(node, {
    width: "18",
    height: "18",
    "stroke-width": "1.6",
    "aria-hidden": "true",
    focusable: "false",
  });
}
export function enhanceControls(root: HTMLElement) {
  const apply = () => {
    for (const element of Array.from(
      root.querySelectorAll<HTMLElement>("button,nav a,summary"),
    )) {
      if (element.querySelector("svg,img")) continue;
      const label = element.textContent?.trim() ?? "";
      const selected = icons[label];
      if (selected) element.prepend(icon(selected));
      element.setAttribute(
        "title",
        element.getAttribute("aria-label") ?? label,
      );
    }
  };
  const observer = new MutationObserver(() => {
    observer.disconnect();
    apply();
    observer.observe(root, { childList: true, subtree: true });
  });
  apply();
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
let session: Promise<any> | undefined;
let checked = 0;
export function readSession(force = false) {
  if (!session || force || Date.now() - checked > 30000) {
    checked = Date.now();
    session = fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .catch(() => ({ user: null, configured: false, error: true }));
  }
  return session;
}
export function accountControl(parent: HTMLElement) {
  const holder = document.createElement("div");
  holder.className = "account-control";
  holder.setAttribute("aria-label", "계정");
  holder.textContent = "연결 확인 중";
  holder.setAttribute("aria-busy", "true");
  parent.append(holder);
  let disposed = false;
  void readSession().then((data) => {
    if (disposed) return;
    holder.replaceChildren();
    holder.removeAttribute("aria-busy");
    if (!data.user) {
      const a = document.createElement("a");
      a.href = data.configured ? "/api/auth/github" : "/setup.html";
      a.className = "github-login";
      const image = document.createElement("img");
      image.src = "/branding/github.svg";
      image.alt = "";
      image.width = 18;
      image.height = 18;
      a.append(
        image,
        document.createTextNode(
          data.error
            ? "연결 확인 필요"
            : data.configured
              ? "GitHub 로그인"
              : "로그인 연결 설정",
        ),
      );
      holder.append(a);
      return;
    }
    const menu = document.createElement("details");
    menu.className = "account-menu";
    const summary = document.createElement("summary");
    summary.append(icon(UserRound), document.createTextNode(data.user.login));
    const settings = document.createElement("a");
    settings.href = "/setup.html";
    settings.append(icon(Settings), document.createTextNode("설정"));
    const logout = document.createElement("button");
    logout.append(icon(LogOut), document.createTextNode("로그아웃"));
    logout.onclick = async () => {
      logout.disabled = true;
      try {
        const r = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (!r.ok) throw Error();
        session = undefined;
        holder.replaceChildren();
        accountControl(holder);
        window.dispatchEvent(new Event("nv:auth-change"));
      } catch {
        logout.disabled = false;
        logout.textContent = "로그아웃 재시도";
      }
    };
    menu.append(summary, settings, logout);
    holder.append(menu);
  });
  return () => {
    disposed = true;
    holder.remove();
  };
}
