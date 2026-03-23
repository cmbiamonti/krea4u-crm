// src/pages/public/FaqPage.tsx

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import {
  AppBar,
  Toolbar,
} from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────
// Dati Q&A organizzati per categoria
// ─────────────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  emoji: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    id: 'generale',
    label: 'Generale',
    color: 'primary',
    emoji: '🎨',
    items: [
      {
        q: 'Cos\'è Krea4u CRM e a chi è rivolto?',
        a: 'Krea4u CRM è un sistema di gestione completo progettato specificamente per curatori d\'arte, gallerie e professionisti del settore culturale. È adatto a curatori indipendenti, gallerie commerciali, spazi espositivi, fondazioni e artisti che gestiscono autonomamente la propria carriera. Il sistema è scalabile e si adatta da piccole mostre personali a grandi eventi internazionali.',
      },
      {
        q: 'Krea4u CRM è gratuito?',
        a: 'Sì, Krea4u CRM è uno strumento gratuito e liberamente accessibile dopo la registrazione. Il progetto è sviluppato e mantenuto da un piccolo team di volontari. Se lo trovi utile, puoi supportarne il mantenimento e lo sviluppo con una donazione libera — anche piccola fa la differenza.',
      },
      {
        q: 'Quali sono i vantaggi principali rispetto a strumenti generici come Excel o Google Sheets?',
        a: 'Krea4u CRM è costruito specificamente per il mondo dell\'arte: gestisce schede artista con portfolio visivo, cataloga opere con metadati tecnici completi (dimensioni, medium, provenienza, valore assicurativo), pianifica mostre con timeline e budget integrati, e automatizza la generazione di documenti ricorrenti come contratti di prestito e certificati di autenticità. Tutto questo da un unico ambiente cloud, accessibile da qualsiasi dispositivo.',
      },
      {
        q: 'È necessario installare qualcosa sul mio computer?',
        a: 'No. Krea4u CRM è una web app che funziona direttamente nel browser — Chrome, Firefox, Safari ed Edge sono tutti supportati. Non è necessaria alcuna installazione. Ti basta una connessione internet e un account registrato.',
      },
      {
        q: 'I miei dati sono visibili ad altri utenti?',
        a: 'Assolutamente no. Ogni utente ha un\'area completamente isolata. Il sistema utilizza Row Level Security (RLS) su database Supabase: ogni query include automaticamente filtri che limitano l\'accesso ai soli dati di proprietà dell\'utente autenticato. I tuoi artisti, opere, progetti e contatti non sono mai accessibili da altri.',
      },
    ],
  },
  {
    id: 'artisti-opere',
    label: 'Artisti & Opere',
    color: 'secondary',
    emoji: '🖼️',
    items: [
      {
        q: 'Quante informazioni posso registrare per ogni artista?',
        a: 'La scheda artista è molto completa: dati anagrafici, nome artistico, nazionalità, biografia breve ed estesa, formazione accademica, premi e riconoscimenti, portfolio visivo con immagini multiple, informazioni di contatto (email, telefono, sito, social), note private visibili solo a te, documenti allegati (CV, portfolio PDF, contratti). Puoi anche categorizzare gli artisti per medium (pittura, scultura, fotografia, video, installazione...) e stili/movimenti.',
      },
      {
        q: 'Come funziona la catalogazione delle opere?',
        a: 'Ogni opera può essere catalogata con: titolo, anno di creazione, medium/tecnica, dimensioni (H×L×P), edizione per opere multiple, descrizione tecnica e statement artistico, note di conservazione, provenienza e storia delle esposizioni, valore di vendita e valore assicurativo, immagini multiple (frontale, dettagli, vista installazione, retro/firma) e documenti allegati (certificati di autenticità, perizie, condition report).',
      },
      {
        q: 'Posso importare un database di artisti già esistente?',
        a: 'Sì. Krea4u CRM supporta l\'importazione via CSV. Prepara un file con le colonne corrispondenti ai campi del database, caricalo, mappa le colonne e conferma. Il sistema rileva automaticamente i duplicati (match su nome o email) e ti offre le opzioni: salta duplicati, aggiorna informazioni esistenti o crea comunque.',
      },
      {
        q: 'Posso esportare i dati degli artisti?',
        a: 'Sì, dalla pagina Database Artisti puoi esportare in CSV selezionando i campi da includere (dati anagrafici, contatti, medium, stili, range di prezzo, URL immagini). Puoi esportare tutti gli artisti o solo quelli filtrati dalla ricerca corrente.',
      },
    ],
  },
  {
    id: 'progetti',
    label: 'Progetti & Mostre',
    color: 'success',
    emoji: '🏛️',
    items: [
      {
        q: 'Come si crea un nuovo progetto/mostra?',
        a: 'Krea4u CRM guida la creazione attraverso un wizard in steps: (1) Informazioni base — tipo, titolo, date, spazio espositivo; (2) inserimento Artisti partecipanti; (3) Budget preventivo articolato per categorie; (4) Timeline e task con Gantt chart; (5) Revisione e salvataggio. Puoi salvare come bozza e completare in momenti successivi.',
      },
      {
        q: 'Come funziona il modulo budget?',
        a: 'Il budget è organizzato in categorie standard (Allestimento, Trasporti, Comunicazione, Hospitality, Personale, Assicurazioni, Spazio, Imprevisti). Per ogni voce inserisci il costo preventivato, note e fornitore previsto. Man mano che il progetto avanza, registri le spese effettive con allegati (ricevute, fatture). Il sistema mostra in tempo reale lo scostamento tra preventivo ed effettivo.',
      },
      {
        q: 'Posso gestire i task?',
        a: 'Sì. Ogni progetto ha una task board con vista Kanban (To Do / In Progress / Done) e vista Gantt. Puoi creare task con titolo, descrizione, date, responsabile, priorità (Alta/Media/Bassa) e checklist sub-task.',
      },
    ],
  },
  {
    id: 'comunicazione',
    label: 'Comunicazione & Newsletter',
    color: 'info',
    emoji: '📧',
    items: [
      {
        q: 'Posso inviare emails direttamente dal CRM?',
        a: 'Sì. Il modulo messagistica permette di creare email ed inviarle direttamente dal CRM'
      },
    ],
  },
  {
    id: 'documenti',
    label: 'Documenti & Template',
    color: 'warning',
    emoji: '📄',
    items: [
      {
        q: 'Cosa sono i template e come funzionano?',
        a: 'I template sono modelli riutilizzabili per documenti ricorrenti: contratti di prestito opera, contratti di collaborazione artista, certificati di autenticità, lettere di richiesta prestito, comunicati stampa, condition report e molto altro. Una volta creato un template con campi dinamici (es: {{artist.name}}, {{artwork.title}}, {{project.start_date}}), il sistema compila automaticamente tutti i campi con i dati del database, generando il documento in pochi secondi.',
      },
      {
        q: 'Posso importare templates da salvare nel database?',
        a: 'Sì. il CRM permette di importare nuovi formati di templates in formato JSON. Puoi caricare un file JSON con la struttura del template (nome, descrizione, categoria, campi dinamici, layout) e salvarlo nel database per utilizzarlo nei tuoi progetti. In questo modo puoi creare documenti personalizzati che si adattano perfettamente alle tue esigenze.',
      },
      {
        q: 'Come è organizzato il sistema documentale dei progetti?',
        a: 'Ogni progetto ha una sua cartella per il salvataggio dei documenti. I documenti caricati appaiono con un elemento di decrizione individuale, possono essere visualizzati, modificati, stampati, scaricati edeliminati',
      },
    ],
  },
  {
    id: 'sicurezza',
    label: 'Sicurezza & Privacy',
    color: 'error',
    emoji: '🔒',
    items: [
      {
        q: 'Come sono protetti i miei dati?',
        a: 'Krea4u CRM utilizza Supabase come backend con crittografia end-to-end sia per i dati a riposo che in transito (HTTPS). Ogni utente accede con credenziali personali protette da hash crittografico. Le Row Level Security (RLS) garantiscono che ogni query al database includa automaticamente filtri che limitano l\'accesso ai soli record di tua proprietà. I backup sono automatici e distribuiti geograficamente.',
      },
      {
        q: 'Posso esportare tutti i miei dati?',
        a: 'Sì, in qualsiasi momento. Dalla sezione Impostazioni → Backup puoi scaricare un archivio JSON completo con tutti i tuoi dati (artisti, opere, progetti, contatti, messaggi) oppure esportare singole tabelle in CSV. Non c\'è lock-in: i tuoi dati sono sempre portabili e di tua esclusiva proprietà.',
      },
      {
        q: 'Cosa succede se cancello accidentalmente un artista o un progetto?',
        a: 'Molti elementi dispongono della funzione "Archivia" come alternativa a "Elimina": l\'elemento scompare dalle ricerche standard ma rimane consultabile. In caso di eliminazione definitiva, il team di supporto può tentare il ripristino da backup entro 30 giorni dall\'eliminazione. Per sicurezza, esegui periodicamente un export manuale dei tuoi dati.',
      },
      {
        q: 'Krea4u CRM funziona offline?',
        a: 'La versione web richiede connessione internet per accedere ai dati sul database cloud. Una app mobile con modalità offline è nella roadmap di sviluppo: sincronizzerà i dati in locale e aggiornerà il database quando tornerà la connessione. Puoi seguire gli aggiornamenti sulla pagina "Aiutaci a migliorare".',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Accesso',
    color: 'primary',
    emoji: '👤',
    items: [
      {
        q: 'Come mi registro?',
        a: 'Clicca su "Inizia Gratis" o "Iscriviti Gratis" in qualsiasi punto del sito. Compila il modulo di registrazione come da istruzioni. Riceverai una mail con le credenziali di accesso. Non è richiesta carta di credito né alcun pagamento.',
      },
      {
        q: 'Ho dimenticato la password. Come la recupero?',
        a: 'Nella pagina di login, clicca "Password Dimenticata?", inserisci la tua email e riceverai un link per il reset. Se non ricevi l\'email entro qualche minuto, controlla la cartella spam o scrivi a info@lastanzadellarte.it.',
      },
      {
        q: 'Quali browser sono supportati?',
        a: 'Krea4u CRM funziona su tutti i browser moderni: Chrome (consigliato), Firefox, Safari ed Edge. Versioni minime raccomandate: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Per la migliore esperienza ti consigliamo di mantenere il browser aggiornato.',
      },
      {
        q: 'Posso usare Krea4u CRM su smartphone o tablet?',
        a: 'L\'interfaccia web è responsive e funziona su dispositivi mobili, anche se l\'esperienza ottimale è su desktop o laptop per via della ricchezza delle funzionalità. ',
      },
    ],
  },
  {
    id: 'supporto',
    label: 'Supporto & Comunità',
    color: 'success',
    emoji: '🤝',
    items: [
      {
        q: 'Come posso segnalare un bug o richiedere una nuova funzionalità?',
        a: 'Vai alla pagina "Aiutaci a migliorare" dal menu principale. Puoi inviarci feedback, segnalazioni di bug e richieste di nuove funzionalità. Ogni suggerimento viene letto dal team di sviluppo e i più votati dalla community vengono inseriti nella roadmap. Il tuo contributo è fondamentale per migliorare lo strumento.',
      },
      {
        q: 'Esiste un manuale utente completo?',
        a: 'Sì. Il manuale utente completo è disponibile dal menu principale della applicazione Krea4u CRM. Copre in dettaglio tutte le funzionalità: dashboard, gestione artisti e opere, spazi espositivi, progetti e mostre, sistema di template, messagistica, impostazioni avanzate e risoluzione problemi comuni.',
      },
      {
        q: 'Come posso contribuire allo sviluppo del progetto?',
        a: 'Krea4u CRM è sviluppato da un team di volontari appassionati. Puoi contribuire in diversi modi: facendo una donazione libera (anche un caffè aiuta a coprire i costi di infrastruttura), segnalando bug e suggerendo miglioramenti, condividendo lo strumento con colleghi curatori e professionisti del settore, o — se sei sviluppatore — contattandoci per contribuire direttamente al codice.',
      },
      {
        q: 'Come faccio a contattare il team?',
        a: 'Puoi scriverci tramite il modulo nella pagina "Contatti" del menu principale, oppure direttamente all\'indirizzo info@lastanzadellarte.it. Rispondiamo generalmente entro 48-72 ore lavorative. Per richieste urgenti o segnalazioni di bug critici, indica chiaramente l\'urgenza nell\'oggetto del messaggio.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Navbar pubblica (riutilizzata dalla HeroPage)
// ─────────────────────────────────────────────────────────────────────────────
const PublicNavbar = () => {
  const navigate = useNavigate();
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, md: 6 },
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Box
            component="img"
            src="/documents/Krea4u_logo.png"
            alt="Krea4u CRM Logo"
            sx={{ height: { xs: 32, sm: 120 }, width: 'auto' }}
          />
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            component={RouterLink}
            to="/about/crm"
            color="inherit"
            sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}
          >
            Come Funziona il CRM
          </Button>
          <Button
            component={RouterLink}
            to="/about/support"
            color="inherit"
            sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}
          >
            Aiutaci a migliorare
          </Button>
          <Button
            component={RouterLink}
            to="/about/contacts"
            color="inherit"
            sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}
          >
            Contatti
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ ml: 1, fontWeight: 600, fontSize: '0.85rem' }}
          >
            Accedi
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
          >
            Inizia Gratis
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principale FaqPage
// ─────────────────────────────────────────────────────────────────────────────
const FaqPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('tutti');
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordion =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const filteredCategories =
    activeCategory === 'tutti'
      ? FAQ_DATA
      : FAQ_DATA.filter((c) => c.id === activeCategory);

  // Conteggio totale domande
  const totalQuestions = FAQ_DATA.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Offset navbar */}
      <Box sx={{ pt: { xs: '56px', sm: '64px' } }} />

      {/* ── Hero Header ──────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1F4788 0%, #6D243C 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Domande Frequenti
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, mb: 1, fontWeight: 400 }}
          >
            Tutto quello che devi sapere su Krea4u CRM
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.75 }}>
            {totalQuestions} domande organizzate in {FAQ_DATA.length} categorie
          </Typography>
        </Container>
      </Box>

      {/* ── Filtri categoria ─────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          position: 'sticky',
          top: { xs: '56px', sm: '64px' },
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'center', md: 'flex-start' }}
          >
            <Chip
              label="Tutte le domande"
              onClick={() => setActiveCategory('tutti')}
              color={activeCategory === 'tutti' ? 'primary' : 'default'}
              variant={activeCategory === 'tutti' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
            {FAQ_DATA.map((cat) => (
              <Chip
                key={cat.id}
                label={`${cat.emoji} ${cat.label}`}
                onClick={() => setActiveCategory(cat.id)}
                color={activeCategory === cat.id ? cat.color : 'default'}
                variant={activeCategory === cat.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Contenuto principale ─────────────────────────── */}
      <Box sx={{ flex: 1, py: { xs: 4, md: 8 }, bgcolor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            {filteredCategories.map((category) => (
              <Box key={category.id}>
                {/* Header categoria */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="h2" sx={{ lineHeight: 1 }}>
                    {category.emoji}
                  </Typography>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#1F4788',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.items.length} domand
                      {category.items.length === 1 ? 'a' : 'e'}
                    </Typography>
                  </Box>
                </Box>

                {/* Accordion Q&A */}
                <Stack spacing={1}>
                  {category.items.map((item, idx) => {
                    const panelId = `${category.id}-${idx}`;
                    return (
                      <Accordion
                        key={panelId}
                        expanded={expanded === panelId}
                        onChange={handleAccordion(panelId)}
                        elevation={0}
                        sx={{
                          bgcolor: 'white',
                          border: '1px solid',
                          borderColor:
                            expanded === panelId ? 'primary.main' : 'divider',
                          borderRadius: '8px !important',
                          '&:before': { display: 'none' },
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <ExpandMoreIcon
                              sx={{
                                color:
                                  expanded === panelId
                                    ? 'primary.main'
                                    : 'text.secondary',
                              }}
                            />
                          }
                          sx={{
                            px: 3,
                            py: 1,
                            '& .MuiAccordionSummary-content': { my: 1.5 },
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color:
                                expanded === panelId
                                  ? 'primary.main'
                                  : 'text.primary',
                              pr: 2,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.q}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Typography
                            variant="body1"
                            sx={{
                              lineHeight: 1.8,
                              color: 'text.secondary',
                            }}
                          >
                            {item.a}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* ── CTA finale ───────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{
              mt: 8,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1F4788',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Non hai trovato risposta alla tua domanda?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
            >
              Scrivici direttamente — il team risponde entro 24-48 ore
              lavorative. Puoi anche consultare il manuale utente completo per
              approfondimenti tecnici.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/about/contacts"
                sx={{ fontWeight: 600, px: 4 }}
              >
                Contattaci
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/about/crm"
                sx={{ fontWeight: 600, px: 4 }}
              >
                Leggi il Manuale
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 600,
                  px: 4,
                  bgcolor: '#6D243C',
                  '&:hover': { bgcolor: '#5a1d31' },
                }}
              >
                Inizia Gratis
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default FaqPage;