
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Users } from 'lucide-react';

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

interface ReminderConfigurationProps {
  users: User[];
  reminderConfigs: ReminderConfig[];
  mockEmails: MockEmail[];
  onAddReminderConfig: (config: Omit<ReminderConfig, 'id'>) => void;
  onSendTestReminder: (type: string, recipients: string[]) => void;
}

const ReminderConfiguration: React.FC<ReminderConfigurationProps> = ({
  users,
  reminderConfigs,
  mockEmails,
  onAddReminderConfig,
  onSendTestReminder
}) => {
  const [reminderType, setReminderType] = useState<'amc' | 'warranty' | 'insurance'>('amc');
  const [daysBefore, setDaysBefore] = useState('30');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAddConfig = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one recipient.',
        variant: 'destructive',
      });
      return;
    }

    const config: Omit<ReminderConfig, 'id'> = {
      type: reminderType,
      daysBefore: parseInt(daysBefore),
      recipients: selectedUsers,
      active: true
    };

    onAddReminderConfig(config);
    setSelectedUsers([]);
    
    toast({
      title: 'Reminder Configuration Added',
      description: `${reminderType.toUpperCase()} reminders will be sent ${daysBefore} days before expiry.`,
    });
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleTestReminder = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select recipients for test reminder.',
        variant: 'destructive',
      });
      return;
    }

    onSendTestReminder(reminderType, selectedUsers);
  };

  return (
    <div className="space-y-6">
      {/* Reminder Configuration */}
      <Card className="bg-black/60 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Reminder Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Reminder Type</Label>
              <Select value={reminderType} onValueChange={(value: 'amc' | 'warranty' | 'insurance') => setReminderType(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-blue-500/30">
                  <SelectItem value="amc" className="text-white hover:bg-blue-500/20">AMC</SelectItem>
                  <SelectItem value="warranty" className="text-white hover:bg-blue-500/20">Warranty</SelectItem>
                  <SelectItem value="insurance" className="text-white hover:bg-blue-500/20">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Days Before Expiry</Label>
              <Select value={daysBefore} onValueChange={setDaysBefore}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-blue-500/30">
                  <SelectItem value="7" className="text-white hover:bg-blue-500/20">7 days</SelectItem>
                  <SelectItem value="15" className="text-white hover:bg-blue-500/20">15 days</SelectItem>
                  <SelectItem value="30" className="text-white hover:bg-blue-500/20">30 days</SelectItem>
                  <SelectItem value="60" className="text-white hover:bg-blue-500/20">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleTestReminder}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  onClick={handleAddConfig}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add Config
                </Button>
              </div>
            </div>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Select Recipients
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-800/30 rounded">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                  />
                  <div className="text-sm">
                    <p className="text-white">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Configurations */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">Active Reminder Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminderConfigs.map(config => (
              <div key={config.id} className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-300">
                    {config.type.toUpperCase()}
                  </Badge>
                  <span className="text-white">{config.daysBefore} days before</span>
                  <span className="text-gray-400">
                    {config.recipients.length} recipient{config.recipients.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Badge className={config.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                  {config.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mock Email Log */}
      <Card className="bg-black/60 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Reminder Emails (Mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {mockEmails.slice(0, 10).map(email => (
              <div key={email.id} className="p-3 bg-gray-800/30 rounded text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{email.subject}</p>
                    <p className="text-gray-400">To: {email.to}</p>
                    <p className="text-gray-300 mt-1">{email.body}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(email.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderConfiguration;
