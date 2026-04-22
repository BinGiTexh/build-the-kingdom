import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { useSiteConfig } from '../../context/SiteConfigContext';

export const Footer = () => {
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{
      py: 3,
      px: 2,
      mt: 'auto',
      backgroundColor: 'var(--color-primary-900)',
      color: 'white'
    }}>
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          &copy; {year} {config.siteName}. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Link color="inherit" href="/about">
            About
          </Link>
          <Link color="inherit" href="/privacy">
            Privacy Policy
          </Link>
          <Link color="inherit" href="/terms">
            Terms of Service
          </Link>
          <Link color="inherit" href="/contact">
            Contact
          </Link>
        </Box>
      </Container>
    </Box>
  );
};
