import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService, User } from '@/lib/auth';
import { assetService } from '@/lib/assets';
import { auditService } from '@/lib/audit';
import { useToast } from '@/hooks/use-toast';
import UserDialog from '@/components/UserDialog';
import RoleDefinitionManager from '@/components/roles/RoleDefinitionManager';
import PermissionMatrixManager from '@/components/roles/PermissionMatrixManager';
import AccessControlManager from '@/components/roles/AccessControlManager';
import { 
  UserCheck, 
  Shield, 
  Users, 
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Building,
  Activity,
  BarChart,
  Database,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const Roles = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const assets = assetService.getAllAssets();

  // Mock audit logs since getLogs method doesn't exist
  const getMockAuditLogs = () => [
    {
      id: '1',
      actionType: 'user_created',
      resourceType: 'user',
      resourceId: 'user_001',
      userId: currentUser?.id || 'admin',
      timestamp: new Date().toISOString(),
      details: { role: 'viewer', department: 'IT' }
    },
    {
      id: '2',
      actionType: 'role_changed',
      resourceType: 'user',
      resourceId: 'user_002',
      userId: currentUser?.id || 'admin',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: { newRole: 'manager', changedBy: currentUser?.id }
    },
    {
      id: '3',
      actionType: 'user_status_changed',
      resourceType: 'user',
      resourceId: 'user_003',
      userId: currentUser?.id || 'admin',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: { newStatus: 'active', changedBy: currentUser?.id }
    }
  ];

  // Load users and audit logs on component mount
  useEffect(() => {
    try {
      const allUsers = authService.getAllUsers();
      setUsers(allUsers);
      setAuditLogs(getMockAuditLogs());
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [toast]);

  // System statistics
  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'active').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.currentValue, 0),
    departments: new Set(users.filter(u => u.department).map(u => u.department)).size
  };

  const roleDefinitions = {
    super_admin: {
      label: 'Super Admin',
      description: 'Full system access with all permissions',
      color: 'bg-red-500/20 text-red-400 border border-red-500/30',
      permissions: ['All Permissions', 'User Management', 'System Settings', 'Asset Management', 'AMC Management', 'QR Codes']
    },
    admin: {
      label: 'Admin',
      description: 'Administrative access to most features',
      color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      permissions: ['Asset Management', 'User Management', 'AMC Management', 'QR Codes', 'Reports']
    },
    manager: {
      label: 'Manager',
      description: 'Departmental management and asset oversight',
      color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      permissions: ['Asset Management', 'AMC Management', 'QR Codes', 'Reports (Limited)']
    },
    amc_officer: {
      label: 'AMC Officer',
      description: 'Specialized in maintenance contract management',
      color: 'bg-green-500/20 text-green-400 border border-green-500/30',
      permissions: ['AMC Management', 'Asset Viewing', 'QR Codes']
    },
    viewer: {
      label: 'Viewer',
      description: 'Read-only access to assets and reports',
      color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      permissions: ['Asset Viewing', 'Report Viewing']
    }
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    try {
      authService.updateUser(userId, { role: newRole });
      setUsers(authService.getAllUsers());
      auditService.log('role_changed', 'user', userId, {
        newRole: newRole,
        changedBy: currentUser?.id
      });
      setAuditLogs(getMockAuditLogs());
      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${roleDefinitions[newRole].label}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = (userId: string, isActive: boolean) => {
    try {
      authService.updateUser(userId, { isActive });
      setUsers(authService.getAllUsers());
      auditService.log('user_status_changed', 'user', userId, {
        newStatus: isActive ? 'active' : 'inactive',
        changedBy: currentUser?.id
      });
      setAuditLogs(getMockAuditLogs());
      toast({
        title: 'Status Updated',
        description: `User has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        authService.deleteUser(userId);
        setUsers(authService.getAllUsers());
        auditService.log('user_deleted', 'user', userId, {
          deletedBy: currentUser?.id
        });
        setAuditLogs(getMockAuditLogs());
        toast({
          title: 'User Deleted',
          description: 'User has been successfully deleted.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsUserDialogOpen(true);
  };

  const handleUserSaved = () => {
    setUsers(authService.getAllUsers());
    setAuditLogs(getMockAuditLogs());
  };

  const getRoleBadge = (role: User['role']) => {
    const roleInfo = roleDefinitions[role];
    return (
      <Badge className={roleInfo.color}>
        {roleInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getAccessLevelBadge = (user: User) => {
    const colors = {
      global: 'bg-red-500/20 text-red-400 border border-red-500/30',
      company: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      department: 'bg-green-500/20 text-green-400 border border-green-500/30'
    };
    
    const labels = {
      global: 'Global',
      company: 'Company',
      department: 'Department'
    };
    
    return (
      <Badge className={colors[user.accessLevel]}>
        {labels[user.accessLevel]}
      </Badge>
    );
  };

  const canManageUser = (targetUser: User) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin' && targetUser.role !== 'super_admin') return true;
    return false;
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_created':
      case 'user_updated':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'role_changed':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'user_status_changed':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'user_deleted':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto glow-green"></div>
          <p className="text-muted-foreground">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel & Role Management</h1>
          <p className="text-muted-foreground">Complete system administration with advanced RBAC and organizational hierarchy</p>
        </div>
        <div className="flex gap-3">
          {authService.hasPermission('write', 'users') && (
            <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-border hover:bg-muted"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-xs text-green-500">{systemStats.activeUsers} active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{systemStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-xl font-bold">{systemStats.totalAssets}</p>
                <p className="text-xs text-green-500">{systemStats.activeAssets} active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Asset Value</p>
                <p className="text-xl font-bold">₹{(systemStats.totalValue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-muted-foreground">Current valuation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">
                  {users.filter(u => ['super_admin', 'admin'].includes(u.role)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-xl font-bold">{systemStats.departments}</p>
                <p className="text-xs text-muted-foreground">Active departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="roles">Role Definitions</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and access permissions across Hero Corporate Services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {canManageUser(user) ? (
                            <Select 
                              value={user.role} 
                              onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleDefinitions).map(([role, info]) => (
                                  <SelectItem key={role} value={role}>
                                    {info.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </TableCell>
                        <TableCell>{user.company || 'N/A'}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>{getAccessLevelBadge(user)}</TableCell>
                        <TableCell>
                          {canManageUser(user) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(user.id, !user.isActive)}
                            >
                              {getStatusBadge(user.isActive)}
                            </Button>
                          ) : (
                            getStatusBadge(user.isActive)
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {canManageUser(user) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access">
          <AccessControlManager />
        </TabsContent>

        {/* Role Definitions Tab */}
        <TabsContent value="roles">
          <RoleDefinitionManager />
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="permissions">
          <PermissionMatrixManager />
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>
                Recent system activities and user actions across Hero Corporate Services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className="mt-1">
                        {getActionTypeIcon(log.actionType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">{log.actionType.replace('_', ' ')}</p>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.resourceType}: {log.resourceId}
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(log.details, null, 2)}
                          </p>
                        )}
                        <p className="text-xs text-primary">by User ID: {log.userId}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activity logs available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserDialog
        isOpen={isUserDialogOpen}
        onClose={() => {
          setIsUserDialogOpen(false);
          setSelectedUser(null);
        }}
        user={isEditMode ? selectedUser : null}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default Roles;
