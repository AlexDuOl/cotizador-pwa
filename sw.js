// *** 1. Definición del CACHE y Recursos ***
// CAMBIA ESTE VALOR CADA VEZ que subas cambios importantes para forzar la actualización.
const CACHE_NAME = 'cotizador-pwa-cache-v17';
// Define la ruta base de tu repositorio en GitHub Pages
const REPO_PATH = '/cotizador-pwa'; // <-- RUTA ESPECÍFICA DE TU REPOSITORIO Para producción (GitHub Pages)
//const REPO_PATH = ''; // <-- PARA DESARROLLO EN LOCAL

// Lista de URLs esenciales que deben ser CACHEADAS
const urlsToCache = [
  // Rutas críticas: La raíz, el index, y el manifest
  `${REPO_PATH}/`,
  `${REPO_PATH}/index.html`,
  `${REPO_PATH}/manifest.json`,
  
  // Incluye todos tus archivos de estilo y lógica
  `${REPO_PATH}/styles.css`,
  `${REPO_PATH}/app.js`,
  
  // Incluye todos los iconos definidos en tu manifest
  `${REPO_PATH}/images/logo1.ico`, 
  `${REPO_PATH}/images/Logo1.jpg` 
  
  // *** AÑADE AQUÍ CUALQUIER OTRA IMAGEN, FUENTE O ARCHIVO CRÍTICO ***
];


// 2. Evento 'install': Instalar y Cachear
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando y abriendo caché:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache); 
      })
      .then(() => {
        // Asegura que el nuevo Service Worker tome el control inmediatamente
        return self.skipWaiting();
      })
  );
});

// 3. Evento 'activate': Limpiar Caché Antiguo
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando y limpiando cachés antiguos.');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 4. Evento 'fetch': Estrategia Cache-First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve el recurso si está en caché
        if (response) {
          return response;
        }
        
        // Si no está, va a la red
        return fetch(event.request);
      })
  );
});