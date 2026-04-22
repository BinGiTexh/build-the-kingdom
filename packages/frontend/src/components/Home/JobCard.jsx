import React, { useState } from 'react';
import { 
  Bookmark, 
  Share2, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  ExternalLink,
  Star,
  Building2,
  Calendar,
  CheckCircle,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ 
  job = {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    salary: "$60,000 - $80,000",
    description: "Join our dynamic team building the next generation of web applications...",
    requirements: ["React", "JavaScript", "TypeScript", "CSS"],
    posted: "2 days ago",
    applicants: 23,
    logo: null,
    featured: false,
    urgent: false,
    matchScore: 92
  },
  variant = 'default' // 'default', 'featured', 'compact'
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const navigate = useNavigate();

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    navigate(`/jobs/${job.id}/apply`);
  };

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  };

  const getJobTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'part-time':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'contract':
        return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'internship':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleCardClick}
        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 brand-gradient rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{job.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{job.company}</p>
            </div>
          </div>
          <button onClick={handleBookmark} className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-primary-600 dark:text-primary-400' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
              {job.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(job.matchScore)}`}>
              {job.matchScore}% match
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700 hover:-translate-y-1 relative overflow-hidden ${
        job.featured ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
    >
      {/* Background decoration for featured jobs */}
      {job.featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full -translate-y-16 translate-x-16" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Company logo */}
          <div className={`w-12 h-12 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${
            job.logo ? '' : ''
          }`}>
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-8 h-8 rounded-lg" />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {job.title}
              </h3>
              {job.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium brand-gradient text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
              {job.urgent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{job.posted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button 
            onClick={handleLike}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBookmarked 
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button 
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Copy link
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Share on LinkedIn
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Share on Twitter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job details */}
      <div className="space-y-4 mb-6">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
          {job.description}
        </p>

        {/* Requirements/Skills */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 4).map((req, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full"
              >
                {req}
              </span>
            ))}
            {job.requirements.length > 4 && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                +{job.requirements.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Job meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            {job.salary && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{job.salary}</span>
              </div>
            )}
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
              {job.type}
            </span>

            {job.applicants && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{job.applicants} applicants</span>
              </div>
            )}
          </div>

          {/* Match score */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{job.matchScore}% match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Posted {job.posted}</span>
          </div>
          {job.featured && (
            <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400">
              <CheckCircle className="w-3 h-3" />
              <span>Verified company</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleApply}
          className="px-6 py-2 brand-gradient text-white font-medium text-sm rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
