
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { assetService } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ExcelImport component for handling Excel/CSV file uploads (legacy component)
const ExcelImport = () => {
  // State to track loading status during file processing
  const [isLoading, setIsLoading] = useState(false);
  // State to store validation errors
  const [errors, setErrors] = useState<string[]>([]);
  // State to track successful imports count
  const [successCount, setSuccessCount] = useState(0);
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // Handle file upload and processing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Get the selected file from the input
    const file = event.target.files?.[0];
    // Return early if no file selected
    if (!file) return;

    // Set loading state to true
    setIsLoading(true);
    // Clear previous errors
    setErrors([]);
    // Reset success count
    setSuccessCount(0);

    try {
      // Read file content as text (simple CSV parsing for demo purposes)
      const text = await file.text();
      // Split text into lines
      const lines = text.split('\n');
      // Extract headers from first line and clean them
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Process data lines (skip header)
      const data = lines.slice(1)
        .filter(line => line.trim())  // Remove empty lines
        .map(line => {
          // Split line into values and clean them
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          // Map each header to its corresponding value
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

      // Import assets using the asset service
      const result = assetService.importAssetsFromExcel(data);
      // Update success count
      setSuccessCount(result.success);
      // Update errors array
      setErrors(result.errors);

      // Show success toast if any assets were imported
      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} assets.`,
        });
      }

      // Show warning toast if there were errors
      if (result.errors.length > 0) {
        toast({
          title: 'Import Warnings',
          description: `${result.errors.length} rows had errors.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Show error toast if file processing fails
      toast({
        title: 'Import Failed',
        description: 'Failed to process the file. Please check the format.',
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  // Render the component
  return (
    <Card className="glass-effect border-dark-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-neon-green" />
          Import Assets from Excel
        </CardTitle>
        <CardDescription className="text-dark-muted">
          Upload a CSV/Excel file to import multiple assets at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File input section */}
        <div className="space-y-2">
          <Label htmlFor="excel-file" className="text-dark-text">
            Select File (CSV format)
          </Label>
          <Input
            id="excel-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="bg-black border-green-500/30 text-white file:bg-green-500/20 file:text-white file:border-0"
          />
        </div>

        {/* Instructions section */}
        <div className="text-sm text-gray-400 space-y-2">
          <p>Expected columns: name, type, category, purchaseDate, purchasePrice, depreciationRate, residualValue, owner, department, company, location, office, vendor, status, depreciationMethod, usefulLife, notes</p>
          <p>Date format: YYYY-MM-DD</p>
        </div>

        {/* Success message */}
        {successCount > 0 && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <AlertCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Successfully imported {successCount} assets.
            </AlertDescription>
          </Alert>
        )}

        {/* Error messages */}
        {errors.length > 0 && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              <div className="space-y-1">
                <p>Errors encountered:</p>
                {/* Show first 10 errors with option to show more */}
                <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && <li>... and {errors.length - 10} more</li>}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="text-white">Processing file...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelImport;
