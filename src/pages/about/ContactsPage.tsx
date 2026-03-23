// src/pages/about/ContactsPage.tsx

import {
  Typography,
  Box,
  Grid,
  Button,
  Divider,
} from '@mui/material'
import {
  Email,
  HelpOutline,
  InfoOutlined,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import AboutLayout  from '@/layouts/AboutLayout'
import Footer       from '@/components/layout/Footer'
import PublicNavbar from '@/components/layout/PublicNavbar'

// ── Pagina ────────────────────────────────────────────────────────────────────
const ContactsPage = () => {
  return (
    <Box>
      {/* ✅ Navbar condivisa responsive — sostituisce PublicNavbar locale */}
      <PublicNavbar />

      {/* Offset AppBar */}
      <Box sx={{ pt: { xs: '72px', sm: '88px', md: '104px' } }} />

      <AboutLayout title="Contatti" subtitle="Come Raggiungerci">
        <Box sx={{ mb: { xs: 6, md: 8 } }}>

          {/* ── Introduzione ───────────────────────────────────────────────── */}
          <Typography
            variant="body1"
            sx={{
              mb:         6,
              lineHeight: 1.9,
              color:      '#333333',
              fontSize:   { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            Per qualsiasi domanda, informazione o richiesta di supporto puoi
            contattarci direttamente via email. Risponderemo entro{' '}
            <strong>2 giorni lavorativi</strong>.
          </Typography>

          {/* ── Due card contatto ───────────────────────────────────────────── */}
          <Grid container spacing={4} sx={{ mb: 6 }}>

            {/* Informazioni generali */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p:              { xs: 3, md: 4 },
                  bgcolor:        '#F0F7FF',
                  border:         '1px solid #B3D4FC',
                  borderRadius:   3,
                  height:         '100%',
                  display:        'flex',
                  flexDirection:  'column',
                  gap:            2,
                }}
              >
                {/* Icona */}
                <Box
                  sx={{
                    width:          56,
                    height:         56,
                    borderRadius:   '50%',
                    bgcolor:        '#1F4788',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  <InfoOutlined sx={{ fontSize: 28, color: 'white' }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F4788' }}>
                  Informazioni Generali
                </Typography>

                <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8 }}>
                  Per domande sul progetto Krea4u CRM, richieste di collaborazione,
                  partnership o qualsiasi altra informazione di carattere generale.
                </Typography>

                <Divider />

                {/* Email cliccabile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ color: '#1F4788', fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scrivici a
                    </Typography>
                    <Typography
                      component="a"
                      href="mailto:info@lastanzadellarte.com"
                      sx={{
                        display:        'block',
                        color:          '#1F4788',
                        fontWeight:     700,
                        fontSize:       '1rem',
                        textDecoration: 'none',
                        '&:hover':      { textDecoration: 'underline' },
                      }}
                    >
                      info@lastanzadellarte.com
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  href="mailto:info@lastanzadellarte.com"
                  startIcon={<Email />}
                  sx={{
                    mt:           'auto',
                    bgcolor:      '#1F4788',
                    fontWeight:   600,
                    borderRadius: 2,
                    '&:hover':    { bgcolor: '#163560' },
                  }}
                >
                  Scrivi per Informazioni
                </Button>
              </Box>
            </Grid>

            {/* Supporto tecnico */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p:              { xs: 3, md: 4 },
                  bgcolor:        '#FFF3E0',
                  border:         '1px solid #FFCC80',
                  borderRadius:   3,
                  height:         '100%',
                  display:        'flex',
                  flexDirection:  'column',
                  gap:            2,
                }}
              >
                {/* Icona */}
                <Box
                  sx={{
                    width:          56,
                    height:         56,
                    borderRadius:   '50%',
                    bgcolor:        '#C55A11',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  <HelpOutline sx={{ fontSize: 28, color: 'white' }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#C55A11' }}>
                  Supporto Tecnico
                </Typography>

                <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8 }}>
                  Hai riscontrato un problema con il CRM, un bug o hai bisogno
                  di assistenza nell'utilizzo delle funzionalità? Scrivici
                  descrivendo il problema nel dettaglio.
                </Typography>

                <Divider />

                {/* Email cliccabile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ color: '#C55A11', fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Scrivici a
                    </Typography>
                    <Typography
                      component="a"
                      href="mailto:supporto@lastanzadellarte.com"
                      sx={{
                        display:        'block',
                        color:          '#C55A11',
                        fontWeight:     700,
                        fontSize:       '1rem',
                        textDecoration: 'none',
                        '&:hover':      { textDecoration: 'underline' },
                      }}
                    >
                      supporto@lastanzadellarte.com
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  href="mailto:supporto@lastanzadellarte.com"
                  startIcon={<Email />}
                  sx={{
                    mt:           'auto',
                    bgcolor:      '#C55A11',
                    fontWeight:   600,
                    borderRadius: 2,
                    '&:hover':    { bgcolor: '#A04A0D' },
                  }}
                >
                  Scrivi per Supporto
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* ── Nota tempi di risposta ──────────────────────────────────────── */}
          <Box
            sx={{
              bgcolor:      '#F5F5F5',
              borderLeft:   '4px solid #1F4788',
              borderRadius: '0 8px 8px 0',
              p:            { xs: 2.5, md: 3 },
              mb:           4,
            }}
          >
            <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.8 }}>
              <strong>Tempi di risposta:</strong> ci impegniamo a rispondere
              a tutte le email entro <strong>3 giorni lavorativi</strong>.
              Per le richieste di accesso al CRM i tempi sono di{' '}
              <strong>5 giorni lavorativi</strong> — consulta la pagina{' '}
              <Typography
                component={RouterLink}
                to="/register"
                sx={{
                  color:          '#1F4788',
                  fontWeight:     600,
                  textDecoration: 'none',
                  '&:hover':      { textDecoration: 'underline' },
                }}
              >
                Registrati
              </Typography>
              {' '}per maggiori informazioni.
            </Typography>
          </Box>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
              Hai una domanda frequente?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Prima di scriverci, controlla se la risposta è già nella nostra
              sezione Q&amp;A.
            </Typography>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/faq"
              sx={{
                fontWeight:  600,
                borderColor: '#1F4788',
                color:       '#1F4788',
                borderRadius: 2,
                px:          4,
                '&:hover': {
                  bgcolor: '#1F4788',
                  color:   'white',
                },
              }}
            >
              Vai alla sezione Q&amp;A
            </Button>
          </Box>

        </Box>
      </AboutLayout>

      <Footer />
    </Box>
  )
}

export default ContactsPage