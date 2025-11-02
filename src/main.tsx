import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './swRegistration'

// Handle FCP loader removal when React renders
const removeFCPLoader = () => {
  const fcpLoader = document.getElementById('fcp-loader');
  if (fcpLoader) {
    setTimeout(() => {
      fcpLoader.style.opacity = '0';
      setTimeout(() => fcpLoader.remove(), 300);
    }, 500);
  }
};

// Unregister Service Workers in development to avoid stale bundles
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => registrations.forEach(reg => reg.unregister()))
    .catch(() => {});
  caches?.keys().then(keys => keys.forEach(k => caches.delete(k)));
}

// Register Service Worker in production only
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Initialize app
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Remove FCP loader after initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removeFCPLoader);
} else {
  removeFCPLoader();
}
