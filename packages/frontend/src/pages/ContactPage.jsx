import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

export const ContactPage = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
          Have a question, suggestion, or partnership inquiry? We'd love to hear from you.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <Mail className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-400">
              General inquiries: <a href="mailto:hello@buildthekingdom.com" className="text-primary-600 hover:underline">hello@buildthekingdom.com</a>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Partnerships</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Employer or feed partner? Reach out at <a href="mailto:partners@buildthekingdom.com" className="text-primary-600 hover:underline">partners@buildthekingdom.com</a>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Send a Message</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 rounded-xl">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};
