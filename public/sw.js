// Minimal PWA service worker: cache the app shell so the site still opens
// (with stale content) when offline or on a flaky connection. Not trying
// to cache every asset aggressively — a portfolio site's content changes
// on every deploy, so we keep the cache small and network-first for pages.
const CACHE = "site-shell-v1";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const isPage = request.mode === "navigate";
  event.respondWith(
    isPage
      ? fetch(request).catch(() => caches.match("/"))
      : caches.match(request).then((cached) => cached || fetch(request))
  );
});
