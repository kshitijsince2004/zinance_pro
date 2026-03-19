
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Users } from 'lucide-react';
import { Block, BlockSummary } from '@/types/blocks';

/**
 * Props interface for the BlockTable component
 * Defines all required props for displaying block data in a table format
 */
interface BlockTableProps {
  blockSummaries: BlockSummary[];
  onEditBlock: (block: Block) => void;
  onDeleteBlock: (id: string) => void;
  onViewBlockAssets: (block: Block) => void;
  formatCurrency: (amount: number) => string;
}

/**
 * BlockTable Component
 * 
 * Displays asset blocks in a responsive table format with management capabilities.
 * This component handles the display of block information including financial data,
 * asset counts, and provides action buttons for block management.
 * 
 * Features:
 * - Fully responsive design that adapts to different screen sizes
 * - Financial data formatting with proper currency display
 * - Action buttons for viewing assets and deleting blocks
 * - Status indicators with color-coded badges
 * - Scrollable content area for large datasets
 * 
 * Note: Edit functionality has been removed as per business requirements
 */
export const BlockTable: React.FC<BlockTableProps> = ({
  blockSummaries,
  onEditBlock, // Keep prop for backward compatibility but don't use
  onDeleteBlock,
  onViewBlockAssets,
  formatCurrency
}) => {
  /**
   * Handle delete button click with event propagation prevention
   * Prevents the click from bubbling up to parent elements
   * 
   * @param e - React mouse event
   * @param id - Block ID to delete
   */
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked for block ID:', id);
    onDeleteBlock(id);
  };

  /**
   * Handle view assets button click with event propagation prevention
   * Opens the asset management view for the selected block
   * 
   * @param e - React mouse event
   * @param block - Block object to view assets for
   */
  const handleViewClick = (e: React.MouseEvent, block: Block) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('View assets button clicked for block:', block.name);
    onViewBlockAssets(block);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg text-foreground">
          Asset Blocks Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Responsive container with horizontal scroll for mobile */}
        <div className="overflow-x-auto">
          <ScrollArea className="h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  {/* Block Name - Always visible */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[120px] sticky left-0 bg-card z-10">
                    Block Name
                  </TableHead>
                  {/* Code - Hidden on mobile */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[80px] hidden sm:table-cell">
                    Code
                  </TableHead>
                  {/* Grouping - Hidden on small screens */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px] hidden md:table-cell">
                    Grouping
                  </TableHead>
                  {/* Rate - Always visible but smaller on mobile */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[60px]">
                    Rate
                  </TableHead>
                  {/* Assets - Always visible */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[60px]">
                    Assets
                  </TableHead>
                  {/* Opening WDV - Hidden on mobile */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px] hidden sm:table-cell">
                    Opening WDV
                  </TableHead>
                  {/* Status - Hidden on mobile */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[80px] hidden sm:table-cell">
                    Status
                  </TableHead>
                  {/* Actions - Always visible */}
                  <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockSummaries.map((summary) => (
                  <TableRow key={summary.block.id} className="border-border hover:bg-muted/50 transition-colors">
                    {/* Block Name Cell - Sticky on mobile for better UX */}
                    <TableCell className="text-foreground font-medium text-xs sm:text-sm p-2 sm:p-4 sticky left-0 bg-card z-10">
                      <div className="space-y-1">
                        {/* Block name with truncation for long names */}
                        <p className="font-medium truncate max-w-[100px] sm:max-w-none">
                          {summary.block.name}
                        </p>
                        {/* Tags display - responsive layout */}
                        {summary.block.tags && summary.block.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {/* Show only first tag on mobile, more on larger screens */}
                            {summary.block.tags.slice(0, window.innerWidth < 640 ? 1 : 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {/* Show count of remaining tags */}
                            {summary.block.tags.length > (window.innerWidth < 640 ? 1 : 2) && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                +{summary.block.tags.length - (window.innerWidth < 640 ? 1 : 2)}
                              </Badge>
                            )}
                          </div>
                        )}
                        {/* Show code on mobile (since it's hidden in header) */}
                        <p className="text-xs text-muted-foreground sm:hidden">
                          Code: {summary.block.code || 'N/A'}
                        </p>
                      </div>
                    </TableCell>

                    {/* Code Cell - Hidden on mobile */}
                    <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                      {summary.block.code || '-'}
                    </TableCell>

                    {/* Grouping Cell - Hidden on small screens */}
                    <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {/* Company grouping badge */}
                        {summary.block.groupingCriteria?.company && (
                          <Badge variant="outline" className="text-xs">
                            C: {summary.block.groupingCriteria.company}
                          </Badge>
                        )}
                        {/* Department grouping badge */}
                        {summary.block.groupingCriteria?.department && (
                          <Badge variant="outline" className="text-xs">
                            D: {summary.block.groupingCriteria.department}
                          </Badge>
                        )}
                        {/* Show dash if no grouping criteria */}
                        {!summary.block.groupingCriteria?.company && !summary.block.groupingCriteria?.department && '-'}
                      </div>
                    </TableCell>

                    {/* Depreciation Rate Cell */}
                    <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                      <span className="font-medium">{summary.block.depreciationRate}%</span>
                    </TableCell>

                    {/* Asset Count Cell */}
                    <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                      <span className="font-medium text-primary">{summary.assetCount}</span>
                    </TableCell>

                    {/* Opening WDV Cell - Hidden on mobile */}
                    <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                      <span className="font-medium">{formatCurrency(summary.openingWDV)}</span>
                    </TableCell>

                    {/* Status Cell - Hidden on mobile */}
                    <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                      <Badge 
                        className={
                          summary.block.isActive 
                            ? 'bg-green-500/20 text-green-600 dark:text-green-300 text-xs' 
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-300 text-xs'
                        }
                      >
                        {summary.block.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>

                    {/* Actions Cell - Always visible */}
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex items-center space-x-1">
                        {/* View Assets Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleViewClick(e, summary.block)}
                          className="text-blue-600 hover:bg-blue-600/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                          title="View Block Assets"
                        >
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, summary.block.id)}
                          className="text-destructive hover:bg-destructive/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                          title="Delete Block"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        {/* Mobile-only summary cards for hidden information */}
        <div className="block sm:hidden p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Legend:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Rate: Depreciation Rate</div>
              <div>Assets: Asset Count</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
