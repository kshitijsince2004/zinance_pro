
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { importLogger } from '@/lib/import-logger';
import { FileText, Clock, User, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ImportLog } from '@/types/asset';

const ImportLogs: React.FC = () => {
  const importLogs = importLogger.getAllImportLogs();

  const getStatusIcon = (log: ImportLog) => {
    if (log.failedCount === 0 && log.successCount > 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (log.successCount === 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (log: ImportLog) => {
    if (log.failedCount === 0 && log.successCount > 0) {
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    } else if (log.successCount === 0) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    } else {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  const downloadLogDetails = (log: ImportLog) => {
    const logData = {
      batchId: log.batchId,
      fileName: log.fileName,
      importDate: log.importDate,
      importTime: log.importTime,
      importedBy: log.importedBy,
      results: {
        total: log.totalRows,
        success: log.successCount,
        failed: log.failedCount,
        skipped: log.skippedCount
      },
      columnMappings: log.metadata.columnMappings,
      customFields: log.metadata.customFields,
      errors: log.metadata.errors
    };

    const jsonContent = "data:text/json;charset=utf-8," + 
      encodeURIComponent(JSON.stringify(logData, null, 2));

    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", `import_log_${log.batchId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (importLogs.length === 0) {
    return (
      <Card className="bg-black/60 border-gray-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Import History
          </CardTitle>
          <CardDescription className="text-gray-400">
            No import history available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No imports have been performed yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Import History
        </CardTitle>
        <CardDescription className="text-gray-400">
          Complete log of all import operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {importLogs.map((log, index) => (
              <div key={log.id}>
                <div className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-gray-500/20">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log)}
                      <span className="font-medium text-white">{log.fileName}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.importMethod.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        {log.importDate} at {log.importTime}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-4 h-4" />
                        {log.importedBy}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-xs border ${getStatusColor(log)}`}>
                        {log.successCount} Success
                      </div>
                      {log.failedCount > 0 && (
                        <div className="px-2 py-1 rounded text-xs border bg-red-500/10 text-red-400 border-red-500/30">
                          {log.failedCount} Failed
                        </div>
                      )}
                      {log.skippedCount > 0 && (
                        <div className="px-2 py-1 rounded text-xs border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                          {log.skippedCount} Skipped
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Batch ID: {log.batchId}
                    </div>

                    {log.metadata.customFields.length > 0 && (
                      <div className="text-xs text-purple-400">
                        Custom fields: {log.metadata.customFields.join(', ')}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLogDetails(log)}
                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                {index < importLogs.length - 1 && <Separator className="bg-gray-500/20" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImportLogs;
