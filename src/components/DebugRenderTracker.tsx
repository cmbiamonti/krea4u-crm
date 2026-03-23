// src/components/DebugRenderTracker.tsx

import { useEffect, useRef } from 'react'

interface DebugRenderTrackerProps {
  component: string
}

export default function DebugRenderTracker({ component }: DebugRenderTrackerProps) {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])
  const mountTime = useRef(Date.now())

  // ✅ FIX: Usa useRef invece di useState per evitare re-render
  renderCount.current++

  useEffect(() => {
    const now = Date.now()
    renderTimes.current.push(now)

    // Calcola velocità render
    if (renderTimes.current.length > 1) {
      const recentRenders = renderTimes.current.slice(-10)
      const timeDiff = recentRenders[recentRenders.length - 1] - recentRenders[0]
      const renderRate = (recentRenders.length / timeDiff) * 1000

      // ⚠️ Allarme solo se troppo veloce
      if (renderRate > 50) {
        console.warn('🚨 LOOP RILEVATO in', component, '!')
        console.warn('   Render:', renderCount.current)
        console.warn('   Velocità:', renderRate.toFixed(2), 'render/sec')
      }
    }

    // ✅ Log render solo ogni 10 render
    if (renderCount.current % 10 === 0) {
      console.log(`🎨 ${component} render #${renderCount.current}`)
    }

    // Pulisci array ogni 100 render
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-20)
    }

    // ❌ RIMUOVI CLEANUP CHE CAUSAVA LOOP
    // return () => {
    //   console.log('🧹 Cleanup')
    // }
  }) // ✅ Nessuna dependency = esegui ad ogni render ma NON causare re-render

  return null
}