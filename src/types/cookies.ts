// src/types/cookies.ts

export type CookieCategory = 'essential' | 'analytics' | 'video' | 'maps';

export interface CookiePreferences {
  essential: boolean;    // Sempre true - non modificabile
  analytics: boolean;    // Google Analytics, Plausible, etc.
  video: boolean;        // YouTube, Vimeo embeds
  maps: boolean;         // Google Maps, Leaflet tiles
}

export interface CookieConsentState {
  preferences: CookiePreferences;
  hasConsented: boolean;       // L'utente ha già fatto una scelta?
  consentTimestamp: string | null;
  consentVersion: string;      // Per invalidare consensi vecchi
}

export interface CookieCategoryInfo {
  key: CookieCategory;
  label: string;
  description: string;
  isEssential: boolean;
  cookies: CookieDetail[];
}

export interface CookieDetail {
  name: string;
  purpose: string;
  duration: string;
  provider: string;
}

export const CONSENT_VERSION = '1.0.0';
export const CONSENT_STORAGE_KEY = 'lastanzadellarte_cookie_consent';

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  video: false,
  maps: false,
};

// Catalogo completo dei cookie per categoria
export const COOKIE_CATEGORIES: CookieCategoryInfo[] = [
  {
    key: 'essential',
    label: 'Cookie Essenziali',
    description:
      'Necessari per il funzionamento del sito. Includono autenticazione, preferenze lingua e memorizzazione della scelta cookie. Non possono essere disattivati.',
    isEssential: true,
    cookies: [
      {
        name: 'sb-*-auth-token',
        purpose: 'Autenticazione Supabase - mantiene la sessione utente',
        duration: 'Sessione / 1 anno',
        provider: 'Supabase',
      },
      {
        name: 'i18next',
        purpose: 'Memorizza la lingua scelta dall\'utente',
        duration: '1 anno',
        provider: 'La Stanza dell\'Arte',
      },
      {
        name: CONSENT_STORAGE_KEY,
        purpose: 'Memorizza le preferenze cookie espresse',
        duration: '1 anno',
        provider: 'La Stanza dell\'Arte',
      },
    ],
  },
  {
    key: 'analytics',
    label: 'Cookie Analitici',
    description:
      'Ci aiutano a capire come gli utenti navigano la piattaforma, quali pagine visitano di più e come migliorare l\'esperienza. I dati sono aggregati e anonimi.',
    isEssential: false,
    cookies: [
      {
        name: '_ga, _ga_*',
        purpose: 'Google Analytics - tracciamento visite e comportamento',
        duration: '2 anni',
        provider: 'Google',
      },
      {
        name: '_gid',
        purpose: 'Google Analytics - distingue gli utenti',
        duration: '24 ore',
        provider: 'Google',
      },
    ],
  },
  {
    key: 'video',
    label: 'Cookie Video Tutorial',
    description:
      'Permettono la riproduzione di video tutorial incorporati da piattaforme esterne come YouTube o Vimeo. Senza questi cookie, i video non saranno visibili.',
    isEssential: false,
    cookies: [
      {
        name: 'YSC, VISITOR_INFO1_LIVE',
        purpose: 'YouTube - riproduzione video embedded',
        duration: 'Sessione / 6 mesi',
        provider: 'Google (YouTube)',
      },
      {
        name: 'vuid',
        purpose: 'Vimeo - riproduzione video embedded',
        duration: '2 anni',
        provider: 'Vimeo',
      },
    ],
  },
  {
    key: 'maps',
    label: 'Cookie Mappe',
    description:
      'Permettono di visualizzare mappe interattive per localizzare eventi, gallerie e mostre. Senza questi cookie, le mappe non saranno caricate.',
    isEssential: false,
    cookies: [
      {
        name: 'NID, 1P_JAR',
        purpose: 'Google Maps - visualizzazione mappe interattive',
        duration: '6 mesi / 1 mese',
        provider: 'Google',
      },
    ],
  },
];