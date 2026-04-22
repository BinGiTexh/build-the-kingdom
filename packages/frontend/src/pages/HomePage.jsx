import React, { useState, useEffect } from 'react';
import HeroSection from '../components/Home/HeroSection';
import JobCard from '../components/Home/JobCard';
import {
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Zap,
  Target,
  Globe,
  Search,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    api.get('/api/jobs', { params: { limit: 4 } })
      .then(res => setFeaturedJobs(res.data.jobs || []))
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "Smart Matching",
      description: "Our algorithm matches you with jobs that fit your skills, interests, and career goals."
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your career progress and get personalized recommendations for skill development."
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Connect directly with employers and get feedback on your applications."
    },
    {
      icon: Target,
      title: "Precision Filtering",
      description: "Advanced filters help you find exactly what you're looking for — salary, location, company size, and more."
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with other job seekers, share experiences, and learn from each other."
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Access remote work opportunities from companies worldwide, not just in your local area."
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200 text-sm font-medium mb-4">
                <Star className="w-4 h-4 mr-2" />
                <span>Featured Opportunities</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Latest <span className="gradient-text">Openings</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Hand-picked opportunities from companies that value talent
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={{
                  ...job,
                  salary: job.salary?.min && job.salary?.max
                    ? `${config.currencySymbol}${(job.salary.min / 1000).toFixed(0)}K–${(job.salary.max / 1000).toFixed(0)}K`
                    : job.salary?.min ? `From ${config.currencySymbol}${(job.salary.min / 1000).toFixed(0)}K` : null,
                  company: job.company?.name || job.company || 'Company',
                  type: job.type?.replace('_', '-'),
                  posted: new Date(job.createdAt).toLocaleDateString(),
                  requirements: Array.isArray(job.skills) ? job.skills : [],
                }} />
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/jobs')}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 mx-auto"
              >
                <span>View All Jobs</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200 text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for the <span className="gradient-text">Future of Work</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform is designed to help you find the right opportunity faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="feature-card hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Find Your Next Role?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join professionals who've found their next opportunity through {config.siteName}. Your future starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>Browse Jobs</span>
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export { HomePage };
