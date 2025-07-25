const CACHE_NAME = 'tabnews-blog-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/api.js',
  '/js/theme.js',
  '/js/pwa.js',
  '/js/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// URLs da API para cache
const API_URLS = [
  'https://www.tabnews.com.br/api/v1/contents?strategy=relevant&page=1&per_page=30',
  'https://www.tabnews.com.br/api/v1/contents?strategy=new&page=1&per_page=30'
];

// Security headers to add to cached responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Validate cache integrity
const validateCacheIntegrity = (response) => {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return false;
  }
  return true;
};

// Add security headers to response
const addSecurityHeaders = (response) => {
  const newHeaders = new Headers(response.headers);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erro ao abrir cache:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - validate and return response
        if (response) {
          if (validateCacheIntegrity(response)) {
            return addSecurityHeaders(response);
          } else {
            // Remove invalid cache entry
            caches.open(CACHE_NAME).then(cache => {
              cache.delete(event.request);
            });
          }
        }

        // Clona a requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Validate response before caching
          if (!validateCacheIntegrity(response)) {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          // Adiciona URLs da API ao cache com validation
          if (event.request.url.includes('tabnews.com.br/api')) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache successful API responses
                if (response.status === 200) {
                  cache.put(event.request, responseToCache);
                }
              })
              .catch((error) => {
                console.error('Erro ao cachear resposta da API:', error);
              });
          }

          return addSecurityHeaders(response);
        }).catch((error) => {
          console.error('Erro na requisição:', error);
          
          // Se falhou e é uma requisição da API, tenta retornar do cache
          if (event.request.url.includes('tabnews.com.br/api')) {
            return caches.match(event.request).then(cachedResponse => {
              return cachedResponse ? addSecurityHeaders(cachedResponse) : new Response('Offline', { status: 503 });
            });
          }
          
          // Para páginas, retorna a página principal em caso de erro de rede
          if (event.request.destination === 'document') {
            return caches.match('/').then(cachedResponse => {
              return cachedResponse ? addSecurityHeaders(cachedResponse) : new Response('Offline', { status: 503 });
            });
          }
          
          return new Response('Network error', { status: 503 });
        });
      })
  );
});

// Limpa caches antigos com validation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).catch((error) => {
      console.error('Erro ao limpar caches antigos:', error);
    })
  );
});