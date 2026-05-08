import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export const PrivacyPolicyPage = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: January 1, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
          <p>When you use {config.siteName}, we may collect the following information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account information (name, email, password) when you register</li>
            <li>Profile information you choose to provide (resume, skills, location)</li>
            <li>Usage data (pages visited, searches performed, jobs saved)</li>
            <li>Device and browser information for security and analytics</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and improve our job search platform</li>
            <li>Personalize your experience and job recommendations</li>
            <li>Communicate with you about your account and our services</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with employer partners
            only when you explicitly apply for a job. We may share anonymized, aggregated data for
            analytics purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including encrypted
            connections (HTTPS), secure password hashing, and regular security audits.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and download your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">6. Cookies</h2>
          <p>
            We use essential cookies to maintain your session and preferences. We may use analytics
            cookies to understand how our platform is used. You can control cookie settings in your browser.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">7. Contact</h2>
          <p>
            For privacy-related questions, contact us at{' '}
            <a href="mailto:privacy@buildthekingdom.com" className="text-primary-600 hover:underline">privacy@buildthekingdom.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
