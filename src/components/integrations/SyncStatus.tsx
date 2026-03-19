
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';

interface SyncStatusProps {
  systemName: string;
  lastSync: string | null;
  status: string;
  failures?: Array<{ timestamp: string; reason: string; }>;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ 
  systemName, 
  lastSync, 
  status, 
  failures = [] 
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Sync Status - {systemName}
        </CardTitle>
        <CardDescription>
          Current synchronization status and history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Connection Status</label>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge variant={getStatusColor()}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Sync</label>
            <div className="p-2 bg-muted/50 rounded text-sm">
              {lastSync ? new Date(lastSync).toLocaleString() : 'Never synchronized'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sync Statistics</label>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
              <div className="text-lg font-bold text-green-600">0</div>
              <div className="text-xs text-green-600">Successful</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{failures.length}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-blue-600">Pending</div>
            </div>
          </div>
        </div>

        {failures.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent Failures</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {failures.map((failure, index) => (
                <div key={index} className="p-2 bg-red-50 dark:bg-red-950/50 rounded text-xs">
                  <div className="font-medium">{new Date(failure.timestamp).toLocaleString()}</div>
                  <div className="text-red-600">{failure.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Next Scheduled Sync</h4>
          <p className="text-sm text-muted-foreground">
            No automatic sync scheduled. Use manual sync controls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
