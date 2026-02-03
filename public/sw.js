// Service Worker to add ngrok-skip-browser-warning header to all requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Add the ngrok-skip-browser-warning header to all requests
  const newRequest = new Request(request, {
    headers: {
      ...Object.fromEntries(request.headers),
      'ngrok-skip-browser-warning': 'true',
    },
  });

  event.respondWith(fetch(newRequest));
});
