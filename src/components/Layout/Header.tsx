import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Админ-панель спортивного магазина
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Typography variant="body2">
              {user.profile.firstName} {user.profile.lastName}
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

