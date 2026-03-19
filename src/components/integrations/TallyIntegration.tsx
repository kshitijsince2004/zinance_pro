
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportExportControls } from './ImportExportControls';
import { FieldMapper } from './FieldMapper';
import { SyncStatus } from './SyncStatus';
import { Database, Download, Upload, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export const TallyIntegration: React.FC = () => {
  const [tallyVersion, setTallyVersion] = useState('Not Detected');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastSync, setLastSync] = useState(null);

  const tallyFeatures = [
    { name: 'Ledger Accounts', status: 'ready', count: 0 },
    { name: 'Cost Centers', status: 'ready', count: 0 },
    { name: 'Asset Entries', status: 'ready', count: 0 },
    { name: 'Depreciation Entries', status: 'pending', count: 0 },
    { name: 'Disposal Entries', status: 'pending', count: 0 },
    { name: 'Insurance Vouchers', status: 'ready', count: 0 }
  ];

  const handleDetectTally = () => {
    // Simulate Tally detection
    const versions = ['Tally.ERP 9', 'TallyPrime 1.0', 'TallyPrime 2.0', 'TallyPrime 3.0'];
    const detected = versions[Math.floor(Math.random() * versions.length)];
    setTallyVersion(detected);
    setConnectionStatus('connected');
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
            <Database className="w-5 h-5 text-green-500" />
            Tally Integration Setup
          </CardTitle>
          <CardDescription>
            Configure integration with Tally ERP and TallyPrime for seamless asset data sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tally Version</label>
              <div className="flex items-center gap-2">
                <Badge variant={tallyVersion === 'Not Detected' ? 'destructive' : 'default'}>
                  {tallyVersion}
                </Badge>
                <Button size="sm" onClick={handleDetectTally}>
                  Auto-Detect
                </Button>
              </div>
            </div>
            
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
              <label className="text-sm font-medium">Actions</label>
              <Button size="sm" onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Import from Tally</CardTitle>
            <CardDescription>Import ledgers, cost centers, and asset data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tallyFeatures.filter(f => ['Ledger Accounts', 'Cost Centers', 'Asset Entries'].includes(f.name)).map((feature) => (
                <div key={feature.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feature.status === 'ready' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({feature.count})</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" disabled={connectionStatus !== 'connected'}>
              <Download className="w-4 h-4 mr-2" />
              Import from Tally
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Export to Tally</CardTitle>
            <CardDescription>Export depreciation and disposal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tallyFeatures.filter(f => ['Depreciation Entries', 'Disposal Entries', 'Insurance Vouchers'].includes(f.name)).map((feature) => (
                <div key={feature.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feature.status === 'ready' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({feature.count})</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" disabled={connectionStatus !== 'connected'}>
              <Upload className="w-4 h-4 mr-2" />
              Export to Tally XML
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping">
          <FieldMapper 
            sourceSystem="Tally" 
            mappings={[
              { source: 'Company Name', target: 'company', mapped: true },
              { source: 'Cost Center', target: 'department', mapped: true },
              { source: 'Ledger Name', target: 'category', mapped: false },
              { source: 'Asset Name', target: 'name', mapped: true },
              { source: 'Purchase Date', target: 'purchaseDate', mapped: true },
              { source: 'Asset Value', target: 'purchasePrice', mapped: true }
            ]}
          />
        </TabsContent>

        <TabsContent value="status">
          <SyncStatus 
            systemName="Tally"
            lastSync={lastSync}
            status={connectionStatus}
          />
        </TabsContent>

        <TabsContent value="controls">
          <ImportExportControls 
            systemName="Tally"
            onImport={() => console.log('Import from Tally')}
            onExport={() => console.log('Export to Tally')}
            onTest={handleTestConnection}
            connected={connectionStatus === 'connected'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
