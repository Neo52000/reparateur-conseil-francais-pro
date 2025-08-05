import React from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './TestApp';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<TestApp />);
}