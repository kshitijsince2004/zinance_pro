import { Asset } from '@/types/asset';
import { AssetChangeImpact, ImpactBookingEntry, ImpactSummary } from '@/types/impact-analysis';
import { depreciationCalculator } from '@/lib/depreciation/calculations';

export class ImpactAnalysisService {
  private getStorageKey(type: 'impacts' | 'bookings'): string {
    return type === 'impacts' ? 'fams-impact-analysis' : 'fams-impact-bookings';
  }

  // Calculate impact when asset details change
  calculateAssetChangeImpact(
    asset: Asset,
    previousValues: Partial<Asset>,
    newValues: Partial<Asset>,
    changeDate: Date,
    createdBy: string
  ): AssetChangeImpact {
    const changeType = this.determineChangeType(previousValues, newValues);
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    
    // Create temporary assets with old and new values for comparison
    const oldAsset = { ...asset, ...previousValues };
    const newAsset = { ...asset, ...newValues };
    
    // Calculate depreciation under both methods up to change date
    const historicalDepreciation = this.calculateDepreciationTillDate(oldAsset, putToUseDate, changeDate);
    const recalculatedDepreciation = this.calculateDepreciationTillDate(newAsset, putToUseDate, changeDate);
    
    const impactAmount = historicalDepreciation - recalculatedDepreciation;
    const impactType = impactAmount > 0 ? 'excess_depreciation' : 'shortfall_depreciation';
    
    const oldBookValue = oldAsset.purchasePrice - historicalDepreciation;
    const newBookValue = newAsset.purchasePrice - recalculatedDepreciation;
    
    // Calculate year-wise breakdown
    const yearWiseImpact = this.calculateYearWiseImpact(oldAsset, newAsset, putToUseDate, changeDate);
    
    // Calculate future depreciation impact
    const remainingLife = (newAsset.usefulLife || 5) - this.getYearsElapsed(putToUseDate, changeDate);
    const futureDepreciationChange = this.calculateFutureDepreciationDifference(
      oldAsset, newAsset, changeDate, remainingLife
    );

    const impact: AssetChangeImpact = {
      id: `impact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assetId: asset.id,
      assetName: asset.name,
      changeDate: changeDate.toISOString(),
      effectiveFromDate: changeDate.toISOString(),
      changeType,
      previousValues,
      newValues,
      impactAnalysis: {
        historicalDepreciation,
        recalculatedDepreciation,
        impactAmount: Math.abs(impactAmount),
        impactType,
        oldBookValue,
        newBookValue,
        futureDepreciationChange
      },
      status: 'pending_review',
      yearWiseImpact,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return impact;
  }

  // Save impact analysis
  saveImpactAnalysis(impact: AssetChangeImpact): void {
    const impacts = this.getAllImpacts();
    impacts.push(impact);
    localStorage.setItem(this.getStorageKey('impacts'), JSON.stringify(impacts));
  }

  // Get all impacts
  getAllImpacts(): AssetChangeImpact[] {
    const stored = localStorage.getItem(this.getStorageKey('impacts'));
    return stored ? JSON.parse(stored) : [];
  }

  // Get impacts for specific asset
  getAssetImpacts(assetId: string): AssetChangeImpact[] {
    return this.getAllImpacts().filter(impact => impact.assetId === assetId);
  }

  // Approve impact
  approveImpact(impactId: string, reviewedBy: string): void {
    const impacts = this.getAllImpacts();
    const impact = impacts.find(i => i.id === impactId);
    if (impact) {
      impact.status = 'approved';
      impact.reviewedBy = reviewedBy;
      impact.reviewedAt = new Date().toISOString();
      impact.updatedAt = new Date().toISOString();
      localStorage.setItem(this.getStorageKey('impacts'), JSON.stringify(impacts));
    }
  }

  // Book impact in specific month
  bookImpact(impactId: string, bookingMonth: string, bookedBy: string): void {
    const impacts = this.getAllImpacts();
    const impact = impacts.find(i => i.id === impactId);
    if (impact && impact.status === 'approved') {
      impact.status = 'booked';
      impact.bookedInMonth = bookingMonth;
      impact.bookedAt = new Date().toISOString();
      impact.updatedAt = new Date().toISOString();

      // Create booking entry
      const booking: ImpactBookingEntry = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        impactId,
        assetId: impact.assetId,
        bookingMonth,
        bookingType: impact.impactAnalysis.impactType === 'excess_depreciation' 
          ? 'depreciation_adjustment' 
          : 'book_value_correction',
        amount: impact.impactAnalysis.impactAmount,
        description: `Impact booking for ${impact.assetName} - ${impact.changeType}`,
        bookedBy,
        bookedAt: new Date().toISOString()
      };

      this.saveBookingEntry(booking);
      localStorage.setItem(this.getStorageKey('impacts'), JSON.stringify(impacts));
    }
  }

  // Get impact summary
  getImpactSummary(): ImpactSummary {
    const impacts = this.getAllImpacts();
    
    const summary: ImpactSummary = {
      totalPendingImpacts: impacts.filter(i => i.status === 'pending_review').length,
      totalApprovedImpacts: impacts.filter(i => i.status === 'approved').length,
      totalBookedImpacts: impacts.filter(i => i.status === 'booked').length,
      totalPendingAmount: impacts
        .filter(i => i.status === 'pending_review')
        .reduce((sum, i) => sum + i.impactAnalysis.impactAmount, 0),
      totalApprovedAmount: impacts
        .filter(i => i.status === 'approved')
        .reduce((sum, i) => sum + i.impactAnalysis.impactAmount, 0),
      totalBookedAmount: impacts
        .filter(i => i.status === 'booked')
        .reduce((sum, i) => sum + i.impactAnalysis.impactAmount, 0),
      byChangeType: {},
      byFinancialYear: {}
    };

    // Calculate by change type
    impacts.forEach(impact => {
      if (!summary.byChangeType[impact.changeType]) {
        summary.byChangeType[impact.changeType] = { count: 0, totalAmount: 0 };
      }
      summary.byChangeType[impact.changeType].count++;
      summary.byChangeType[impact.changeType].totalAmount += impact.impactAnalysis.impactAmount;
    });

    // Calculate by financial year
    impacts.forEach(impact => {
      impact.yearWiseImpact.forEach(yearImpact => {
        if (!summary.byFinancialYear[yearImpact.financialYear]) {
          summary.byFinancialYear[yearImpact.financialYear] = { impactCount: 0, totalImpactAmount: 0 };
        }
        summary.byFinancialYear[yearImpact.financialYear].impactCount++;
        summary.byFinancialYear[yearImpact.financialYear].totalImpactAmount += Math.abs(yearImpact.difference);
      });
    });

    return summary;
  }

  private determineChangeType(previousValues: Partial<Asset>, newValues: Partial<Asset>): AssetChangeImpact['changeType'] {
    if (newValues.depreciationMethod && newValues.depreciationMethod !== previousValues.depreciationMethod) {
      return 'depreciation_method';
    }
    if (newValues.usefulLife && newValues.usefulLife !== previousValues.usefulLife) {
      return 'useful_life';
    }
    if (newValues.residualValue && newValues.residualValue !== previousValues.residualValue) {
      return 'residual_value';
    }
    if (newValues.purchasePrice && newValues.purchasePrice !== previousValues.purchasePrice) {
      return 'purchase_price';
    }
    if (newValues.putToUseDate && newValues.putToUseDate !== previousValues.putToUseDate) {
      return 'put_to_use_date';
    }
    if (newValues.category && newValues.category !== previousValues.category) {
      return 'category';
    }
    return 'depreciation_method'; // fallback
  }

  private calculateDepreciationTillDate(asset: Asset, startDate: Date, endDate: Date): number {
    return depreciationCalculator.calculateDepreciationTillDate(asset, startDate, endDate);
  }

  private getYearsElapsed(startDate: Date, endDate: Date): number {
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  private calculateYearWiseImpact(
    oldAsset: Asset, 
    newAsset: Asset, 
    startDate: Date, 
    endDate: Date
  ): AssetChangeImpact['yearWiseImpact'] {
    const yearWiseImpact: AssetChangeImpact['yearWiseImpact'] = [];
    const startFY = depreciationCalculator.getFinancialYear(startDate);
    const endFY = depreciationCalculator.getFinancialYear(endDate);

    for (let fy = startFY; fy <= endFY; fy++) {
      const fyStart = new Date(fy, 3, 1);
      const fyEnd = new Date(fy + 1, 2, 31);
      
      const periodStart = fy === startFY ? startDate : fyStart;
      const periodEnd = fy === endFY ? endDate : fyEnd;

      const oldDepreciation = this.calculateDepreciationForPeriod(oldAsset, periodStart, periodEnd);
      const newDepreciation = this.calculateDepreciationForPeriod(newAsset, periodStart, periodEnd);

      yearWiseImpact.push({
        financialYear: `FY ${fy}-${(fy + 1).toString().slice(-2)}`,
        oldDepreciation,
        newDepreciation,
        difference: oldDepreciation - newDepreciation
      });
    }

    return yearWiseImpact;
  }

  private calculateDepreciationForPeriod(asset: Asset, startDate: Date, endDate: Date): number {
    // This is a simplified calculation - should be enhanced based on specific depreciation method
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const annualDepreciation = (asset.purchasePrice - asset.residualValue) / (asset.usefulLife || 5);
    return annualDepreciation * (daysInPeriod / 365);
  }

  private calculateFutureDepreciationDifference(
    oldAsset: Asset, 
    newAsset: Asset, 
    fromDate: Date, 
    remainingYears: number
  ): number {
    // Simplified calculation for future depreciation difference
    const oldAnnualDep = (oldAsset.purchasePrice - oldAsset.residualValue) / (oldAsset.usefulLife || 5);
    const newAnnualDep = (newAsset.purchasePrice - newAsset.residualValue) / (newAsset.usefulLife || 5);
    return (oldAnnualDep - newAnnualDep) * remainingYears;
  }

  private saveBookingEntry(booking: ImpactBookingEntry): void {
    const bookings = this.getAllBookings();
    bookings.push(booking);
    localStorage.setItem(this.getStorageKey('bookings'), JSON.stringify(bookings));
  }

  private getAllBookings(): ImpactBookingEntry[] {
    const stored = localStorage.getItem(this.getStorageKey('bookings'));
    return stored ? JSON.parse(stored) : [];
  }
}

export const impactAnalysisService = new ImpactAnalysisService();