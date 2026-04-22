import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  ExternalLink,
  Users,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';

const ModernJobCard = ({ job = {} }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Default job data for demo
  const defaultJob = {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $150k',
    postedTime: '2 hours ago',
    logo: null,
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    description: 'Join our innovative team building the future of web development...',
    applicants: 45,
    featured: true,
    remote: true,
    companyRating: 4.8
  };

  const jobData = { ...defaultJob, ...job };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    // Handle apply logic
    console.log('Applying to job:', jobData.id);
  };

  return (
    <div 
      className={`job-card group cursor-pointer relative overflow-hidden ${
        jobData.featured ? 'ring-2 ring-accent-200 shadow-accent-100/50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      {jobData.featured && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="w-3 h-3 fill-current" />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Company Logo */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {jobData.logo ? (
              <img src={jobData.logo} alt={jobData.company} className="w-full h-full rounded-xl object-cover" />
            ) : (
              jobData.company.charAt(0)
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
              {jobData.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{jobData.company}</span>
              {jobData.companyRating && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current text-secondary-400" />
                    <span>{jobData.companyRating}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isBookmarked 
              ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{jobData.location}</span>
            {jobData.remote && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                Remote
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{jobData.type}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{jobData.salary}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {jobData.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {jobData.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium dark:bg-primary-900/20 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
          {jobData.tags.length > 4 && (
            <span className="text-gray-500 text-xs py-1">
              +{jobData.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{jobData.applicants} applicants</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{jobData.postedTime}</span>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isHovered
              ? 'bg-primary-600 text-white transform scale-105 shadow-lg'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30'
          }`}
        >
          <span>Apply</span>
          <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      
      {/* Animated Border */}
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
        <div className="absolute inset-0.5 bg-white dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
};

export default ModernJobCard;
