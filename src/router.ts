export type Route = "inicio" | "carta" | "galeria" | "contacto";

const ROUTES: Route[] = ["inicio", "carta", "galeria", "contacto"];

type RouteHooks = {
  onEnter?: () => void;
  onLeave?: () => void;
};

const hooks: Partial<Record<Route, RouteHooks>> = {};
let currentRoute: Route | null = null;

export function onRoute(route: Route, hooksForRoute: RouteHooks): void {
  hooks[route] = hooksForRoute;
}

let lastQuery = new URLSearchParams();

export function getRouteQuery(): URLSearchParams {
  return lastQuery;
}

function parseHash(): { route: Route; anchor: string | null } {
  const hash = window.location.hash;
  if (hash.startsWith("#/")) {
    const [slugPart, queryPart] = hash.slice(2).split("?");
    const slug = slugPart.replace(/\/$/, "");
    lastQuery = new URLSearchParams(queryPart ?? "");
    const route = (ROUTES as string[]).includes(slug) ? (slug as Route) : "inicio";
    return { route, anchor: null };
  }
  lastQuery = new URLSearchParams();
  if (hash.length > 1) {
    return { route: "inicio", anchor: hash };
  }
  return { route: "inicio", anchor: null };
}

function activate(route: Route, anchor: string | null): void {
  if (route !== currentRoute) {
    if (currentRoute) hooks[currentRoute]?.onLeave?.();
    ROUTES.forEach((r) => {
      const el = document.getElementById(`view-${r}`);
      if (el) el.hidden = r !== route;
    });
    document.body.dataset.route = route;
    currentRoute = route;
    hooks[route]?.onEnter?.();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((a) => {
    const target = a.dataset.navLink;
    a.classList.toggle("is-active", target === route);
  });

  if (anchor) {
    requestAnimationFrame(() => {
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

export function getCurrentRoute(): Route | null {
  return currentRoute;
}

export function initRouter(): void {
  const resolve = () => {
    const { route, anchor } = parseHash();
    activate(route, anchor);
  };
  window.addEventListener("hashchange", resolve);
  resolve();
}
