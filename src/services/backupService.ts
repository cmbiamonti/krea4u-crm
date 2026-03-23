// src/services/backupService.ts
import { supabase } from '@/lib/supabase'

export interface UserBackup {
  exported_at: string
  user_id: string
  version: string
  data: {
    artists:  unknown[]
    venues:   unknown[]
    projects: unknown[]
    messages: unknown[]
  }
}

// ── Scarica tutti i dati dell'utente corrente ─────────────────────────────
export const exportUserData = async (): Promise<UserBackup> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utente non autenticato')

  // ✅ Fetch parallelo di tutte le tabelle (RLS garantisce solo i propri dati)
  const [artists, venues, projects, messages] = await Promise.all([
    supabase.from('artists').select('*'),
    supabase.from('venues').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('messages').select('*'),
  ])

  const backup: UserBackup = {
    exported_at: new Date().toISOString(),
    user_id:     user.id,
    version:     '1.0.0',
    data: {
      artists:  artists.data  ?? [],
      venues:   venues.data   ?? [],
      projects: projects.data ?? [],
      messages: messages.data ?? [],
    },
  }

  return backup
}

// ── Scarica il JSON come file ─────────────────────────────────────────────
export const downloadBackupAsJSON = async (): Promise<void> => {
  const backup = await exportUserData()

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: 'application/json' }
  )

  const url      = URL.createObjectURL(blob)
  const link     = document.createElement('a')
  const filename = `krea4u_backup_${new Date().toISOString().split('T')[0]}.json`

  link.href     = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

// ── Scarica come CSV (per ogni tabella) ───────────────────────────────────
export const downloadTableAsCSV = async (
  tableName: 'artists' | 'venues' | 'projects'
): Promise<void> => {
  const { data, error } = await supabase.from(tableName).select('*')
  if (error) throw error
  if (!data || data.length === 0) return

  // Intestazione colonne
  const headers = Object.keys(data[0]).join(',')

  // Righe dati
  const rows = data.map(row =>
    Object.values(row)
      .map(val => {
        if (val === null || val === undefined) return ''
        const str = String(val)
        // Esegue escape se contiene virgole o newline
        return str.includes(',') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(',')
  )

  const csv  = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href     = url
  link.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

// ── Ripristina da file JSON ───────────────────────────────────────────────
export const importFromJSON = async (file: File): Promise<void> => {
  const text   = await file.text()
  const backup = JSON.parse(text) as UserBackup

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utente non autenticato')

  // ✅ Upsert: inserisce o aggiorna senza duplicati
  const tables = [
    { name: 'artists',  data: backup.data.artists },
    { name: 'venues',   data: backup.data.venues },
    { name: 'projects', data: backup.data.projects },
  ] as const

  for (const table of tables) {
    if (table.data.length > 0) {
      const { error } = await supabase
        .from(table.name)
        .upsert(table.data as never[], { onConflict: 'id' })

      if (error) throw error
    }
  }
}