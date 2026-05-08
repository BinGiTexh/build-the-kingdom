import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

export const Footer = () => {
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 px-4" style={{ backgroundColor: 'var(--color-primary-900)' }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-white/90 text-sm">
          &copy; {year} {config.siteName}. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link to="/about" className="text-white/80 hover:text-white text-sm transition-colors">
            About
          </Link>
          <Link to="/privacy" className="text-white/80 hover:text-white text-sm transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-white/80 hover:text-white text-sm transition-colors">
            Terms of Service
          </Link>
          <Link to="/contact" className="text-white/80 hover:text-white text-sm transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};
