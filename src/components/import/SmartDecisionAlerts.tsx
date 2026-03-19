
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Info, AlertCircle } from 'lucide-react';

interface SmartDecisionAlertsProps {
  smartDecisions: string[];
  usefulLifeCheck: {
    column: string;
    value: number;
    possiblyDays: boolean;
  } | null;
}

const SmartDecisionAlerts: React.FC<SmartDecisionAlertsProps> = ({ smartDecisions, usefulLifeCheck }) => {
  return (
    <div className="space-y-4">
      {/* Smart Decisions Alert */}
      {smartDecisions.length > 0 && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <Check className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            <div>
              <p className="font-medium">Smart Mapping Decisions Made:</p>
              <ul className="list-disc list-inside mt-1 text-sm">
                {smartDecisions.slice(0, 5).map((decision, index) => (
                  <li key={index}>{decision}</li>
                ))}
                {smartDecisions.length > 5 && (
                  <li>... and {smartDecisions.length - 5} more automatic mappings</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Smart Import Features Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-400">
          <div>
            <p className="font-medium">Smart Import Features:</p>
            <ul className="list-disc list-inside mt-1 text-sm">
              <li><strong>Useful Life:</strong> Automatically detects if values are in days (&gt;50) and converts to years</li>
              <li><strong>Date Formats:</strong> Supports multiple date formats with automatic parsing</li>
              <li><strong>Custom Fields:</strong> Automatically creates new fields for unmapped columns</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Useful Life Days Detection */}
      {usefulLifeCheck && (
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            <div>
              <p className="font-medium">Useful Life Format Detected:</p>
              <p className="mt-1">Column "{usefulLifeCheck.column}" has sample value "{usefulLifeCheck.value}" which appears to be in days.</p>
              <p className="mt-1 text-sm">✓ Will be automatically converted to years during import (e.g., {usefulLifeCheck.value} days = {Math.round((usefulLifeCheck.value / 365) * 10) / 10} years)</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SmartDecisionAlerts;
