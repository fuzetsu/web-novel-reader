const CACHE_NAME = 'web-novel-reader-v1'
const assetsToCache = ['/', '/index.html', '/bundle.js', '/bundle.css']

self.addEventListener('install', event =>
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache)))
)

self.addEventListener('fetch', event =>
  event.respondWith(
    caches
      .match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
  )
)

self.addEventListener('activate', event =>
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
)
