// src/services/budget.service.ts

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Budget } from '@/types/budget.types'

export class BudgetService {
  /**
   * Crea nuovo budget
   */
  static async createBudget(budget: Budget): Promise<Budget> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // ✅ Bypass TypeScript check per 'budgets'
      const { data, error } = await (supabase as any)
        .from('budgets')
        .insert({
          ...budget,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      logger.log('✅ Budget created:', data.id)
      return data as Budget
    } catch (error: any) {
      logger.error('❌ Error creating budget:', error)
      throw error
    }
  }

  /**
   * Aggiorna budget
   */
  static async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
    try {
      const { data, error } = await (supabase as any)
        .from('budgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', budgetId)
        .select()
        .single()

      if (error) throw error

      logger.log('✅ Budget updated:', budgetId)
      return data as Budget
    } catch (error: any) {
      logger.error('❌ Error updating budget:', error)
      throw error
    }
  }

  /**
   * Carica budget per progetto
   */
  static async getBudgetsByProject(projectId: string): Promise<Budget[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('budgets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []) as Budget[]
    } catch (error: any) {
      logger.error('❌ Error loading budgets:', error)
      throw error
    }
  }

  /**
   * Elimina budget
   */
  static async deleteBudget(budgetId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('budgets')
        .delete()
        .eq('id', budgetId)

      if (error) throw error

      logger.log('✅ Budget deleted:', budgetId)
    } catch (error: any) {
      logger.error('❌ Error deleting budget:', error)
      throw error
    }
  }

  /**
   * Esporta budget in PDF
   */
  static async exportToPDF(budget: Budget): Promise<void> {
    try {
      logger.log('📄 Exporting budget to PDF:', budget.title)

      const doc = new jsPDF()
      const currencySymbol = budget.currency === 'EUR' ? '€' : budget.currency === 'USD' ? '$' : '£'

      // Header
      doc.setFontSize(20)
      doc.setTextColor(60, 60, 60)
      doc.text(budget.title, 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Tipo: ${budget.project_type}`, 14, 28)
      
      // ✅ Safe date handling
      const createdDate = budget.created_at 
        ? new Date(budget.created_at).toLocaleDateString('it-IT')
        : new Date().toLocaleDateString('it-IT')
      
      doc.text(`Data: ${createdDate}`, 14, 33)

      if (budget.description) {
        doc.setFontSize(9)
        const splitDescription = doc.splitTextToSize(budget.description, 180)
        doc.text(splitDescription, 14, 40)
      }

      let yPos = budget.description ? 55 : 45

      // Categories
      budget.categories.forEach((category) => {
        // Check page break
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Category Header
        doc.setFontSize(14)
        doc.setTextColor(40, 40, 40)
        doc.text(`${category.icon} ${category.name}`, 14, yPos)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(
          `Subtotale: ${currencySymbol} ${category.subtotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
          150,
          yPos
        )

        yPos += 8

        // Category Items Table
        if (category.items.length > 0) {
          const tableData = category.items.map((item) => [
            item.description,
            item.quantity.toString(),
            `${currencySymbol} ${item.unit_price.toFixed(2)}`,
            `${currencySymbol} ${item.total.toFixed(2)}`,
          ])

          autoTable(doc, {
            startY: yPos,
            head: [['Descrizione', 'Qtà', 'Prezzo Unit.', 'Totale']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [66, 139, 202] },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 },
          })

          yPos = (doc as any).lastAutoTable.finalY + 10
        } else {
          yPos += 5
        }
      })

      // Summary
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      doc.setDrawColor(200, 200, 200)
      doc.line(14, yPos, 196, yPos)
      yPos += 10

      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text('RIEPILOGO', 14, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.text('Totale Costi:', 14, yPos)
      doc.text(
        `${currencySymbol} ${budget.total_cost.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        150,
        yPos
      )
      yPos += 7

      doc.setTextColor(200, 100, 0)
      doc.text(`Contingenza (${budget.contingency_percentage}%):`, 14, yPos)
      doc.text(
        `${currencySymbol} ${budget.contingency_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        150,
        yPos
      )
      yPos += 10

      doc.setDrawColor(60, 60, 60)
      doc.line(14, yPos, 196, yPos)
      yPos += 8

      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('TOTALE GENERALE:', 14, yPos)
      doc.text(
        `${currencySymbol} ${budget.grand_total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        150,
        yPos
      )

      // Save PDF
      const fileName = `budget_${budget.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`
      doc.save(fileName)

      logger.log('✅ PDF exported:', fileName)
    } catch (error: any) {
      logger.error('❌ Error exporting PDF:', error)
      throw error
    }
  }
}