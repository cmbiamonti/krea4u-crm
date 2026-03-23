// src/components/collaborators/CollaboratorsStats.tsx

import { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collaboratorService } from '@/services/collaborator.service';

export default function CollaboratorsStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collaboratorService.getStatistics();
      console.log('✅ Stats loaded:', data);
      setStats(data);
    } catch (error: any) {
      console.error('❌ Error loading stats:', error);
      setError(error.message || 'Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Errore nel caricamento
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {error || 'Impossibile caricare le statistiche'}
            </p>
            <button
              onClick={loadStats}
              className="text-primary hover:underline text-sm"
            >
              Riprova
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale Collaboratori
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tutti i collaboratori registrati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Per Ruolo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.byRole || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ruoli diversi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorie
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.byCategory || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorie attive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Ruolo</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.byRole || {}).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nessun ruolo assegnato
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{role || 'Non specificato'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${((count as number) / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.byCategory || {}).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nessuna categoria assegnata
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([categoryId, count]) => (
                <div key={categoryId} className="flex items-center justify-between">
                  <span className="text-sm font-medium">Categoria {categoryId.slice(0, 8)}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${((count as number) / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}