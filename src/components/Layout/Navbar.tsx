import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CRYPTO TRACKER
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Typography
              component={Link}
              to="/dashboard"
              sx={{
                mx: 2,
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  color: '#4CAF50',
                },
              }}
            >
              Dashboard
            </Typography>
            <Typography
              component={Link}
              to="/portfolio"
              sx={{
                mx: 2,
                color: 'white',
                textDecoration: 'none',
                '&:hover': {
                  color: '#4CAF50',
                },
              }}
            >
              Portfolio
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
