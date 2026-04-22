import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, formatJobType } from '../../utils/format';
import { handleApiError } from '../../utils/errorHandling';

export const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/api/jobs/company');
      setJobs(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Typography color="error" gutterBottom>
        {error}
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Your Job Postings</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/jobs/post')}
          >
            Post New Job
          </Button>
        </Box>
      </Grid>

      {jobs.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary" gutterBottom>
                You haven't posted any jobs yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/jobs/post')}
                sx={{ mt: 2 }}
              >
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        jobs.map(job => (
          <Grid item xs={12} key={job.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {job.location} • {formatJobType(job.type)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${job.applications?.length || 0} Applications`}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={job.status}
                        color={job.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="textSecondary">
                      Posted {formatDate(job.createdAt)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}/applications`)}
                      >
                        View Applications
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

