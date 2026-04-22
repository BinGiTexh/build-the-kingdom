import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { HomePage } from '../pages/HomePage';
import { JobSearchPage } from '../pages/JobSearchPage';
import { JobDetailsPage } from '../pages/JobDetailsPage';
import { ModernJobSearchPage } from '../pages/ModernJobSearchPage';
import { ModernJobDetailsPage } from '../pages/ModernJobDetailsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PostJobPage } from '../pages/employer/PostJobPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobSearchPage />} />
      <Route path="/jobs/modern" element={<ModernJobSearchPage />} />
      <Route path="/jobs/:id" element={<JobDetailsPage />} />
      <Route path="/jobs/modern/:id" element={<ModernJobDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
      <Route path="/jobs/post" element={
        <PrivateRoute roles={['EMPLOYER']}>
          <PostJobPage />
        </PrivateRoute>
      } />
      
      {/* 404 and Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
