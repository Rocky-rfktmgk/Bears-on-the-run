const CACHE_NAME = "bears-on-the-run-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./bear-run-icon.png"
];


/* INSTALL */

self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })

  );

  self.skipWaiting();

});


/* REMOVE OLD CACHE VERSIONS */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))

        );

      })

  );

  self.clients.claim();

});


/*
CACHE ONLY FILES FROM THIS WEBSITE.

GOOGLE SHEETS POST REQUESTS ARE NOT CACHED.
*/

self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(

    fetch(request)

      .then(response => {

        const copy = response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {
            cache.put(request, copy);
          });

        return response;

      })

      .catch(() => {
        return caches.match(request);
      })

  );

});
