import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { Upload, FileSpreadsheet, Download, AlertCircle, History } from 'lucide-react';
import FileUploader from '@/components/import/FileUploader';
import DataPreview from '@/components/import/DataPreview';
import ColumnMapper from '@/components/import/ColumnMapper';
import ImportSummary from '@/components/import/ImportSummary';
import ImportLogs from '@/components/import/ImportLogs';
import ExportModule from '@/components/import/ExportModule';
import FileFormatRequirements from '@/components/import/FileFormatRequirements';
import { HistoricalImportWizard } from '@/components/import/HistoricalImportWizard';

export interface ImportData {
  [key: string]: string | number;
}

export interface ColumnMapping {
  [importColumn: string]: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
  batchId: string;
  newFields: string[];
}

const ImportExport = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'mapping' | 'summary'>('upload');
  const [rawData, setRawData] = useState<ImportData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const currentUser = authService.getCurrentUser();

  // Check permissions
  if (!currentUser || !authService.hasPermission('write', 'assets')) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Import & Export Assets</h1>
          <p className="text-gray-400">Bulk import and export asset data from Excel or CSV files</p>
        </div>
        <Card className="bg-black/60 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>You don't have permission to import assets.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUploaded = (data: ImportData[], fileHeaders: string[], filename: string) => {
    setRawData(data);
    setHeaders(fileHeaders);
    setFileName(filename);
    setCurrentStep('preview');
  };

  const handleDataChanged = (updatedData: ImportData[]) => {
    setRawData(updatedData);
  };

  const handlePreviewConfirmed = () => {
    setCurrentStep('mapping');
  };

  const handleMappingCompleted = (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
    setCurrentStep('summary');
  };

  const handleImportCompleted = (result: ImportResult) => {
    setImportResult(result);
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setRawData([]);
    setHeaders([]);
    setColumnMapping({});
    setImportResult(null);
    setFileName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Import & Export Assets</h1>
        <p className="text-gray-400">Bulk import and export asset data from Excel or CSV files</p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/60 border border-gray-500/20">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Standard Import
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Historical Import
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Import History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-6">
            {[
              { key: 'upload', label: 'Upload File', icon: Upload },
              { key: 'preview', label: 'Preview Data', icon: FileSpreadsheet },
              { key: 'mapping', label: 'Map Columns', icon: Download },
              { key: 'summary', label: 'Import Summary', icon: AlertCircle }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep === step.key 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : index < ['upload', 'preview', 'mapping', 'summary'].indexOf(currentStep)
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-black/60 border-gray-500 text-gray-400'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm ${
                  currentStep === step.key ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < 3 && <div className="w-8 h-px bg-gray-600" />}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {currentStep === 'upload' && (
              <>
                <FileFormatRequirements />
                <FileUploader onFileUploaded={handleFileUploaded} />
              </>
            )}

            {currentStep === 'preview' && (
              <DataPreview 
                data={rawData}
                headers={headers}
                fileName={fileName}
                onConfirm={handlePreviewConfirmed}
                onBack={() => setCurrentStep('upload')}
                onDataChange={handleDataChanged}
              />
            )}

            {currentStep === 'mapping' && (
              <ColumnMapper
                headers={headers}
                sampleData={rawData[0] || {}}
                onMappingComplete={handleMappingCompleted}
                onBack={() => setCurrentStep('preview')}
              />
            )}

            {currentStep === 'summary' && (
              <ImportSummary
                data={rawData}
                mapping={columnMapping}
                fileName={fileName}
                onImportComplete={handleImportCompleted}
                onBack={() => setCurrentStep('mapping')}
                onReset={resetImport}
                result={importResult}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <Card className="bg-black/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-500" />
                Historical Asset Data Import
              </CardTitle>
              <CardDescription className="text-gray-400">
                Import comprehensive historical asset data with depreciation history and impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoricalImportWizard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <ExportModule />
        </TabsContent>

        <TabsContent value="history">
          <ImportLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportExport;
