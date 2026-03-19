import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Calendar, BarChart3, Wrench, Eye, Edit, Trash2 } from 'lucide-react';
import { assetService } from '@/lib/assets';
import AmcSummaryCards from '@/components/amc/AmcSummaryCards';
import ServiceForm from '@/components/amc/service/ServiceForm';
import ServiceCard from '@/components/amc/service/ServiceCard';
import CalendarView from '@/components/amc/CalendarView';
import TaskManagement from '@/components/amc/TaskManagement';
import ReminderConfiguration from '@/components/amc/ReminderConfiguration';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

// Updated ServiceRecord interface with all required properties for compatibility
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
  // Additional properties for compatibility with other components
  type?: 'amc' | 'warranty' | 'insurance';
  vendor?: string;
  policyNumber?: string;
  amount?: number;
  documents?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface ReminderConfig {
  id: string;
  type: 'amc' | 'warranty' | 'insurance';
  daysBefore: number;
  recipients: string[];
  active: boolean;
  lastSent?: string;
}

interface MockEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

const AMC: React.FC = () => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ServiceRecord[]>([]);
  const [assets, setAssets] = useState(assetService.getAllAssets());
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'tasks' | 'reminders' | 'manage'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  
  // Mock data for reminder functionality
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@company.com', department: 'IT' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', department: 'Finance' },
    { id: '3', name: 'Bob Wilson', email: 'bob@company.com', department: 'Operations' }
  ]);
  
  const [reminderConfigs, setReminderConfigs] = useState<ReminderConfig[]>([]);
  const [mockEmails, setMockEmails] = useState<MockEmail[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    // Clear existing AMCs and generate new ones based on assets
    generateAmcsFromAssets();
    loadReminderConfigs();
    loadMockEmails();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [serviceRecords, searchTerm, statusFilter, typeFilter]);

  const generateAmcsFromAssets = () => {
    // Clear existing service records
    localStorage.removeItem('service-records');
    
    const newServiceRecords: ServiceRecord[] = assets.map(asset => {
      const startDate = asset.purchaseDate;
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year AMC
      
      const today = new Date();
      const endDateObj = new Date(endDate);
      const isExpired = endDateObj < today;
      const isExpiringSoon = !isExpired && (endDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      
      let status: ServiceRecord['status'] = 'active';
      if (isExpired) {
        status = 'expired';
      } else if (isExpiringSoon) {
        status = 'pending_renewal';
      }

      return {
        id: `amc-${asset.id}`,
        assetId: asset.id,
        assetName: asset.name,
        serviceType: 'amc' as const,
        provider: asset.vendor || 'Default Vendor',
        startDate: startDate,
        endDate: endDate.toISOString().split('T')[0],
        cost: Math.round(asset.purchasePrice * 0.1), // 10% of purchase price as AMC cost
        status,
        description: `Annual Maintenance Contract for ${asset.name}`,
        contactPerson: 'Service Manager',
        contactPhone: '+91-9876543210',
        contactEmail: 'service@vendor.com',
        reminderDays: 30,
        notes: `Auto-generated AMC based on asset purchase date`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'amc' as const,
        vendor: asset.vendor || 'Default Vendor',
        policyNumber: `AMC-${asset.id}`,
        amount: Math.round(asset.purchasePrice * 0.1),
        documents: []
      };
    });

    setServiceRecords(newServiceRecords);
    localStorage.setItem('service-records', JSON.stringify(newServiceRecords));
    
    toast({
      title: 'AMCs Generated',
      description: `Generated ${newServiceRecords.length} AMC records based on asset purchase dates.`,
    });
  };

  const loadReminderConfigs = () => {
    const stored = localStorage.getItem('reminder-configs');
    if (stored) {
      setReminderConfigs(JSON.parse(stored));
    }
  };

  const loadMockEmails = () => {
    const stored = localStorage.getItem('mock-emails');
    if (stored) {
      setMockEmails(JSON.parse(stored));
    }
  };

  const saveServiceRecords = (records: ServiceRecord[]) => {
    localStorage.setItem('service-records', JSON.stringify(records));
    setServiceRecords(records);
  };

  const filterRecords = () => {
    let filtered = serviceRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        (record.assetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.provider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.serviceType === typeFilter);
    }

    setFilteredRecords(filtered);
  };

  const createServiceRecord = (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: ServiceRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRecords = [...serviceRecords, newRecord];
    saveServiceRecords(updatedRecords);
    
    toast({
      title: 'Service Record Created',
      description: `${data.serviceType?.toUpperCase() || 'Service'} record for ${data.assetName || 'asset'} has been created.`,
    });

    setShowAddForm(false);
  };

  const updateServiceRecord = (id: string, updates: Partial<ServiceRecord>) => {
    const updatedRecords = serviceRecords.map(record =>
      record.id === id
        ? { ...record, ...updates, updatedAt: new Date().toISOString() }
        : record
    );
    
    saveServiceRecords(updatedRecords);
    
    toast({
      title: 'Service Record Updated',
      description: 'Service record has been updated successfully.',
    });

    setEditingRecord(null);
  };

  const deleteServiceRecord = (id: string) => {
    const record = serviceRecords.find(r => r.id === id);
    if (!record) return;

    if (window.confirm(`Are you sure you want to delete this ${record.serviceType || 'service'} record?`)) {
      const updatedRecords = serviceRecords.filter(record => record.id !== id);
      saveServiceRecords(updatedRecords);
      
      toast({
        title: 'Service Record Deleted',
        description: 'Service record has been deleted successfully.',
        variant: 'destructive',
      });
    }
  };

  const handleAddReminderConfig = (config: Omit<ReminderConfig, 'id'>) => {
    const newConfig: ReminderConfig = {
      ...config,
      id: Date.now().toString()
    };
    const updated = [...reminderConfigs, newConfig];
    setReminderConfigs(updated);
    localStorage.setItem('reminder-configs', JSON.stringify(updated));
  };

  const handleSendTestReminder = (type: string, recipients: string[]) => {
    const newEmail: MockEmail = {
      id: Date.now().toString(),
      to: recipients.map(id => users.find(u => u.id === id)?.email || '').join(', '),
      subject: `Test ${type?.toUpperCase() || 'SERVICE'} Reminder`,
      body: `This is a test reminder for ${type || 'service'} services.`,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newEmail, ...mockEmails];
    setMockEmails(updated);
    localStorage.setItem('mock-emails', JSON.stringify(updated));
    
    toast({
      title: 'Test Reminder Sent',
      description: `Test reminder sent to ${recipients.length} recipient(s).`,
    });
  };

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

  const getSummaryData = () => {
    const activeAmcs = serviceRecords.filter(r => r.serviceType === 'amc' && r.status === 'active').length;
    const expiredAmcs = serviceRecords.filter(r => r.serviceType === 'amc' && r.status === 'expired').length;
    const activeWarranties = serviceRecords.filter(r => r.serviceType === 'warranty' && r.status === 'active').length;
    const activeInsurance = serviceRecords.filter(r => r.serviceType === 'insurance' && r.status === 'active').length;
    const expiringSoon = serviceRecords.filter(r => {
      if (r.status !== 'active') return false;
      const endDate = new Date(r.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;
    const terminatedServices = serviceRecords.filter(r => 
      r.status === 'terminated' || r.status === 'cancelled' || r.status === 'transferred'
    ).length;

    return {
      activeAmcs,
      expiredAmcs,
      activeWarranties,
      activeInsurance,
      expiringSoon,
      terminatedServices
    };
  };

  // Filter records for components that expect basic status types
  const getActiveRecords = () => serviceRecords.filter(r => 
    ['active', 'expired', 'pending_renewal'].includes(r.status)
  );

  const transformRecordForComponents = (record: ServiceRecord) => {
    // Map extended status types to basic ones for compatibility
    let compatibleStatus: 'active' | 'expired' | 'pending_renewal' = 'expired';
    if (record.status === 'active') {
      compatibleStatus = 'active';
    } else if (record.status === 'pending_renewal') {
      compatibleStatus = 'pending_renewal';
    } else {
      // Map all other statuses to 'expired' for compatibility
      compatibleStatus = 'expired';
    }

    return {
      ...record,
      status: compatibleStatus,
      type: record.serviceType,
      vendor: record.provider,
      amount: record.cost,
      policyNumber: record.id, // Use ID as policy number if not available
      documents: record.documents || [],
      notes: record.notes || '' // Ensure notes is always a string, not optional
    };
  };

  const getTransformedRecords = () => {
    return getActiveRecords().map(transformRecordForComponents);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">AMC Management</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Manage Annual Maintenance Contracts, Warranties, and Insurance</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full lg:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Summary Cards */}
      <AmcSummaryCards {...getSummaryData()} />

      {/* Navigation Tabs */}
      <div className="flex space-x-1 lg:space-x-2 border-b border-border overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'tasks', label: 'Tasks', icon: Wrench },
          { id: 'reminders', label: 'Reminders', icon: Calendar },
          { id: 'manage', label: 'Manage Records', icon: Edit }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm lg:text-base">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4 lg:mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {serviceRecords.map(record => (
              <ServiceCard
                key={record.id}
                record={record}
                onEdit={(record) => setEditingRecord(record)}
                onDelete={(id) => deleteServiceRecord(id)}
                onView={(record) => setSelectedRecord(record)}
              />
            ))}
            {serviceRecords.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No service records found</p>
                <p className="text-muted-foreground mt-2">Click "Add Service Record" to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            assets={assets}
            serviceRecords={getTransformedRecords()} 
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagement 
            assets={assets}
            serviceRecords={getTransformedRecords()}
            users={users}
            onUpdateService={updateServiceRecord}
          />
        )}

        {activeTab === 'reminders' && (
          <ReminderConfiguration 
            users={users}
            reminderConfigs={reminderConfigs}
            mockEmails={mockEmails}
            onAddReminderConfig={handleAddReminderConfig}
            onSendTestReminder={handleSendTestReminder}
          />
        )}

        {activeTab === 'manage' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Manage Service Records</CardTitle>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                    <SelectItem value="warranty">Warranty</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground min-w-[120px]">Asset</TableHead>
                        <TableHead className="text-muted-foreground min-w-[80px]">Type</TableHead>
                        <TableHead className="text-muted-foreground min-w-[120px]">Provider</TableHead>
                        <TableHead className="text-muted-foreground min-w-[100px]">Start Date</TableHead>
                        <TableHead className="text-muted-foreground min-w-[100px]">End Date</TableHead>
                        <TableHead className="text-muted-foreground min-w-[100px]">Cost</TableHead>
                        <TableHead className="text-muted-foreground min-w-[100px]">Status</TableHead>
                        <TableHead className="text-muted-foreground min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="border-border hover:bg-muted/50">
                          <TableCell className="text-foreground font-medium">{record.assetName || 'Unknown Asset'}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(record.serviceType || 'amc')}>
                              {(record.serviceType || 'amc').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{record.provider || 'Unknown Provider'}</TableCell>
                          <TableCell className="text-foreground">{record.startDate ? format(new Date(record.startDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                          <TableCell className="text-foreground">{record.endDate ? format(new Date(record.endDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                          <TableCell className="text-foreground">₹{(record.cost || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status || 'active')}>
                              {(record.status || 'active').replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                                className="text-primary hover:bg-primary/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRecord(record)}
                                className="text-primary hover:bg-primary/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteServiceRecord(record.id)}
                                className="text-destructive hover:bg-destructive/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Service Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Service Record</DialogTitle>
          </DialogHeader>
          <ServiceForm
            assets={assets}
            onSubmit={createServiceRecord}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Service Form Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Service Record</DialogTitle>
          </DialogHeader>
          <ServiceForm
            assets={assets}
            record={editingRecord}
            onSubmit={(data) => updateServiceRecord(editingRecord!.id, data)}
            onCancel={() => setEditingRecord(null)}
          />
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="bg-popover border-border max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Service Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Asset Name</label>
                    <p className="text-foreground font-medium">{selectedRecord.assetName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Service Type</label>
                    <Badge className={getTypeColor(selectedRecord.serviceType)}>
                      {selectedRecord.serviceType?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Provider</label>
                    <p className="text-foreground">{selectedRecord.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status?.replace('_', ' ') || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Start Date</label>
                    <p className="text-foreground">{selectedRecord.startDate ? format(new Date(selectedRecord.startDate), 'dd MMMM yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">End Date</label>
                    <p className="text-foreground">{selectedRecord.endDate ? format(new Date(selectedRecord.endDate), 'dd MMMM yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Cost</label>
                    <p className="text-foreground">₹{selectedRecord.cost?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contact Person</label>
                    <p className="text-foreground">{selectedRecord.contactPerson || 'Not specified'}</p>
                  </div>
                  {selectedRecord.contactPhone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Contact Phone</label>
                      <p className="text-foreground">{selectedRecord.contactPhone}</p>
                    </div>
                  )}
                  {selectedRecord.contactEmail && (
                    <div>
                      <label className="text-sm text-muted-foreground">Contact Email</label>
                      <p className="text-foreground">{selectedRecord.contactEmail}</p>
                    </div>
                  )}
                </div>
                {selectedRecord.description && (
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="text-foreground">{selectedRecord.description}</p>
                  </div>
                )}
                {selectedRecord.notes && (
                  <div>
                    <label className="text-sm text-muted-foreground">Notes</label>
                    <p className="text-foreground">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AMC;
