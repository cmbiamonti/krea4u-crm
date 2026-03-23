// src/components/settings/BackupPanel.tsx
// ✅ Riscritto con Shadcn/UI per coerenza con Settings.tsx

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Download,
  Upload,
  Table,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  DatabaseBackup,
  FileJson,
} from 'lucide-react'
import {
  downloadBackupAsJSON,
  downloadTableAsCSV,
  importFromJSON,
} from '@/services/backupService'

// ── Tabelle esportabili ───────────────────────────────────────────────────────
const TABLES = [
  { key: 'artists',  label: 'Artisti'  },
  { key: 'venues',   label: 'Spazi'    },
  { key: 'projects', label: 'Progetti' },
] as const

// ─────────────────────────────────────────────────────────────────────────────

const BackupPanel = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Handler generico con feedback toast ──────────────────────────────────
  const handle = async (
    actionKey: string,
    fn: () => Promise<void>,
    successMsg: string,
  ) => {
    setLoadingAction(actionKey)
    try {
      await fn()
      toast.success(successMsg, { icon: <CheckCircle2 className="h-4 w-4" /> })
    } catch (err) {
      toast.error(`Errore: ${(err as Error).message}`, {
        icon: <AlertTriangle className="h-4 w-4" />,
      })
    } finally {
      setLoadingAction(null)
    }
  }

  // ── Import da file JSON ───────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await handle(
      'import',
      () => importFromJSON(file),
      'Dati ripristinati con successo!',
    )

    // Reset input per permettere di ricaricare lo stesso file
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isLoading = (key: string) => loadingAction === key

  return (
    <div className="space-y-6">

      {/* ── Export JSON completo ─────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileJson className="h-4 w-4 text-[#2B4C7E]" />
            <p className="font-medium">Backup Completo (JSON)</p>
          </div>
          <p className="text-sm text-neutral-500">
            Esporta tutti i tuoi dati (artisti, spazi, progetti, messaggi)
            in un unico file JSON. Conservalo come copia di sicurezza.
          </p>
        </div>
        <Button
          onClick={() =>
            handle(
              'json',
              downloadBackupAsJSON,
              'Backup JSON scaricato con successo!',
            )
          }
          disabled={loadingAction !== null}
          className="shrink-0 bg-[#2B4C7E] hover:bg-[#1A2E4C]"
        >
          {isLoading('json') ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Scarica JSON
        </Button>
      </div>

      <Separator />

      {/* ── Export CSV per tabella ───────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Table className="h-4 w-4 text-[#2B4C7E]" />
          <p className="font-medium">Esporta Tabella (CSV)</p>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Scarica i dati di una singola sezione in formato CSV,
          compatibile con Excel e Google Sheets.
        </p>

        <div className="flex flex-wrap gap-3">
          {TABLES.map(({ key, label }) => (
            <Button
              key={key}
              variant="outline"
              disabled={loadingAction !== null}
              onClick={() =>
                handle(
                  `csv-${key}`,
                  () => downloadTableAsCSV(key),
                  `${label} esportati in CSV!`,
                )
              }
            >
              {isLoading(`csv-${key}`) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {label} .csv
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Import da JSON ───────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DatabaseBackup className="h-4 w-4 text-amber-600" />
            <p className="font-medium">Ripristina da Backup</p>
          </div>
          <p className="text-sm text-neutral-500">
            Importa un file JSON precedentemente scaricato.
            I dati esistenti verranno aggiornati (upsert), non sovrascritti.
          </p>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Attenzione: operazione non reversibile. Effettua prima un backup.
          </p>
        </div>

        {/* Input file nascosto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Button
          variant="outline"
          className="shrink-0 border-amber-400 text-amber-700
                     hover:bg-amber-50 hover:border-amber-500"
          disabled={loadingAction !== null}
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading('import') ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Carica JSON
        </Button>
      </div>

    </div>
  )
}

export default BackupPanel