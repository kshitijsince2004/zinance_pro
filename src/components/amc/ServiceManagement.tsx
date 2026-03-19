
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Asset } from '@/types/asset';
import ServiceForm from './service/ServiceForm';
import ServiceCard from './service/ServiceCard';

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

interface ServiceManagementProps {
  assets: Asset[];
  serviceRecords: ServiceRecord[];
  onAddService: (record: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateService: (id: string, updates: Partial<ServiceRecord>) => void;
  onDeleteService: (id: string) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({
  assets,
  serviceRecords,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const { toast } = useToast();

  const handleSubmit = (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAddService(data);
    setShowAddDialog(false);
    
    toast({
      title: 'Service Added',
      description: `${data.serviceType.toUpperCase()} record has been added.`,
    });
  };

  const handleEdit = (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRecord) {
      onUpdateService(editingRecord.id, data);
      setEditingRecord(null);
      
      toast({
        title: 'Service Updated',
        description: 'Service record has been updated successfully.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Service Records</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-green-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add Service Record</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add AMC, Warranty, or Insurance coverage for an asset
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              assets={assets}
              onSubmit={handleSubmit}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {serviceRecords.map((record) => (
          <ServiceCard 
            key={record.id} 
            record={record}
            onEdit={(record) => setEditingRecord(record)}
            onDelete={(id) => onDeleteService(id)}
            onView={(record) => {
              // Handle view logic here
              console.log('Viewing record:', record);
            }}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="bg-black/90 border-green-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Service Record</DialogTitle>
          </DialogHeader>
          <ServiceForm
            assets={assets}
            record={editingRecord}
            onSubmit={handleEdit}
            onCancel={() => setEditingRecord(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;
