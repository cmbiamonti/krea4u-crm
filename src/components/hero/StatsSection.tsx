import { Box, Container, Grid, Typography } from '@mui/material';
import { People, Event, Verified, TrendingUp } from '@mui/icons-material';

const stats = [
  {
    icon: <People sx={{ fontSize: 50 }} />,
    value: 'Target 200+',
    label: 'Artisti Registrati',
  },
  {
    icon: <Event sx={{ fontSize: 50 }} />,
    value: 'Target 50+',
    label: 'Eventi Realizzati Anno',
  },
  {
    icon: <Verified sx={{ fontSize: 50 }} />,
    value: 'Target 100+',
    label: 'Spazi Offerti',
  },
  {
    icon: <TrendingUp sx={{ fontSize: 50 }} />,
    value: 'Target 85%',
    label: 'Tasso di Successo',
  },
];

const StatsSection = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'neutral' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box sx={{ color: '#C55A11', mb: 2 }}>{stat.icon}</Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#000000',
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;