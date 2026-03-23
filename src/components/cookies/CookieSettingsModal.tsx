// src/components/cookies/CookieSettingsModal.tsx

import { useState } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { CookieToggle } from './CookieToggle';
import {
  COOKIE_CATEGORIES,
  type CookieCategory,
  type CookiePreferences,
} from '../../types/cookies';

export function CookieSettingsModal() {
  const { preferences, acceptAll, rejectAll, savePreferences, closeSettings } =
    useCookieConsent();

  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>({
    ...preferences,
  });

  const [expanded, setExpanded] = useState<Set<CookieCategory>>(new Set());

  const toggleCategory = (key: CookieCategory, value: boolean) => {
    if (key === 'essential') return;
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (key: CookieCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = () => {
    savePreferences(localPrefs);
  };

  return (
    <>
      <div
        className="cookie-overlay"
        onClick={closeSettings}
        aria-hidden="true"
      />

      <div
        className="cookie-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Impostazioni cookie"
      >
        <div className="cookie-modal__header">
          <h2 className="cookie-modal__title">⚙ Impostazioni Cookie</h2>
          <button
            className="cookie-modal__close"
            onClick={closeSettings}
            aria-label="Chiudi impostazioni"
          >
            ✕
          </button>
        </div>

        <div className="cookie-modal__body">
          {COOKIE_CATEGORIES.map((category) => {
            const isExpanded = expanded.has(category.key);
            const isEssential = category.isEssential;
            const isChecked = isEssential ? true : localPrefs[category.key];

            return (
              <div className="cookie-category" key={category.key}>
                <div className="cookie-category__header">
                  <div
                    className="cookie-category__info"
                    onClick={() => toggleExpand(category.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(category.key);
                      }
                    }}
                    aria-expanded={isExpanded}
                  >
                    <h3 className="cookie-category__name">
                      {category.label}
                      <span
                        className={`cookie-category__badge ${
                          isEssential
                            ? 'cookie-category__badge--essential'
                            : 'cookie-category__badge--optional'
                        }`}
                      >
                        {isEssential ? 'Sempre attivo' : 'Opzionale'}
                      </span>
                    </h3>
                    <p className="cookie-category__desc">
                      {category.description}
                    </p>
                  </div>

                  <CookieToggle
                    label={category.label}
                    checked={isChecked}
                    disabled={isEssential}
                    onChange={(val) => toggleCategory(category.key, val)}
                  />
                </div>

                {isExpanded && (
                  <div className="cookie-category__details">
                    {category.cookies.map((cookie, idx) => (
                      <div className="cookie-detail" key={idx}>
                        <span className="cookie-detail__label">Nome:</span>
                        <span className="cookie-detail__value">
                          {cookie.name}
                        </span>
                        <span className="cookie-detail__label">Scopo:</span>
                        <span className="cookie-detail__value">
                          {cookie.purpose}
                        </span>
                        <span className="cookie-detail__label">Durata:</span>
                        <span className="cookie-detail__value">
                          {cookie.duration}
                        </span>
                        <span className="cookie-detail__label">Provider:</span>
                        <span className="cookie-detail__value">
                          {cookie.provider}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="cookie-modal__footer">
          <button className="cookie-btn cookie-btn--reject" onClick={rejectAll}>
            Rifiuta opzionali
          </button>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="cookie-btn cookie-btn--accept"
              onClick={handleSave}
            >
              Salva preferenze
            </button>
            <button
              className="cookie-btn cookie-btn--accept"
              onClick={acceptAll}
              style={{
                background: 'transparent',
                color: 'var(--cookie-accent)',
                borderColor: 'var(--cookie-accent)',
              }}
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </>
  );
}