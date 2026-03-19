
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, Download, Calculator } from 'lucide-react';

interface BulkActionsBarProps {
  selectedAssets: string[];
  onBulkEdit: () => void;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedAssets,
  onBulkEdit,
  onBulkAction,
  onClearSelection
}) => {
  if (selectedAssets.length === 0) return null;

  return (
    <Card className="bg-black/60 border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkEdit}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Selected ({selectedAssets.length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('depreciation')}
            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Depreciation
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('delete')}
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('verify')}
            className="border-green-500/30 text-green-400 hover:bg-green-500/20"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Selected
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('export')}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Selected
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
            className="border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActionsBar;
