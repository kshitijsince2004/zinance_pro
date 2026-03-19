
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, CheckCircle, Clock, AlertTriangle, User, Calendar, FileText } from 'lucide-react';
import { Asset } from '@/lib/assets';

interface ServiceRecord {
  id: string;
  assetId: string;
  type: 'amc' | 'warranty' | 'insurance';
  vendor: string;
  startDate: string;
  endDate: string;
  policyNumber: string;
  amount: number;
  status: 'active' | 'expired' | 'pending_renewal';
  documents: string[];
  notes: string;
  renewalReminder?: string;
}

interface ServiceTask {
  id: string;
  serviceRecordId: string;
  assetId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedAgency?: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'validated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  remarks: string;
  attachments: string[];
  validatedBy?: string;
  validationDate?: string;
  validationRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface TaskManagementProps {
  assets: Asset[];
  serviceRecords: ServiceRecord[];
  users: User[];
  onUpdateService: (id: string, updates: Partial<ServiceRecord>) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  assets,
  serviceRecords,
  users,
  onUpdateService
}) => {
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form states
  const [selectedServiceRecord, setSelectedServiceRecord] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedAgency, setAssignedAgency] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorage.getItem('service-tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Auto-generate tasks for expired AMCs
      generateInitialTasks();
    }
  }, [serviceRecords]);

  const generateInitialTasks = () => {
    const expiredAmcs = serviceRecords.filter(record => 
      (record.type || 'amc') === 'amc' && (record.status || 'expired') === 'expired'
    );
    
    const initialTasks: ServiceTask[] = expiredAmcs.map(record => {
      const asset = assets.find(a => a.id === record.assetId);
      return {
        id: `task-${record.id}`,
        serviceRecordId: record.id,
        assetId: record.assetId,
        title: `AMC Renewal Required - ${asset?.name || 'Unknown Asset'}`,
        description: `AMC has expired for ${asset?.name || 'Unknown Asset'}. Please coordinate renewal with vendor.`,
        assignedTo: users[0]?.id || '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        priority: 'high',
        remarks: 'Auto-generated task for expired AMC',
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    if (initialTasks.length > 0) {
      setTasks(initialTasks);
      localStorage.setItem('service-tasks', JSON.stringify(initialTasks));
    }
  };

  const saveTasks = (updatedTasks: ServiceTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('service-tasks', JSON.stringify(updatedTasks));
  };

  const handleCreateTask = () => {
    if (!selectedServiceRecord || !taskTitle || !assignedTo || !scheduledDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const serviceRecord = serviceRecords.find(r => r.id === selectedServiceRecord);
    if (!serviceRecord) return;

    const newTask: ServiceTask = {
      id: Date.now().toString(),
      serviceRecordId: selectedServiceRecord,
      assetId: serviceRecord.assetId,
      title: taskTitle,
      description: taskDescription,
      assignedTo,
      assignedAgency,
      scheduledDate,
      status: 'pending',
      priority,
      remarks: '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);

    // Reset form
    setSelectedServiceRecord('');
    setTaskTitle('');
    setTaskDescription('');
    setAssignedTo('');
    setAssignedAgency('');
    setScheduledDate('');
    setPriority('medium');
    setShowCreateDialog(false);

    toast({
      title: 'Task Created',
      description: 'Service task has been created successfully.',
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ServiceTask>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    );
    saveTasks(updatedTasks);

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }

    toast({
      title: 'Task Updated',
      description: 'Task has been updated successfully.',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500/20 text-gray-300';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300';
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'validated':
        return 'bg-purple-500/20 text-purple-300';
      case 'closed':
        return 'bg-gray-700/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset?.name || 'Unknown Asset';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Service Tasks</h3>
          <p className="text-sm text-gray-400">Manage AMC, warranty, and insurance service tasks</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-green-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Service Task</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new service task for asset maintenance
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Service Record</Label>
                <Select value={selectedServiceRecord} onValueChange={setSelectedServiceRecord}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select Service Record" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    {serviceRecords.map(record => {
                      const asset = assets.find(a => a.id === record.assetId);
                      const serviceType = record.type || 'amc';
                      const status = record.status || 'active';
                      return (
                        <SelectItem key={record.id} value={record.id} className="text-white hover:bg-green-500/20">
                          {asset?.name || 'Unknown Asset'} - {serviceType.toUpperCase()} ({status})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="low" className="text-white hover:bg-green-500/20">Low</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-green-500/20">Medium</SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-green-500/20">High</SelectItem>
                    <SelectItem value="urgent" className="text-white hover:bg-green-500/20">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white">Task Title</Label>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter task title"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter task description"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Assigned To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id} className="text-white hover:bg-green-500/20">
                        {user.name} ({user.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">External Agency (Optional)</Label>
                <Input
                  value={assignedAgency}
                  onChange={(e) => setAssignedAgency(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter agency name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Scheduled Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTask} className="flex-1 bg-green-500 hover:bg-green-600 text-black">
                Create Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="space-y-2">
          <Label className="text-white">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-green-500/30">
              <SelectItem value="all" className="text-white hover:bg-green-500/20">All Status</SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-green-500/20">Pending</SelectItem>
              <SelectItem value="in_progress" className="text-white hover:bg-green-500/20">In Progress</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-green-500/20">Completed</SelectItem>
              <SelectItem value="validated" className="text-white hover:bg-green-500/20">Validated</SelectItem>
              <SelectItem value="closed" className="text-white hover:bg-green-500/20">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white">Priority</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-green-500/30">
              <SelectItem value="all" className="text-white hover:bg-green-500/20">All Priority</SelectItem>
              <SelectItem value="urgent" className="text-white hover:bg-green-500/20">Urgent</SelectItem>
              <SelectItem value="high" className="text-white hover:bg-green-500/20">High</SelectItem>
              <SelectItem value="medium" className="text-white hover:bg-green-500/20">Medium</SelectItem>
              <SelectItem value="low" className="text-white hover:bg-green-500/20">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-black/60 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{task.title}</h4>
                    <Badge className={getStatusBadgeColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityBadgeColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{task.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Asset:</span>
                      <p className="text-white">{getAssetName(task.assetId)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Assigned To:</span>
                      <p className="text-white">{getUserName(task.assignedTo)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Scheduled:</span>
                      <p className="text-white">{new Date(task.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    {task.assignedAgency && (
                      <div>
                        <span className="text-gray-400">Agency:</span>
                        <p className="text-white">{task.assignedAgency}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:bg-blue-500/20"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-black/90 border-green-500/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Task Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage task status and add remarks
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select
                    value={selectedTask.status}
                    onValueChange={(value) => handleUpdateTask(selectedTask.id, { status: value as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-green-500/30">
                      <SelectItem value="pending" className="text-white hover:bg-green-500/20">Pending</SelectItem>
                      <SelectItem value="in_progress" className="text-white hover:bg-green-500/20">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-green-500/20">Completed</SelectItem>
                      <SelectItem value="validated" className="text-white hover:bg-green-500/20">Validated</SelectItem>
                      <SelectItem value="closed" className="text-white hover:bg-green-500/20">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Priority</Label>
                  <Select
                    value={selectedTask.priority}
                    onValueChange={(value) => handleUpdateTask(selectedTask.id, { priority: value as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-green-500/30">
                      <SelectItem value="low" className="text-white hover:bg-green-500/20">Low</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-green-500/20">Medium</SelectItem>
                      <SelectItem value="high" className="text-white hover:bg-green-500/20">High</SelectItem>
                      <SelectItem value="urgent" className="text-white hover:bg-green-500/20">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Remarks</Label>
                <Textarea
                  value={selectedTask.remarks}
                  onChange={(e) => handleUpdateTask(selectedTask.id, { remarks: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Add task remarks or updates"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
