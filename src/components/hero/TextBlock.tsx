// src/components/hero/TextBlock.tsx - VERSIONE AVANZATA
import { Box, Container, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface TextBlockProps {
  content: string | ReactNode;
  backgroundColor?: string;
  textColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize?: { xs: string; md: string };
  paddingY?: { xs: number; md: number };
  paddingX?: { xs: number; sm: number; md: number };
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
}

const TextBlock = ({ 
  content,
  backgroundColor = '#FFF4E6', // Arancione pallido
  textColor = '#333333',
  maxWidth = 'lg',
  fontSize = { xs: '1rem', md: '1.125rem' },
  paddingY = { xs: 6, md: 8 },
  paddingX = { xs: 2, sm: 4, md: 6 },
  textAlign = 'justify',
  lineHeight = 1.8,
}: TextBlockProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: backgroundColor,
        py: paddingY,
      }}
    >
      <Container maxWidth={maxWidth}>
        <Typography
          variant="body1"
          component="div"
          sx={{
            textAlign: textAlign,
            lineHeight: lineHeight,
            fontSize: fontSize,
            color: textColor,
            px: paddingX,
            whiteSpace: 'pre-line',
            '& p': {
              mb: 2,
            },
            '& strong': {
              fontWeight: 600,
              color: '#C55A11', // Arancione accent
            },
          }}
        >
          {content}
        </Typography>
      </Container>
    </Box>
  );
};

export default TextBlock;