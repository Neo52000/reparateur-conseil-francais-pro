import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Optimisations de production
import { initProductionOptimizations } from "./utils/productionOptimizations";
import { preloadCriticalComponents } from "./utils/bundleOptimization";

// Initialiser les optimisations
initProductionOptimizations();
preloadCriticalComponents();

createRoot(document.getElementById("root")!).render(<App />);
