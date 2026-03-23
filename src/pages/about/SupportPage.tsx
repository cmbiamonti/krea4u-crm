// src/pages/about/SupportPage.tsx

import { useState } from 'react'
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Favorite,
  Close,
  AccountBalance,
  ContentCopy,
  CheckCircle,
  Code,
  Storage,
  Speed,
  Build,
} from '@mui/icons-material'
import AboutLayout  from '@/layouts/AboutLayout'
import Footer       from '@/components/layout/Footer'
import PublicNavbar from '@/components/layout/PublicNavbar'

const SupportPage = () => {
  const [donationDialogOpen, setDonationDialogOpen] = useState(false)
  const [copiedField, setCopiedField]               = useState<string | null>(null)

  const bankDetails = {
    beneficiario: 'Carlo Maria Biamonti',
    iban:    'IT22 B036 6901 6008 1191 5771 637',
    bic:     'REVOITM2',
    banca:   'Revolut Bank UAB - Via Dante 7 - 20123 Milano',
    causale: "Krea4u - La Stanza dell'Arte - Donazione sviluppo CRM",
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const CopyButton = ({ field, value }: { field: string; value: string }) => (
    <IconButton size="small" onClick={() => handleCopy(value, field)}>
      {copiedField === field
        ? <CheckCircle sx={{ color: '#00B050', fontSize: 20 }} />
        : <ContentCopy sx={{ fontSize: 20 }} />
      }
    </IconButton>
  )

  return (
    <Box>
      <PublicNavbar />

      <Box sx={{ pt: { xs: '72px', sm: '88px', md: '104px' } }} />

      <AboutLayout
        title="Sostieni Krea4u CRM"
        subtitle="Aiutaci a Migliorare lo Strumento"
      >
        <Box sx={{ mb: { xs: 6, md: 8 } }}>

          <Typography
            variant="body1"
            sx={{
              mb:        4,
              lineHeight: 1.8,
              color:     '#333333',
              fontSize:  { xs: '1rem', md: '1.1rem' },
              textAlign: 'justify',
            }}
          >
            <strong>Krea4u CRM</strong> è uno strumento gratuito, progettato e sviluppato
            per supportare curatori d'arte, galleristi e professionisti del settore nella
            organizzazione del loro lavoro quotidiano.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb:        4,
              lineHeight: 1.8,
              color:     '#333333',
              fontSize:  { xs: '1rem', md: '1.1rem' },
              textAlign: 'justify',
            }}
          >
            Il progetto è mantenuto senza finanziamenti istituzionali. Le donazioni ci
            permettono di coprire i costi di infrastruttura e dedicare più tempo allo
            sviluppo di nuove funzionalità.
          </Typography>

          {/* A cosa servono */}
          <Typography
            variant="h5"
            sx={{
              fontWeight:  600,
              color:       '#1F4788',
              mb:          3,
              mt:          5,
              fontFamily:  '"Poppins", sans-serif',
            }}
          >
            A Cosa Servono le Donazioni
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                icon:  <Storage sx={{ color: '#1976D2' }} />,
                title: 'Infrastruttura',
                color: '#1976D2',
                bg:    '#E3F2FD',
                items: ['Costi database Supabase', 'Hosting e CDN', 'Servizi email transazionali'],
              },
              {
                icon:  <Code sx={{ color: '#F57C00' }} />,
                title: 'Sviluppo',
                color: '#F57C00',
                bg:    '#FFF3E0',
                items: ['Nuove funzionalità CRM', 'Miglioramento UI/UX', 'App mobile companion'],
              },
              {
                icon:  <Speed sx={{ color: '#7B1FA2' }} />,
                title: 'Performance',
                color: '#7B1FA2',
                bg:    '#F3E5F5',
                items: ['Ottimizzazione query DB', 'Backup automatici dati', 'Scalabilità utenti'],
              },
              {
                icon:  <Build sx={{ color: '#388E3C' }} />,
                title: 'Supporto',
                color: '#388E3C',
                bg:    '#E8F5E9',
                items: ['Assistenza agli utenti', 'Documentazione e guide', 'Bug fix e aggiornamenti'],
              },
            ].map((card) => (
              <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', bgcolor: card.bg }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {card.icon}
                      <Typography variant="h6" sx={{ fontWeight: 600, color: card.color }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <List dense>
                      {card.items.map((t) => (
                        <ListItem key={t}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle sx={{ fontSize: 18, color: '#00B050' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={t}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Roadmap */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color:      '#1F4788',
              mb:         3,
              mt:         5,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Cosa Stiamo Costruendo
          </Typography>

          <Box
            sx={{
              bgcolor:      '#F0F7FF',
              border:       '1px solid #B3D4FC',
              borderRadius: 3,
              p:            { xs: 3, md: 4 },
              mb:           4,
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: '#1F4788', mb: 2 }}
                >
                  🔧 In Sviluppo Attivo
                </Typography>
                <List dense>
                  {[
                    'Modulo ArtBook per catalogazione opere',
                    'Export PDF automatico per contratti artisti',
                    'Sistema notifiche push per scadenze progetto',
                    'Dashboard analytics per curatori',
                  ].map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#1976D2' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: '#6D243C', mb: 2 }}
                >
                  🚀 Nella Roadmap
                </Typography>
                <List dense>
                  {[
                    'Marketplace per artisti e spazi espositivi',
                    'Marketplace Professionisti per logistica mostre',
                    'Aggiunta di AI Assistant',
                    'Implementazione funzionalità multi-utente',
                  ].map((item, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#C55A11' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>

          {/* CTA */}
          <Box sx={{ textAlign: 'center', my: 6 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#333333', fontWeight: 500 }}>
              Krea4u CRM è e rimarrà sempre gratuito.<br />
              Se lo usi e lo trovi utile, considera una piccola donazione. ❤️
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Favorite />}
              onClick={() => setDonationDialogOpen(true)}
              sx={{
                py:        2,
                px:        5,
                fontSize:  '1.1rem',
                fontWeight: 700,
                bgcolor:   '#C55A11',
                boxShadow: '0 4px 16px rgba(197,90,17,0.3)',
                '&:hover': {
                  bgcolor:   '#A04A0D',
                  boxShadow: '0 6px 20px rgba(197,90,17,0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Fai una Donazione
            </Button>
          </Box>

          {/* Quote */}
          <Box
            sx={{
              bgcolor:      '#F5F5F5',
              borderLeft:   '4px solid #C55A11',
              p:            { xs: 3, md: 4 },
              my:           { xs: 4, md: 6 },
              borderRadius: '0 8px 8px 0',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color:      '#333333',
                lineHeight: 1.7,
                fontStyle:  'italic',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              "Ogni donazione, grande o piccola, si traduce direttamente in ore di sviluppo,
              nuove funzionalità e un CRM migliore per tutta la comunità."
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              💎 Trasparenza sull'uso dei fondi
            </Typography>
            <Typography variant="body2">
              Il 100% delle donazioni ricevute è utilizzato per coprire i costi di
              infrastruttura e per finanziare lo sviluppo di nuove funzionalità.
            </Typography>
          </Alert>

        </Box>
      </AboutLayout>

      <Footer />

      {/* ── Dialog Donazioni ────────────────────────────────────────────────── */}
      <Dialog
        open={donationDialogOpen}
        onClose={() => setDonationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Favorite sx={{ color: '#C55A11' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dona a Krea4u CRM
              </Typography>
            </Box>
            <IconButton onClick={() => setDonationDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              bgcolor:      '#FFF8F4',
              border:       '1px solid #F5CBA7',
              borderRadius: 3,
              p:            3,
              mb:           3,
              textAlign:    'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color:      '#C55A11',
                mb:         2,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Il tuo sostegno fa la differenza
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#555', lineHeight: 1.8, textAlign: 'justify' }}
            >
              Non esiste una soglia minima: anche un piccolo gesto è un segnale
              concreto che il progetto ha valore per te.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            <AccountBalance sx={{ verticalAlign: 'middle', mr: 1 }} />
            Dati per Bonifico Bancario
          </Typography>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Le donazioni a titolo personale non sono
              fiscalmente deducibili.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: '#F5F5F5', borderRadius: 2, p: 3 }}>
            {[
              { label: 'Beneficiario', field: 'beneficiario', value: bankDetails.beneficiario, mono: false },
              { label: 'IBAN',         field: 'iban',         value: bankDetails.iban,         mono: true  },
              { label: 'BIC/SWIFT',    field: 'bic',          value: bankDetails.bic,          mono: true  },
              { label: 'Causale',      field: 'causale',      value: bankDetails.causale,      mono: false },
            ].map((row, idx, arr) => (
              <Box key={row.field}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    {row.label}
                  </Typography>
                  <Box
                    sx={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      alignItems:     'center',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight:  600,
                        fontFamily:  row.mono ? 'monospace' : 'inherit',
                        wordBreak:   'break-all',
                      }}
                    >
                      {row.value}
                    </Typography>
                    <CopyButton field={row.field} value={row.value} />
                  </Box>
                </Box>
                {idx === 1 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      Banca
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {bankDetails.banca}
                    </Typography>
                  </Box>
                )}
                {idx < arr.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              📧 Dopo il bonifico, invia una email a{' '}
              <strong>info@lastanzadellarte.it</strong> con la ricevuta e il tuo nome.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#F5F5F5' }}>
          <Button
            onClick={() => setDonationDialogOpen(false)}
            variant="outlined"
          >
            Chiudi
          </Button>
          <Button
            variant="contained"
            startIcon={<Favorite />}
            sx={{ bgcolor: '#C55A11', '&:hover': { bgcolor: '#A04A0D' } }}
          >
            Grazie per il Supporto! ❤️
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupportPage