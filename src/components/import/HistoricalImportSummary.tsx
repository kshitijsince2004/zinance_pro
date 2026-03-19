import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportBatch } from '@/types/historical-asset';
import { CheckCircle, FileText, AlertTriangle, Download, RotateCcw } from 'lucide-react';

interface HistoricalImportSummaryProps {
  batch: ImportBatch;
  onStartNewImport: () => void;
}

export const HistoricalImportSummary: React.FC<HistoricalImportSummaryProps> = ({
  batch,
  onStartNewImport
}) => {
  const handleDownloadReport = () => {
    // Generate and download import report
    const report = {
      batch_id: batch.id,
      file_name: batch.file_name,
      import_date: batch.import_date,
      summary: batch.import_summary,
      errors: batch.error_log
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_report_${batch.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Import Completed Successfully!</h2>
        <p className="text-muted-foreground">
          Your historical asset data has been imported and impact analysis has been calculated.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Import Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Batch ID:</span>
                <p className="font-mono text-sm">{batch.id}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">File Name:</span>
                <p className="font-medium">{batch.file_name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Import Date:</span>
                <p className="font-medium">{new Date(batch.import_date).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Imported By:</span>
                <p className="font-medium">{batch.imported_by}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={batch.status === 'COMPLETED' ? 'default' : 'destructive'}>
                  {batch.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Assets:</span>
                <span className="font-bold text-blue-600">{batch.total_assets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Successful:</span>
                <span className="font-bold text-green-600">{batch.successful_imports}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed:</span>
                <span className="font-bold text-red-600">{batch.failed_imports}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impact Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {batch.assets_with_impact}
              </div>
              <div className="text-sm text-muted-foreground">Assets with Impact</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                ₹{batch.total_impact_amount.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Total Impact Amount</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {batch.import_summary.assets_requiring_approval}
              </div>
              <div className="text-sm text-muted-foreground">Require Approval</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Historical Records Created:</span>
              <span className="font-medium">{batch.import_summary.historical_records_created}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Impacts Calculated:</span>
              <span className="font-medium">{batch.import_summary.impacts_calculated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Average Impact Percentage:</span>
              <span className="font-medium">{batch.import_summary.avg_impact_percentage.toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {batch.error_log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Import Errors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {batch.error_log.length} errors occurred during import. Please review the error log.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {batch.error_log.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  <span className="font-medium">Row {error.row_number}:</span> {error.error_message}
                </div>
              ))}
              {batch.error_log.length > 5 && (
                <div className="text-sm text-muted-foreground">
                  ... and {batch.error_log.length - 5} more errors
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Review Asset Details</p>
                <p className="text-sm text-muted-foreground">
                  Check individual assets for historical data and impact analysis.
                </p>
              </div>
            </div>
            
            {batch.import_summary.assets_requiring_approval > 0 && (
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Approve Impact Adjustments</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.import_summary.assets_requiring_approval} assets require management approval for impact adjustments.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Generate Reports</p>
                <p className="text-sm text-muted-foreground">
                  Download FA register and impact analysis reports for management review.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button onClick={onStartNewImport}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Import
        </Button>
      </div>
    </div>
  );
};