// src/components/about/ImageGallery.tsx

import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  ZoomIn,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';

// ✅ Helper: costruisce il path assoluto verso /documents/images_gallery/
const getPublicImageUrl = (filename: string): string => {
  if (filename.startsWith('http'))    return filename;
  if (filename.startsWith('/'))       return filename;
  if (filename.startsWith('public/')) return `/${filename.slice('public/'.length)}`;
  return `/documents/images_gallery/${filename}`;
};

// ─────────────────────────────────────────────────────────────────────────────

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  title?: string;
}

const ImageGallery = ({ images, title = 'Galleria' }: ImageGalleryProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ── Lightbox state ────────────────────────────────────────────────────────
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [activeIndex,   setActiveIndex]   = useState(0);
  const [zoomed,        setZoomed]        = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setZoomed(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomed(false);
  };

  const goNext = () => {
    setZoomed(false);
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setZoomed(false);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleZoom = () => setZoomed((z) => !z);

  // Navigazione da tastiera
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
    if (e.key === 'Escape')     closeLightbox();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mb: { xs: 4, md: 6 } }}>

      {/* Titolo sezione */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: '#6D243C',
          mb: { xs: 3, md: 4 },
          fontFamily: '"Poppins", sans-serif',
          fontSize: { xs: '1.5rem', md: '2rem' },
        }}
      >
        {title}
      </Typography>

      {/* ── Griglia thumbnail ── */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {images.map((image, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'zoom-in',
                bgcolor: 'grey.100',
                '&:hover .zoom-overlay': { opacity: 1 },
                '&:hover img': {
                  transform: 'scale(1.04)',
                },
              }}
              onClick={() => openLightbox(index)}
            >
              {/* Immagine */}
              <Box
                component="img"
                src={getPublicImageUrl(image.src)}
                alt={image.alt}
                onError={(e) => {
                  console.warn(
                    `[ImageGallery] Immagine non trovata: ${getPublicImageUrl(image.src)}`
                  );
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
                sx={{
                  width: '100%',
                  height: { xs: 300, sm: 350, md: 400 },
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
              />

              {/* Overlay hover con icona zoom */}
              <Box
                className="zoom-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <ZoomIn sx={{ fontSize: 56, color: 'white', opacity: 0.9 }} />
              </Box>

              {/* Caption badge in basso */}
              {image.alt && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 2,
                    py: 1,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'white', fontStyle: 'italic' }}
                  >
                    {image.alt}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ════════════════════════════════════════════════
          LIGHTBOX
      ════════════════════════════════════════════════ */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth={false}
        fullScreen={isMobile}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        onKeyDown={handleKeyDown}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            m: { xs: 0, sm: 2 },
          },
          '& .MuiBackdrop-root': {
            bgcolor: 'rgba(0,0,0,0.92)',
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* ── Pulsante Chiudi ── */}
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <Close />
          </IconButton>

          {/* ── Contatore ── */}
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.85rem',
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            {activeIndex + 1} / {images.length}
          </Box>

          {/* ── Freccia Precedente ── */}
          {images.length > 1 && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              sx={{
                position: 'fixed',
                left: { xs: 4, sm: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          {/* ── Immagine principale zoomabile ── */}
          <Box
            onClick={toggleZoom}
            sx={{
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflow: zoomed ? 'auto' : 'hidden',
            }}
          >
            <Box
              component="img"
              src={getPublicImageUrl(images[activeIndex]?.src ?? '')}
              alt={images[activeIndex]?.alt ?? ''}
              onError={(e) => {
                console.warn('[ImageGallery Lightbox] Immagine non trovata');
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
              sx={{
                maxWidth:   zoomed ? 'none'  : '90vw',
                maxHeight:  zoomed ? 'none'  : '80vh',
                width:      zoomed ? '150%'  : 'auto',
                height:     zoomed ? 'auto'  : 'auto',
                objectFit:  'contain',
                borderRadius: zoomed ? 0 : 2,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                transition: 'transform 0.35s ease, width 0.35s ease',
                userSelect: 'none',
                WebkitUserDrag: 'none',
              }}
            />
          </Box>

          {/* ── Freccia Successiva ── */}
          {images.length > 1 && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              sx={{
                position: 'fixed',
                right: { xs: 4, sm: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}

          {/* ── Caption ── */}
          {images[activeIndex]?.alt && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 3,
                py: 1,
                bgcolor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                borderRadius: 3,
                maxWidth: '80vw',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'white', fontStyle: 'italic' }}
              >
                {images[activeIndex].alt}
              </Typography>
            </Box>
          )}

          {/* ── Dot indicators ── */}
          {images.length > 1 && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 10,
              }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => { setZoomed(false); setActiveIndex(i); }}
                  sx={{
                    width:    i === activeIndex ? 20 : 8,
                    height:   8,
                    borderRadius: 4,
                    bgcolor:  i === activeIndex
                      ? 'white'
                      : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
          )}

        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default ImageGallery;