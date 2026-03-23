// src/components/Logo.tsx - VERSIONE PNG

import React from 'react';

interface LogoTextProps {
  width?: number;
  height?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const LogoText: React.FC<LogoTextProps> = ({ 
  size = 'md',
  className = '',
  showIcon = true
}) => {
  // ✅ URL logo da Supabase Storage
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const logoUrl = `${SUPABASE_URL}/storage/v1/object/public/logo/logo.png`;

  // Mappa size a dimensioni effettive (mantenendo aspect ratio 500x300)
  const sizeMap = {
    sm: { width: 100, height: 60 },
    md: { width: 150, height: 90 },
    lg: { width: 200, height: 120 },
    xl: { width: 250, height: 150 }
  };

  const dimensions = sizeMap[size];

  return (
    <img
      src={logoUrl}
      alt="Krea4u Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={`object-contain ${className}`}
      style={{
        maxWidth: '100%',
        height: 'auto'
      }}
      loading="lazy"
    />
  );
};

export default LogoText;