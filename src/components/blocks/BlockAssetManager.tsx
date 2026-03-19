
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Minus } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { Block, blockService } from '@/lib/blocks';

interface BlockAssetManagerProps {
  block: Block | null;
  onClose: () => void;
  assets: Asset[];
  allBlocks: Block[];
}

export const BlockAssetManager: React.FC<BlockAssetManagerProps> = ({
  block,
  onClose,
  assets,
  allBlocks
}) => {
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (block) {
      const assetIds = blockService.getBlockAssets(block.id);
      const blockAssets = assets.filter(asset => assetIds.includes(asset.id));
      setAssignedAssets(blockAssets);
    }
  }, [block, assets]);

  const filteredAssets = assignedAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeAssetFromBlock = (assetId: string) => {
    if (block) {
      blockService.removeAssetFromBlock(assetId, block.id);
      setAssignedAssets(prev => prev.filter(asset => asset.id !== assetId));
    }
  };

  if (!block) return null;

  return (
    <Dialog open={!!block} onOpenChange={() => onClose()}>
      <DialogContent className="bg-popover border-border max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base sm:text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assets in "{block.name}" Block
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="assetSearch">Search Assets</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="assetSearch"
                placeholder="Search by name or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-xl font-bold">{assignedAssets.length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Depreciation Rate</p>
              <p className="text-xl font-bold">{block.depreciationRate}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold">
                ₹{assignedAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={block.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}>
                {block.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Assets Table */}
          <div className="rounded-lg border overflow-hidden">
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Asset Name</TableHead>
                    <TableHead className="text-muted-foreground">Serial Number</TableHead>
                    <TableHead className="text-muted-foreground">Company</TableHead>
                    <TableHead className="text-muted-foreground">Department</TableHead>
                    <TableHead className="text-muted-foreground">Purchase Price</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-foreground font-medium">
                        {asset.name}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {asset.serialNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {asset.company}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {asset.department}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{asset.purchasePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAssetFromBlock(asset.id)}
                          className="text-destructive hover:bg-destructive/20"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
