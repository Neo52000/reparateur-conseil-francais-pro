export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates on registration
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available — dispatch custom event
                window.dispatchEvent(
                  new CustomEvent('sw-update-available', {
                    detail: { registration },
                  })
                );
              }
            }
          };
        };
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  });

  // Listen for messages from the SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      window.dispatchEvent(new CustomEvent('sw-activated'));
    }
  });
}

/**
 * Tell the waiting SW to skip waiting and take over.
 */
export function skipWaitingAndReload() {
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Reload once the new SW takes control
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true;
      window.location.reload();
    }
  });
}
