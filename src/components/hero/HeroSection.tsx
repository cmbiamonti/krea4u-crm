// src/components/hero/HeroSection.tsx

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const YOUTUBE_VIDEO_ID = '0SMdaChkdz0';

const buildYouTubeEmbedUrl = (videoId: string, autoplay = true) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?` +
  new URLSearchParams({
    autoplay:       autoplay ? '1' : '0',
    rel:            '0',
    modestbranding: '1',
    playsinline:    '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    color:          'white',
  }).toString()

const OCRE_GOLD = '#D4A843'

// ─────────────────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const navigate = useNavigate()
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const handleCloseTutorial = () => setTutorialOpen(false)

  const backgroundConfig = {
    // ✅ type impostato su 'image' per usare il nuovo sfondo
    type: 'image' as 'gradient' | 'image' | 'solid' | 'video',

    gradient: 'linear-gradient(135deg, #265F82 50%, #23799E 100%)',

    image: {
      // ✅ NUOVO: percorso immagine di sfondo salvata in public/images/
      url:      '/images/hero-background.jpg',
      // Overlay scuro semi-trasparente per leggibilità del testo
      // Abbassa l'opacità (es: 0.25) per vedere più l'immagine
      // Alzala (es: 0.55) per testo più leggibile
      overlay:  'rgba(10, 10, 15, 0.25)',
      position: 'center',
      size:     'cover',
    },

    solid: '#265F82',

    video: {
      url:           '/documents/bg_video.mp4',
      overlay:       'rgba(30, 10, 30, 0.40)',
      fallbackImage: 'https://idydndbhmrieyrpddljf.supabase.co/storage/v1/object/sign/Support_images/Gemini_Generated_Image_om6jcqom6jcqom6j.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMTExNjNmZC04YWY2LTQyOWUtYTgwMC01YWQ2YzhkZmM4YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTdXBwb3J0X2ltYWdlcy9HZW1pbmlfR2VuZXJhdGVkX0ltYWdlX29tNmpjcW9tNmpjcW9tNmoucG5nIiwiaWF0IjoxNzY5NDI4Mzk1LCJleHAiOjE4MzI1MDAzOTV9.qVNrkM5aecwlyuvPyQ_w_aTooh7YjjLrCUvRYEvW6tU',
    },
  }

  const isMediaBackground =
    backgroundConfig.type === 'image' || backgroundConfig.type === 'video'

  const getBackgroundStyle = () => {
    switch (backgroundConfig.type) {
      case 'gradient':
        return { background: backgroundConfig.gradient }
      case 'image':
        return {
          backgroundImage:    `linear-gradient(${backgroundConfig.image.overlay}, ${backgroundConfig.image.overlay}), url(${backgroundConfig.image.url})`,
          backgroundPosition: backgroundConfig.image.position,
          backgroundSize:     backgroundConfig.image.size,
          backgroundRepeat:   'no-repeat',
          // ✅ 'scroll' invece di 'fixed' per compatibilità iOS Safari
          // 'fixed' (parallax) non funziona su iPhone/iPad
          backgroundAttachment: 'scroll',
        }
      case 'solid':
        return { backgroundColor: backgroundConfig.solid }
      case 'video':
        return { backgroundColor: '#0a1628' }
      default:
        return { background: backgroundConfig.gradient }
    }
  }

  return (
    <Box
      sx={{
        ...getBackgroundStyle(),
        color:    'white',
        py:       { xs: 8, md: 15 },
        position: 'relative',
        overflow: 'hidden',
        // ✅ Altezza minima per valorizzare l'immagine di sfondo
        minHeight: { xs: '100vh', md: '90vh' },
      }}
    >
      {/* ── VIDEO BACKGROUND ────────────────────────────────────────────── */}
      {backgroundConfig.type === 'video' && (
        <>
          <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            {...(backgroundConfig.video.fallbackImage && {
              poster: backgroundConfig.video.fallbackImage,
            })}
            sx={{
              position:  'absolute',
              top:       '30%',
              left:      '50%',
              transform: 'translate(-50%, -50%)',
              minWidth:  '130%',
              minHeight: '100%',
              width:     'auto',
              height:    'auto',
              objectFit: 'cover',
              zIndex:    0,
            }}
          >
            <source src={backgroundConfig.video.url} type="video/mp4" />
          </Box>

          <Box
            sx={{
              position:        'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: backgroundConfig.video.overlay,
              zIndex:          0,
            }}
          />
        </>
      )}

      {/* ── Elementi decorativi ──────────────────────────────────────────── */}
      <Box
        sx={{
          position:     'absolute',
          top: -50, right: -50,
          width: 300, height: 300,
          borderRadius: '50%',
          bgcolor:      '#FFFFFF1A',
          zIndex:       0,
        }}
      />
      <Box
        sx={{
          position:     'absolute',
          bottom: -100, left: -100,
          width: 400, height: 400,
          borderRadius: '50%',
          bgcolor:      '#FFFFFF0D',
          zIndex:       0,
        }}
      />

      {/* ── Contenuto principale ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>

          <Typography
            variant="h1"
            sx={{
              fontSize:   { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb:         3,
              lineHeight: 1.2,
              textShadow: isMediaBackground
                ? '2px 2px 4px rgba(0,0,0,0.3)'
                : 'none',
            }}
          >
            KREA4U
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize:   { xs: '2.5rem', md: '2rem' },
              fontWeight: 800,
              mb:         3,
              lineHeight: 1.6,
              textShadow: isMediaBackground
                ? '2px 2px 4px rgba(0,0,0,0.3)'
                : 'none',
            }}
          >
            Il CRM del Curatore.
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb:         5,
              opacity:    0.95,
              fontWeight: 400,
              lineHeight: 1.8,
              textShadow: isMediaBackground
                ? '1px 1px 2px rgba(0,0,0,0.3)'
                : 'none',
            }}
          >
            Un software gestionale progettato specificamente per curatori d'arte,
            galleristi e professionisti del settore curatoriale.
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
                px:         5,
                py:         2,
                fontSize:   '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor:   '#FFFFFFE6',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
                boxShadow:  isMediaBackground
                  ? '0 4px 12px rgba(0,0,0,0.2)'
                  : 'none',
              }}
            >
              Registrati Ora
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => setTutorialOpen(true)}
              sx={{
                borderColor: 'white',
                color:       'white',
                px:          4,
                py:          2,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor:     '#FFFFFF1A',
                },
              }}
            >
              Guarda come funziona
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* ── Quote Section ───────────────────────────────────────────────── */}
      <Container
        maxWidth="xl"
        sx={{ position: 'relative', zIndex: 1, mt: { xs: 6, md: 8 } }}
      >
        <Box
          sx={{
            bgcolor:      'transparent',
            p:            { xs: 2, md: 3 },
            px:           { xs: 3, md: 6 },
            mx:           'auto',
            maxWidth:     '1700px',
            textAlign:    'center',
            borderRadius: isMediaBackground ? 2 : 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color:      'white',
              lineHeight: 1.6,
              fontStyle:  'italic',
              fontFamily: '"Poppins", sans-serif',
              fontSize:   { xs: '0.95rem', md: '1.15rem' },
              textShadow: isMediaBackground
                ? '1px 1px 2px rgba(0,0,0,0.5)'
                : 'none',
            }}
          >
            Uno strumento che parli il linguaggio del mondo dell'arte
            <br /><br />
            Costruito attorno ai flussi di lavoro reali di chi organizza mostre,
            gestisce artisti e coordina progetti espositivi. Ogni funzione è pensata
            per ridurre il tempo dedicato alla burocrazia e aumentare quello per il
            lavoro curatoriale.
          </Typography>
        </Box>
      </Container>

      {/* ══════════════════════════════════════════════════════════════════
          BRAND FOOTER — Logo + "La Stanza dell'Arte" → link esterno
      ══════════════════════════════════════════════════════════════════ */}
      <Container
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 1, mt: { xs: 6, md: 10 } }}
      >
        <Box
          sx={{
            display:        'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            component="a"
            href="https://www.lastanzadellarte.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display:     'flex',
              alignItems:  'flex-end',
              gap:         { xs: 1.5, md: 2 },
              textDecoration: 'none',
              cursor:         'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                filter:    'brightness(1.15)',
              },
              '&:focus-visible': {
                outline:      `2px solid ${OCRE_GOLD}`,
                outlineOffset: '6px',
                borderRadius:  '6px',
              },
            }}
          >
            {/* ── Logo ─────────────────────────────────────────────── */}
            <Box
              component="img"
              src="/images/logo-stanza-arte.png"
              alt="La Stanza dell'Arte — vai al sito"
              sx={{
                height:    { xs: '52px', md: '68px' },
                width:     'auto',
                objectFit: 'contain',
                filter:    'drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
                mb:        '2px',
              }}
            />

            {/* ── Nome brand ───────────────────────────────────────── */}
            <Typography
              component="span"
              sx={{
                color:         OCRE_GOLD,
                fontWeight:    700,
                fontFamily:    '"Poppins", sans-serif',
                fontSize:      { xs: '1.35rem', md: '1.75rem' },
                letterSpacing: '0.02em',
                lineHeight:    1,
                mb:            '2px',
                textShadow:    '0 2px 8px rgba(0,0,0,0.40)',
              }}
            >
              La Stanza dell'Arte
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* ══════════════════════════════════════════════════════════════════
          DIALOG TUTORIAL — YouTube embed — FULLWIDTH
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={tutorialOpen}
        onClose={handleCloseTutorial}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor:      '#000',
            borderRadius: { xs: 0, md: 2 },
            overflow:     'hidden',
            boxShadow:    '0 24px 60px rgba(0,0,0,0.6)',
            m:            { xs: 0, md: 2 },
            width:        { xs: '100%', md: 'calc(100% - 32px)' },
            maxHeight:    'none',
          },
        }}
      >
        {/* Header dialog */}
        <Box
          sx={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            px:      2,
            py:      1,
            bgcolor: '#111',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: 'white', fontWeight: 600 }}
          >
            Tutorial — Krea4u CRM
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              component="a"
              href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              sx={{
                color:          'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize:       '0.75rem',
                '&:hover': { color: 'rgba(255,255,255,0.9)' },
              }}
            >
              Apri su YouTube ↗
            </Typography>

            <IconButton
              onClick={handleCloseTutorial}
              size="small"
              sx={{ color: 'white' }}
              aria-label="Chiudi tutorial"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Iframe YouTube */}
        <DialogContent sx={{ p: 0, bgcolor: '#000', lineHeight: 0 }}>
          <Box
            sx={{
              position:    'relative',
              width:       '100%',
              aspectRatio: '16 / 9',
              bgcolor:     '#000',
              maxHeight:   'calc(100vh - 48px)',
              display:     'flex',
              alignItems:  'flex-end',
              overflow:    'hidden',
            }}
          >
            {tutorialOpen && (
              <Box
                key={String(tutorialOpen)}
                component="iframe"
                src={buildYouTubeEmbedUrl(YOUTUBE_VIDEO_ID, true)}
                title="Tutorial Krea4u CRM"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sx={{
                  position:  'relative',
                  width:     '100%',
                  height:    '100%',
                  minHeight: '100%',
                  border:    'none',
                  outline:   'none',
                  display:   'block',
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default HeroSection