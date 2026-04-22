import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegionConfig = async () => {
      try {
        const response = await api.get('/api/config/region');
        setRegion(response.data);
      } catch (error) {
        console.error('Failed to load region config:', error);
        // Fall back to default configuration
        setRegion({
          name: 'Default',
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          theme: {
            colors: {
              primary: '#2C5530',
              secondary: '#FFD700'
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadRegionConfig();
  }, []);

  if (loading) {
    return (
      <RegionContext.Provider value={{
        region: {
          name: 'Default',
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          theme: {
            colors: {
              primary: '#2C5530',
              secondary: '#FFD700'
            }
          }
        },
        loading: true
      }}>
        {children}
      </RegionContext.Provider>
    );
  }

  return (
    <RegionContext.Provider value={{ region }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegionConfig = () => useContext(RegionContext);

