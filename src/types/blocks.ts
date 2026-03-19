
export interface Block {
  id: string;
  name: string;
  code?: string;
  depreciationRate: number;
  slabId: string;
  assetClass: string;
  category: string;
  tags?: string[];
  notes?: string;
  isActive: boolean;
  // Updated grouping criteria with optional properties
  groupingCriteria?: {
    department?: string;
    company?: string;
    location?: string;
    costCenter?: string;
    customField1?: string;
    customField2?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlockAssignment {
  id: string;
  blockId: string;
  assetId: string;
  assignedDate: string;
  assignedBy: string;
  notes?: string;
}

export interface BlockDepreciationData {
  blockId: string;
  financialYear: string;
  openingWDV: number;
  additions: number;
  deletions: number;
  currentYearDepreciation: number;
  closingWDV: number;
  assetCount: number;
  calculationDetails: {
    additionsWithHalfYear: number;
    deletionsBeforeDepreciation: number;
    effectiveWDVForDepreciation: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlockMovementLog {
  id: string;
  assetId: string;
  fromBlockId?: string;
  toBlockId: string;
  movedDate: string;
  movedBy: string;
  reason?: string;
  type: 'assignment' | 'reassignment' | 'removal';
}

export interface BlockSummary {
  block: Block;
  assetCount: number;
  totalPurchaseValue: number;
  openingWDV: number;
  currentYearDepreciation: number;
  closingWDV: number;
  unassignedAssets: number;
}
