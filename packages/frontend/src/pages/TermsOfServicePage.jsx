import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export const TermsOfServicePage = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: January 1, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {config.siteName}, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">2. Use of Service</h2>
          <p>{config.siteName} provides a job discovery platform. You agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate information when creating an account</li>
            <li>Use the platform only for lawful purposes</li>
            <li>Not attempt to scrape, crawl, or overload our systems</li>
            <li>Not impersonate other users or entities</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">3. Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account credentials. You must
            notify us immediately of any unauthorized access to your account.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">4. Job Listings</h2>
          <p>
            Job listings on {config.siteName} are sourced from employers and feed partners. While we
            strive for accuracy, we do not guarantee the completeness or accuracy of any listing.
            {config.siteName} is not the employer for any listed position unless explicitly stated.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">5. Intellectual Property</h2>
          <p>
            The {config.siteName} platform, including its design, features, and content (excluding
            user-submitted and third-party content), is owned by {config.siteName} and protected by
            applicable intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">6. Limitation of Liability</h2>
          <p>
            {config.siteName} is provided "as is" without warranties of any kind. We are not liable
            for any damages arising from your use of the platform, including but not limited to
            decisions made based on job listing information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">7. Termination</h2>
          <p>
            We may suspend or terminate your access to {config.siteName} at our discretion if you
            violate these terms. You may delete your account at any time.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform after changes
            constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">9. Contact</h2>
          <p>
            Questions about these terms? Contact us at{' '}
            <a href="mailto:legal@buildthekingdom.com" className="text-primary-600 hover:underline">legal@buildthekingdom.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
