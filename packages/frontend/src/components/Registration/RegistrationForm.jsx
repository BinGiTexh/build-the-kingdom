import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Check,
  X,
  Building2,
  MapPin,
  Phone,
  Globe,
  Users,
  Calendar,
  GraduationCap,
  Briefcase,
  Star,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleOAuthButton from '../auth/GoogleOAuthButton';

const RegistrationForm = ({ userType, onBack, onComplete }) => {
  const navigate = useNavigate();
  const { registerWithGoogle } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleError, setGoogleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleGoogleSuccess = async ({ googleToken }) => {
    setGoogleError('');
    try {
      const role = userType === 'employer' ? 'EMPLOYER' : 'JOBSEEKER';
      await registerWithGoogle(googleToken, role);
      navigate(userType === 'employer' ? '/employer/dashboard' : '/dashboard');
    } catch (error) {
      setGoogleError(error.response?.data?.error || 'Google registration failed');
    }
  };

  const handleGoogleError = (error) => {
    setGoogleError(error?.message || 'Google sign-in failed');
  };

  // Form data state
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    profileImage: null,
    
    // Job seeker specific
    education: '',
    major: '',
    graduationYear: '',
    skills: [],
    experience: '',
    resume: null,
    
    // Employer specific
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    companyDescription: '',
    logo: null
  });

  const totalSteps = 3;

  // Validation rules
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.location) newErrors.location = 'Location is required';

      if (userType === 'employer') {
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
      } else {
        if (!formData.education) newErrors.education = 'Education level is required';
        if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleSkillAdd = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(userType, formData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  // Step 1: Account Setup
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your login credentials to get started
        </p>
      </div>

      <GoogleOAuthButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="Sign up with Google"
      />

      {googleError && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {googleError}
        </p>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or register with email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`modern-input pl-10 ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`modern-input pl-10 pr-10 ${errors.password ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`modern-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Personal/Company Information
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {userType === 'employer' ? 'Company Information' : 'Personal Information'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {userType === 'employer' 
            ? 'Tell us about your company to attract the right candidates'
            : 'Help us create your professional profile'
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`modern-input pl-10 ${errors.firstName ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="John"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`modern-input ${errors.lastName ? 'border-red-500 ring-red-500' : ''}`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      {userType === 'employer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`modern-input pl-10 ${errors.companyName ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="Acme Inc."
            />
          </div>
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`modern-input pl-10 ${errors.phone ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`modern-input pl-10 ${errors.location ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="New York, NY"
            />
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
          )}
        </div>
      </div>

      {userType === 'employer' ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`modern-input ${errors.industry ? 'border-red-500 ring-red-500' : ''}`}
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Size
            </label>
            <select
              value={formData.companySize}
              onChange={(e) => handleInputChange('companySize', e.target.value)}
              className="modern-input"
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education Level
            </label>
            <select
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className={`modern-input ${errors.education ? 'border-red-500 ring-red-500' : ''}`}
            >
              <option value="">Select Education</option>
              <option value="high-school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
            {errors.education && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.education}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Graduation Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                className={`modern-input pl-10 ${errors.graduationYear ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="2024"
                min="2020"
                max="2030"
              />
            </div>
            {errors.graduationYear && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.graduationYear}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Additional Details & Files
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Final Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your profile to get the best experience
        </p>
      </div>

      {userType === 'jobseeker' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Major/Field of Study
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                className="modern-input pl-10"
                placeholder="Computer Science, Business, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Resume (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your resume here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload('resume', e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-sm"
              >
                Choose File
              </button>
              {formData.resume && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Check className="w-4 h-4 mr-1" />
                  {formData.resume.name}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Website (Optional)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="modern-input pl-10"
                placeholder="https://www.company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Description (Optional)
            </label>
            <textarea
              value={formData.companyDescription}
              onChange={(e) => handleInputChange('companyDescription', e.target.value)}
              className="modern-input resize-none"
              rows={4}
              placeholder="Tell candidates about your company culture, mission, and what makes you unique..."
            />
          </div>
        </>
      )}

      {/* Terms and Conditions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {userType === 'employer' ? 'Employer' : 'Job Seeker'} Registration
              </h1>
            </div>
            
            <div className="w-16" /> {/* Spacer */}
          </div>

          <ProgressBar />

          {/* Form Content */}
          <form className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`btn-primary flex items-center space-x-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
