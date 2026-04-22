import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import AppRoutes from './routes';

const App = () => {
  return (
    <BrowserRouter>
      <SiteConfigProvider>
        <ThemeProvider>
          <AuthProvider>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </AuthProvider>
        </ThemeProvider>
      </SiteConfigProvider>
    </BrowserRouter>
  );
};

export default App;
