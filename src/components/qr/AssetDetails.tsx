
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Asset } from '@/types/asset';

interface AssetDetailsProps {
  asset: Asset;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2 text-gray-300">
        <div><span className="text-gray-400">Name:</span> {asset.name}</div>
        <div><span className="text-gray-400">Type:</span> {asset.type}</div>
        <div><span className="text-gray-400">Department:</span> {asset.department}</div>
        <div><span className="text-gray-400">Location:</span> {asset.location}</div>
        <div><span className="text-gray-400">Owner:</span> {asset.owner}</div>
        <div><span className="text-gray-400">Status:</span> 
          <Badge className="ml-1 bg-green-500/20 text-green-300">{asset.status}</Badge>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
