
import React from 'react';
import { ImportData } from '@/pages/Import';

interface DataSummaryStatsProps {
  data: ImportData[];
  headers: string[];
  emptyRows: number;
}

const DataSummaryStats: React.FC<DataSummaryStatsProps> = ({ data, headers, emptyRows }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <div className="text-green-400 font-medium">Total Rows</div>
        <div className="text-white text-lg font-bold">{data.length}</div>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="text-blue-400 font-medium">Columns</div>
        <div className="text-white text-lg font-bold">{headers.length}</div>
      </div>
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <div className="text-purple-400 font-medium">Valid Rows</div>
        <div className="text-white text-lg font-bold">{data.length - emptyRows}</div>
      </div>
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <div className="text-orange-400 font-medium">Empty Rows</div>
        <div className="text-white text-lg font-bold">{emptyRows}</div>
      </div>
    </div>
  );
};

export default DataSummaryStats;
