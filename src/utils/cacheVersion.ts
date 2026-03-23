// src/utils/cacheVersion.ts
const CACHE_VERSION = '1.0.0';
const CACHE_VERSION_KEY = 'la_stanza_cache_version';

export const initializeCacheVersion = () => {
  const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  
  if (storedVersion !== CACHE_VERSION) {
    console.log('Cache version mismatch. Clearing old cache...');
    
    // Salva la sessione auth se esiste (per non fare logout)
    const authSession = localStorage.getItem('la-stanza-auth');
    
    // Pulisci tutto
    localStorage.clear();
    sessionStorage.clear();
    
    // Ripristina auth se esisteva
    if (authSession) {
      localStorage.setItem('la-stanza-auth', authSession);
    }
    
    // Imposta nuova versione
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    
    console.log('Cache cleared successfully');
  }
};