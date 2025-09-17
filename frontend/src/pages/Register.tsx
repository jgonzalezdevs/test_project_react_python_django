import { useState, type FormEvent } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register as registerUser } from '../store/authSlice';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Register = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(registerUser(form as any));
    if ((res as any).meta.requestStatus === 'fulfilled') {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm" className="flex items-center justify-center min-h-screen">
      <Paper elevation={3} className="p-6 w-full">
        <Typography variant="h5" component="h1" className="mb-4 text-center">Create account</Typography>
        {error && <Alert severity="error" className="mb-3" role="alert">{String(error)}</Alert>}
        <Box component="form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="register form">
          <TextField name="username" label="Username" value={form.username} onChange={handleChange} required inputProps={{ 'aria-label': 'username' }} />
          <TextField name="email" label="Email" value={form.email} onChange={handleChange} type="email" inputProps={{ 'aria-label': 'email' }} />
          <TextField name="first_name" label="First name" value={form.first_name} onChange={handleChange} inputProps={{ 'aria-label': 'first_name' }} />
          <TextField name="last_name" label="Last name" value={form.last_name} onChange={handleChange} inputProps={{ 'aria-label': 'last_name' }} />
          <TextField name="password" type="password" label="Password" value={form.password} onChange={handleChange} required inputProps={{ 'aria-label': 'password' }} />
          <TextField name="password2" type="password" label="Confirm Password" value={form.password2} onChange={handleChange} required inputProps={{ 'aria-label': 'confirm_password' }} />
          <Box className="md:col-span-2">
            <Button type="submit" variant="contained" disabled={loading} aria-label="create account">
              {loading ? 'Creating...' : 'Create account'}
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" className="mt-4 text-center">
          Already have an account? <Link component={RouterLink} to="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
