// Ensure React is available globally to prevent import errors
import React from 'react';

// Make React available globally for components that may need it
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

export default React;