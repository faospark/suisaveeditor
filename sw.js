// Service Worker for SuikoHDEditor
// Enables offline functionality by caching all app assets

const CACHE_NAME = 'suikohd-editor-v1.1.0';

// Install event - cache all assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');

                // Detect if running on localhost
                const isLocalhost = self.location.hostname === 'localhost' ||
                    self.location.hostname === '127.0.0.1';

                // Use appropriate base path
                const basePath = isLocalhost ? '/suisaveeditor' : '';

                // Cache required files first
                const requiredFiles = [
                    `${basePath}/`,
                    `${basePath}/index.html`,
                    `${basePath}/css/pico.css`,
                    `${basePath}/src/style.css`,
                    `${basePath}/src/main.js`,
                    `${basePath}/src/gamedata.js`,
                    `${basePath}/public/favicon.svg`
                ];

                // Cache optional files (like debug save)
                const optionalFiles = [
                    `${basePath}/debug/save.json`
                ];

                // Cache required files one by one to see which fails
                const cacheRequired = Promise.all(
                    requiredFiles.map(url => {
                        return cache.add(url).catch(err => {
                            console.error('[Service Worker] Failed to cache required file:', url, err);
                            throw err; // Re-throw to fail installation
                        });
                    })
                );

                // Cache optional files (won't fail if missing)
                const cacheOptional = Promise.all(
                    optionalFiles.map(url => {
                        return cache.add(url).catch(err => {
                            console.log('[Service Worker] Optional file not cached:', url);
                        });
                    })
                );

                return Promise.all([cacheRequired, cacheOptional]);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activated successfully');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Network request failed, return offline page or error
                    console.log('[Service Worker] Network request failed for:', event.request.url);
                    // You could return a custom offline page here if needed
                });
            })
    );
});
