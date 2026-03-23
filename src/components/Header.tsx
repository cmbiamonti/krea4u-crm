import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import NotificationsPanel from '@/components/notifications/NotificationsPanel'
import { LogOut } from 'lucide-react'

export default function Header() {
  const { signOut, user } = useAuth()

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-neutral-800">
            Benvenuto
          </h2>
          <p className="text-sm text-neutral-600">{user?.email}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notifications Panel */}
          <NotificationsPanel />
          
          {/* Logout Button */}
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>
      </div>
    </header>
  )
}
