
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, TestTube, Eye, FileText, RefreshCw } from 'lucide-react';

interface ImportExportControlsProps {
  systemName: string;
  onImport: () => void;
  onExport: () => void;
  onTest: () => void;
  connected: boolean;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({
  systemName,
  onImport,
  onExport,
  onTest,
  connected
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await onImport();
      // Simulate import process
      setTimeout(() => {
        setIsImporting(false);
      }, 3000);
    } catch (error) {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
      // Simulate export process
      setTimeout(() => {
        setIsExporting(false);
      }, 2000);
    } catch (error) {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    setPreviewData({
      recordCount: Math.floor(Math.random() * 100) + 1,
      sampleFields: ['Asset Name', 'Purchase Date', 'Cost', 'Department'],
      conflicts: Math.floor(Math.random() * 5)
    });
  };

  const downloadLog = () => {
    const logData = `${systemName} Integration Log
Generated: ${new Date().toISOString()}
Status: ${connected ? 'Connected' : 'Disconnected'}
Last Activity: Manual test connection
`;
    
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${systemName.toLowerCase()}-integration-log.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Integration Controls - {systemName}
        </CardTitle>
        <CardDescription>
          Manual controls for import, export, and testing operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            onClick={handleImport} 
            disabled={!connected || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isImporting ? 'Importing...' : 'Import Now'}
          </Button>
          
          <Button 
            onClick={handleExport} 
            disabled={!connected || isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export Now'}
          </Button>
          
          <Button 
            onClick={onTest} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Connection
          </Button>
          
          <Button 
            onClick={handlePreview} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Data
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={downloadLog} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download Log
          </Button>
          
          <Badge variant={connected ? 'default' : 'destructive'}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {previewData && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Data Preview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Records: {previewData.recordCount}</div>
              <div>Conflicts: {previewData.conflicts}</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                Fields: {previewData.sampleFields.join(', ')}
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Import operations will merge data with existing records</p>
          <p>• Export operations will generate formatted files for {systemName}</p>
          <p>• Test connection to verify system accessibility</p>
        </div>
      </CardContent>
    </Card>
  );
};
