
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Plus, ArrowUpDown, Filter, History, UserPlus, Calendar } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { Block, blockService } from '@/lib/blocks';
import { assetOwnershipService } from '@/lib/asset-ownership';
import { AssetOwnershipHistory, AssetOwnership } from '@/types/asset-ownership';

interface AssetAssignmentProps {
  assets: Asset[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export const AssetAssignment: React.FC<AssetAssignmentProps> = ({
  assets,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState<AssetOwnershipHistory | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    assignedTo: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    assignmentEndDate: '',
    department: '',
    location: '',
    office: '',
    notes: '',
    isPermanent: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = () => {
    const loadedBlocks = blockService.getAllBlocks();
    setBlocks(loadedBlocks);
  };

  const sortAssets = (assets: Asset[]) => {
    return [...assets].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Asset];
      let bValue: any = b[sortBy as keyof Asset];

      if (sortBy === 'purchasePrice') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortBy === 'purchaseDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const filteredAssets = assets.filter(asset => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = asset.name.toLowerCase().includes(searchLower) ||
                          asset.serialNumber?.toLowerCase().includes(searchLower) ||
                          asset.model?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Block filter
    if (blockFilter !== 'all') {
      const assetBlocks = blockService.getAssetBlocks(asset.id);
      if (blockFilter === 'unassigned') {
        return assetBlocks.length === 0;
      } else {
        return assetBlocks.some(block => block.id === blockFilter);
      }
    }

    return true;
  });

  const sortedAssets = sortAssets(filteredAssets);

  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const selectAllAssets = () => {
    if (selectedAssets.size === sortedAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(sortedAssets.map(asset => asset.id)));
    }
  };

