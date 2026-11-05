/* Replaced at build time; this worker never reads financial browser storage. */
const CONFIG = {"scope":"/dubai-vastgoed-dashboard/","prefix":"apex-offline:/dubai-vastgoed-dashboard/:","cache":"apex-offline:/dubai-vastgoed-dashboard/:3f8d7067f8e807252529","urls":["/dubai-vastgoed-dashboard/","/dubai-vastgoed-dashboard/404.html","/dubai-vastgoed-dashboard/404/index.html","/dubai-vastgoed-dashboard/__next.__PAGE__.txt","/dubai-vastgoed-dashboard/__next._full.txt","/dubai-vastgoed-dashboard/__next._tree.txt","/dubai-vastgoed-dashboard/_next/static/chunks/4bd1b696-c7408084347438ae.js","/dubai-vastgoed-dashboard/_next/static/chunks/794-24564b4a073b53e1.js","/dubai-vastgoed-dashboard/_next/static/chunks/app/_global-error/page-aba28f88d5781771.js","/dubai-vastgoed-dashboard/_next/static/chunks/app/_not-found/page-f0f09b9c3d1d609b.js","/dubai-vastgoed-dashboard/_next/static/chunks/app/layout-1a83b81f57e313aa.js","/dubai-vastgoed-dashboard/_next/static/chunks/app/page-ab6f6468c92d6bd2.js","/dubai-vastgoed-dashboard/_next/static/chunks/framework-ea4f97ca039bd777.js","/dubai-vastgoed-dashboard/_next/static/chunks/main-1247389e08cf335c.js","/dubai-vastgoed-dashboard/_next/static/chunks/main-app-cb06bdad0f449c20.js","/dubai-vastgoed-dashboard/_next/static/chunks/next/dist/client/components/builtin/app-error-aba28f88d5781771.js","/dubai-vastgoed-dashboard/_next/static/chunks/next/dist/client/components/builtin/forbidden-aba28f88d5781771.js","/dubai-vastgoed-dashboard/_next/static/chunks/next/dist/client/components/builtin/global-error-32b4f320c88530de.js","/dubai-vastgoed-dashboard/_next/static/chunks/next/dist/client/components/builtin/not-found-aba28f88d5781771.js","/dubai-vastgoed-dashboard/_next/static/chunks/next/dist/client/components/builtin/unauthorized-aba28f88d5781771.js","/dubai-vastgoed-dashboard/_next/static/chunks/polyfills-42372ed130431b0a.js","/dubai-vastgoed-dashboard/_next/static/chunks/webpack-838be1c447e707f2.js","/dubai-vastgoed-dashboard/_next/static/css/215df7138c5912d7.css","/dubai-vastgoed-dashboard/_next/static/zKWzm7ef5b7elaKH9HqE5/_buildManifest.js","/dubai-vastgoed-dashboard/_next/static/zKWzm7ef5b7elaKH9HqE5/_ssgManifest.js","/dubai-vastgoed-dashboard/_not-found/__next._full.txt","/dubai-vastgoed-dashboard/_not-found/__next._not-found.__PAGE__.txt","/dubai-vastgoed-dashboard/_not-found/__next._tree.txt","/dubai-vastgoed-dashboard/_not-found/index.html","/dubai-vastgoed-dashboard/_not-found/index.txt","/dubai-vastgoed-dashboard/apple-touch-icon.png","/dubai-vastgoed-dashboard/icon-192.png","/dubai-vastgoed-dashboard/icon-512.png","/dubai-vastgoed-dashboard/icon-maskable.png","/dubai-vastgoed-dashboard/icon.svg","/dubai-vastgoed-dashboard/index.html","/dubai-vastgoed-dashboard/index.txt","/dubai-vastgoed-dashboard/manifest.webmanifest"]};
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
