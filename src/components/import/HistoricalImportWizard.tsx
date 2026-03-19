import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploader from '@/components/import/FileUploader';
import { HistoricalDataPreview } from './HistoricalDataPreview';
import { HistoricalColumnMapper } from './HistoricalColumnMapper';
import { ImpactAnalysisPreview } from './ImpactAnalysisPreview';
import { HistoricalImportSummary } from './HistoricalImportSummary';
import { HistoricalImportData, ImportBatch } from '@/types/historical-asset';
import { HistoricalAssetService } from '@/lib/historical-asset-service';
import { CheckCircle, Upload, MapPin, Calculator, FileCheck, AlertTriangle } from 'lucide-react';

type ImportStep = 'upload' | 'preview' | 'mapping' | 'impact' | 'confirm' | 'complete';

interface ImportStepInfo {
  id: ImportStep;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const importSteps: ImportStepInfo[] = [
  {
    id: 'upload',
    title: 'File Upload',
    description: 'Upload historical FA register Excel file',
    icon: Upload
  },
  {
    id: 'preview',
    title: 'Data Preview',
    description: 'Review and validate imported data',
    icon: FileCheck
  },
  {
    id: 'mapping',
    title: 'Column Mapping',
    description: 'Map Excel columns to system fields',
    icon: MapPin
  },
  {
    id: 'impact',
    title: 'Impact Analysis',
    description: 'Calculate depreciation impact',
    icon: Calculator
  },
  {
    id: 'confirm',
    title: 'Confirmation',
    description: 'Review and confirm import',
    icon: CheckCircle
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Import completed successfully',
    icon: CheckCircle
  }
];

export const HistoricalImportWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [mappedData, setMappedData] = useState<HistoricalImportData[]>([]);
  const [importBatch, setImportBatch] = useState<ImportBatch | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCurrentStepIndex = () => {
    return importSteps.findIndex(step => step.id === currentStep);
  };

  const getProgressPercentage = () => {
    return ((getCurrentStepIndex() + 1) / importSteps.length) * 100;
  };

  const handleFileUploaded = (data: any[], fileHeaders: string[], filename: string) => {
    setRawData(data);
    setHeaders(fileHeaders);
    setFileName(filename);
    
    // Create import batch
    const batch = HistoricalAssetService.createImportBatch({
      batch_name: `Historical_Import_${filename}`,
      file_name: filename,
      imported_by: 'Current User'
    });
    setImportBatch(batch);
    
    setCurrentStep('preview');
  };

  const handleDataValidated = () => {
    setCurrentStep('mapping');
  };

  const handleMappingCompleted = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    
    // Transform raw data using column mapping
    const transformed = transformDataWithMapping(rawData, mapping);
    setMappedData(transformed);
    
    setCurrentStep('impact');
  };

  const handleImpactCalculated = () => {
    setCurrentStep('confirm');
  };

  const handleImportConfirmed = async () => {
    if (!importBatch) return;
    
    setIsProcessing(true);
    try {
      // Process the historical import
      HistoricalAssetService.processHistoricalImport(
        importBatch.id,
        mappedData,
        'Current User'
      );
      
      setCurrentStep('complete');
    } catch (error) {
      console.error('Import processing failed:', error);
      setValidationErrors(['Import processing failed. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setRawData([]);
    setHeaders([]);
    setFileName('');
    setColumnMapping({});
    setMappedData([]);
    setImportBatch(null);
    setValidationErrors([]);
  };

  const transformDataWithMapping = (data: any[], mapping: Record<string, string>): HistoricalImportData[] => {
    return data.map(row => {
      const transformed: any = {};
      
      // Map basic fields
      Object.entries(mapping).forEach(([excelColumn, systemField]) => {
        if (row[excelColumn] !== undefined) {
          transformed[systemField] = row[excelColumn];
        }
      });

      // Extract year-wise data (assuming columns like "2019-20_Dep", "2020-21_Dep", etc.)
      const yearWiseData: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        const yearMatch = key.match(/(\d{4}-\d{2})_(Opening|Dep|Closing)/);
        if (yearMatch) {
          const [, year, type] = yearMatch;
          if (!yearWiseData[year]) {
            yearWiseData[year] = {};
          }
          yearWiseData[year][type.toLowerCase() === 'dep' ? 'depreciation' : `${type.toLowerCase()}_value`] = row[key];
        }
      });

      return {
        ...transformed,
        year_wise_data: yearWiseData
      };
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUploader
            onFileUploaded={handleFileUploaded}
          />
        );

      case 'preview':
        return (
          <HistoricalDataPreview
            data={rawData}
            headers={headers}
            onValidated={handleDataValidated}
            onErrorsFound={setValidationErrors}
          />
        );

      case 'mapping':
        return (
          <HistoricalColumnMapper
            headers={headers}
            sampleData={rawData.slice(0, 3)}
            onMappingCompleted={handleMappingCompleted}
          />
        );

      case 'impact':
        return (
          <ImpactAnalysisPreview
            data={mappedData}
            onCalculationCompleted={handleImpactCalculated}
          />
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to Import</h3>
              <p className="text-muted-foreground mb-4">
                Please review the import summary and confirm to proceed.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Import Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">File Name:</span>
                    <p className="font-medium">{fileName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total Assets:</span>
                    <p className="font-medium">{mappedData.length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Batch ID:</span>
                    <p className="font-medium">{importBatch?.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Import Type:</span>
                    <p className="font-medium">Historical FA Register</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {validationErrors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationErrors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep('impact')}>
                Back
              </Button>
              <Button 
                onClick={handleImportConfirmed}
                disabled={isProcessing || validationErrors.length > 0}
              >
                {isProcessing ? 'Processing...' : 'Confirm Import'}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <HistoricalImportSummary
            batch={importBatch!}
            onStartNewImport={resetImport}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Historical Asset Import Wizard</span>
          </CardTitle>
          <CardDescription>
            Import complete historical FA register data with automatic impact analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Import Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {getCurrentStepIndex() + 1} of {importSteps.length}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="mb-4" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {importSteps.map((step, index) => {
                const Icon = step.icon;
                const isCurrent = step.id === currentStep;
                const isCompleted = index < getCurrentStepIndex();
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};