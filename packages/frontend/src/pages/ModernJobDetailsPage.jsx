import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Star,
  CheckCircle,
  Globe,
  Users,
  TrendingUp,
  GraduationCap,
  Calendar,
  Shield,
  Monitor,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import api from '../services/api';

export const ModernJobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        const data = response.data;
        setJob({
          ...data,
          company: data.companyId || 'Company',
          remote: data.location?.toLowerCase().includes('remote'),
          postedDate: data.createdAt,
          requirements: typeof data.requirements === 'string'
            ? data.requirements.split('\n').filter(Boolean)
            : (data.requirements || []),
          responsibilities: [],
          niceToHave: [],
          benefits: [],
          companyInfo: { size: '-', founded: '-', industry: '-', funding: '-', description: '' },
          team: [],
          applicants: 0,
          views: data.clickCount || 0,
        });
      } catch (err) {
        console.error('Failed to load job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (job?.externalApplyUrl) {
      window.location.href = `/go/apply/${job.id}`;
    } else {
      setApplyDialogOpen(true);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <button 
          onClick={() => navigate('/jobs')}
          className="hover:text-primary-600 transition-colors"
        >
          Jobs
        </button>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="hover:text-primary-600 transition-colors cursor-pointer">
          {job.company}
        </span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">{job.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <img 
              src={job.logo} 
              alt={job.company}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                {job.verified && <CheckCircle className="w-6 h-6 text-primary-600" />}
                {job.urgent && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    URGENT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl text-gray-600 dark:text-gray-400">
                  {job.company}
                </h2>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{job.rating} company rating</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                  {job.remote && <Monitor className="w-4 h-4 text-primary-600" />}
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {job.type.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-semibold">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className={`p-2 rounded-lg border ${saved ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{job.applicants} applicants</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{job.views} views</span>
            </div>
            <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
          </div>
          <button
            onClick={handleApply}
            className="btn-primary px-8 py-3"
          >
            Apply Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                {['Job Details', 'Company', 'Team'].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(index)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === index
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    About this role
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">
                    {job.description}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{resp}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Requirements
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Nice to Have
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {job.niceToHave.map((nice, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{nice}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    About {job.company}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {job.companyInfo.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company Size</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{job.companyInfo.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Founded</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{job.companyInfo.founded}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{job.companyInfo.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Funding</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{job.companyInfo.funding}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Meet the Team
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {job.team.map((member, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        <img 
                          src={member.avatar}
                          alt={member.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3"
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={handleApply}
              className="btn-primary w-full mb-3"
            >
              Apply for this Job
            </button>
            <button
              onClick={handleSave}
              className={`w-full px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                saved 
                  ? 'bg-primary-50 border-primary-200 text-primary-600' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved' : 'Save Job'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Benefits & Perks
            </h3>
            <ul className="space-y-2">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Application Deadline
            </h3>
            <p className="text-red-600 font-semibold">
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Don't miss out on this opportunity!
            </p>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      {applyDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Apply for {job.title}
              </h3>
              <button 
                onClick={() => setApplyDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                You'll be redirected to complete your application with your resume and cover letter.
              </p>
            </div>
            <textarea
              placeholder="Tell us what excites you about this opportunity..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setApplyDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setApplyDialogOpen(false)}
                className="flex-1 btn-primary"
              >
                Continue Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
