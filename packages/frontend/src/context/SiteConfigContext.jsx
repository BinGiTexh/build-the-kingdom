import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SiteConfigContext = createContext();

const DEFAULT_CONFIG = {
  siteName: 'Job Platform',
  tagline: 'Find Your Dream Job',
  logo: '/logo.svg',
  currency: 'USD',
  currencySymbol: '$',
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  stripeEnabled: false,
  feedIngestEnabled: true,
};

function hexToHSL(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generateShades(hex) {
  const { h, s } = hexToHSL(hex);
  return {
    50:  `hsl(${h}, ${Math.min(s + 20, 100)}%, 97%)`,
    100: `hsl(${h}, ${Math.min(s + 15, 100)}%, 93%)`,
    200: `hsl(${h}, ${Math.min(s + 10, 100)}%, 86%)`,
    300: `hsl(${h}, ${s}%, 75%)`,
    400: `hsl(${h}, ${s}%, 62%)`,
    500: `hsl(${h}, ${s}%, 50%)`,
    600: hex,
    700: `hsl(${h}, ${s}%, 38%)`,
    800: `hsl(${h}, ${s}%, 30%)`,
    900: `hsl(${h}, ${s}%, 22%)`,
    950: `hsl(${h}, ${s}%, 14%)`,
  };
}

function applyColorVars(config) {
  const root = document.documentElement;
  const primary = generateShades(config.primaryColor);
  const secondary = generateShades(config.secondaryColor);

  Object.entries(primary).forEach(([shade, value]) => {
    root.style.setProperty(`--color-primary-${shade}`, value);
  });
  Object.entries(secondary).forEach(([shade, value]) => {
    root.style.setProperty(`--color-secondary-${shade}`, value);
  });
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-secondary', config.secondaryColor);
}

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [configRes, statsRes] = await Promise.allSettled([
          api.get('/api/config'),
          api.get('/api/config/stats'),
        ]);
        const cfg = configRes.status === 'fulfilled' ? configRes.value.data : DEFAULT_CONFIG;
        setConfig(cfg);
        applyColorVars(cfg);
        document.title = cfg.siteName;
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
      } catch {
        applyColorVars(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, stats, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig must be used within SiteConfigProvider');
  return ctx;
};
