// src/components/budget/BudgetSummary.tsx

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import type { Budget } from '@/types/budget.types'

interface BudgetSummaryProps {
  budget: Budget
}

export default function BudgetSummary({ budget }: BudgetSummaryProps) {
  const currencySymbol = budget.currency === 'EUR' ? '€' : budget.currency === 'USD' ? '$' : '£'

  const formatCurrency = (amount: number) => {
    return `${currencySymbol} ${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Trova categoria più costosa
  const mostExpensiveCategory = [...budget.categories].sort((a, b) => b.subtotal - a.subtotal)[0]

  // Calcola percentuale di ogni categoria
  const categoriesWithPercentage = budget.categories.map(cat => ({
    ...cat,
    percentage: budget.total_cost > 0 ? (cat.subtotal / budget.total_cost) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{budget.title}</h2>
            {budget.description && (
              <p className="text-gray-600 mt-2">{budget.description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {budget.project_type}
          </Badge>
        </div>
      </Card>

      {/* Total Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Riepilogo Totali</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-lg">
            <span className="text-gray-600">Totale Costi</span>
            <span className="font-semibold">{formatCurrency(budget.total_cost)}</span>
          </div>

          <div className="flex items-center justify-between text-lg text-orange-600">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Contingenza ({budget.contingency_percentage}%)
            </span>
            <span className="font-semibold">{formatCurrency(budget.contingency_amount)}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-2xl font-bold text-primary">
            <span>Totale Generale</span>
            <span>{formatCurrency(budget.grand_total)}</span>
          </div>
        </div>
      </Card>

      {/* Categories Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dettaglio per Categoria</h3>
        </div>

        <div className="space-y-4">
          {categoriesWithPercentage
            .sort((a, b) => b.subtotal - a.subtotal)
            .map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">
                        {category.items.length} voci
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.subtotal)}</p>
                    <p className="text-sm text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>

                {/* Items Detail */}
                {category.items.length > 0 && (
                  <div className="ml-8 space-y-1 text-sm">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-gray-600">
                        <span>
                          {item.description} ({item.quantity} x {formatCurrency(item.unit_price)})
                        </span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Analisi Budget
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Categoria più costosa:</strong> {mostExpensiveCategory?.name} (
            {formatCurrency(mostExpensiveCategory?.subtotal || 0)})
          </p>
          <p>
            <strong>Numero categorie:</strong> {budget.categories.length}
          </p>
          <p>
            <strong>Voci totali:</strong>{' '}
            {budget.categories.reduce((sum, cat) => sum + cat.items.length, 0)}
          </p>
          <p>
            <strong>Costo medio per categoria:</strong>{' '}
            {formatCurrency(budget.total_cost / budget.categories.length)}
          </p>
        </div>
      </Card>
    </div>
  )
}