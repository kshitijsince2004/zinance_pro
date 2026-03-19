import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { assetOwnershipService } from '@/lib/asset-ownership';
import { assetService } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import EnhancedDatePicker from '@/components/EnhancedDatePicker';
import { User, Calendar, MapPin, Building2, Plus, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

interface AssetOwnershipHistoryProps {
  assetId: string;
}

export const AssetOwnershipHistory: React.FC<AssetOwnershipHistoryProps> = ({ assetId }) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: '',
    department: '',
    location: '',
    office: '',
    notes: ''
  });
  const [transferData, setTransferData] = useState({
    newAssignedTo: '',
    newDepartment: '',
    newLocation: '',
    newOffice: '',
    transferReason: '',
    notes: ''
  });
  const [assignmentDate, setAssignmentDate] = useState<Date | undefined>(new Date());
  const [transferDate, setTransferDate] = useState<Date | undefined>(new Date());
  
  const { toast } = useToast();
  const ownershipHistory = assetOwnershipService.getAssetOwnershipHistory(assetId);
  const asset = assetService.getAssetById(assetId);

  // Get dynamic departments and locations
  const existingAssets = assetService.getAllAssets();
  const departments = [...new Set(existingAssets.map(asset => asset.department).filter(dept => dept && dept.trim() !== ''))];
  const locations = [...new Set(existingAssets.map(asset => asset.location).filter(loc => loc && loc.trim() !== ''))];

  const handleAssign = async () => {
    if (!assignmentData.assignedTo || !assignmentDate) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await assetOwnershipService.assignAsset(
        assetId,
        assignmentData.assignedTo,
        'Current User', // In real app, get from auth context
        assignmentDate.toISOString().split('T')[0],
        assignmentData.department,
        assignmentData.location,
        assignmentData.office,
        assignmentData.notes
      );

      toast({ title: 'Success', description: 'Asset assigned successfully' });
      setShowAssignDialog(false);
      setAssignmentData({ assignedTo: '', department: '', location: '', office: '', notes: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign asset', variant: 'destructive' });
    }
  };

  const handleTransfer = async () => {
    if (!transferData.newAssignedTo || !transferDate) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await assetOwnershipService.transferAsset(
        assetId,
        transferData.newAssignedTo,
        'Current User', // In real app, get from auth context  
        transferDate.toISOString().split('T')[0],
        transferData.newDepartment,
        transferData.newLocation,
        transferData.newOffice,
        transferData.transferReason,
        transferData.notes
      );

      toast({ title: 'Success', description: 'Asset transferred successfully' });
      setShowTransferDialog(false);
      setTransferData({ newAssignedTo: '', newDepartment: '', newLocation: '', newOffice: '', transferReason: '', notes: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to transfer asset', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {ownershipHistory.currentOwner ? 'Reassign' : 'Assign Asset'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assigned To *</Label>
                <Input
                  value={assignmentData.assignedTo}
                  onChange={e => setAssignmentData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label>Assignment Date *</Label>
                <EnhancedDatePicker
                  date={assignmentDate}
                  onDateChange={setAssignmentDate}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={assignmentData.department} onValueChange={value => setAssignmentData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept, index) => (
                      <SelectItem key={index} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={assignmentData.location} onValueChange={value => setAssignmentData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc, index) => (
                      <SelectItem key={index} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Office</Label>
                <Input
                  value={assignmentData.office}
                  onChange={e => setAssignmentData(prev => ({ ...prev, office: e.target.value }))}
                  placeholder="Enter office"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={assignmentData.notes}
                  onChange={e => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssign} className="flex-1">Assign</Button>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {ownershipHistory.currentOwner && (
          <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Transfer Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Transfer To *</Label>
                  <Input
                    value={transferData.newAssignedTo}
                    onChange={e => setTransferData(prev => ({ ...prev, newAssignedTo: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transfer Date *</Label>
                  <EnhancedDatePicker
                    date={transferDate}
                    onDateChange={setTransferDate}
                    placeholder="Select date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Department</Label>
                  <Select value={transferData.newDepartment} onValueChange={value => setTransferData(prev => ({ ...prev, newDepartment: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept, index) => (
                        <SelectItem key={index} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transfer Reason</Label>
                  <Input
                    value={transferData.transferReason}
                    onChange={e => setTransferData(prev => ({ ...prev, transferReason: e.target.value }))}
                    placeholder="Reason for transfer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleTransfer} className="flex-1">Transfer</Button>
                  <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Current Owner */}
      {ownershipHistory.currentOwner ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Current Owner</span>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Name:</span> {ownershipHistory.currentOwner.assignedTo}</div>
              <div><span className="text-gray-600">Department:</span> {ownershipHistory.currentOwner.department}</div>
              <div><span className="text-gray-600">Location:</span> {ownershipHistory.currentOwner.location}</div>
              <div><span className="text-gray-600">Since:</span> {format(new Date(ownershipHistory.currentOwner.assignmentDate), 'dd MMM yyyy')}</div>
            </div>
            {ownershipHistory.currentOwner.notes && (
              <div className="text-sm mt-2">
                <span className="text-gray-600">Notes:</span> {ownershipHistory.currentOwner.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No current owner assigned</p>
          </CardContent>
        </Card>
      )}

      {/* Previous Owners */}
      {ownershipHistory.previousOwners.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Previous Owners ({ownershipHistory.previousOwners.length})</h4>
          {ownershipHistory.previousOwners.map((owner, index) => (
            <Card key={owner.id} className="bg-gray-50 border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{owner.assignedTo}</span>
                  <Badge variant="secondary">Previous</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Department: {owner.department}</div>
                  <div>Location: {owner.location}</div>
                  <div>From: {format(new Date(owner.assignmentDate), 'dd MMM yyyy')}</div>
                  <div>To: {owner.assignmentEndDate ? format(new Date(owner.assignmentEndDate), 'dd MMM yyyy') : 'N/A'}</div>
                </div>
                {owner.transferReason && (
                  <div className="text-sm text-gray-600 mt-1">
                    Reason: {owner.transferReason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {ownershipHistory.totalAssignments === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No ownership history available</p>
          <p className="text-sm text-gray-500">Assign this asset to create ownership records</p>
        </div>
      )}
    </div>
  );
};