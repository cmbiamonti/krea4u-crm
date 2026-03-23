// app/import-export/page.tsx
'use client';

//import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportArtists } from '@/components/import-export/ImportArtists';
import { ImportVenues } from '@/components/import-export/ImportVenues';
import { ExportData } from '@/components/import-export/ExportData';
import { Download, Upload } from 'lucide-react';

export default function ImportExportPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import/Export Data</h1>
        <p className="text-muted-foreground">
          Manage your data with advanced import and export tools
        </p>
      </div>

      <Tabs defaultValue="import-artists" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import-artists">
            <Upload className="h-4 w-4 mr-2" />
            Import Artists
          </TabsTrigger>
          <TabsTrigger value="import-venues">
            <Upload className="h-4 w-4 mr-2" />
            Import Venues
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import-artists">
          <ImportArtists />
        </TabsContent>

        <TabsContent value="import-venues">
          <ImportVenues />
        </TabsContent>

        <TabsContent value="export">
          <ExportData />
        </TabsContent>
      </Tabs>
    </div>
  );
}