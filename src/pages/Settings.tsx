import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auditService, AuditLog } from '@/lib/audit';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import FieldConfiguration from '@/components/settings/FieldConfiguration';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Download,
  Search,
  Filter,
  Activity,
  Clock,
  Eye,
  Moon,
  Sun,
  Palette,
  SlidersHorizontal,
  Building,
  Layout
} from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  
  // Company settings
  const [companyName, setCompanyName] = useState(
    localStorage.getItem('companyName') || 'Hero Corporate Services'
  );
  const [companyAddress, setCompanyAddress] = useState(
    localStorage.getItem('companyAddress') || ''
  );
  const [companyPhone, setCompanyPhone] = useState(
    localStorage.getItem('companyPhone') || ''
  );
  const [companyEmail, setCompanyEmail] = useState(
    localStorage.getItem('companyEmail') || ''
  );
  
  // Module management settings - use new module system
  const [moduleSettings, setModuleSettings] = useState(() => {
    return {
      integrations: JSON.parse(localStorage.getItem('module_integrations') || 'false'), // Default disabled
      reports: JSON.parse(localStorage.getItem('module_reports') || 'true'),
      blocks: JSON.parse(localStorage.getItem('module_blocks') || 'true'),
      calculations: JSON.parse(localStorage.getItem('module_calculations') || 'true'),
      itActDepreciation: JSON.parse(localStorage.getItem('module_itActDepreciation') || 'true'),
      settings: true // Settings page cannot be disabled
    };
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [dataRetention, setDataRetention] = useState('365');

  const handleModuleToggle = (moduleName: string, enabled: boolean) => {
    const newSettings = { ...moduleSettings, [moduleName]: enabled };
    setModuleSettings(newSettings);
    
    // Use the new module system
    import('@/lib/modules').then(({ setModuleEnabled }) => {
      setModuleEnabled(moduleName, enabled);
    });
    
    toast({
      title: 'Module Updated',
      description: `${moduleName} module has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSave = () => {
    // Save company settings to localStorage
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyAddress', companyAddress);
    localStorage.setItem('companyPhone', companyPhone);
    localStorage.setItem('companyEmail', companyEmail);
    
    // Log the settings change
    auditService.log('settings_updated', 'system', 'global', {
      theme: theme,
      notifications: notificationsEnabled,
      twoFactorAuth: twoFactorAuthEnabled,
      companyName: companyName,
      timestamp: new Date().toISOString()
    });

    toast({
      title: 'Settings Saved',
      description: 'Your settings have been successfully saved.',
    });
  };

  const auditLogs = auditService.getAllLogs();
  
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = auditSearch === '' || 
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userId.toLowerCase().includes(auditSearch.toLowerCase());
    
    const matchesFilter = auditFilter === 'all' || log.action === auditFilter;
    
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Details'].join(','),
      ...filteredAuditLogs.map(log => [
        log.timestamp,
        log.userId,
        log.action,
        log.resourceType,
        log.resourceId,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    auditService.log('audit_export', 'system', 'logs', {
      exportedRows: filteredAuditLogs.length,
      filters: { search: auditSearch, filter: auditFilter }
    });

    toast({
      title: 'Export Complete',
      description: 'Audit logs have been exported to CSV.',
    });
  };

  const moduleList = [
    { key: 'integrations', name: 'Integrations', description: 'Third-party system integrations and API connections' },
    { key: 'reports', name: 'Reports', description: 'Depreciation reports and analytics dashboard' },
    { key: 'blocks', name: 'Asset Blocks', description: 'Asset grouping and block management' },
    { key: 'calculations', name: 'Calculations', description: 'Depreciation calculation tools and methods' },
    { key: 'itActDepreciation', name: 'IT Act Depreciation', description: 'Income Tax Act compliance and calculations' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and system configuration</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-fit">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="fieldConfig">Field Config</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Configure your company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="Enter company email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="Enter company phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Enter company address"
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Save Company Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Page/Module Management
              </CardTitle>
              <CardDescription>
                Control which modules and pages are available in the application. Disabled modules will be hidden from navigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {moduleList.map((module) => (
                  <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-medium">{module.name}</Label>
                        <Badge variant={moduleSettings[module.key] ? 'default' : 'secondary'}>
                          {moduleSettings[module.key] ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Switch
                      checked={moduleSettings[module.key]}
                      onCheckedChange={(checked) => handleModuleToggle(module.key, checked)}
                    />
                  </div>
                ))}
                
                {/* Settings module - always enabled */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">Settings</Label>
                      <Badge variant="default">Always Enabled</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">System settings and configuration panel</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Notes:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Disabling a module will hide it from navigation and prevent access</li>
                  <li>• The Settings module cannot be disabled for security reasons</li>
                  <li>• Changes require a page reload to take effect</li>
                  <li>• Module data is preserved when disabled and will be available when re-enabled</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                    <SelectItem value="1825">5 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorAuthEnabled}
                  onCheckedChange={setTwoFactorAuthEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Change Password</Label>
                <div className="space-y-2">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button variant="outline">Update Password</Button>
              </div>

              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fieldConfig" className="space-y-6">
          <FieldConfiguration />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>
                    Immutable log of all system activities and user actions
                  </CardDescription>
                </div>
                <Button onClick={exportAuditLogs} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search logs..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={auditFilter} onValueChange={setAuditFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <p className="text-xl font-bold">{auditLogs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Activity</p>
                      <p className="text-xl font-bold">
                        {auditLogs.filter(log => 
                          new Date(log.timestamp).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Filtered Results</p>
                      <p className="text-xl font-bold">{filteredAuditLogs.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Action</th>
                        <th className="text-left p-3">Resource</th>
                        <th className="text-left p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">{log.userId}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {log.resourceType}: {log.resourceId}
                          </td>
                          <td className="p-3 text-muted-foreground truncate max-w-xs">
                            {Object.keys(log.details).length > 0 
                              ? JSON.stringify(log.details).substring(0, 50) + '...'
                              : 'No details'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
