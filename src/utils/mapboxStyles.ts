
export const createMarkerStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .custom-marker:hover {
      background-color: #2563EB !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
      z-index: 1000 !important;
    }
  `;
  
  // Éviter de dupliquer les styles
  if (!document.head.querySelector('style[data-marker-styles]')) {
    style.setAttribute('data-marker-styles', 'true');
    document.head.appendChild(style);
  }
};

export const getMarkerBaseStyles = () => `
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3B82F6;
  border: 3px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
`;

export const mapboxStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9'
};
