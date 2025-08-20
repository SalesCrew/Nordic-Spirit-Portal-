self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		try {
			const keys = await caches.keys();
			await Promise.all(keys.map((k) => caches.delete(k)));
			await self.registration.unregister();
			const clients = await self.clients.matchAll();
			clients.forEach((client) => client.navigate(client.url));
		} catch (e) {
			// no-op
		}
	})());
});


