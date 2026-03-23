import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, Palette } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user } = useAuth()

  const getInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-neutral-700"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-bold text-primary">
            La Stanza dell'Arte
          </span>
        </div>

        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-white text-sm font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}