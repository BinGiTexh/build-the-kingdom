import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

export const AboutPage = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About {config.siteName}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            {config.siteName} is a nonprofit job platform dedicated to connecting talented individuals
            with meaningful career opportunities. We believe that everyone deserves access to quality
            employment and that the right job can transform lives and communities.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Our Mission</h2>
          <p className="leading-relaxed">
            We exist to build pathways to economic empowerment by making job discovery accessible,
            transparent, and equitable. Our platform aggregates thousands of opportunities from
            employers across industries, making it easy for job seekers to find their next career move.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">How It Works</h2>
          <p className="leading-relaxed">
            {config.siteName} partners with employers and job feed providers to bring you a curated
            selection of active job listings. When you find a role that interests you, we connect you
            directly to the employer's application page — no middlemen, no hidden fees.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accessibility — job search should be free and open to all</li>
            <li>Transparency — clear information about roles, companies, and compensation</li>
            <li>Community — building economic strength from the ground up</li>
            <li>Quality — curated listings from verified employers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
