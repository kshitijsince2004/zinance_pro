
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BlockSummary } from '@/types/blocks';

interface BlockSummaryCardsProps {
  blockSummaries: BlockSummary[];
  totalAssets: number;
  formatCurrency: (amount: number) => string;
}

export const BlockSummaryCards: React.FC<BlockSummaryCardsProps> = ({
  blockSummaries,
  totalAssets,
  formatCurrency
}) => {
  const filteredBlocks = blockSummaries.length;
  const assignedAssets = blockSummaries.reduce((sum, bs) => sum + bs.assetCount, 0);
  const unassignedAssets = totalAssets - assignedAssets;
  const totalValue = blockSummaries.reduce((sum, bs) => sum + bs.openingWDV, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-blue-600 dark:text-blue-300 text-xs sm:text-sm">Total Blocks</p>
            <p className="text-foreground text-lg sm:text-2xl font-bold">{filteredBlocks}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-green-600 dark:text-green-300 text-xs sm:text-sm">Assigned Assets</p>
            <p className="text-foreground text-lg sm:text-2xl font-bold">{assignedAssets}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-orange-600 dark:text-orange-300 text-xs sm:text-sm">Unassigned</p>
            <p className="text-foreground text-lg sm:text-2xl font-bold">{unassignedAssets}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-purple-600 dark:text-purple-300 text-xs sm:text-sm">Total Value</p>
            <p className="text-foreground text-sm sm:text-lg font-bold">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
