
import { Block, BlockAssignment, BlockSummary } from '@/types/blocks';

// Mock data for blocks - replace with actual API calls when backend is ready
const MOCK_BLOCKS: Block[] = [
  {
    id: 'block-1',
    name: 'Computer Equipment',
    code: 'CE001',
    depreciationRate: 60,
    slabId: 'slab-1',
    assetClass: 'Computer',
    category: 'IT Equipment',
    tags: ['IT', 'Hardware'],
    notes: 'All computer equipment including desktops, laptops',
    isActive: true,
    groupingCriteria: {
      department: 'IT',
      company: 'Tech Corp'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'block-2',
    name: 'Office Furniture',
    code: 'OF001',
    depreciationRate: 10,
    slabId: 'slab-2',
    assetClass: 'Furniture',
    category: 'Office Equipment',
    tags: ['Furniture', 'Office'],
    notes: 'Desks, chairs, and other office furniture',
    isActive: true,
    groupingCriteria: {
      department: 'Admin',
      company: 'Tech Corp'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class BlockService {
  private blocks: Block[] = [];
  private assignments: BlockAssignment[] = [];

  constructor() {
    this.loadBlocks();
    this.loadAssignments();
  }

  private loadBlocks(): void {
    const stored = localStorage.getItem('asset_blocks');
    if (stored) {
      this.blocks = JSON.parse(stored);
    } else {
      this.blocks = [...MOCK_BLOCKS];
      this.saveBlocks();
    }
  }

  private saveBlocks(): void {
    localStorage.setItem('asset_blocks', JSON.stringify(this.blocks));
  }

  private loadAssignments(): void {
    const stored = localStorage.getItem('block_assignments');
    if (stored) {
      this.assignments = JSON.parse(stored);
    }
  }

  private saveAssignments(): void {
    localStorage.setItem('block_assignments', JSON.stringify(this.assignments));
  }

  getAllBlocks(): Block[] {
    return [...this.blocks];
  }

  getActiveBlocks(): Block[] {
    return this.blocks.filter(block => block.isActive);
  }

  getBlockById(id: string): Block | undefined {
    return this.blocks.find(block => block.id === id);
  }

  createBlock(blockData: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Block {
    const newBlock: Block = {
      ...blockData,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.blocks.push(newBlock);
    this.saveBlocks();
    return newBlock;
  }

  updateBlock(id: string, updates: Partial<Block>): Block | null {
    const index = this.blocks.findIndex(block => block.id === id);
    if (index === -1) return null;

    this.blocks[index] = {
      ...this.blocks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveBlocks();
    return this.blocks[index];
  }

  deleteBlock(id: string): boolean {
    const index = this.blocks.findIndex(block => block.id === id);
    if (index === -1) return false;

    // Remove all assignments for this block
    this.assignments = this.assignments.filter(assignment => assignment.blockId !== id);
    this.saveAssignments();

    this.blocks.splice(index, 1);
    this.saveBlocks();
    return true;
  }

  assignAssetToBlock(assetId: string, blockId: string): BlockAssignment {
    // Remove existing assignments for this asset
    this.assignments = this.assignments.filter(assignment => assignment.assetId !== assetId);

    const assignment: BlockAssignment = {
      id: `assignment-${Date.now()}`,
      blockId,
      assetId,
      assignedDate: new Date().toISOString(),
      assignedBy: 'current-user' // Replace with actual user
    };

    this.assignments.push(assignment);
    this.saveAssignments();
    return assignment;
  }

  removeAssetFromBlock(assetId: string, blockId: string): boolean {
    const initialLength = this.assignments.length;
    this.assignments = this.assignments.filter(
      assignment => !(assignment.assetId === assetId && assignment.blockId === blockId)
    );

    if (this.assignments.length !== initialLength) {
      this.saveAssignments();
      return true;
    }
    return false;
  }

  getAssetBlocks(assetId: string): Block[] {
    const assetAssignments = this.assignments.filter(assignment => assignment.assetId === assetId);
    return assetAssignments
      .map(assignment => this.getBlockById(assignment.blockId))
      .filter((block): block is Block => block !== undefined);
  }

  getBlockAssets(blockId: string): string[] {
    return this.assignments
      .filter(assignment => assignment.blockId === blockId)
      .map(assignment => assignment.assetId);
  }

  getBlockSummaries(): BlockSummary[] {
    return this.blocks.map(block => {
      const assetIds = this.getBlockAssets(block.id);
      
      return {
        block,
        assetCount: assetIds.length,
        totalPurchaseValue: 0, // Calculate from actual assets
        openingWDV: 0, // Calculate from depreciation data
        currentYearDepreciation: 0, // Calculate from depreciation data
        closingWDV: 0, // Calculate from depreciation data
        unassignedAssets: 0 // Calculate from actual assets
      };
    });
  }
}

export const blockService = new BlockService();
export type { Block, BlockAssignment, BlockSummary };
