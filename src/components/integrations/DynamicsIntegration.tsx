
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportExportControls } from './ImportExportControls';
import { FieldMapper } from './FieldMapper';
import { SyncStatus } from './SyncStatus';
import { Cloud, Download, Upload, Settings, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export const DynamicsIntegration: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [oauthStatus, setOauthStatus] = useState('not_authenticated');
  const [lastSync, setLastSync] = useState(null);
  const [scheduledSync, setScheduledSync] = useState(false);

  const dynamicsFeatures = [
    { name: 'Asset Master', status: 'ready', count: 0 },
    { name: 'Location & Cost Center', status: 'ready', count: 0 },
    { name: 'Depreciation Books', status: 'ready', count: 0 },
    { name: 'Asset Summary Export', status: 'pending', count: 0 },
    { name: 'Depreciation Values', status: 'pending', count: 0 },
    { name: 'Scheduled Reminders', status: 'ready', count: 0 }
  ];

  const handleOAuthSignIn = () => {
    // Simulate OAuth flow
    setOauthStatus('authenticating');
    setTimeout(() => {
      setOauthStatus('authenticated');
      setConnectionStatus('connected');
    }, 3000);
  };

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const toggleScheduledSync = () => {
    setScheduledSync(!scheduledSync);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Microsoft Dynamics 365 Integration
          </CardTitle>
          <CardDescription>
            OAuth-based integration with Microsoft Dynamics 365 for enterprise asset management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">OAuth Status</label>
              <div className="flex items-center gap-2">
                {oauthStatus === 'authenticated' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {oauthStatus === 'not_authenticated' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {oauthStatus === 'authenticating' && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                <span className="text-sm capitalize">{oauthStatus.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection</label>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {connectionStatus === 'disconnected' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {connectionStatus === 'testing' && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                <span className="text-sm capitalize">{connectionStatus}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Sync</label>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${scheduledSync ? 'text-green-500' : 'text-gray-400'}`} />
                <Badge variant={scheduledSync ? 'default' : 'secondary'}>
                  {scheduledSync ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                {oauthStatus !== 'authenticated' && (
                  <Button size="sm" onClick={handleOAuthSignIn} disabled={oauthStatus === 'authenticating'}>
                    OAuth Sign In
                  </Button>
                )}
                {oauthStatus === 'authenticated' && (
                  <Button size="sm" onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                    Test Connection
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Import from Dynamics 365</CardTitle>
            <CardDescription>Import asset master and configuration data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dynamicsFeatures.filter(f => ['Asset Master', 'Location & Cost Center', 'Depreciation Books'].includes(f.name)).map((feature) => (
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
              Import from Dynamics
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Export to Dynamics 365</CardTitle>
            <CardDescription>Export asset summaries and depreciation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dynamicsFeatures.filter(f => ['Asset Summary Export', 'Depreciation Values', 'Scheduled Reminders'].includes(f.name)).map((feature) => (
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
              Export to Dynamics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Sync Configuration</CardTitle>
          <CardDescription>Configure automatic synchronization settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Schedule</label>
              <Button 
                variant={scheduledSync ? "default" : "outline"} 
                onClick={toggleScheduledSync}
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {scheduledSync ? 'Disable Scheduled Sync' : 'Enable Scheduled Sync'}
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Sync</label>
              <div className="p-2 bg-muted/50 rounded text-sm">
                {lastSync || 'Never synchronized'}
              </div>
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
            sourceSystem="Dynamics 365" 
            mappings={[
              { source: 'AssetNumber', target: 'serialNumber', mapped: true },
              { source: 'AssetName', target: 'name', mapped: true },
              { source: 'AssetGroup', target: 'category', mapped: true },
              { source: 'AcquisitionDate', target: 'purchaseDate', mapped: true },
              { source: 'AcquisitionPrice', target: 'purchasePrice', mapped: true },
              { source: 'Location', target: 'location', mapped: false }
            ]}
          />
        </TabsContent>

        <TabsContent value="status">
          <SyncStatus 
            systemName="Dynamics 365"
            lastSync={lastSync}
            status={connectionStatus}
          />
        </TabsContent>

        <TabsContent value="controls">
          <ImportExportControls 
            systemName="Dynamics 365"
            onImport={() => console.log('Import from Dynamics')}
            onExport={() => console.log('Export to Dynamics')}
            onTest={handleTestConnection}
            connected={connectionStatus === 'connected'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
