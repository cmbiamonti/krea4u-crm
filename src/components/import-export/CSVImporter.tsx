// components/import-export/CSVImporter.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner';

interface ImportRow {
  first_name: string;
  last_name: string;
  email: string;
  nationality?: string;
  city?: string;
  medium?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function CSVImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip');
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    duplicates: number;
  } | null>(null);


  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        nationality: 'Italian',
        city: 'Milan',
        medium: 'Painting',
        bio: 'Contemporary artist specializing in abstract paintings',
        website: 'https://johndoe.com',
        instagram: '@johndoe_art',
        phone: '+39 123 456 7890',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Artists');

    // Add instructions sheet
    const instructions = [
      { Field: 'first_name', Required: 'Yes', Description: 'Artist first name' },
      { Field: 'last_name', Required: 'Yes', Description: 'Artist last name' },
      { Field: 'email', Required: 'Yes', Description: 'Valid email address (unique)' },
      { Field: 'nationality', Required: 'No', Description: 'Nationality' },
      { Field: 'city', Required: 'No', Description: 'City of residence' },
      { Field: 'medium', Required: 'No', Description: 'Primary artistic medium' },
      { Field: 'bio', Required: 'No', Description: 'Artist biography' },
      { Field: 'website', Required: 'No', Description: 'Personal website URL' },
      { Field: 'instagram', Required: 'No', Description: 'Instagram handle' },
      { Field: 'phone', Required: 'No', Description: 'Phone number' },
    ];
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    XLSX.writeFile(wb, 'artists_import_template.xlsx');
  };

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setIsValidating(true);
    setErrors([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];

        // Validate data
        const validationErrors = validateData(json);
        setErrors(validationErrors);
        
        if (validationErrors.length === 0) {
          setData(json);
          setPreviewData(json.slice(0, 10));
          toast.success('File validated successfully');
        } else {
          toast.error(`Found ${validationErrors.length} validation errors`);
        }
      } catch (error) {
        toast.error('Failed to parse file');
        console.error(error);
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  // Validation function
  const validateData = (data: ImportRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const emails = new Set<string>();

    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel row number (1-indexed + header)

      // Required fields
      if (!row.first_name?.trim()) {
        errors.push({ row: rowNum, field: 'first_name', message: 'Required field' });
      }
      if (!row.last_name?.trim()) {
        errors.push({ row: rowNum, field: 'last_name', message: 'Required field' });
      }
      if (!row.email?.trim()) {
        errors.push({ row: rowNum, field: 'email', message: 'Required field' });
      } else {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({ row: rowNum, field: 'email', message: 'Invalid email format' });
        }
        // Check duplicates in file
        if (emails.has(row.email.toLowerCase())) {
          errors.push({ row: rowNum, field: 'email', message: 'Duplicate email in file' });
        }
        emails.add(row.email.toLowerCase());
      }

      // URL validation
      if (row.website && !isValidUrl(row.website)) {
        errors.push({ row: rowNum, field: 'website', message: 'Invalid URL' });
      }
    });

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Import function
  const handleImport = async () => {
    if (data.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to import data');
      setIsImporting(false);
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Check for existing artist
        const { data: existing } = await supabase
          .from('artists')
          .select('id')
          .eq('email', row.email.toLowerCase())
          .single();

        if (existing) {
          duplicateCount++;
          
        if (duplicateStrategy === 'update') {
            // Update existing
            const supabaseClient: any = supabase
            
            const result: any = await supabaseClient
                .from('artists')
                .update({
                first_name: row.first_name,
                last_name: row.last_name,
                nationality: row.nationality || null,
                city: row.city || null,
                medium: row.medium || null,
                bio: row.bio || null,
                website: row.website || null,
                instagram: row.instagram || null,
                phone: row.phone || null,
                updated_at: new Date().toISOString(),
                })
                .eq('id', (existing as any).id)

            if (result.error) throw result.error
            successCount++
            }
          // If 'skip', just count as duplicate
             } else {
            // Insert new artist
            const insertData: any = {
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email.toLowerCase(),
                nationality: row.nationality || null,
                city: row.city || null,
                medium: row.medium || null,
                bio: row.bio || null,
                website: row.website || null,
                instagram: row.instagram || null,
                phone: row.phone || null,
                created_by: user.id,
            }

  const result: any = await supabase
    .from('artists')
    .insert(insertData)

  if (result.error) throw result.error
}
      } catch (error) {
        console.error(`Failed to import row ${i + 2}:`, error);
        failedCount++;
      }

      setImportProgress(((i + 1) / data.length) * 100);
    }

    setImportResult({ success: successCount, failed: failedCount, duplicates: duplicateCount });
    setIsImporting(false);

    toast.success(`Import complete! ${successCount} artists imported`);
  };

  // Download error log
  const downloadErrorLog = () => {
    const errorData = errors.map(err => ({
      Row: err.row,
      Field: err.field,
      Error: err.message,
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
    XLSX.writeFile(wb, 'import_errors.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Download Template */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-semibold">Download Import Template</h3>
          <p className="text-sm text-muted-foreground">
            Get a pre-formatted Excel file with sample data and instructions
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the file here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse (CSV, XLS, XLSX)
            </p>
            <Button variant="secondary">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </>
        )}
      </div>

      {/* Validation Status */}
      {file && (
        <Alert>
          <FileSpreadsheet className="h-4 w-4" />
          <AlertDescription>
            <strong>File loaded:</strong> {file.name}
            {isValidating && ' - Validating...'}
            {!isValidating && errors.length === 0 && ` - ${data.length} rows ready to import`}
            {!isValidating && errors.length > 0 && ` - ${errors.length} errors found`}
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <strong>{errors.length} validation errors found</strong>
              <Button onClick={downloadErrorLog} variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download Error Log
              </Button>
            </div>
            <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
              {errors.slice(0, 10).map((err, i) => (
                <div key={i}>
                  Row {err.row}, {err.field}: {err.message}
                </div>
              ))}
              {errors.length > 10 && (
                <div className="text-muted-foreground">
                  ... and {errors.length - 10} more errors
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && errors.length === 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold">
            Preview (first 10 rows)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">City</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Medium</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 text-sm">
                      {row.first_name} {row.last_name}
                    </td>
                    <td className="px-4 py-2 text-sm">{row.email}</td>
                    <td className="px-4 py-2 text-sm">{row.city || '-'}</td>
                    <td className="px-4 py-2 text-sm">{row.medium || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Options */}
      {data.length > 0 && errors.length === 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Import Options</h3>
            <RadioGroup value={duplicateStrategy} onValueChange={(value: any) => setDuplicateStrategy(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="skip" id="skip" />
                <Label htmlFor="skip">Skip duplicates (don't import existing emails)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update">Update existing records</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Import {data.length} Artists
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isImporting && (
            <div className="space-y-2">
              <Progress value={importProgress} />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(importProgress)}% complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Import Complete!</strong>
            <div className="mt-2 space-y-1 text-sm">
              <div>✓ {importResult.success} artists successfully imported</div>
              {importResult.duplicates > 0 && (
                <div>⚠ {importResult.duplicates} duplicates {duplicateStrategy === 'skip' ? 'skipped' : 'updated'}</div>
              )}
              {importResult.failed > 0 && (
                <div className="text-destructive">✗ {importResult.failed} failed</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}