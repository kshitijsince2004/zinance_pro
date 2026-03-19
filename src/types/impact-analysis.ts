export interface AssetChangeImpact {
  id: string;
  assetId: string;
  assetName: string;
  changeDate: string;
  effectiveFromDate: string; // When the impact should be applied from
  changeType: 'depreciation_method' | 'useful_life' | 'residual_value' | 'purchase_price' | 'put_to_use_date' | 'category';
  
  // Previous values
  previousValues: {
    depreciationMethod?: string;
    usefulLife?: number;
    residualValue?: number;
    purchasePrice?: number;
    putToUseDate?: string;
    category?: string;
  };
  
  // New values
  newValues: {
    depreciationMethod?: string;
    usefulLife?: number;
    residualValue?: number;
    purchasePrice?: number;
    putToUseDate?: string;
    category?: string;
  };
  
  // Financial impact calculations
  impactAnalysis: {
    // Historical depreciation under old method
    historicalDepreciation: number;
    // What depreciation should have been under new method
    recalculatedDepreciation: number;
    // The difference (impact amount)
    impactAmount: number;
    // Whether it's excess or shortfall
    impactType: 'excess_depreciation' | 'shortfall_depreciation';
    // Book value under old vs new method
    oldBookValue: number;
    newBookValue: number;
    // Impact on future depreciation
    futureDepreciationChange: number;
  };
  
  // Approval and booking status
  status: 'pending_review' | 'approved' | 'booked' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  bookedInMonth?: string; // Format: YYYY-MM
  bookedAt?: string;
  
  // Detailed breakdown by financial year
  yearWiseImpact: {
    financialYear: string;
    oldDepreciation: number;
    newDepreciation: number;
    difference: number;
  }[];
  
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactBookingEntry {
  id: string;
  impactId: string;
  assetId: string;
  bookingMonth: string; // Format: YYYY-MM
  bookingType: 'depreciation_adjustment' | 'book_value_correction';
  amount: number;
  description: string;
  bookedBy: string;
  bookedAt: string;
}

export interface ImpactSummary {
  totalPendingImpacts: number;
  totalApprovedImpacts: number;
  totalBookedImpacts: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
  totalBookedAmount: number;
  byChangeType: {
    [key: string]: {
      count: number;
      totalAmount: number;
    };
  };
  byFinancialYear: {
    [key: string]: {
      impactCount: number;
      totalImpactAmount: number;
    };
  };
}