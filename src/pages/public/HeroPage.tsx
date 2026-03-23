// src/pages/public/HeroPage.tsx

import { lazy, Suspense, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Skeleton,
  Stack,
  Grid,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useNavigate } from 'react-router-dom'

import HeroSection from '@/components/hero/HeroSection'
import Footer      from '@/components/layout/Footer'
import PublicNavbar from '@/components/layout/PublicNavbar'

const HowItWorks = lazy(() => import('@/components/hero/HowItWorks'))

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SectionSkeleton = () => (
  <Box sx={{ py: 10 }}>
    <Container maxWidth="lg">
      <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="text" width="40%" height={40} sx={{ mx: 'auto', mb: 6 }} />
      <Box sx={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={300}
            sx={{ flex: 1, borderRadius: 2 }}
          />
        ))}
      </Box>
    </Container>
  </Box>
)

// ── Sezione Donazioni ─────────────────────────────────────────────────────────
const DonationSection = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        py: 10,
        background:   'linear-gradient(135deg, #fff8f0 0%, #fff0fa 100%)',
        borderTop:    '1px solid',
        borderBottom: '1px solid',
        borderColor:  'divider',
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">

          {/* Icona */}
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width:        80,
                height:       80,
                borderRadius: '50%',
                bgcolor:      '#f0c54d',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                mx:           'auto',
                boxShadow:    '0 4px 20px rgba(211,47,47,0.25)',
              }}
            >
              <FavoriteIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Grid>

          {/* Testo */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Il progetto è gratuito — e con il tuo aiuto cresce meglio
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Krea4u_CRM è uno strumento libero, costruito con passione per la comunità
              dell'arte. Se lo trovi utile, una donazione — anche piccola — ci permette
              di migliorarlo, mantenerlo online e aggiungere nuove funzionalità.
              Ogni contributo fa la differenza. Grazie di cuore. ❤️
            </Typography>
          </Grid>

          {/* CTA */}
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ textAlign: { xs: 'center', md: 'right' } }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<FavoriteIcon />}
              onClick={() => navigate('/about/support')}
              sx={{
                bgcolor:      '#f0c54d',
                color:        'white',
                px:           4,
                py:           1.8,
                fontSize:     '1rem',
                fontWeight:   700,
                borderRadius: 3,
                boxShadow:    '0 4px 14px rgba(211,47,47,0.4)',
                '&:hover': {
                  bgcolor:   'error.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(211,47,47,0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sostienici
            </Button>
          </Grid>

        </Grid>
      </Container>
    </Box>
  )
}

// ── Pagina principale ─────────────────────────────────────────────────────────
const HeroPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => import('@/components/hero/HowItWorks'), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <Box>
      <PublicNavbar />

      {/* Offset AppBar */}
      <Box sx={{ pt: { xs: '72px', sm: '88px', md: '104px' } }} />

      {/* Hero */}
      <HeroSection />

      {/* How It Works */}
      <Box id="how-it-works">
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorks />
        </Suspense>
      </Box>

      {/* Donazioni */}
      <DonationSection />

      {/* Call To Action */}
      <Box
        sx={{
          bgcolor:   'primary.main',
          color:     'white',
          py:        10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            Pronto a Iniziare?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Unisciti alla comunità di Krea4u e trasforma la tua visione artistica in realtà
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor:    'white',
                color:      'primary.main',
                px:         6,
                py:         2,
                fontSize:   '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor:   'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Registrati Gratis
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color:       'white',
                px:          6,
                py:          2,
                fontSize:    '1.1rem',
                fontWeight:  600,
                '&:hover': {
                  bgcolor:   'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Accedi al CRM
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  )
}

export default HeroPage