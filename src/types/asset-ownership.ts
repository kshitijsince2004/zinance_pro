export interface AssetOwnership {
  id: string;
  assetId: string;
  assignedTo: string;
  assignedBy: string;
  assignmentDate: string;  // Date when assigned
  assignmentEndDate?: string;  // Date when assignment ended (null if current)
  department: string;
  location: string;
  office: string;
  isCurrent: boolean;
  notes?: string;
  transferReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetOwnershipHistory {
  assetId: string;
  assetName: string;
  currentOwner?: AssetOwnership;
  previousOwners: AssetOwnership[];
  totalAssignments: number;
}