
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, AlertCircle } from 'lucide-react';
import ImportProgress from './ImportProgress';
import ImportResultComponent from './ImportResult';
import { ImportProcessor } from './ImportProcessor';
import type { ImportData, ColumnMapping, ImportResult } from '@/pages/Import';

// Define the props interface for ImportSummary component
interface ImportSummaryProps {
  data: ImportData[];                                    // Array of imported data rows
  mapping: ColumnMapping;                                // Column mapping configuration
  fileName: string;                                      // Name of the uploaded file
  onImportComplete: (result: ImportResult) => void;     // Callback when import is complete
  onBack: () => void;                                    // Callback to go back to previous step
  onReset: () => void;                                   // Callback to reset the import process
  result: ImportResult | null;                          // Import result data (null if not complete)
}

// Main ImportSummary component for final review before importing
const ImportSummary: React.FC<ImportSummaryProps> = ({
  data,
  mapping,
  fileName,
  onImportComplete,
  onBack,
  onReset,
  result
}) => {
  // State to track if import is currently in progress
  const [isImporting, setIsImporting] = useState(false);
  // State to track import progress percentage
  const [progress, setProgress] = useState(0);
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // Function to handle the import process
  const handleImport = async () => {
    // Set importing state to true
    setIsImporting(true);
    // Reset progress to 0
    setProgress(0);

    try {
      // Process the import data using the ImportProcessor
      const processedData = ImportProcessor.processImportData(data, mapping);
      
      // Execute the actual import with progress tracking
      const importResult = await ImportProcessor.executeImport(
        processedData,
        data,
        fileName,
        mapping,
        setProgress
      );

      // Call the completion callback with the result
      onImportComplete(importResult);

      // Show success toast notification
      toast({
        title: 'Import Completed',
        description: `Successfully imported ${importResult.success} assets. Service dates and reminders have been automatically configured.`,
      });

    } catch (error) {
      // Show error toast notification if import fails
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      // Reset importing state regardless of success or failure
      setIsImporting(false);
    }
  };

  // If import is complete, show the result component
  if (result) {
    return <ImportResultComponent result={result} onReset={onReset} />;
  }

  // Render the import summary interface
  return (
    <Card className="bg-black/60 border-green-500/30">
      <CardHeader>
        {/* Card title */}
        <CardTitle className="text-white">Import Summary</CardTitle>
        {/* Card description */}
        <p className="text-gray-400">Review and confirm the import</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import progress component - only visible during import */}
        <ImportProgress isImporting={isImporting} progress={progress} />

        {/* Auto-configuration information alert */}
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <strong>Auto-Configuration:</strong> Assets without warranty, AMC, or insurance dates will be automatically configured with industry-standard durations. Service reminders will be created automatically.
          </AlertDescription>
        </Alert>

        {/* Import summary information */}
        <div className="space-y-2">
          {/* File name display */}
          <div className="flex justify-between">
            <span className="text-gray-400">File:</span>
            <span className="text-white">{fileName}</span>
          </div>
          {/* Record count display */}
          <div className="flex justify-between">
            <span className="text-gray-400">Records to import:</span>
            <span className="text-white">{data.length}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Back button */}
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isImporting}
            className="border-gray-600 text-gray-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {/* Import button */}
          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing...' : 'Start Import'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportSummary;
