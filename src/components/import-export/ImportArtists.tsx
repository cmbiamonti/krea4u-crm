// components/import-export/ImportArtists.tsx
'use client';

//import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//import { Button } from '@/components/ui/button';
//import { Progress } from '@/components/ui/progress';
//import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { useDropzone } from 'react-dropzone';
//import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
//import * as XLSX from 'xlsx';
import { CSVImporter } from './CSVImporter';
import { InstagramImporter } from './InstagramImporter';
import { WebScraperImporter } from '@/components/settings/WebScraperImporter'
import { GoogleContactsImporter } from '@/components/settings/GoogleContactsImporter'

export function ImportArtists() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Artists</CardTitle>
        <CardDescription>
          Choose your preferred method to import artist data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="csv">CSV/Excel</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="google">Google Contacts</TabsTrigger>
            <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
          </TabsList>

          <TabsContent value="csv">
            <CSVImporter />
          </TabsContent>

          <TabsContent value="instagram">
            <InstagramImporter />
          </TabsContent>

          <TabsContent value="google">
            <GoogleContactsImporter />
          </TabsContent>

          <TabsContent value="scraper">
            <WebScraperImporter />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}