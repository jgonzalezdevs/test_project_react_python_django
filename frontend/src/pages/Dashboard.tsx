import { Card, CardActions, CardContent, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const Dashboard = () => {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="space-y-6">
      <Typography variant="h5" component="h2">Welcome, {user?.first_name || user?.username}!</Typography>
      <Typography variant="body1">Your role: <strong>{user?.role}</strong></Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardContent>
            <Typography variant="h6" className="mb-1">Projects</Typography>
            <Typography variant="body2" className="text-gray-600">Manage your projects and assignments.</Typography>
          </CardContent>
          <CardActions>
            <Button component={RouterLink} to="/projects" variant="contained" size="small">Open Projects</Button>
          </CardActions>
        </Card>
        <Card className="shadow-md">
          <CardContent>
            <Typography variant="h6" className="mb-1">Tasks</Typography>
            <Typography variant="body2" className="text-gray-600">Track tasks and add comments.</Typography>
          </CardContent>
          <CardActions>
            <Button component={RouterLink} to="/tasks" variant="contained" size="small">Open Tasks</Button>
          </CardActions>
        </Card>
        <Card className="shadow-md">
          <CardContent>
            <Typography variant="h6" className="mb-1">Notifications</Typography>
            <Typography variant="body2" className="text-gray-600">Keep up with important updates.</Typography>
          </CardContent>
          <CardActions>
            <Button component={RouterLink} to="/notifications" variant="contained" size="small">Open Notifications</Button>
          </CardActions>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
