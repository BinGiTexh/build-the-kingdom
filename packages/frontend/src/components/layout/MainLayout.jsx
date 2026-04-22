import React from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Header userType={user?.userType} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export { MainLayout };

