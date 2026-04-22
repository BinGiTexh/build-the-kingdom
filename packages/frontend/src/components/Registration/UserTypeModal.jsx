import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Check, 
  ArrowRight,
  Briefcase,
  Users,
  Search,
  Star,
  MessageSquare,
  BarChart3,
  Globe,
  Zap,
  Target
} from 'lucide-react';

const UserTypeSelectionModal = ({ isOpen, onClose, onUserTypeSelect }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isOpen) return null;

  const handleSelection = (userType) => {
    setSelectedType(userType);
    setIsAnimating(true);
    
    // Add a slight delay for the selection animation
    setTimeout(() => {
      onUserTypeSelect(userType);
      setIsAnimating(false);
      setSelectedType(null);
    }, 300);
  };

  const jobSeekerFeatures = [
    { icon: Search, text: "AI-powered job matching" },
    { icon: Star, text: "Save & track applications" },
    { icon: MessageSquare, text: "Direct employer messaging" },
    { icon: BarChart3, text: "Career progress tracking" },
    { icon: Globe, text: "Remote work opportunities" },
    { icon: Zap, text: "Instant application alerts" }
  ];

  const employerFeatures = [
    { icon: Users, text: "Access to a diverse talent pool" },
    { icon: Target, text: "Advanced candidate filtering" },
    { icon: MessageSquare, text: "Direct candidate messaging" },
    { icon: BarChart3, text: "Hiring analytics & insights" },
    { icon: Star, text: "Employer branding tools" },
    { icon: Zap, text: "Fast-track hiring process" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="relative px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Choose your account type to get started
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Job Seeker Card */}
              <div 
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedType === 'jobseeker' && isAnimating
                    ? 'scale-105 shadow-2xl ring-4 ring-primary-500'
                    : 'hover:scale-105 hover:shadow-xl'
                }`}
                onClick={() => handleSelection('jobseeker')}
              >
                <div className="p-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl border-2 border-primary-200 dark:border-primary-700 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full -translate-y-16 translate-x-16" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      I'm looking for a job
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Find your dream job, connect with top employers, and launch your career
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {jobSeekerFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        Perfect for students & graduates
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer Card */}
              <div 
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedType === 'employer' && isAnimating
                    ? 'scale-105 shadow-2xl ring-4 ring-secondary-500'
                    : 'hover:scale-105 hover:shadow-xl'
                }`}
                onClick={() => handleSelection('employer')}
              >
                <div className="p-8 bg-gradient-to-br from-secondary-50 to-accent-50 dark:from-secondary-900/20 dark:to-accent-900/20 rounded-2xl border-2 border-secondary-200 dark:border-secondary-700 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-200/30 to-accent-200/30 rounded-full -translate-y-16 translate-x-16" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary-600 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      I'm hiring talent
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Connect with motivated candidates and build your dream team
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {employerFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-3 h-3 text-secondary-600 dark:text-secondary-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        For companies & recruiters
                      </span>
                      <ArrowRight className="w-5 h-5 text-secondary-600 dark:text-secondary-400 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                You can always change your account type later in settings
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <Check className="w-4 h-4" />
                <span>Free to join</span>
                <span>•</span>
                <Check className="w-4 h-4" />
                <span>No credit card required</span>
                <span>•</span>
                <Check className="w-4 h-4" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelectionModal;
