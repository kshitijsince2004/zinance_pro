
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { RefreshCw } from 'lucide-react';

// Define the props interface for ImportProgress component
interface ImportProgressProps {
  isImporting: boolean;    // Flag indicating if import is in progress
  progress: number;        // Progress percentage (0-100)
}

// ImportProgress component for displaying import progress
const ImportProgress: React.FC<ImportProgressProps> = ({ isImporting, progress }) => {
  // Don't render anything if import is not in progress
  if (!isImporting) return null;

  // Render progress indicator
  return (
    <div className="space-y-2">
      {/* Progress header with spinning icon and percentage */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 flex items-center gap-2">
          {/* Spinning refresh icon to indicate activity */}
          <RefreshCw className="w-4 h-4 animate-spin" />
          Importing assets...
        </span>
        {/* Progress percentage display */}
        <span className="text-white">{Math.round(progress)}%</span>
      </div>
      {/* Progress bar component */}
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ImportProgress;
