// src/components/layout/PublicNavbar.tsx
// Navbar pubblica condivisa tra HeroPage, Krea4uCrmPage, SupportPage, ContactsPage
// ─────────────────────────────────────────────────────────────────────────────
// Desktop (≥ md): logo + links + bottoni inline
// Mobile  (< md): logo + hamburger → Drawer con menu verticale

import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon  from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'

// ── Link di navigazione ───────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Come Funziona il CRM', to: '/about/crm'      },
  { label: 'Aiutaci a migliorare', to: '/about/support'  },
  { label: 'Contatti',             to: '/about/contacts' },
]

const PublicNavbar = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const theme     = useTheme()
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  // ── Drawer mobile ─────────────────────────────────────────────────────────
  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          pt: 1,
        },
      }}
    >
      {/* Header drawer */}
      <Box
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom:   '1px solid',
          borderColor:    'divider',
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          onClick={() => setDrawerOpen(false)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
        >
          <Box
            component="img"
            src="/documents/Krea4u_logo.png"
            alt="Krea4u Logo"
            sx={{ height: 32, width: 'auto' }}
          />
          <Typography
            sx={{
              color:      'text.primary',
              fontWeight: 600,
              fontSize:   '0.95rem',
            }}
          >
            Krea4u CRM
          </Typography>
        </Box>

        <IconButton
          onClick={() => setDrawerOpen(false)}
          size="small"
          aria-label="Chiudi menu"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Voci di menu */}
      <List sx={{ pt: 1 }}>
        {NAV_LINKS.map((link) => (
          <ListItem key={link.to} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              selected={isActive(link.to)}
              sx={{
                px: 3,
                py: 1.5,
                borderLeft: isActive(link.to) ? '3px solid' : '3px solid transparent',
                borderColor: isActive(link.to) ? 'primary.main' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{
                  fontWeight: isActive(link.to) ? 700 : 500,
                  fontSize:   '0.95rem',
                  color:      isActive(link.to) ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Bottoni CTA */}
      <Box sx={{ px: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={() => { navigate('/login'); setDrawerOpen(false) }}
          sx={{ fontWeight: 600 }}
        >
          Accedi
        </Button>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => { navigate('/register'); setDrawerOpen(false) }}
          sx={{ fontWeight: 600 }}
        >
          Registrati
        </Button>
      </Box>

      {/* Footer drawer */}
      <Box
        sx={{
          mt:         'auto',
          px:         2,
          py:         2,
          borderTop:  '1px solid',
          borderColor:'divider',
          textAlign:  'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          La Stanza dell'Arte
        </Typography>
      </Box>
    </Drawer>
  )

  // ── AppBar ────────────────────────────────────────────────────────────────
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor:        'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom:   '1px solid',
          borderColor:    'divider',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px:             { xs: 2, md: 6 },
            minHeight:      { xs: 72, sm: 88, md: 104 },
          }}
        >

          {/* ── Logo ────────────────────────────────────── */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display:        'flex',
              alignItems:     'center',
              textDecoration: 'none',
              gap:            1,
              // Su mobile riduce lo spazio occupato
              maxWidth:       { xs: 'calc(100% - 56px)', md: 'auto' },
            }}
          >
            <Box
              component="img"
              src="/documents/Krea4u_logo.png"
              alt="Krea4u CRM Logo"
              sx={{
                height:    { xs: 64, sm: 80, md: 96 },
                width:     'auto',
                display:   'block',
                flexShrink: 0,
              }}
            />
            {/* Sottotitolo nascosto su mobile per risparmiare spazio */}
            <Typography
              sx={{
                color:      'grey.800',
                fontWeight: 200,
                fontSize:   { sm: '1rem', md: '1.1rem' },
                whiteSpace: 'nowrap',
                userSelect: 'none',
                // Nasconde su schermi molto piccoli
                display:    { xs: 'none', sm: 'block' },
              }}
            >
              — La Stanza dell'Arte
            </Typography>
          </Box>

          {/* ── Desktop: links + bottoni ─────────────────── */}
          {!isMobile && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  color="inherit"
                  sx={{
                    color:        isActive(link.to) ? 'primary.main' : 'text.primary',
                    fontWeight:   isActive(link.to) ? 700 : 500,
                    fontSize:     '0.85rem',
                    borderBottom: isActive(link.to) ? '2px solid' : '2px solid transparent',
                    borderColor:  isActive(link.to) ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    pb:           0.5,
                  }}
                >
                  {link.label}
                </Button>
              ))}

              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ ml: 1.5, fontWeight: 600, fontSize: '0.85rem' }}
              >
                Accedi
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                Registrati
              </Button>
            </Stack>
          )}

          {/* ── Mobile: hamburger ────────────────────────── */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Apri menu"
              sx={{
                color:   'text.primary',
                border:  '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p:       0.75,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      {isMobile && <MobileDrawer />}
    </>
  )
}

export default PublicNavbar