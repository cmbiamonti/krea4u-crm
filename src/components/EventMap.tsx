// src/components/EventMap.tsx

import React from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface EventMapProps {
  lat: number;
  lng: number;
  title: string;
}

export function EventMap({ lat, lng, title }: EventMapProps) {
  const { preferences, openSettings } = useCookieConsent();

  if (!preferences.maps) {
    return (
      <div className="map-placeholder">
        <p>🗺️ Per vedere la mappa di <strong>{title}</strong>,</p>
        <p>abilita i cookie per le mappe.</p>
        <button onClick={openSettings} className="cookie-btn cookie-btn--accept">
          Gestisci Cookie
        </button>
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height="300"
      src={`https://maps.google.com/maps?q=${lat},${lng}&output=embed`}
      title={`Mappa - ${title}`}
      style={{ border: 0, borderRadius: 8 }}
    />
  );
}