  const assignToBlock = () => {
    if (!selectedBlock || selectedAssets.size === 0) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select assets and a block to assign them to.',
        variant: 'destructive'
      });
      return;
    }

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block) return;

    selectedAssets.forEach(assetId => {
      blockService.assignAssetToBlock(assetId, selectedBlock);
    });

    toast({
      title: 'Assets Assigned',
      description: `${selectedAssets.size} assets assigned to ${block.name}.`
    });

    setSelectedAssets(new Set());
  };

  const getAssetBlocks = (assetId: string): Block[] => {
    return blockService.getAssetBlocks(assetId);
  };

  const handleIndividualAssignment = () => {
    if (selectedAssets.size === 0) {
      toast({
        title: 'No Assets Selected',
        description: 'Please select at least one asset to assign.',
        variant: 'destructive'
      });
      return;
    }
    setShowAssignmentDialog(true);
  };

  const handleAssignmentSubmit = () => {
    if (!assignmentForm.assignedTo || !assignmentForm.assignmentDate || !assignmentForm.department) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    let successCount = 0;
    selectedAssets.forEach(assetId => {
      try {
        assetOwnershipService.assignAsset(
          assetId,
          assignmentForm.assignedTo,
          'System User',
          assignmentForm.assignmentDate,
          assignmentForm.department,
          assignmentForm.location,
          assignmentForm.office,
          assignmentForm.notes
        );
        successCount++;
      } catch (error) {
        console.error('Failed to assign asset:', error);
      }
    });

    toast({
      title: 'Assets Assigned',
      description: `${successCount} assets assigned to ${assignmentForm.assignedTo}.`
    });

    setSelectedAssets(new Set());
    setShowAssignmentDialog(false);
    setAssignmentForm({
      assignedTo: '',
      assignmentDate: new Date().toISOString().split('T')[0],
      assignmentEndDate: '',
      department: '',
      location: '',
      office: '',
      notes: '',
      isPermanent: true
    });
  };

  const showAssetHistory = (assetId: string) => {
    const history = assetOwnershipService.getAssetOwnershipHistory(assetId);
    setSelectedAssetHistory(history);
    setShowHistoryDialog(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters and Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Asset Assignment Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-xs sm:text-sm">Search Assets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy" className="text-xs sm:text-sm">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="name">Asset Name</SelectItem>
                  <SelectItem value="purchasePrice">Purchase Price</SelectItem>
                  <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-xs sm:text-sm">Sort Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockFilter" className="text-xs sm:text-sm">Filter by Block</Label>
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="unassigned">Unassigned Assets</SelectItem>
                  {blocks.map(block => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="assignBlock" className="text-xs sm:text-sm">Assign to Block</Label>
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select a block..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {blocks.filter(block => block.isActive).map(block => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name} ({block.depreciationRate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={assignToBlock}
                disabled={selectedAssets.size === 0 || !selectedBlock}
                className="text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Assign to Block ({selectedAssets.size})
              </Button>
              <Button
                onClick={handleIndividualAssignment}
                disabled={selectedAssets.size === 0}
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Assign to User ({selectedAssets.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-foreground">
              Assets for Assignment ({sortedAssets.length} assets)
            </CardTitle>
            <Button
              onClick={selectAllAssets}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              {selectedAssets.size === sortedAssets.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ScrollArea className="h-[50vh] sm:h-[60vh] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground text-xs sm:text-sm w-12">
                      <input
                        type="checkbox"
                        checked={selectedAssets.size === sortedAssets.length && sortedAssets.length > 0}
                        onChange={selectAllAssets}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[150px]">Asset Name</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px]">Company</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px]">Department</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px]">Purchase Price</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[120px]">Current Owner</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[150px]">Current Blocks</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAssets.map((asset) => {
                    const assetBlocks = getAssetBlocks(asset.id);
                    const currentOwnership = assetOwnershipService.getAssetOwnershipHistory(asset.id).currentOwner;
                    return (
                      <TableRow key={asset.id} className="border-border hover:bg-muted/50">
                        <TableCell className="p-2 sm:p-4">
                          <input
                            type="checkbox"
                            checked={selectedAssets.has(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="text-foreground font-medium text-xs sm:text-sm p-2 sm:p-4">
                          {asset.name}
                        </TableCell>
                        <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">{asset.company}</TableCell>
                        <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">{asset.department}</TableCell>
                        <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">₹{asset.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                          {currentOwnership ? (
                            <div className="space-y-1">
                              <div className="font-medium">{currentOwnership.assignedTo}</div>
                              <div className="text-xs text-muted-foreground">
                                Since {new Date(currentOwnership.assignmentDate).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <div className="flex flex-wrap gap-1">
                            {assetBlocks.length > 0 ? (
                              assetBlocks.map(block => (
                                <Badge key={block.id} variant="secondary" className="text-xs">
                                  {block.name}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Unassigned
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <Button
                            onClick={() => showAssetHistory(asset.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <History className="w-3 h-3 mr-1" />
                            History
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Asset Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Assets to User</DialogTitle>
            <DialogDescription>
              Assign {selectedAssets.size} selected asset(s) to a user with proper tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Input
                id="assignedTo"
                value={assignmentForm.assignedTo}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter user name or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignmentDate">Assignment Date *</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={assignmentForm.assignmentDate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignmentDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={assignmentForm.department}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={assignmentForm.location}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office">Office</Label>
              <Input
                id="office"
                value={assignmentForm.office}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, office: e.target.value }))}
                placeholder="Enter office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignmentEndDate">Assignment End Date (Optional)</Label>
              <Input
                id="assignmentEndDate"
                type="date"
                value={assignmentForm.assignmentEndDate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignmentEndDate: e.target.value }))}
                disabled={assignmentForm.isPermanent}
              />
            </div>
            <div className="col-span-full space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPermanent"
                  checked={assignmentForm.isPermanent}
                  onChange={(e) => setAssignmentForm(prev => ({ 
                    ...prev, 
                    isPermanent: e.target.checked,
                    assignmentEndDate: e.target.checked ? '' : prev.assignmentEndDate
                  }))}
                />
                <Label htmlFor="isPermanent">Permanent Assignment</Label>
              </div>
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the assignment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignmentSubmit}>
              Assign Assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asset Ownership History</DialogTitle>
            <DialogDescription>
              Complete ownership history for {selectedAssetHistory?.assetName}
            </DialogDescription>
          </DialogHeader>
          {selectedAssetHistory && (
            <div className="space-y-4">
              {/* Current Owner */}
              {selectedAssetHistory.currentOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Current Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Assigned To</Label>
                        <p className="font-medium">{selectedAssetHistory.currentOwner.assignedTo}</p>
                      </div>
                      <div>
                        <Label>Assignment Date</Label>
                        <p>{new Date(selectedAssetHistory.currentOwner.assignmentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <p>{selectedAssetHistory.currentOwner.department}</p>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <p>{selectedAssetHistory.currentOwner.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label>Office</Label>
                        <p>{selectedAssetHistory.currentOwner.office || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <p className="text-green-600 font-medium">
                          {Math.ceil((new Date().getTime() - new Date(selectedAssetHistory.currentOwner.assignmentDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                    {selectedAssetHistory.currentOwner.notes && (
                      <div className="mt-4">
                        <Label>Notes</Label>
                        <p className="text-sm text-muted-foreground">{selectedAssetHistory.currentOwner.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Previous Owners */}
              {selectedAssetHistory.previousOwners.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Previous Assignments ({selectedAssetHistory.previousOwners.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedAssetHistory.previousOwners.map((owner, index) => (
                        <div key={owner.id} className="p-4 border rounded-lg bg-muted/20">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Assigned To</Label>
                              <p className="font-medium">{owner.assignedTo}</p>
                            </div>
                            <div>
                              <Label>From</Label>
                              <p>{new Date(owner.assignmentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label>To</Label>
                              <p>{owner.assignmentEndDate ? new Date(owner.assignmentEndDate).toLocaleDateString() : 'Present'}</p>
                            </div>
                            <div>
                              <Label>Duration</Label>
                              <p>
                                {owner.assignmentEndDate
                                  ? Math.ceil((new Date(owner.assignmentEndDate).getTime() - new Date(owner.assignmentDate).getTime()) / (1000 * 60 * 60 * 24))
                                  : Math.ceil((new Date().getTime() - new Date(owner.assignmentDate).getTime()) / (1000 * 60 * 60 * 24))
                                } days
                              </p>
                            </div>
                            <div>
                              <Label>Department</Label>
                              <p>{owner.department}</p>
                            </div>
                            <div>
                              <Label>Location</Label>
                              <p>{owner.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label>Office</Label>
                              <p>{owner.office || 'Not specified'}</p>
                            </div>
                            {owner.transferReason && (
                              <div>
                                <Label>Transfer Reason</Label>
                                <p className="text-sm">{owner.transferReason}</p>
                              </div>
                            )}
                          </div>
                          {owner.notes && (
                            <div className="mt-2">
                              <Label>Notes</Label>
                              <p className="text-sm text-muted-foreground">{owner.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedAssetHistory.previousOwners.length === 0 && !selectedAssetHistory.currentOwner && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Assignment History</h3>
                    <p className="text-sm text-muted-foreground">This asset has not been assigned to any user yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
