// Service Worker for SuikoHDEditor
// Enables offline functionality by caching all app assets

// Version must match APP_VERSION in src/config/constants.js
const APP_VERSION = '1.3.2';
const CACHE_NAME = `suikohd-editor-v${APP_VERSION}`;

// Install event - cache all assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');

                // Get the base path from the service worker's registration scope
                const swPath = self.registration.scope;
                
                // Cache critical files for offline functionality
                const requiredFiles = [
                    swPath,
                    `${swPath}index.html`,
                    // Stylesheets
                    `${swPath}css/pico.css`,
                    `${swPath}src/style.css`,
                    // Core JavaScript modules
                    `${swPath}src/main.js`,
                    `${swPath}src/gamedata.js`,
                    // Config modules
                    `${swPath}src/config/constants.js`,
                    `${swPath}src/config/schema.js`,
                    // Editor modules
                    `${swPath}src/editors/index.js`,
                    `${swPath}src/editors/battleCharacters.js`,
                    `${swPath}src/editors/partyMembers.js`,
                    `${swPath}src/editors/keyItems.js`,
                    `${swPath}src/editors/recruitment.js`,
                    `${swPath}src/editors/tableEditor.js`,
                    `${swPath}src/editors/bathItems.js`,
                    `${swPath}src/editors/roomItems.js`,
                    // Renderer modules
                    `${swPath}src/renderers/dataValuesViewer.js`,
                    // Utility modules
                    `${swPath}src/utils/index.js`,
                    `${swPath}src/utils/debug.js`,
                    `${swPath}src/utils/helpers.js`,
                    `${swPath}src/utils/markdown.js`,
                    `${swPath}src/utils/statusBar.js`,
                    // Assets
                    `${swPath}public/favicon.svg`,
                    // Documentation
                    `${swPath}README.md`,
                    `${swPath}CHANGELOG.md`
                ];

                // Optional files that will be cached on first access
                const optionalFiles = [
                    `${swPath}debug/save.json`,
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
