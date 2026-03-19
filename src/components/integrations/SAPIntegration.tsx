
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportExportControls } from './ImportExportControls';
import { FieldMapper } from './FieldMapper';
import { SyncStatus } from './SyncStatus';
import { Building, Download, Upload, FileText, CheckCircle, AlertCircle, History } from 'lucide-react';

export const SAPIntegration: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastSync, setLastSync] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const sapModules = [
    { name: 'Asset Accounting (FI-AA)', status: 'ready', count: 0 },
    { name: 'Equipment Master', status: 'ready', count: 0 },
    { name: 'Depreciation Postings', status: 'pending', count: 0 },
    { name: 'Asset Transfers', status: 'pending', count: 0 },
    { name: 'Asset Disposals', status: 'ready', count: 0 },
    { name: 'Change Logs', status: 'ready', count: 0 }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }))]);
  };

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-orange-500" />
            SAP ERP Integration
          </CardTitle>
          <CardDescription>
            Enterprise-grade integration with SAP modules for comprehensive asset management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Status</label>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {connectionStatus === 'disconnected' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {connectionStatus === 'testing' && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                <span className="text-sm capitalize">{connectionStatus}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Uploaded Files</label>
              <Badge variant="outline">{uploadedFiles.length} files</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button size="sm" onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">File Upload</CardTitle>
          <CardDescription>Upload SAP export files (Excel, CSV, XML) for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.xml"
                onChange={handleFileUpload}
                className="hidden"
                id="sap-file-upload"
              />
              <label htmlFor="sap-file-upload" className="cursor-pointer">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload SAP export files</p>
                <p className="text-xs text-muted-foreground">Supports Excel, CSV, and XML formats</p>
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Files</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Import from SAP</CardTitle>
            <CardDescription>Import asset data from SAP modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sapModules.filter(m => ['Asset Accounting (FI-AA)', 'Equipment Master', 'Change Logs'].includes(m.name)).map((module) => (
                <div key={module.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={module.status === 'ready' ? 'default' : 'secondary'}>
                      {module.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({module.count})</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" disabled={uploadedFiles.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Process SAP Import
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Export to SAP</CardTitle>
            <CardDescription>Export depreciation and transaction data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sapModules.filter(m => ['Depreciation Postings', 'Asset Transfers', 'Asset Disposals'].includes(m.name)).map((module) => (
                <div key={module.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={module.status === 'ready' ? 'default' : 'secondary'}>
                      {module.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({module.count})</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Generate SAP Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>Track all SAP integration activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No audit trail entries yet</p>
              <p className="text-xs">Integration activities will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping">
          <FieldMapper 
            sourceSystem="SAP" 
            mappings={[
              { source: 'ANLN1', target: 'serialNumber', mapped: true },
              { source: 'TXT50', target: 'name', mapped: true },
              { source: 'ANLKL', target: 'category', mapped: false },
              { source: 'AKTIV', target: 'purchaseDate', mapped: true },
              { source: 'KANSW', target: 'purchasePrice', mapped: true },
              { source: 'KOSTL', target: 'department', mapped: false }
            ]}
          />
        </TabsContent>

        <TabsContent value="status">
          <SyncStatus 
            systemName="SAP"
            lastSync={lastSync}
            status={connectionStatus}
          />
        </TabsContent>

        <TabsContent value="controls">
          <ImportExportControls 
            systemName="SAP"
            onImport={() => console.log('Import from SAP')}
            onExport={() => console.log('Export to SAP')}
            onTest={handleTestConnection}
            connected={connectionStatus === 'connected'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
