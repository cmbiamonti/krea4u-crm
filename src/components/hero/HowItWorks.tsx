import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { PersonAdd, Search, Message, Celebration } from '@mui/icons-material';

const steps = [
  {
    icon: <PersonAdd sx={{ fontSize: 40 }} />,
    title: 'Gestione Centralizzata del Database Artistico',
    description:
      'Il CRM offre un database unificato per gestire artisti, opere d\'arte e spazi espositivi.',
  },
  {
    icon: <Search sx={{ fontSize: 40 }} />,
    title: 'Pianificazione/ Organizzazione Progetti:',
    description:
      'Il modulo progetti permette di pianificare mostre ed eventi dall\'ideazione alla realizzazione',
  },
  {
    icon: <Message sx={{ fontSize: 40 }} />,
    title: 'Comunicazione e Marketing Automatizzati',
    description:
      'Strumenti avanzati per la gestione della comunicazione.',
  },
  {
    icon: <Celebration sx={{ fontSize: 40 }} />,
    title: 'Gestione Documentale Intelligente',
    description:
      'Un sistema di template permette di generare automaticamente contratti, lettere di prestito, certificati di autenticità e altri documenti ricorrenti.',
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Come Funziona
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Un supporto gestionale per accrescere la tua produttività
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {steps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  pt: 6,
                  position: 'relative',
                  mt: -2,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(31, 71, 136, 0.3)',
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </Box>
                <CardContent sx={{ pt: 6 }}>
                  <Box sx={{ color: 'secondary.main', mb: 2 }}>{step.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;