import type { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItemButton, ListItemText, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const menu = [
    { to: '/', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, roles: ['admin', 'collaborator', 'viewer'] },
    { to: '/projects', label: 'Projects', icon: <WorkspacesIcon fontSize="small" />, roles: ['admin', 'collaborator'] },
    { to: '/tasks', label: 'Tasks', icon: <AssignmentIcon fontSize="small" />, roles: ['admin', 'collaborator'] },
    { to: '/notifications', label: 'Notifications', icon: <NotificationsIcon fontSize="small" />, roles: ['admin', 'collaborator', 'viewer'] },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Project Management Dashboard
          </Typography>
          <Box className="flex items-center gap-3">
            <Avatar sx={{ width: 32, height: 32 }}>{user?.username?.charAt(0)?.toUpperCase() ?? '?'}</Avatar>
            <Box className="hidden sm:block text-right">
              <Typography variant="body2">{user?.username}</Typography>
              <Typography variant="caption" color="inherit">{user?.role}</Typography>
            </Box>
            <IconButton color="inherit" aria-label="logout" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menu.filter((m) => m.roles.includes(user?.role ?? 'viewer')).map((m) => (
              <ListItemButton key={m.to} component={RouterLink} to={m.to} selected={location.pathname === m.to}>
                {m.icon}
                <ListItemText sx={{ ml: 1 }} primary={m.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
