// src/components/layout/Footer.tsx

import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
} from '@mui/material';
import { Facebook, Instagram, YouTube } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const PrivacyPolicyPDF      = '/documents/PrivacyPolicy.pdf';
const TerminiDiServizioPDF  = '/documents/TerminiDiServizio.pdf';
const CookiePolicyPDF       = '/documents/CookiePolicy.pdf';

/* ── Link social ── */
const SOCIAL = [
  {
    label:       'Facebook',
    href:        'https://www.facebook.com',
    icon:        <Facebook />,
    hoverColor:  '#1877F2',
    preview:     'Seguici su Facebook',
  },
  {
    label:       'Instagram',
    href:        'https://www.instagram.com/krea4u.lastanzadellarte/',
    icon:        <Instagram />,
    hoverColor:  '#E1306C',
    preview:     'Seguici su Instagram',
  },
  {
    label:       'YouTube',
    href:        'https://www.youtube.com/@cmbiamonti',
    icon:        <YouTube />,
    hoverColor:  '#FF0000',
    preview:     'Guarda i nostri video',
  },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color:   'white',
        py:      6,
        mt:      'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* ── Colonna 1 — Brand + Social ── */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'Poppins', fontWeight: 700, mb: 2 }}
            >
              Krea4u CRM
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Software gestionale progettato specificamente per curatori
              d'arte, gallerie e professionisti del settore culturale.
            </Typography>

            {/* Icone social */}
            <Box>
              {SOCIAL.map(({ label, href, icon }) => (
                <IconButton
                  key={label}
                  color="inherit"
                  aria-label={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    transition: 'opacity 0.2s, transform 0.2s',
                    '&:hover': {
                      opacity:   0.8,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* ── Colonna 2 — Spaziatore ── */}
          <Grid size={{ xs: 12, sm: 4 }}>
            {/* riservata per contenuti futuri */}
          </Grid>

          {/* ── Colonna 3 — Supporto + Documenti legali ── */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'Poppins', fontWeight: 600, mb: 2 }}
            >
              Supporto
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

              <MuiLink
                href={PrivacyPolicyPDF}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                Privacy Policy
              </MuiLink>

              <MuiLink
                href={TerminiDiServizioPDF}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                Termini di Servizio
              </MuiLink>

              <MuiLink
                href={CookiePolicyPDF}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
              >
                Cookie Policy
              </MuiLink>

              <MuiLink
                component={Link}
                to="/faq"
                color="inherit"
                underline="hover"
              >
                Q&amp;A
              </MuiLink>

              <MuiLink
                component={Link}
                to="/about/contacts"
                color="inherit"
                underline="hover"
                sx={{
                  fontWeight: 600,
                  '&:hover': { color: 'secondary.main' },
                }}
              >
                Contattaci
              </MuiLink>

            </Box>
          </Grid>

        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            mt:        4,
            pt:        3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Krea4U CRM. Tutti i diritti riservati.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;