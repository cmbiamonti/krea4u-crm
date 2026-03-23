import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { User, MessageCircle, FolderPlus, Calendar } from 'lucide-react'

interface Activity {
  id: string
  type: 'artist' | 'message' | 'project' | 'event'
  title: string
  description: string
  timestamp: string
  icon?: 'user' | 'message' | 'folder' | 'calendar'
}

interface ActivityFeedProps {
  activities: Activity[]
  loading?: boolean
}

const iconMap = {
  user: User,
  message: MessageCircle,
  folder: FolderPlus,
  calendar: Calendar,
}

const colorMap = {
  artist: 'bg-primary/10 text-primary',
  message: 'bg-secondary/10 text-secondary',
  project: 'bg-primary/20 text-accent',
  event: 'bg-success/20 text-success',
}

export default function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attività Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-neutral-600 py-8">
            Nessuna attività recente
          </p>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const Icon = iconMap[activity.icon || 'user']
              const colorClass = colorMap[activity.type]

              return (
                <div key={activity.id} className="flex gap-4">
                  <Avatar className={`h-10 w-10 ${colorClass}`}>
                    <AvatarFallback className={colorClass}>
                      <Icon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}