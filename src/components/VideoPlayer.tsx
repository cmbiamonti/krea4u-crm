// src/components/VideoPlayer.tsx

import React, { useState, useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
}

export function VideoPlayer({ youtubeId, title }: VideoPlayerProps) {
  const { preferences, openSettings } = useCookieConsent();

  if (!preferences.video) {
    return (
      <div className="video-placeholder">
        <div className="video-placeholder__content">
          <p>🎬 Per visualizzare questo video tutorial,</p>
          <p>devi abilitare i cookie video.</p>
          <button onClick={openSettings} className="cookie-btn cookie-btn--accept">
            Gestisci Cookie
          </button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      width="100%"
      height="400"
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      allowFullScreen
      style={{ border: 0, borderRadius: 8 }}
    />
  );
}