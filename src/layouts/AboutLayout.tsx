// src/layouts/AboutLayout.tsx

import {
  Box,
  Container,
  Toolbar,   // ← aggiungi import
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

interface AboutLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AboutLayout = ({ children, title, subtitle }: AboutLayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>

      {/* ✅ Spacer automatico per la AppBar fixed della HeroPage/PublicNavbar */}
      <Toolbar />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#6D243C',
              mb: 2,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#333333',
                mb: 4,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {children}
      </Container>

    </Box>
  );
};

export default AboutLayout;