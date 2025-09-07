import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// CSS is loaded asynchronously to prevent render blocking
import { registerServiceWorker } from './swRegistration'
import { FontPreloader } from './services/performance/FontPreloader'

// Initialize font preloading for performance
const fontPreloader = new FontPreloader();

// Defer font optimization until after initial render (remove Google Fonts dependency)
const initializeFonts = () => {
  // Only initialize custom font handling, no external font requests
  fontPreloader.initialize().then(() => {
    document.documentElement.classList.add('fonts-loaded');
  }).catch(console.error);
};

// Async load main CSS bundle to prevent render blocking
const loadMainCSS = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/index.css';
  document.head.appendChild(link);
};

// Handle FCP loader removal when React renders
const removeFCPLoader = () => {
  const fcpLoader = document.getElementById('fcp-loader');
  const root = document.getElementById('root');
  if (fcpLoader && root && root.children.length > 0) {
    // Ensure React component is fully rendered before removing FCP loader
    setTimeout(() => {
      fcpLoader.style.opacity = '0';
      setTimeout(() => {
        if (fcpLoader.parentNode) {
          fcpLoader.parentNode.removeChild(fcpLoader);
        }
      }, 500); // Increased delay to ensure smooth transition
    }, 1000); // Wait longer to ensure React component is the LCP
  }
};

// Initialize everything without blocking render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      loadMainCSS();
      initializeFonts();
    }, 100);
    setTimeout(removeFCPLoader, 1500);
  });
} else {
  setTimeout(() => {
    loadMainCSS();
    initializeFonts();
  }, 100);
  setTimeout(removeFCPLoader, 1500);
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
setTimeout(removeFCPLoader, 2000); // Ensure this happens after React is fully loaded
