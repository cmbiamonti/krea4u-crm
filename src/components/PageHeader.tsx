import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
//import { LogoText } from './Logo'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  action?: ReactNode
}

export default function PageHeader({ 
  title, 
  description, 
  breadcrumbs,
  action 
}: PageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-3">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              {crumb.href ? (
                <Link 
                  to={crumb.href} 
                  className="hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-neutral-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-neutral-600">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}