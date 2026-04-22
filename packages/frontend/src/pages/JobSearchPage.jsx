import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, LocationOn, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const JobSearchPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (location) params.append('location', location);
      params.append('page', page);
      const response = await api.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Your Next Job
      </Typography>

      {/* Search Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Job title, keywords..."
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Location"
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
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Jobs'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Job Results */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && jobs.length === 0 && (
        <Alert severity="info">No jobs found. Try adjusting your search.</Alert>
      )}

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} key={job.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {job.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {job.companyId || 'Company'}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Work />}
                    label={job.type?.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.location}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {job.description?.substring(0, 200)}{job.description?.length > 200 ? '...' : ''}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {(job.skills || []).map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>

                {job.salary?.min && (
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </Typography>
                )}

                {job.feedSource && (
                  <Chip label={`via ${job.feedSource}`} size="small" sx={{ mt: 1 }} color="secondary" variant="outlined" />
                )}
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" onClick={() => {
                  if (job.externalApplyUrl) {
                    window.location.href = `/go/apply/${job.id}`;
                  } else {
                    navigate(`/jobs/${job.id}`);
                  }
                }}>
                  {job.externalApplyUrl ? 'Apply on Company Site' : 'Apply Now'}
                </Button>
                <Button size="small" onClick={() => navigate(`/jobs/${job.id}`)}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Container>
  );
};
