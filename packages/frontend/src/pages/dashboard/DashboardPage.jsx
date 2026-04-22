import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { JobSeekerDashboard } from './JobSeekerDashboard';
import { EmployerDashboard } from './EmployerDashboard';

export const DashboardPage = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {currentUser?.profile?.name}
        </Typography>
      </Box>

      {currentUser?.role === 'EMPLOYER' ? (
        <EmployerDashboard />
      ) : (
        <JobSeekerDashboard />
      )}
    </Container>
  );
};

