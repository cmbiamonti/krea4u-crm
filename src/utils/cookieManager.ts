// src/utils/cookieManager.ts

import {
  type CookiePreferences,
  type CookieConsentState,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from '../types/cookies';

export function saveConsent(preferences: CookiePreferences): CookieConsentState {
  const state: CookieConsentState = {
    preferences: {
      ...preferences,
      essential: true,
    },
    hasConsented: true,
    consentTimestamp: new Date().toISOString(),
    consentVersion: CONSENT_VERSION,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Impossibile salvare le preferenze cookie:', e);
  }

  return state;
}

export function loadConsent(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const state: CookieConsentState = JSON.parse(raw);

    if (state.consentVersion !== CONSENT_VERSION) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

export function applyPreferences(preferences: CookiePreferences): void {
  if (preferences.analytics) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }

  if (preferences.video) {
    window.dispatchEvent(new CustomEvent('cookie:video:enabled'));
    console.log('[Cookie] Video embeds abilitati');
  } else {
    window.dispatchEvent(new CustomEvent('cookie:video:disabled'));
    console.log('[Cookie] Video embeds disabilitati');
  }

  if (preferences.maps) {
    window.dispatchEvent(new CustomEvent('cookie:maps:enabled'));
    console.log('[Cookie] Mappe abilitate');
  } else {
    window.dispatchEvent(new CustomEvent('cookie:maps:disabled'));
    console.log('[Cookie] Mappe disabilitate');
  }
}

function enableAnalytics(): void {
  if (document.getElementById('ga-script')) return;

  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!GA_ID) {
    console.warn('VITE_GA_MEASUREMENT_ID non configurato in .env');
    return;
  }

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.id = 'ga-inline-script';
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  `;
  document.head.appendChild(inlineScript);

  console.log('[Cookie] Analytics abilitati');
}

function disableAnalytics(): void {
  document.getElementById('ga-script')?.remove();
  document.getElementById('ga-inline-script')?.remove();

  const gaCookies = document.cookie.split(';').filter(
    (c) => c.trim().startsWith('_ga') || c.trim().startsWith('_gid')
  );

  gaCookies.forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });

  const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (GA_ID) {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
  }

  console.log('[Cookie] Analytics disabilitati');
}

export function isCategoryAllowed(category: keyof CookiePreferences): boolean {
  const consent = loadConsent();
  if (!consent) return category === 'essential';
  return consent.preferences[category] ?? false;
}