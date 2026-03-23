import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  color?: string
  bgColor?: string
  loading?: boolean
  action?: React.ReactNode
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'text-primary',
  bgColor = 'bg-primary/10',
  loading = false,
  action,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        <div className={cn('p-2.5 rounded-lg', bgColor)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold text-neutral-900">{value}</div>
          {trend && (
            <div
              className={cn(
                'flex items-center text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-error'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-neutral-600 mt-1">{subtitle}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  )
}