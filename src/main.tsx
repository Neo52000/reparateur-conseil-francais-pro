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

// Handle FCP loader removal when React renders
const removeFCPLoader = () => {
  const fcpLoader = document.getElementById('fcp-loader');
  const root = document.getElementById('root');
  if (fcpLoader && root && root.children.length > 0) {
    fcpLoader.style.opacity = '0';
    setTimeout(() => {
      if (fcpLoader.parentNode) {
        fcpLoader.parentNode.removeChild(fcpLoader);
      }
    }, 300);
  }
};

// Defer font optimization until after initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeFonts, 100);
    setTimeout(removeFCPLoader, 200);
  });
} else {
  setTimeout(initializeFonts, 100);
  setTimeout(removeFCPLoader, 200);
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

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Remove FCP loader after React renders
setTimeout(removeFCPLoader, 300);
