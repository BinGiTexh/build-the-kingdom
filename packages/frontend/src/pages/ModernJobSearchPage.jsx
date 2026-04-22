import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  Bookmark,
  Share2,
  TrendingUp,
  Building2,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  Globe,
  Users,
  Calendar,
  Zap,
  Heart,
  ExternalLink,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ModernJobSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState([50000, 150000]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (location) params.append('location', location);
      if (jobType) params.append('type', jobType);
      const response = await api.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs || []);
      setTotalJobs(response.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const formatSalary = (min, max) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  };

  const JobCard = ({ job }) => (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        },
        border: job.urgent ? '2px solid #ff6b35' : '1px solid #e0e0e0'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={job.logo} 
              alt={job.company}
              sx={{ width: 48, height: 48 }}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="h3">
                  {job.title}
                </Typography>
                {job.verified && <Verified color="primary" sx={{ fontSize: 16 }} />}
                {job.urgent && (
                  <Chip 
                    label="URGENT" 
                    size="small" 
                    color="error" 
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography color="text.secondary">
                  {job.company}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 14, color: '#ffc107' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.rating}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small"
              onClick={() => handleSaveJob(job.id)}
              color={savedJobs.has(job.id) ? 'primary' : 'default'}
            >
              {savedJobs.has(job.id) ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
            <IconButton size="small">
              <Share />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
            {job.remote && <RemoteWork sx={{ fontSize: 16, color: 'primary.main' }} />}
          </Box>
          <Chip 
            icon={<Work />}
            label={job.type.replace('_', ' ')}
            size="small"
            variant="outlined"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight="bold">
              {formatSalary(job.salary.min, job.salary.max)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {job.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {job.skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{ mr: 1, mb: 1 }}
              variant="outlined"
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Posted {job.postedDays} days ago • {job.applicants} applicants
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" size="small">
          Apply Now
        </Button>
        <Button variant="outlined" size="small">
          View Details
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Find Your Dream Job
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover opportunities from top companies worldwide
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobType}
                  label="Job Type"
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="FULL_TIME">Full Time</MenuItem>
                  <MenuItem value="PART_TIME">Part Time</MenuItem>
                  <MenuItem value="CONTRACT">Contract</MenuItem>
                  <MenuItem value="FREELANCE">Freelance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Search />}
                onClick={fetchJobs}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} md={1}>
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <Badge badgeContent={remoteOnly ? 1 : 0} color="primary">
                  <FilterList />
                </Badge>
              </IconButton>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Salary Range</Typography>
                  <Slider
                    value={salaryRange}
                    onChange={(e, newValue) => setSalaryRange(newValue)}
                    valueLabelDisplay="auto"
                    min={30000}
                    max={200000}
                    step={5000}
                    valueLabelFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={remoteOnly}
                        onChange={(e) => setRemoteOnly(e.target.checked)}
                      />
                    }
                    label="Remote jobs only"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Jobs
                </Typography>
                <Typography variant="h5" color="primary">
                  1,247
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  New This Week
                </Typography>
                <Typography variant="h5" color="success.main">
                  89
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Remote Jobs
                </Typography>
                <Typography variant="h5" color="info.main">
                  456
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trending Skills
            </Typography>
            <Stack spacing={1}>
              {['React', 'Python', 'AWS', 'TypeScript', 'Node.js'].map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  icon={<TrendingUp />}
                  clickable
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="All Jobs" />
              <Tab label="Recommended" />
              <Tab label="Recent" />
              <Tab label="Saved" />
            </Tabs>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Showing {jobs.length} of {totalJobs} jobs • Sorted by relevance
            </Typography>
          </Box>

          {loading && <Typography color="text.secondary">Loading jobs...</Typography>}

          {!loading && jobs.length === 0 && (
            <Typography color="text.secondary">No jobs found. Try adjusting your search.</Typography>
          )}

          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {/* Load More */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="outlined" size="large">
              Load More Jobs
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
