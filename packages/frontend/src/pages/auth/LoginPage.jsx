import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';
import { handleApiError } from '../../utils/errorHandling';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';

const ROLE_LABELS = {
  JOBSEEKER: 'Job Seeker',
  EMPLOYER: 'Employer'
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [selectedRole, setSelectedRole] = useState('JOBSEEKER');

  const handleGoogleSuccess = async ({ googleToken }) => {
    setApiError('');
    try {
      await loginWithGoogle(googleToken, selectedRole);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(handleApiError(error, 'Google login failed'));
    }
  };

  const handleGoogleError = (error) => {
    setApiError(error?.message || 'Google login failed');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(handleApiError(error, 'Login failed'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1.5 }}>
              I am signing in as:
            </Typography>
            <ToggleButtonGroup
              value={selectedRole}
              exclusive
              onChange={(_, value) => value && setSelectedRole(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="JOBSEEKER">Job Seeker</ToggleButton>
              <ToggleButton value="EMPLOYER">Employer</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <GoogleOAuthButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={`Continue with Google as ${ROLE_LABELS[selectedRole]}`}
          />

          <Divider sx={{ my: 3 }}>or</Divider>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

