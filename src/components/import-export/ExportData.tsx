// components/import-export/ExportData.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner';

export function ExportData() {
  const [exportType] = useState<'artists' | 'venues' | 'projects'>('artists');
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeImages, setIncludeImages] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'first_name',
    'last_name',
    'email',
    'city',
    'medium',
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const artistFields = [
    { id: 'first_name', label: 'First Name' },
    { id: 'last_name', label: 'Last Name' },
    { id: 'email', label: 'Email' },
    { id: 'nationality', label: 'Nationality' },
    { id: 'city', label: 'City' },
    { id: 'medium', label: 'Medium' },
    { id: 'bio', label: 'Bio' },
    { id: 'website', label: 'Website' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'phone', label: 'Phone' },
  ];

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch data
      const { data, error } = await supabase
        .from(exportType)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Filter fields
      const filteredData = data.map(item => {
        const filtered: any = {};
        selectedFields.forEach(field => {
          filtered[field] = item[field];
        });
        return filtered;
      });

      // Export based on format
      if (format === 'excel') {
        exportToExcel(filteredData);
      } else if (format === 'csv') {
        exportToCSV(filteredData);
      } else if (format === 'pdf') {
        exportToPDF(filteredData);
      }

      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportType);
    XLSX.writeFile(wb, `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToPDF = (data: any[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const headers = selectedFields.map(field => 
      artistFields.find(f => f.id === field)?.label || field
    );

    const rows = data.map(item =>
      selectedFields.map(field => item[field] || '-')
    );

    (doc as any).autoTable({
      startY: 35,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 8 },
    });

    doc.save(`${exportType}_export_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Export Artists */}
      <Card>
        <CardHeader>
          <CardTitle>Export Artists</CardTitle>
          <CardDescription>
            Export your artist database with custom field selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)} className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="font-normal">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal">CSV (.csv)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal">PDF (.pdf)</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Select Fields</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFields(artistFields.map(f => f.id))}
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {artistFields.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label htmlFor={field.id} className="font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-images"
              checked={includeImages}
              onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
            />
            <Label htmlFor="include-images" className="font-normal">
              Include profile images (Excel only)
            </Label>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Artists
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Export Projects</CardTitle>
          <CardDescription>
            Export project data and reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Export All Projects (Excel)
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Export Project Reports (PDF)
          </Button>
        </CardContent>
      </Card>

      {/* Full Database Export (Admin) */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Full Database Export</CardTitle>
          <CardDescription>
            Export complete database (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Export Complete Database (JSON + Images)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}