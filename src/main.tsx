import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './swRegistration'
import { FontPreloader } from './services/performance/FontPreloader'

// Initialize font preloading for performance
const fontPreloader = new FontPreloader();

// Prioritize FCP by deferring non-critical initialization
const initializeFonts = () => {
  fontPreloader.initialize().then(() => {
    // Mark fonts as loaded for CSS transitions
    document.documentElement.classList.add('fonts-loaded');
  }).catch(console.error);
};

// Defer font optimization until after initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeFonts, 100);
  });
} else {
  setTimeout(initializeFonts, 100);
}

// Unregister any existing Service Workers and clear caches in development to avoid stale bundles
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister().catch(() => {}));
  });
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

// Register the Service Worker only in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
