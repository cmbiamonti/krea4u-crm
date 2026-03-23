// src/pages/about/Krea4uCrmPage.tsx

import {
  Typography,
  Box,
  Button,
  Stack,
  Paper,
  Chip,
} from '@mui/material'
import {
  HowToReg,
  Send,
  CheckCircle,
  Login,
  AccessTime,
} from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import AboutLayout  from '@/layouts/AboutLayout'
import ImageGallery from '@/components/about/ImageGallery'
import Footer       from '@/components/layout/Footer'
import PublicNavbar from '@/components/layout/PublicNavbar'

// ── Sezione Registrazione ─────────────────────────────────────────────────────
const RegistrationSection = () => {
  const navigate = useNavigate()

  const steps = [
    {
      icon:  <Send sx={{ fontSize: 22, color: '#1F4788' }} />,
      title: 'Compila il modulo',
      desc:  'Invia la richiesta di accesso con i tuoi dati e una breve motivazione.',
    },
    {
      icon:  <AccessTime sx={{ fontSize: 22, color: '#C55A11' }} />,
      title: 'Valutazione',
      desc:  'Il team amministrativo esamina la richiesta entro 5 giorni lavorativi.',
    },
    {
      icon:  <CheckCircle sx={{ fontSize: 22, color: '#388E3C' }} />,
      title: 'Approvazione',
      desc:  'Se approvata, ricevi via email le credenziali di accesso al CRM.',
    },
    {
      icon:  <Login sx={{ fontSize: 22, color: '#7B1FA2' }} />,
      title: 'Primo accesso',
      desc:  'Accedi con le credenziali ricevute e inizia subito a usare Krea4u.',
    },
  ]

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F4788', mb: 2 }}>
        Registrazione
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb:        3,
          lineHeight: 1.8,
          color:     '#333333',
          fontSize:  { xs: '0.95rem', md: '1.05rem' },
          textAlign: 'justify',
        }}
      >
        L'accesso a Krea4u CRM non avviene tramite registrazione automatica.
        Per garantire la qualità della comunità e la sicurezza dei dati,
        ogni richiesta viene valutata individualmente dal team amministrativo.
        Il processo è semplice e trasparente: compila il modulo di richiesta,
        attendi la valutazione e ricevi le credenziali direttamente nella tua
        casella email.
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb:        4,
          lineHeight: 1.8,
          color:     '#333333',
          fontSize:  { xs: '0.95rem', md: '1.05rem' },
          textAlign: 'justify',
        }}
      >
        La richiesta potrebbe non essere accettata: in ogni caso riceverai
        sempre una risposta motivata entro i termini indicati.
        Non è necessario inviare documentazione aggiuntiva — il modulo online
        è sufficiente per avviare la procedura.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p:           { xs: 3, md: 4 },
          mb:          4,
          bgcolor:     '#F8F9FF',
          borderColor: '#C5D3F0',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: '#1F4788', mb: 3 }}
        >
          Come funziona il processo
        </Typography>

        <Stack spacing={2.5}>
          {steps.map((step, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width:          32,
                  height:         32,
                  borderRadius:   '50%',
                  bgcolor:        '#1F4788',
                  color:          'white',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontWeight:     700,
                  fontSize:       '0.85rem',
                  flexShrink:     0,
                }}
              >
                {i + 1}
              </Box>
              <Box sx={{ mt: 0.4, flexShrink: 0 }}>{step.icon}</Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F4788' }}>
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {step.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            mt:         3,
            pt:         2,
            borderTop:  '1px solid #C5D3F0',
            display:    'flex',
            alignItems: 'center',
            gap:        1,
            flexWrap:   'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Tempo medio di risposta:
          </Typography>
          <Chip
            label="5 giorni lavorativi"
            size="small"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          display:       'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems:    { xs: 'stretch', sm: 'center' },
          gap:           2,
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<HowToReg />}
          onClick={() => navigate('/register')}
          sx={{
            fontWeight:   700,
            fontSize:     '1rem',
            px:           5,
            py:           1.8,
            bgcolor:      '#1F4788',
            borderRadius: 2,
            boxShadow:    '0 4px 14px rgba(31,71,136,0.3)',
            '&:hover': {
              bgcolor:   '#163560',
              boxShadow: '0 6px 20px rgba(31,71,136,0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Richiedi Accesso
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ alignSelf: 'center' }}
        >
          Hai già le credenziali?{' '}
          <Box
            component={RouterLink}
            to="/login"
            sx={{
              color:           '#1F4788',
              fontWeight:      600,
              textDecoration:  'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Accedi direttamente →
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}

// ── Pagina principale ─────────────────────────────────────────────────────────
const Krea4uCrmPage = () => {
  return (
    <Box>
      <PublicNavbar />

      <Box sx={{ pt: { xs: '72px', sm: '88px', md: '104px' } }} />

      <AboutLayout title="KREA4U" subtitle="Il CRM del Curatore">
        <Box sx={{ mb: { xs: 6, md: 8 } }}>

          <Typography
            variant="body1"
            sx={{
              mb:        4,
              lineHeight: 1.8,
              color:     '#333333',
              fontSize:  { xs: '0.95rem', md: '1.05rem' },
              textAlign: 'justify',
            }}
          >
            <strong>Krea4U CRM</strong> è un software gestionale progettato specificamente
            per curatori d'arte, galleristi e professionisti del settore culturale.
            L'applicazione nasce dall'esigenza concreta di avere uno strumento che parli
            il linguaggio del mondo dell'arte, senza compromessi tra funzionalità e
            usabilità.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb:        4,
              lineHeight: 1.8,
              color:     '#333333',
              fontSize:  { xs: '0.95rem', md: '1.05rem' },
              textAlign: 'justify',
            }}
          >
            A differenza dei CRM generici, Krea4U è costruito attorno ai flussi di lavoro
            reali di chi organizza mostre, gestisce artisti e coordina progetti espositivi.
            Ogni funzione è pensata per ridurre il tempo dedicato alla burocrazia e
            aumentare quello per il lavoro curatoriale.
          </Typography>

          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#1F4788', mb: 2, mt: 4 }}
          >
            Funzionalità Principali
          </Typography>

          {[
            {
              title: 'Gestione Centralizzata del Database Artistico',
              text:  `Il sistema offre un database unificato per gestire artisti, opere d'arte e spazi
espositivi. Ogni scheda artista include informazioni biografiche complete,
portfolio visivo, storico delle collaborazioni e note private.`,
            },
            {
              title: 'Pianificazione e Organizzazione Progetti',
              text:  `Il modulo progetti permette di pianificare mostre ed eventi dall'ideazione alla
realizzazione. Il curatore può definire timeline dettagliate, assegnare
task ai collaboratori e monitorare l'avanzamento in tempo reale.`,
            },
            {
              title: 'Comunicazione e Marketing Automatizzati',
              text:  `La piattaforma include strumenti avanzati per la gestione della comunicazione.
Il sistema di newsletter permette di creare campagne email professionali con template
personalizzabili e tracciare le performance.`,
            },
            {
              title: 'Gestione Documentale Intelligente',
              text:  `Il sistema di template permette di generare automaticamente contratti, lettere di prestito,
certificati di autenticità e altri documenti ricorrenti, compilando automaticamente
i campi con i dati presenti nel database.`,
            },
            {
              title: 'Sicurezza e Privacy',
              text:  `Krea4U CRM integra avanzati protocolli di sicurezza per proteggere i dati sensibili.
Tutte le informazioni sono criptate, le comunicazioni avvengono tramite HTTPS
e il sistema implementa autenticazione a più fattori (MFA).`,
            },
          ].map((item, i) => (
            <Typography
              key={i}
              variant="body1"
              sx={{
                mb:        3,
                lineHeight: 1.8,
                color:     '#333333',
                fontSize:  { xs: '0.95rem', md: '1.05rem' },
                textAlign: 'justify',
              }}
            >
              • <strong>{item.title}:</strong> {item.text}
            </Typography>
          ))}

          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#1F4788', mb: 2, mt: 4 }}
          >
            Comunicazione Integrata
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb:        4,
              lineHeight: 1.8,
              color:     '#333333',
              fontSize:  { xs: '0.95rem', md: '1.05rem' },
              textAlign: 'justify',
            }}
          >
            Tutta la comunicazione con artisti, spazi e collaboratori avviene
            all'interno della piattaforma. Ogni progetto ha la sua chat dedicata,
            file sharing illimitato e sistema di notifiche smart.
          </Typography>

          <RegistrationSection />

          <Box
            sx={{
              bgcolor:    '#F5F5F5',
              borderLeft: '4px solid #1F4788',
              p:          { xs: 3, md: 4 },
              my:         { xs: 4, md: 6 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color:      '#1F4788',
                lineHeight: 1.6,
                fontStyle:  'italic',
              }}
            >
              Meno tempo nell'organizzazione, più tempo per la curatela.
            </Typography>
          </Box>

          <ImageGallery
            title="Galleria Screenshot"
            images={[
              { src: '/documents/images_gallery/Dashboard.png',     alt: 'Dashboard CRM'  },
              { src: '/documents/images_gallery/Gestione_Opere.png', alt: 'Gestione Opere' },
            ]}
          />

        </Box>
      </AboutLayout>

      <Footer />
    </Box>
  )
}

export default Krea4uCrmPage