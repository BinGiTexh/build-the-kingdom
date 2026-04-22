import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

export const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { config } = useSiteConfig();

  return (
    <AppBar position="static" sx={{ bgcolor: 'var(--color-primary-700)' }}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{
          flexGrow: 1,
          textDecoration: 'none',
          color: 'inherit'
        }}>
          {config.siteName}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/jobs">
            Find Jobs
          </Button>

          {isAuthenticated ? (
            <>
              {currentUser?.role === 'EMPLOYER' && (
                <Button color="inherit" component={RouterLink} to="/jobs/post">
                  Post Job
                </Button>
              )}
              <Button color="inherit" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
