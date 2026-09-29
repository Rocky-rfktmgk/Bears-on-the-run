const CACHE_NAME = "bear-run-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];


/* Install the app files */

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


/* Remove old cache versions */

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
Only cache GET requests from our own website.

This means Google Sheets registration submissions
still go directly to Google and are NOT cached.
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

        const responseCopy = response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {

            cache.put(request, responseCopy);

          });

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});
