// src/components/cookies/CookieBanner.tsx

import { useCookieConsent } from '../../hooks/useCookieConsent';
import { CookieSettingsModal } from './CookieSettingsModal';
import './CookieBanner.css';

export function CookieBanner() {
  const {
    showBanner,
    showSettings,
    hasConsented,
    acceptAll,
    rejectAll,
    openSettings,
    resetConsent,
  } = useCookieConsent();

  return (
    <>
      {showBanner && !showSettings && (
        <>
          <div
            className="cookie-overlay"
            onClick={rejectAll}
            aria-hidden="true"
          />
          <div
            className="cookie-banner"
            role="dialog"
            aria-modal="true"
            aria-label="Consenso cookie"
          >
            <div className="cookie-banner__inner">
              <div className="cookie-banner__header">
                <span className="cookie-banner__icon" aria-hidden="true">
                  🎨
                </span>
                <h2 className="cookie-banner__title">
                  Krea4u - La Stanza dell'Arte rispetta la tua privacy
                </h2>
              </div>

              <p className="cookie-banner__text">
                Utilizziamo cookie essenziali per il funzionamento del sito e
                cookie opzionali per analisi, video tutorial e mappe interattive.
                Puoi scegliere quali attivare.{' '}
                {/* ✅ Link al PDF in public/documents/PrivacyPolicy.pdf */}
                <a
                  href="/documents/PrivacyPolicy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leggi la Privacy Policy
                </a>
              </p>

              <div className="cookie-banner__actions">
                <button
                  className="cookie-btn cookie-btn--accept"
                  onClick={acceptAll}
                >
                  ✓ Accetta tutti
                </button>
                <button
                  className="cookie-btn cookie-btn--reject"
                  onClick={rejectAll}
                >
                  Solo essenziali
                </button>
                <button
                  className="cookie-btn cookie-btn--settings"
                  onClick={openSettings}
                >
                  ⚙ Personalizza
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettings && <CookieSettingsModal />}

      {hasConsented && !showBanner && !showSettings && (
        <button
          className="cookie-floating-btn"
          onClick={resetConsent}
          title="Gestisci preferenze cookie"
          aria-label="Apri impostazioni cookie"
        >
          🍪
        </button>
      )}
    </>
  );
}