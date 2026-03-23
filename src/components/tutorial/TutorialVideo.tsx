// src/components/tutorial/TutorialVideo.tsx

import { useState } from 'react'
import YouTube      from 'react-youtube'
import { Play }     from 'lucide-react'

interface TutorialVideoProps {
  // Incolla qui solo l'ID del video (parte dopo ?v=)
  // es: https://www.youtube.com/watch?v=ABC123xyz
  //                                        ↑ questo
  youtubeId:    string
  // Fallback locale per chi è offline (opzionale)
  localFallback?: string
  title?:       string
}

export default function TutorialVideo({
  youtubeId,
  localFallback,
  title = 'Video Tutorial',
}: TutorialVideoProps) {

  const [useLocal, setUseLocal] = useState(false)

  // Opzioni player YouTube
  const opts = {
    width:  '100%',
    height: '100%',
    playerVars: {
      autoplay:       0,
      rel:            0,   // non mostrare video correlati alla fine
      modestbranding: 1,   // riduci branding YouTube
      cc_load_policy: 0,
    },
  }

  if (useLocal && localFallback) {
    return (
      <div className="w-full">
        <video
          controls
          playsInline          // ← obbligatorio su iOS
          preload="metadata"   // ← carica solo i metadati, non tutto il video
          className="w-full rounded-xl"
          style={{ maxHeight: '480px' }}
        >
          <source src={localFallback} type="video/mp4" />
          Il tuo browser non supporta il video.
        </video>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Versione locale — alcune funzionalità potrebbero non funzionare su mobile
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Player YouTube — funziona su tutti i dispositivi */}
      <div
        className="relative w-full rounded-xl overflow-hidden bg-black"
        style={{ paddingTop: '56.25%' }}   // aspect ratio 16:9
      >
        <div className="absolute inset-0">
          <YouTube
            videoId={youtubeId}
            opts={opts}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      </div>

      {/* Link diretto + fallback locale */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Play className="h-3 w-3" />
          Apri su YouTube
        </a>

        {localFallback && (
          <button
            onClick={() => setUseLocal(true)}
            className="hover:text-primary transition-colors"
          >
            Usa versione locale
          </button>
        )}
      </div>
    </div>
  )
}