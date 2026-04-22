import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  Work,
  AttachMoney,
  Business,
  Schedule,
  ArrowBack
} from '@mui/icons-material';
import api from '../services/api';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (job.externalApplyUrl) {
      window.location.href = `/go/apply/${job.id}`;
    } else {
      alert('Application functionality coming soon!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
      </Container>
    );
  }

  const requirements = Array.isArray(job.requirements)
    ? job.requirements
    : (job.requirements || '').split('\n').filter(Boolean);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/jobs')}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {job.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Business sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    {job.company}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  <Chip
                    icon={<Work />}
                    label={job.type.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {job.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <List dense>
                {requirements.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>

              {job.skills?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Required Skills
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {job.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </>
              )}

              {job.feedSource && (
                <Chip label={`Sourced via ${job.feedSource}`} color="secondary" variant="outlined" sx={{ mb: 2 }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleApply}
              sx={{ mb: 2 }}
            >
              {job.externalApplyUrl ? 'Apply on Company Site' : 'Apply for this Job'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
            >
              Save Job
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Posted Date
              </Typography>
              <Typography variant="body1">
                {new Date(job.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            {job.salary?.min && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Salary Range
                </Typography>
                <Typography variant="body1">
                  ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Job Type
              </Typography>
              <Typography variant="body1">
                {job.type?.replace('_', ' ')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
