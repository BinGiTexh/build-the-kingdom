import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Star,
  Target,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  return `${n}+`;
}

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Frontend Developer',
    'Marketing',
    'Data Analyst',
    'UI/UX Designer'
  ]);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { config, stats } = useSiteConfig();

  const popularSearches = [
    { term: 'Remote Jobs', icon: '🏠', trending: true },
    { term: 'Internships', icon: '📚', trending: true },
    { term: 'Part-time', icon: '⏰', trending: false },
    { term: 'Entry Level', icon: '🚀', trending: true },
    { term: 'Tech Jobs', icon: '💻', trending: false },
    { term: 'Marketing', icon: '📈', trending: true }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)];
        return updated.slice(0, 4);
      });
      navigate(`/jobs?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/jobs?q=${encodeURIComponent(suggestion)}&location=${encodeURIComponent(location)}`);
  };

  const liveStats = stats ? [
    { number: formatCount(stats.jobCount), label: 'Active Jobs', icon: Briefcase },
    { number: formatCount(stats.companyCount), label: 'Companies', icon: Building2 },
    { number: formatCount(stats.userCount), label: 'Job Seekers', icon: Users },
  ] : null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse-glow" style={{ background: `radial-gradient(circle, var(--color-primary-200), var(--color-secondary-200))` }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse-glow" style={{ animationDelay: '2s', background: `radial-gradient(circle, var(--color-secondary-200), var(--color-primary-200))` }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 animate-slide-down" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Smart Job Matching</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight animate-slide-up">
              {config.tagline.split(' ').length > 3 ? (
                <>
                  {config.tagline.split(' ').slice(0, Math.ceil(config.tagline.split(' ').length / 2)).join(' ')}
                  <br />
                  <span className="gradient-text">{config.tagline.split(' ').slice(Math.ceil(config.tagline.split(' ').length / 2)).join(' ')}</span>
                </>
              ) : (
                <span className="gradient-text">{config.tagline}</span>
              )}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover opportunities, build your career, and connect with companies that value your potential.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-4xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex flex-col md:flex-row gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex-1 relative" ref={searchRef}>
                  <div className="flex items-center">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Job title, company, or keyword..."
                      className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {showSuggestions && recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Searches</p>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(search)}
                              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                            >
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-64 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 md:border-l md:border-gray-200 md:dark:border-gray-700"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-xl flex items-center space-x-2 whitespace-nowrap"
                >
                  <span>Find Jobs</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.term)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      item.trending
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.term}</span>
                    {item.trending && <TrendingUp className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats — only shown when the API returns data */}
          {liveStats && (
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {liveStats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
