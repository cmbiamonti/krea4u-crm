// src/hooks/useCookieConsent.ts

import { useContext } from 'react';
import {
  CookieConsentContext,
  type CookieConsentContextValue,
} from '../contexts/CookieConsentContext';

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      'useCookieConsent deve essere usato dentro <CookieConsentProvider>'
    );
  }
  return context;
}