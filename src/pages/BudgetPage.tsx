  // src/pages/BudgetPage.tsx

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calculator, 
  ArrowLeft, 
  Plus, 
  Download, 
  Edit, 
  Eye, 
  Trash2,
  FileText,
  DollarSign,
  BarChart3,
  Lightbulb,
  Loader2,
  Info
} from 'lucide-react'
import BudgetWizard from '@/components/budget/BudgetWizard'
import BudgetSummary from '@/components/budget/BudgetSummary'
import { BudgetService } from '@/services/budget.service'
import type { Budget } from '@/types/budget.types'

export default function BudgetPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const projectIdFromUrl = searchParams.get('project')
  const budgetIdFromUrl = searchParams.get('budget')

  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || '')
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingBudgets, setLoadingBudgets] = useState(false)
  const [showBudgetWizard, setShowBudgetWizard] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
  const [viewingBudget, setViewingBudget] = useState<Budget | undefined>()

  useEffect(() => {
    if (user?.id) {
      loadProjects()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedProjectId) {
      loadBudgets()
    } else {
      setBudgets([])
      setLoadingBudgets(false)
    }
  }, [selectedProjectId])

  useEffect(() => {
    if (budgetIdFromUrl && budgets.length > 0) {
      const budget = budgets.find(b => b.id === budgetIdFromUrl)
      if (budget) {
        setViewingBudget(budget)
      }
    }
  }, [budgetIdFromUrl, budgets])

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, status')
        .eq('curator_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProjects(data || [])

      if (projectIdFromUrl) {
        setSelectedProjectId(projectIdFromUrl)
      } else if (!selectedProjectId && data && data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    } catch (error: any) {
      toast.error('Errore caricamento progetti: ' + error.message)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadBudgets = async () => {
    if (!selectedProjectId) return

    setLoadingBudgets(true)
    try {
      const data = await BudgetService.getBudgetsByProject(selectedProjectId)
      setBudgets(data)
    } catch (error: any) {
      console.error('Error loading budgets:', error)
      toast.error('Errore caricamento budget: ' + error.message)
      setBudgets([])
    } finally {
      setLoadingBudgets(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo budget?')) return

    try {
      await BudgetService.deleteBudget(budgetId)
      toast.success('Budget eliminato')
      loadBudgets()
    } catch (error: any) {
      toast.error('Errore eliminazione: ' + error.message)
    }
  }

  const handleExportPDF = async (budget: Budget) => {
    try {
      await BudgetService.exportToPDF(budget)
      toast.success('PDF esportato con successo')
    } catch (error: any) {
      toast.error('Errore export: ' + error.message)
    }
  }

  const currencySymbol = (currency: string) => {
    return currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'
  }

  const projectTypeLabels: Record<string, string> = {
    exhibition: '🎨 Mostra',
    concert: '🎤 Concerto',
    workshop: '👨‍🏫 Workshop',
    festival: '🎭 Festival',
    other: '📋 Altro',
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Loading iniziale progetti
  if (loadingProjects) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Caricamento progetti...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* ===================================================
          HEADER
      =================================================== */}
      <div className="mb-6">
        {projectIdFromUrl && (
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/projects/${projectIdFromUrl}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Progetto
          </Button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              Budget Creator
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedProject
                ? `Gestione budget per: ${selectedProject.project_name}`
                : 'Crea e gestisci i budget per i tuoi progetti artistici'
              }
            </p>
          </div>

          <Button
            onClick={() => {
              if (!selectedProjectId) {
                toast.error('Seleziona prima un progetto')
                return
              }
              setEditingBudget(undefined)
              setShowBudgetWizard(true)
            }}
            disabled={!selectedProjectId || loadingBudgets}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Budget
          </Button>
        </div>
      </div>

      {/* ===================================================
          PROJECT SELECTOR
      =================================================== */}
      {!projectIdFromUrl && projects.length > 0 && (
        <Card className="p-6 mb-6">
          <label className="text-sm font-medium mb-2 block">
            Seleziona Progetto
          </label>
          <Select 
            value={selectedProjectId} 
            onValueChange={setSelectedProjectId}
            disabled={loadingBudgets}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Seleziona un progetto..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_name} ({project.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* ===================================================
          EMPTY STATE - No Projects
      =================================================== */}
      {projects.length === 0 && (
        <Card className="p-12 text-center bg-gray-50">
          <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessun Progetto Trovato
          </h3>
          <p className="text-gray-600 mb-4">
            Devi prima creare un progetto per gestire i budget
          </p>
          <Button onClick={() => navigate('/app/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Crea Nuovo Progetto
          </Button>
        </Card>
      )}

      {/* ===================================================
          ✅ MINI INFO CARD - SEMPRE VISIBILE (se progetto selezionato)
      =================================================== */}
      {selectedProjectId && !loadingBudgets && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                {budgets.length === 0 ? (
                  <Lightbulb className="h-6 w-6 text-white" />
                ) : (
                  <Calculator className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {budgets.length === 0 ? (
                // ✅ NESSUN BUDGET - Tutorial Completo
                <>
                  <h3 className="text-lg font-semibold mb-3 text-blue-900">
                    Come Funziona il Budget Creator
                  </h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <div>
                        <strong className="text-gray-900">Scegli il tipo di progetto</strong>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Mostra d'arte, concerto, workshop, festival o altro
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <div>
                        <strong className="text-gray-900">Carica template</strong>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Ottieni categorie e voci di costo predefinite
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <div>
                        <strong className="text-gray-900">Personalizza le voci</strong>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Aggiungi quantità, prezzi e note
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </span>
                      <div>
                        <strong className="text-gray-900">Rivedi il riepilogo</strong>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Controlla totali e percentuali per categoria
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        5
                      </span>
                      <div>
                        <strong className="text-gray-900">Salva ed esporta</strong>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Esporta in PDF professionale
                        </p>
                      </div>
                    </li>
                  </ul>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Calcolo automatico</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Percentuali categoria</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Export PDF</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowBudgetWizard(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Crea il Tuo Budget
                    </Button>
                  </div>
                </>
              ) : (
                // ✅ CI SONO BUDGET - Mini Info
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Budget Creati: {budgets.length}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBudgetWizard(true)}
                      className="bg-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuovo Budget
                    </Button>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    Gestisci i budget esistenti: visualizza dettagli, modifica voci di costo o esporta in PDF
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Totale Budget</p>
                      <p className="text-lg font-bold text-blue-900">
                        {budgets.length}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Categorie Totali</p>
                      <p className="text-lg font-bold text-blue-900">
                        {budgets.reduce((sum, b) => sum + b.categories.length, 0)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Voci di Costo</p>
                      <p className="text-lg font-bold text-blue-900">
                        {budgets.reduce(
                          (sum, b) => 
                            sum + b.categories.reduce((s, c) => s + c.items.length, 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ===================================================
          LOADING BUDGETS
      =================================================== */}
      {loadingBudgets && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Caricamento budget...</p>
          </div>
        </div>
      )}

      {/* ===================================================
          BUDGETS LIST
      =================================================== */}
      {!loadingBudgets && budgets.length > 0 && (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <Card key={budget.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold">{budget.title}</h3>
                    <Badge variant="secondary">
                      {projectTypeLabels[budget.project_type]}
                    </Badge>
                    <Badge variant="outline">{budget.currency}</Badge>
                  </div>

                  {budget.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {budget.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Totale Costi</p>
                      <p className="text-lg font-semibold">
                        {currencySymbol(budget.currency)}{' '}
                        {budget.total_cost.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Contingenza ({budget.contingency_percentage}%)
                      </p>
                      <p className="text-lg font-semibold text-orange-600">
                        {currencySymbol(budget.currency)}{' '}
                        {budget.contingency_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Totale Generale</p>
                      <p className="text-xl font-bold text-blue-600">
                        {currencySymbol(budget.currency)}{' '}
                        {budget.grand_total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span>{budget.categories.length} categorie</span>
                    <span>•</span>
                    <span>
                      {budget.categories.reduce((sum, cat) => sum + cat.items.length, 0)} voci
                    </span>
                    <span>•</span>
                    <span>{new Date(budget.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setViewingBudget(budget)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBudget(budget)
                      setShowBudgetWizard(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportPDF(budget)}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ===================================================
          MODALS
      =================================================== */}
      {showBudgetWizard && (
        <BudgetWizard
          projectId={selectedProjectId}
          existingBudget={editingBudget}
          onClose={() => {
            setShowBudgetWizard(false)
            setEditingBudget(undefined)
            loadBudgets()
          }}
        />
      )}

      {viewingBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Visualizza Budget</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExportPDF(viewingBudget)}>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta PDF
                </Button>
                <Button variant="ghost" onClick={() => setViewingBudget(undefined)}>
                  Chiudi
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <BudgetSummary budget={viewingBudget} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}