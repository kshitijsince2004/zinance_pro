
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { TallyIntegration } from '@/components/integrations/TallyIntegration';
import { SAPIntegration } from '@/components/integrations/SAPIntegration';
import { DynamicsIntegration } from '@/components/integrations/DynamicsIntegration';
import { 
  Shuffle, 
  Database, 
  Cloud, 
  Building, 
  CheckCircle,
  AlertCircle,
  Globe,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  connected: boolean;
  lastSync?: string;
  settings: Record<string, any>;
}

export default function Integrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [activeTab, setActiveTab] = useState('tally');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    try {
      const saved = localStorage.getItem('integrations');
      if (saved) {
        setIntegrations(JSON.parse(saved));
      } else {
        const defaultIntegrations: IntegrationConfig[] = [
          {
            id: 'tally',
            name: 'Tally ERP',
            enabled: false,
            connected: false,
            settings: {}
          },
          {
            id: 'dynamics',
            name: 'Microsoft Dynamics 365',
            enabled: false,
            connected: false,
            settings: {}
          },
          {
            id: 'sap',
            name: 'SAP ERP',
            enabled: false,
            connected: false,
            settings: {}
          },
          {
            id: 'farvision',
            name: 'FarVision ERP',
            enabled: false,
            connected: false,
            settings: {}
          }
        ];
        setIntegrations(defaultIntegrations);
        localStorage.setItem('integrations', JSON.stringify(defaultIntegrations));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations configuration.',
        variant: 'destructive'
      });
    }
  };

  const getIntegrationIcon = (id: string) => {
    switch (id) {
      case 'tally': return <Database className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />;
      case 'dynamics': return <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
      case 'sap': return <Building className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />;
      case 'farvision': return <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />;
      default: return <Shuffle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />;
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
            <Shuffle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span>Enterprise Integration Hub</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Connect FAMS with your ERP systems for real-time data synchronization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-lg flex items-center justify-center border flex-shrink-0">
                  {getIntegrationIcon(integration.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm truncate">{integration.name}</h3>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                    <Badge 
                      variant={integration.connected ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {integration.connected ? (
                        <><Wifi className="w-3 h-3 mr-1" />Connected</>
                      ) : (
                        <><WifiOff className="w-3 h-3 mr-1" />Disconnected</>
                      )}
                    </Badge>
                    {integration.enabled && (
                      <Badge variant="outline" className="text-xs">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
              <TabsTrigger value="tally" className="text-xs sm:text-sm">Tally ERP</TabsTrigger>
              <TabsTrigger value="dynamics" className="text-xs sm:text-sm">Dynamics 365</TabsTrigger>
              <TabsTrigger value="sap" className="text-xs sm:text-sm">SAP ERP</TabsTrigger>
              <TabsTrigger value="farvision" className="text-xs sm:text-sm">FarVision ERP</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tally">
            <TallyIntegration />
          </TabsContent>

          <TabsContent value="dynamics">
            <DynamicsIntegration />
          </TabsContent>

          <TabsContent value="sap">
            <SAPIntegration />
          </TabsContent>

          <TabsContent value="farvision">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Globe className="w-5 h-5 text-purple-500" />
                  FarVision ERP Integration
                </CardTitle>
                <CardDescription className="text-sm">
                  Connect with FarVision ERP for comprehensive business management integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Configuration Required</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    To connect with FarVision ERP, you need to provide valid API credentials and database connection details. 
                    Contact your FarVision administrator for the required connection parameters.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farvision-server" className="text-sm">Server URL</Label>
                    <Input 
                      id="farvision-server"
                      placeholder="https://your-farvision-server.com"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farvision-database" className="text-sm">Database Name</Label>
                    <Input 
                      id="farvision-database"
                      placeholder="farvision_db"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farvision-username" className="text-sm">Username</Label>
                    <Input 
                      id="farvision-username"
                      placeholder="api_user"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farvision-password" className="text-sm">Password</Label>
                    <Input 
                      id="farvision-password"
                      type="password"
                      placeholder="••••••••"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="farvision-enabled" />
                  <Label htmlFor="farvision-enabled" className="text-sm">Enable FarVision Integration</Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 sm:flex-none text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none text-sm">
                    Save Configuration
                  </Button>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> All fields must be filled with valid credentials to establish a connection. 
                    Test the connection before saving to ensure proper integration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
