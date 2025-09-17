import { useState, type FormEvent } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/authSlice';
import { Navigate, useLocation, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const dispatch = useAppDispatch();
  const { tokens, loading, error } = useAppSelector((s) => s.auth);
  const location = useLocation() as any;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname ?? '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await dispatch(login({ username, password }));
  };

  if (tokens) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container maxWidth="xs" className="flex items-center justify-center min-h-screen">
      <Paper elevation={3} className="p-6 w-full">
        <Typography variant="h5" component="h1" className="mb-4 text-center">Sign in</Typography>
        {error && <Alert severity="error" className="mb-3" role="alert">{String(error)}</Alert>}
        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="login form">
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            inputProps={{ 'aria-label': 'username' }}
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ 'aria-label': 'password' }}
          />
          <Button type="submit" variant="contained" disabled={loading} aria-label="sign in">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
        <Typography variant="body2" className="mt-4 text-center">
          No account? <Link component={RouterLink} to="/register">Register</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
