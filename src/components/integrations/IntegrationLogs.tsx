
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Filter, RefreshCw } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  system: string;
  operation: string;
  status: 'success' | 'error' | 'warning';
  recordsProcessed: number;
  message: string;
}

export const IntegrationLogs: React.FC = () => {
  const [filterSystem, setFilterSystem] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Mock log data
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      system: 'Tally',
      operation: 'Test Connection',
      status: 'success',
      recordsProcessed: 0,
      message: 'Connection test successful'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      system: 'Dynamics 365',
      operation: 'OAuth Authentication',
      status: 'success',
      recordsProcessed: 0,
      message: 'Successfully authenticated with Microsoft Dynamics 365'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      system: 'SAP',
      operation: 'File Upload',
      status: 'warning',
      recordsProcessed: 15,
      message: 'File uploaded with 2 validation warnings'
    }
  ]);

  const filteredLogs = logs.filter(log => {
    if (filterSystem !== 'all' && log.system !== filterSystem) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,System,Operation,Status,Records Processed,Message',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.system},${log.operation},${log.status},${log.recordsProcessed},"${log.message}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'integration-logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Integration Logs
          </CardTitle>
          <CardDescription>
            Monitor all integration activities, errors, and system status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              <Select value={filterSystem} onValueChange={setFilterSystem}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="Tally">Tally</SelectItem>
                  <SelectItem value="Dynamics 365">Dynamics 365</SelectItem>
                  <SelectItem value="SAP">SAP</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.system}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.operation}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm">{log.recordsProcessed}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate" title={log.message}>
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No logs found matching the current filters</p>
              <p className="text-sm">Integration activities will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{logs.filter(l => l.status === 'success').length}</div>
              <div className="text-sm text-muted-foreground">Successful Operations</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{logs.filter(l => l.status === 'error').length}</div>
              <div className="text-sm text-muted-foreground">Failed Operations</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{logs.filter(l => l.status === 'warning').length}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
