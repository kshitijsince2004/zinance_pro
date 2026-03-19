
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

// Updated ServiceRecord interface to match AMC.tsx
interface ServiceRecord {
  id: string;
  assetId: string;
  assetName: string;
  serviceType: 'amc' | 'warranty' | 'insurance';
  provider: string;
  startDate: string;
  endDate: string;
  cost: number;
  status: 'active' | 'expired' | 'pending_renewal' | 'cancelled' | 'terminated' | 'transferred';
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  reminderDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceCardProps {
  record: ServiceRecord;
  onEdit: (record: ServiceRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: ServiceRecord) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  record, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'expired': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending_renewal': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'terminated': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'transferred': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'amc': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'warranty': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'insurance': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const calculateDaysLeft = () => {
    if (!record.endDate) return 0;
    const today = new Date();
    const endDate = new Date(record.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Add safety checks for undefined values
  const serviceType = record.serviceType || 'amc';
  const status = record.status || 'active';
  const assetName = record.assetName || 'Unknown Asset';
  const provider = record.provider || 'Unknown Provider';

  return (
    <Card className="bg-black/60 border-gray-700 hover:border-green-500/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white">{assetName}</h4>
            <Badge className={getTypeColor(serviceType)}>
              {serviceType.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(status)}>
              {status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(record)}
              className="text-blue-500 hover:bg-blue-500/20"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(record)}
              className="text-green-500 hover:bg-green-500/20"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(record.id)}
              className="text-red-500 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Provider:</span>
            <p className="text-white font-medium">{provider}</p>
          </div>
          <div>
            <span className="text-gray-400">Cost:</span>
            <p className="text-white font-medium">₹{(record.cost || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">Days Left:</span>
            <p className={`font-medium ${calculateDaysLeft() <= 30 ? 'text-yellow-400' : calculateDaysLeft() <= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {calculateDaysLeft()}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Start Date:</span>
            <p className="text-white">{record.startDate ? format(new Date(record.startDate), 'dd/MM/yyyy') : 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">End Date:</span>
            <p className="text-white">{record.endDate ? format(new Date(record.endDate), 'dd/MM/yyyy') : 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">Contact:</span>
            <p className="text-white">{record.contactPerson || 'N/A'}</p>
          </div>
        </div>

        {record.description && (
          <div className="mt-3 text-sm">
            <span className="text-gray-400">Description:</span>
            <p className="text-white">{record.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
