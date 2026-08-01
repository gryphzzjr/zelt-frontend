import { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext();

const PRESET_COLORS = [
  { name: 'Roxo', value: '#6300ff' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Indigo', value: '#4f46e5' },
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function getPrimaryVars(hex) {
  const { r, g, b } = hexToRgb(hex);
  return {
    '--zelt-primary': hex,
    '--zelt-primary-rgb': `${r}, ${g}, ${b}`,
    '--zelt-primary-hover': `color-mix(in srgb, ${hex} 80%, black)`,
    '--zelt-primary-50': `rgba(${r}, ${g}, ${b}, 0.05)`,
    '--zelt-primary-100': `rgba(${r}, ${g}, ${b}, 0.1)`,
    '--zelt-primary-200': `rgba(${r}, ${g}, ${b}, 0.2)`,
  };
}

export function ThemeProvider({ children }) {
  const [primaryColor, setPrimaryColorState] = useState(() => {
    try { return localStorage.getItem('zelt-theme-primary') || '#6300ff'; } catch { return '#6300ff'; }
  });

  const setPrimaryColor = useCallback((c) => {
    setPrimaryColorState(c);
    try { localStorage.setItem('zelt-theme-primary', c); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, presetColors: PRESET_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
