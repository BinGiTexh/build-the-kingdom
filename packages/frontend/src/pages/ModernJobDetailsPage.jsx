import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Clock,
  Share2,
  Bookmark,
  CheckCircle,
  Monitor,
  ChevronRight,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useSiteConfig } from '../context/SiteConfigContext';

export const ModernJobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { config } = useSiteConfig();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
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
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const formatSalary = (salary) => {
    if (!salary?.min) return null;
    const sym = config.currencySymbol || '$';
    if (salary.max && salary.max !== salary.min) {
      return `${sym}${(salary.min / 1000).toFixed(0)}k - ${sym}${(salary.max / 1000).toFixed(0)}k`;
    }
    return `From ${sym}${(salary.min / 1000).toFixed(0)}k`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">Job not found</p>
        </div>
      </div>
    );
  }

  const companyName = job.company?.name || job.companyName || 'Unknown Company';
  const isRemote = job.location?.toLowerCase().includes('remote');
  const salary = formatSalary(job.salary);
  const skills = job.skills?.length ? job.skills : [];
  const hasApplyUrl = !!job.externalApplyUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center mb-6 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={() => navigate('/jobs')}
          className="hover:text-primary-600 transition-colors"
        >
          Jobs
        </button>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 dark:text-white font-medium truncate">{job.title}</span>
      </nav>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {job.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              {companyName}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg border transition-colors ${saved ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-700' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
            {isRemote && <Monitor className="w-4 h-4 text-primary-600 ml-1" />}
          </span>
          {job.type && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Briefcase className="w-3 h-3 inline mr-1" />
              {job.type.replace('_', ' ')}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <DollarSign className="w-4 h-4" />
              {salary}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
          {job.clickCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {job.clickCount} views
            </span>
          )}
        </div>

        {/* Apply Button */}
        {hasApplyUrl ? (
          <button
            onClick={handleApply}
            className="btn-primary px-8 py-3 inline-flex items-center gap-2"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </button>
        ) : (
          <span className="inline-block px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
            Applications closed
          </span>
        )}
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About this role</h2>
        <div
          className="prose prose-sm max-w-none dark:prose-invert job-description text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Apply CTA */}
      {hasApplyUrl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Interested in this position?</p>
          <button
            onClick={handleApply}
            className="btn-primary px-8 py-3 inline-flex items-center gap-2"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
