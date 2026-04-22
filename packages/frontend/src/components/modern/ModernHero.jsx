import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, TrendingUp, Zap, Users } from 'lucide-react';

const ModernHero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '12,000+', color: 'text-primary-600' },
    { icon: Users, label: 'Companies', value: '500+', color: 'text-secondary-600' },
    { icon: TrendingUp, label: 'Success Rate', value: '94%', color: 'text-accent-600' },
  ];

  const trendingSearches = [
    'Frontend Developer',
    'Product Manager', 
    'Data Scientist',
    'UI/UX Designer',
    'DevOps Engineer'
  ];

  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary-400/20 rounded-full blur-xl animate-bounce-slow"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-accent-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-primary-400/20 rounded-full blur-xl animate-bounce-slow"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Hero Badge */}
          <div className={`inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 mb-8 transition-all duration-700 ${isVisible ? 'animate-slide-down' : 'opacity-0'}`}>
            <Zap className="w-4 h-4 text-secondary-300" />
            <span className="text-white text-sm font-medium">🚀 Find Your Dream Job Today</span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
            <span className="block">Your Next</span>
            <span className="block gradient-text bg-gradient-to-r from-white via-secondary-200 to-accent-200 bg-clip-text text-transparent">
              Career Move
            </span>
            <span className="block">Starts Here</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
            Discover opportunities at the world's most innovative companies. 
            Built for the next generation of talent.
          </p>

          {/* Search Section */}
          <div className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-600 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Job Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Location Input */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Search Button */}
                <button className="btn-primary px-8 py-4 whitespace-nowrap animate-pulse-glow">
                  Find Jobs
                </button>
              </div>

              {/* Trending Searches */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-gray-600 text-sm font-medium">Trending:</span>
                {trendingSearches.map((term, index) => (
                  <button
                    key={index}
                    className="text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30">
                  <stat.icon className={`w-8 h-8 text-white`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 text-white fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V120H1200V0C1200,0,1200,0,1200,0C1200,0,1200,0,1200,0C1156,0,1112,0,1068,10C1024,20,980,40,936,50C892,60,848,60,804,65C760,70,716,80,672,85C628,90,584,90,540,85C496,80,452,70,408,65C364,60,320,60,276,50C232,40,188,20,144,10C100,0,56,0,28,0L0,0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default ModernHero;
