// src/types/budget.types.ts

export type ProjectType = 'exhibition' | 'concert' | 'workshop' | 'festival' | 'other'

export interface BudgetItem {
  id: string
  category: string
  subcategory: string
  description: string
  quantity: number
  unit_price: number
  total: number
  notes?: string
}

export interface BudgetCategory {
  id: string
  name: string
  icon: string
  items: BudgetItem[]
  subtotal: number
}

export interface Budget {
  id: string
  project_id: string
  project_type: ProjectType
  title: string
  description?: string
  categories: BudgetCategory[]
  total_cost: number
  contingency_percentage: number
  contingency_amount: number
  grand_total: number
  currency: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface BudgetTemplate {
  project_type: ProjectType
  categories: {
    name: string
    icon: string
    common_items: {
      subcategory: string
      description: string
      unit?: string
    }[]
  }[]
}