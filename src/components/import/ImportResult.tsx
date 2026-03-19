
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { ImportResult } from '@/pages/Import';

interface ImportResultProps {
  result: ImportResult;
  onReset: () => void;
}

const ImportResultComponent: React.FC<ImportResultProps> = ({ result, onReset }) => {
  return (
    <Card className="bg-black/60 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Import Completed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{result.success}</div>
            <div className="text-sm text-gray-400">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{result.failed}</div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{result.skipped}</div>
            <div className="text-sm text-gray-400">Skipped</div>
          </div>
        </div>

        {result.errors.length > 0 && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              <div className="font-medium mb-2">Import Errors:</div>
              <ul className="text-sm space-y-1">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li>• ... and {result.errors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-300">
            Assets have been imported with automatic warranty, AMC, and insurance date configuration based on industry standards. Service reminders have been set up automatically.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={onReset} className="flex-1 bg-green-500 hover:bg-green-600 text-black">
            Import More Assets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportResultComponent;
