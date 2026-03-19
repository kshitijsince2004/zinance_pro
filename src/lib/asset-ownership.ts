import { AssetOwnership, AssetOwnershipHistory } from '@/types/asset-ownership';
import { assetStorage } from './asset-storage';

class AssetOwnershipService {
  private getStorageKey(): string {
    return 'asset_ownership_records';
  }

  private getAllOwnershipRecords(): AssetOwnership[] {
    const data = localStorage.getItem(this.getStorageKey());
    return data ? JSON.parse(data) : [];
  }

  private saveOwnershipRecords(records: AssetOwnership[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
  }

  getAssetOwnershipHistory(assetId: string): AssetOwnershipHistory {
    const records = this.getAllOwnershipRecords().filter(r => r.assetId === assetId);
    const asset = assetStorage.getAssetById(assetId);
    
    const currentOwner = records.find(r => r.isCurrent);
    const previousOwners = records.filter(r => !r.isCurrent).sort((a, b) => 
      new Date(b.assignmentDate).getTime() - new Date(a.assignmentDate).getTime()
    );

    return {
      assetId,
      assetName: asset?.name || 'Unknown Asset',
      currentOwner,
      previousOwners,
      totalAssignments: records.length
    };
  }

  assignAsset(
    assetId: string, 
    assignedTo: string, 
    assignedBy: string,
    assignmentDate: string,
    department: string,
    location: string,
    office: string,
    notes?: string
  ): AssetOwnership {
    const records = this.getAllOwnershipRecords();
    
    // End current assignment if exists
    const currentAssignment = records.find(r => r.assetId === assetId && r.isCurrent);
    if (currentAssignment) {
      currentAssignment.isCurrent = false;
      currentAssignment.assignmentEndDate = assignmentDate;
      currentAssignment.updatedAt = new Date().toISOString();
    }

    // Create new assignment
    const newAssignment: AssetOwnership = {
      id: Date.now().toString(),
      assetId,
      assignedTo,
      assignedBy,
      assignmentDate,
      department,
      location,
      office,
      isCurrent: true,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    records.push(newAssignment);
    this.saveOwnershipRecords(records);

    // Update the asset record with new owner info
    const assetService = require('./assets').assetService;
    assetService.updateAsset(assetId, {
      assignedTo,
      owner: assignedTo,
      department,
      location,
      office
    });

    // Log activity
    assetStorage.addActivity(
      'Asset Assigned', 
      assetId, 
      assetService.getAssetById(assetId)?.name || 'Unknown', 
      assignedBy, 
      'info'
    );

    return newAssignment;
  }

  transferAsset(
    assetId: string,
    newAssignedTo: string,
    transferredBy: string,
    transferDate: string,
    newDepartment: string,
    newLocation: string,
    newOffice: string,
    transferReason?: string,
    notes?: string
  ): AssetOwnership {
    const records = this.getAllOwnershipRecords();
    
    // End current assignment
    const currentAssignment = records.find(r => r.assetId === assetId && r.isCurrent);
    if (currentAssignment) {
      currentAssignment.isCurrent = false;
      currentAssignment.assignmentEndDate = transferDate;
      currentAssignment.updatedAt = new Date().toISOString();
    }

    // Create new assignment
    const newAssignment: AssetOwnership = {
      id: Date.now().toString(),
      assetId,
      assignedTo: newAssignedTo,
      assignedBy: transferredBy,
      assignmentDate: transferDate,
      department: newDepartment,
      location: newLocation,
      office: newOffice,
      isCurrent: true,
      transferReason,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    records.push(newAssignment);
    this.saveOwnershipRecords(records);

    // Update the asset record
    const assetService = require('./assets').assetService;
    assetService.updateAsset(assetId, {
      assignedTo: newAssignedTo,
      owner: newAssignedTo,
      department: newDepartment,
      location: newLocation,
      office: newOffice
    });

    // Log activity
    assetStorage.addActivity(
      'Asset Transferred', 
      assetId, 
      assetService.getAssetById(assetId)?.name || 'Unknown', 
      transferredBy, 
      'info'
    );

    return newAssignment;
  }

  endAssignment(
    assetId: string,
    endDate: string,
    endedBy: string,
    reason?: string
  ): void {
    const records = this.getAllOwnershipRecords();
    const currentAssignment = records.find(r => r.assetId === assetId && r.isCurrent);
    
    if (currentAssignment) {
      currentAssignment.isCurrent = false;
      currentAssignment.assignmentEndDate = endDate;
      currentAssignment.transferReason = reason;
      currentAssignment.updatedAt = new Date().toISOString();
      
      this.saveOwnershipRecords(records);

      // Clear assignment from asset
      const assetService = require('./assets').assetService;
      assetService.updateAsset(assetId, {
        assignedTo: '',
        owner: ''
      });

      // Log activity
      assetStorage.addActivity(
        'Asset Assignment Ended', 
        assetId, 
        assetService.getAssetById(assetId)?.name || 'Unknown', 
        endedBy, 
        'warning'
      );
    }
  }

  getAllAssignments(): AssetOwnership[] {
    return this.getAllOwnershipRecords();
  }

  getCurrentAssignments(): AssetOwnership[] {
    return this.getAllOwnershipRecords().filter(r => r.isCurrent);
  }

  getAssignmentsByUser(assignedTo: string): AssetOwnership[] {
    return this.getAllOwnershipRecords().filter(r => r.assignedTo === assignedTo);
  }

  getAssignmentsByDepartment(department: string): AssetOwnership[] {
    return this.getAllOwnershipRecords().filter(r => r.department === department);
  }
}

export const assetOwnershipService = new AssetOwnershipService();