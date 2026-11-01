// Self-destructing Service Worker
// Purges legacy offline caches and unregisters itself to prevent update interference.
// For offline usage, use the official standalone Tauri desktop executable.

self.addEventListener('install', () => {
    console.log('[Service Worker] Decommissioning: skipping waiting...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Decommissioning: purging all caches and unregistering...');
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        console.log('[Service Worker] Deleting cache:', key);
                        return caches.delete(key);
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Unregistering self...');
                return self.registration.unregister();
            })
            .then(() => {
                return self.clients.matchAll();
            })
            .then((clients) => {
                clients.forEach((client) => {
                    if (client.url && 'navigate' in client) {
                        client.navigate(client.url);
                    }
                });
            })
    );
});
