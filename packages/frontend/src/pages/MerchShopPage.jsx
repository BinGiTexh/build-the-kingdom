import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

const MerchShopPage = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
          <ShoppingBag className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Merch Shop
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {config.siteName} merchandise is coming soon. Rep the Kingdom and support the mission.
        </p>
        <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export { MerchShopPage };
export default MerchShopPage;
