import React from 'react';
import ModernHero from '../components/modern/ModernHero';
import ModernJobCard from '../components/modern/ModernJobCard';
import DarkModeToggle from '../components/modern/DarkModeToggle';

const ModernDemo = () => {
  // Demo job data
  const demoJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $150k',
      postedTime: '2 hours ago',
      tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      description: 'Join our innovative team building the future of web development with cutting-edge technologies and modern practices.',
      applicants: 45,
      featured: true,
      remote: true,
      companyRating: 4.8
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$110k - $140k',
      postedTime: '5 hours ago',
      tags: ['Product Strategy', 'Analytics', 'Agile', 'Leadership'],
      description: 'Lead product development from conception to launch, working with cross-functional teams to deliver exceptional user experiences.',
      applicants: 32,
      featured: false,
      remote: false,
      companyRating: 4.5
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$90k - $120k',
      postedTime: '1 day ago',
      tags: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
      description: 'Create beautiful, intuitive designs that solve real problems and delight users across web and mobile platforms.',
      applicants: 28,
      featured: true,
      remote: true,
      companyRating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Fixed Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <DarkModeToggle />
      </div>

      {/* Hero Section */}
      <ModernHero />

      {/* Jobs Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured <span className="gradient-text">Opportunities</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover amazing career opportunities from top companies around the world.
            </p>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoJobs.map((job) => (
              <ModernJobCard key={job.id} job={job} />
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-12">
            <button className="btn-primary">
              View All Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Built for the <span className="gradient-text">Future of Work</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Modern features designed for the next generation of job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Dark Mode Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Easy on the eyes with system-wide dark mode support that adapts to your preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Glassmorphism UI
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Modern, translucent design elements that create depth and visual interest.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Mobile-First Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Responsive design that works perfectly on all devices, from mobile to desktop.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Micro-Animations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smooth, engaging animations that provide instant visual feedback and delight.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Bold Typography
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Clear, modern font choices with excellent readability and visual hierarchy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Gradient Accents
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Eye-catching gradient elements that add energy and modern appeal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernDemo;
