import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/bellavue png.png';
import { useAuth } from '../App';

interface MainLayoutProps {
  children: React.ReactNode;
  onExportData?: () => void;
  onImportData?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ children, onExportData, onImportData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      if (onImportData) {
        onImportData(e as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleLogout = () => {
    // Direkte Logout-Funktion als Fallback
    localStorage.removeItem('bellavue-role');
    window.location.reload(); // Seite neu laden um zum Login zurückzukehren
  };

  const menuItems = [
    {
      text: 'Kalender',
      icon: <CalendarIcon />,
      path: '/',
    },
    {
      text: 'Kunden',
      icon: <PeopleIcon />,
      path: '/customers',
    },
    {
      text: 'Events',
      icon: <EventIcon />,
      path: '/events',
    },
  ];

  const drawer = (
    <>
      <Toolbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6, mb: 1 }}>
        <img src={logo} alt="Bellavue Logo" style={{ height: 96, width: 96, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
      </Box>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <img src={logo} alt="Bellavue Logo" style={{ height: 40, width: 40, borderRadius: '50%', background: '#fff' }} />
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: { xs: 'none', md: 'block' }
            }}>
              Bellavue Eventzentrum
            </Typography>
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontSize: '1rem',
              display: { xs: 'block', md: 'none' }
            }}>
              Bellavue
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" color="inherit" sx={{ 
              mr: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {role === 'admin' ? 'Admin' : role === 'mitarbeiter' ? 'Mitarbeiter' : ''}
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout} 
              sx={{ 
                ml: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Logout
            </Button>
            {onExportData && onImportData && (
              <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
                            <Button
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={onExportData}
              size="small"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Export
            </Button>
            <Button
              color="inherit"
              startIcon={<UploadIcon />}
              onClick={handleImportClick}
              size="small"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Import
            </Button>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: 0,
            left: 0,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: 0,
            left: 0,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          transition: 'margin-left 0.3s, width 0.3s',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 