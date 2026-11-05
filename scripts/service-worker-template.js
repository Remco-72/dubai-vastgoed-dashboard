/* Replaced at build time; this worker never reads financial browser storage. */
const CONFIG = __CONFIG__;
self.addEventListener("install", (event) => {
  // An install only succeeds if the entire version is cached. Do not skip waiting:
  // an update must not replace the current app while someone is editing finances.
  event.waitUntil(
    caches
      .open(CONFIG.cache)
      .then((cache) =>
        cache.addAll(
          CONFIG.urls.map((url) => new Request(url, { cache: "reload" })),
        ),
      ),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CONFIG.prefix) && name !== CONFIG.cache,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(CONFIG.scope)
  )
    return;
  if (url.pathname === CONFIG.scope + "sw.js") return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CONFIG.cache);
      // Keep the HTML shell and its hashed assets from the same cached build.
      if (
        event.request.mode === "navigate" &&
        (url.pathname === CONFIG.scope ||
          url.pathname === CONFIG.scope + "index.html")
      )
        return (await cache.match(CONFIG.scope)) || fetch(event.request);
      return (
        (await cache.match(event.request, { ignoreSearch: true })) ||
        fetch(event.request)
      );
    })(),
  );
});
