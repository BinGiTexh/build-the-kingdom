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

export const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
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
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Applications
            </Typography>
            {applications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="textSecondary" gutterBottom>
                  You haven't applied to any jobs yet
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
                </Button>
              </Box>
            ) : (
              applications.map(application => (
                <Box
                  key={application.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    mb: 2
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="subtitle1" gutterBottom>
                        {application.job.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {application.job.company.name} • {application.job.location}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={formatJobType(application.job.type)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={application.status}
                          color={
                            application.status === 'PENDING' ? 'warning' :
                            application.status === 'ACCEPTED' ? 'success' :
                            'error'
                          }
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="textSecondary">
                        Applied {formatDate(application.createdAt)}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/jobs/${application.job.id}`)}
                      >
                        View Job
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

