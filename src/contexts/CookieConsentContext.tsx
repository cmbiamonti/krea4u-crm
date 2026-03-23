// src/contexts/CookieConsentContext.tsx

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type CookiePreferences,
  DEFAULT_PREFERENCES,
} from '../types/cookies';
import {
  saveConsent,
  loadConsent,
  clearConsent,
  applyPreferences,
} from '../utils/cookieManager';

export interface CookieConsentContextValue {
  preferences: CookiePreferences;
  hasConsented: boolean;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetConsent: () => void;
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export function CookieConsentProvider({ children }: Props) {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = loadConsent();

    if (saved && saved.hasConsented) {
      setPreferences(saved.preferences);
      setHasConsented(true);
      setShowBanner(false);
      applyPreferences(saved.preferences);
    } else {
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      video: true,
      maps: true,
    };
    const state = saveConsent(allAccepted);
    setPreferences(state.preferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);
    applyPreferences(state.preferences);
  }, []);

  const rejectAll = useCallback(() => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      video: false,
      maps: false,
    };
    const state = saveConsent(onlyEssential);
    setPreferences(state.preferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);
    applyPreferences(state.preferences);
  }, []);

  const saveCustomPreferences = useCallback((prefs: CookiePreferences) => {
    const state = saveConsent(prefs);
    setPreferences(state.preferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowSettings(false);
    applyPreferences(state.preferences);
  }, []);

  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, [hasConsented]);

  const resetConsent = useCallback(() => {
    clearConsent();
    setPreferences(DEFAULT_PREFERENCES);
    setHasConsented(false);
    setShowSettings(false);
    setShowBanner(true);
    applyPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      hasConsented,
      showBanner,
      showSettings,
      acceptAll,
      rejectAll,
      savePreferences: saveCustomPreferences,
      openSettings,
      closeSettings,
      resetConsent,
    }),
    [
      preferences,
      hasConsented,
      showBanner,
      showSettings,
      acceptAll,
      rejectAll,
      saveCustomPreferences,
      openSettings,
      closeSettings,
      resetConsent,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}