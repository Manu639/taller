// Sirve la app desde la caché (funciona sin conexión) y la actualiza en segundo plano.
// Al construir la imagen, el Dockerfile cambia 'dev' por la versión de la release, así que
// cada versión publicada usa una caché nueva y la anterior se borra.
const CACHE = 'taller-dev';
// Las figuras de los manuales (app/manual/) llevan un hash en el nombre y nunca cambian: van en una caché
// aparte que se conserva entre versiones, para no volver a descargarlas todas en cada actualización.
const MEDIA_CACHE = 'taller-manual';
const MEDIA_LIST = './manual/medios.json';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './seed.js',
  './figuras.js',
  './guias/ducati-streetfighter-1098.js',
  './guias/yamaha-mt-07.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

const isMedia = url => url.pathname.includes('/manual/') && !url.pathname.endsWith('/medios.json');

// Descarga las figuras que falten y borra las que ya no usa esta versión.
async function syncMedia() {
  const list = await (await fetch(MEDIA_LIST, { cache: 'no-cache' })).json();
  const wanted = new Set(list.map(path => new URL(path, self.registration.scope).href));
  const cache = await caches.open(MEDIA_CACHE);
  for (const request of await cache.keys()) {
    if (!wanted.has(request.url)) await cache.delete(request);
  }
  for (const url of wanted) {
    if (!(await cache.match(url))) await cache.add(url);
  }
}

// Sin esto, el navegador puede dar por buena durante horas su copia HTTP de app.js (el servidor no manda
// Cache-Control) y la app no se actualizaría. Con 'no-cache' siempre pregunta; si no ha cambiado, el servidor
// contesta 304 sin volver a enviar el archivo.
const revalidate = url => fetch(url, { cache: 'no-cache' });

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'no-cache' })))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== MEDIA_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// La app lo pide al arrancar (no en «activate», que retendría las peticiones hasta terminar de descargar).
// Si se corta a medias, lo que falte se guarda al verlo o en el siguiente arranque.
self.addEventListener('message', event => {
  if (event.data === 'sync-media') {
    event.waitUntil(syncMedia().catch(err => console.warn('No se han podido guardar las figuras del manual', err)));
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (isMedia(url)) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = revalidate(request.url)
        .then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
