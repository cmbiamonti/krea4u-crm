// src/lib/clearCache.ts

export const clearAllCache = async () => {
  try {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear IndexedDB
    const databases = await window.indexedDB.databases()
    databases.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name)
      }
    })
    
    // Clear Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    }
    
    // Clear Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    console.log('✅ Cache completamente pulita')
  } catch (error) {
    console.error('Errore pulizia cache:', error)
  }
}