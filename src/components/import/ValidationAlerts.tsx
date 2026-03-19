
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidationAlertsProps {
  emptyRows: number;
  missingRequiredFields: string[];
}

const ValidationAlerts: React.FC<ValidationAlertsProps> = ({ emptyRows, missingRequiredFields }) => {
  if (emptyRows === 0 && missingRequiredFields.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {emptyRows > 0 && (
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            Found {emptyRows} empty rows that will be skipped during import.
          </AlertDescription>
        </Alert>
      )}
      
      {missingRequiredFields.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            <div>
              <p className="font-medium">Missing required fields:</p>
              <ul className="list-disc list-inside mt-1">
                {missingRequiredFields.map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">You'll be able to map these in the next step.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationAlerts;
