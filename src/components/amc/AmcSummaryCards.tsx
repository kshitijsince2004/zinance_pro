
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { assetService } from '@/lib/assets';

interface AmcSummaryCardsProps {
  activeAmcs: number;
  expiredAmcs: number;
  activeWarranties: number;
  activeInsurance: number;
  expiringSoon: number;
  terminatedServices: number;
}

const AmcSummaryCards: React.FC<AmcSummaryCardsProps> = ({
  activeAmcs,
  expiredAmcs,
  activeWarranties,
  activeInsurance,
  expiringSoon,
  terminatedServices
}) => {
  // Calculate real percentages based on asset data
  const assets = assetService.getAllAssets();
  const totalServices = activeAmcs + expiredAmcs + activeWarranties + activeInsurance + terminatedServices;
  
  const calculateServicePercentage = (count: number): string => {
    if (totalServices === 0) return '0%';
    const percentage = (count / totalServices) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <Card className="bg-black/60 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-400">Active AMCs</p>
              <p className="text-xl font-bold text-white">{activeAmcs}</p>
              <p className="text-xs text-blue-400">{calculateServicePercentage(activeAmcs)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-red-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-400">Expired AMCs</p>
              <p className="text-xl font-bold text-white">{expiredAmcs}</p>
              <p className="text-xs text-red-400">{calculateServicePercentage(expiredAmcs)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-400">Active Warranties</p>
              <p className="text-xl font-bold text-white">{activeWarranties}</p>
              <p className="text-xs text-green-400">{calculateServicePercentage(activeWarranties)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-400">Active Insurance</p>
              <p className="text-xl font-bold text-white">{activeInsurance}</p>
              <p className="text-xs text-purple-400">{calculateServicePercentage(activeInsurance)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Expiring Soon</p>
              <p className="text-xl font-bold text-white">{expiringSoon}</p>
              <p className="text-xs text-orange-400">{calculateServicePercentage(expiringSoon)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-gray-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-400">Terminated</p>
              <p className="text-xl font-bold text-white">{terminatedServices}</p>
              <p className="text-xs text-gray-400">{calculateServicePercentage(terminatedServices)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmcSummaryCards;
