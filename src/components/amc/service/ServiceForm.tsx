
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/asset';

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

interface ServiceFormProps {
  assets: Asset[];
  record?: ServiceRecord | null;
  onSubmit: (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  assets,
  record,
  onSubmit,
  onCancel
}) => {
  const [assetId, setAssetId] = useState(record?.assetId || '');
  const [serviceType, setServiceType] = useState<'amc' | 'warranty' | 'insurance'>(record?.serviceType || 'amc');
  const [provider, setProvider] = useState(record?.provider || '');
  const [startDate, setStartDate] = useState(record?.startDate || '');
  const [endDate, setEndDate] = useState(record?.endDate || '');
  const [cost, setCost] = useState(record?.cost?.toString() || '');
  const [status, setStatus] = useState<'active' | 'expired' | 'pending_renewal' | 'cancelled' | 'terminated' | 'transferred'>(record?.status || 'active');
  const [description, setDescription] = useState(record?.description || '');
  const [contactPerson, setContactPerson] = useState(record?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(record?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(record?.contactEmail || '');
  const [reminderDays, setReminderDays] = useState(record?.reminderDays?.toString() || '30');
  const [notes, setNotes] = useState(record?.notes || '');

  const selectedAsset = assets.find(asset => asset.id === assetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assetId || !provider || !startDate || !endDate || !cost) {
      return;
    }

    const formData = {
      assetId,
      assetName: selectedAsset?.name || '',
      serviceType,
      provider,
      startDate,
      endDate,
      cost: parseFloat(cost),
      status,
      description,
      contactPerson,
      contactPhone,
      contactEmail,
      reminderDays: parseInt(reminderDays) || 30,
      notes
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Asset *</Label>
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-green-500/30">
              {assets.map(asset => (
                <SelectItem key={asset.id} value={asset.id} className="text-white hover:bg-green-500/20">
                  {asset.name} - {asset.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Service Type *</Label>
          <Select value={serviceType} onValueChange={(value: 'amc' | 'warranty' | 'insurance') => setServiceType(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-green-500/30">
              <SelectItem value="amc" className="text-white hover:bg-green-500/20">AMC</SelectItem>
              <SelectItem value="warranty" className="text-white hover:bg-green-500/20">Warranty</SelectItem>
              <SelectItem value="insurance" className="text-white hover:bg-green-500/20">Insurance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Provider/Vendor *</Label>
          <Input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Enter provider name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Status</Label>
          <Select value={status} onValueChange={(value: 'active' | 'expired' | 'pending_renewal' | 'cancelled' | 'terminated' | 'transferred') => setStatus(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-green-500/30">
              <SelectItem value="active" className="text-white hover:bg-green-500/20">Active</SelectItem>
              <SelectItem value="expired" className="text-white hover:bg-green-500/20">Expired</SelectItem>
              <SelectItem value="pending_renewal" className="text-white hover:bg-green-500/20">Pending Renewal</SelectItem>
              <SelectItem value="cancelled" className="text-white hover:bg-green-500/20">Cancelled</SelectItem>
              <SelectItem value="terminated" className="text-white hover:bg-green-500/20">Terminated</SelectItem>
              <SelectItem value="transferred" className="text-white hover:bg-green-500/20">Transferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Start Date *</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">End Date *</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Cost *</Label>
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Reminder Days</Label>
          <Input
            type="number"
            value={reminderDays}
            onChange={(e) => setReminderDays(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="30"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Contact Person</Label>
          <Input
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Contact person name"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Contact Phone</Label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="Contact phone number"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-white">Contact Email</Label>
        <Input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="contact@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-white">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Service description"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-white">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Additional notes"
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-black">
          {record ? 'Update' : 'Create'} Service Record
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800/50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
