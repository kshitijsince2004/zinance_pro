import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Lock, Edit, Plus, Trash2, Save, Eye, FileEdit, Database, Shield } from 'lucide-react';

interface PermissionRule {
  id: string;
  resource: string;
  action: string;
  roles: string[];
  conditions?: Record<string, any>;
  isActive: boolean;
  priority: number;
}

interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  availableActions: string[];
}

const PermissionMatrixManager: React.FC = () => {
  const { toast } = useToast();
  const [editingRule, setEditingRule] = useState<PermissionRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');

  const [resources] = useState<Resource[]>([
    {
      id: 'assets',
      name: 'Assets',
      description: 'Physical and digital assets',
      category: 'Core',
      availableActions: ['create', 'read', 'update', 'delete', 'export', 'import']
    },
    {
      id: 'users',
      name: 'Users',
      description: 'User accounts and profiles',
      category: 'Administration',
      availableActions: ['create', 'read', 'update', 'delete', 'activate', 'deactivate']
    },
    {
      id: 'amc',
      name: 'AMC Contracts',
      description: 'Annual Maintenance Contracts',
      category: 'Contracts',
      availableActions: ['create', 'read', 'update', 'delete', 'renew', 'approve']
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'System reports and analytics',
      category: 'Analytics',
      availableActions: ['read', 'generate', 'export', 'schedule']
    },
    {
      id: 'settings',
      name: 'System Settings',
      description: 'Application configuration',
      category: 'Administration',
      availableActions: ['read', 'update', 'backup', 'restore']
    },
    {
      id: 'qr_codes',
      name: 'QR Codes',
      description: 'Asset QR code management',
      category: 'Core',
      availableActions: ['generate', 'read', 'print', 'bulk_generate']
    }
  ]);

  const [roles] = useState([
    { id: 'super_admin', name: 'Super Administrator', color: 'bg-red-500/20 text-red-400' },
    { id: 'admin', name: 'Administrator', color: 'bg-orange-500/20 text-orange-400' },
    { id: 'manager', name: 'Manager', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'amc_officer', name: 'AMC Officer', color: 'bg-green-500/20 text-green-400' },
    { id: 'viewer', name: 'Viewer', color: 'bg-gray-500/20 text-gray-400' }
  ]);

  const [permissionRules, setPermissionRules] = useState<PermissionRule[]>([
    {
      id: '1',
      resource: 'assets',
      action: 'create',
      roles: ['super_admin', 'admin', 'manager'],
      isActive: true,
      priority: 100
    },
    {
      id: '2',
      resource: 'assets',
      action: 'read',
      roles: ['super_admin', 'admin', 'manager', 'amc_officer', 'viewer'],
      isActive: true,
      priority: 90
    },
    {
      id: '3',
      resource: 'assets',
      action: 'update',
      roles: ['super_admin', 'admin', 'manager'],
      isActive: true,
      priority: 80
    },
    {
      id: '4',
      resource: 'assets',
      action: 'delete',
      roles: ['super_admin', 'admin'],
      isActive: true,
      priority: 70
    },
    {
      id: '5',
      resource: 'users',
      action: 'create',
      roles: ['super_admin', 'admin'],
      isActive: true,
      priority: 100
    },
    {
      id: '6',
      resource: 'users',
      action: 'read',
      roles: ['super_admin', 'admin'],
      isActive: true,
      priority: 90
    },
    {
      id: '7',
      resource: 'amc',
      action: 'create',
      roles: ['super_admin', 'admin', 'manager', 'amc_officer'],
      isActive: true,
      priority: 85
    },
    {
      id: '8',
      resource: 'amc',
      action: 'read',
      roles: ['super_admin', 'admin', 'manager', 'amc_officer', 'viewer'],
      isActive: true,
      priority: 80
    }
  ]);

  const handleEditRule = (rule: PermissionRule) => {
    setEditingRule({ ...rule });
    setIsDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    
    if (!permissionRules.find(r => r.id === editingRule.id)) {
      setPermissionRules(prev => [...prev, editingRule]);
    } else {
      setPermissionRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? editingRule : rule
      ));
    }
    
    setIsDialogOpen(false);
    setEditingRule(null);
    
    toast({
      title: 'Permission Rule Updated',
      description: 'Permission rule has been successfully updated.'
    });
  };

  const handleAddRule = () => {
    const newRule: PermissionRule = {
      id: `rule_${Date.now()}`,
      resource: 'assets',
      action: 'read',
      roles: [],
      isActive: true,
      priority: 50
    };
    
    setEditingRule(newRule);
    setIsDialogOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setPermissionRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: 'Permission Rule Deleted',
      description: 'Permission rule has been deleted.'
    });
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (!editingRule) return;
    
    const updatedRoles = checked
      ? [...editingRule.roles, roleId]
      : editingRule.roles.filter(id => id !== roleId);
    
    setEditingRule({ ...editingRule, roles: updatedRoles });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return <Eye className="w-4 h-4" />;
      case 'create': case 'update': return <FileEdit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const filteredRules = permissionRules.filter(rule => {
    const roleMatch = filterRole === 'all' || rule.roles.includes(filterRole);
    const resourceMatch = filterResource === 'all' || rule.resource === filterResource;
    return roleMatch && resourceMatch;
  });

  const getPermissionMatrix = () => {
    const matrix: Record<string, Record<string, string[]>> = {};
    
    resources.forEach(resource => {
      matrix[resource.id] = {};
      resource.availableActions.forEach(action => {
        const rule = permissionRules.find(r => r.resource === resource.id && r.action === action && r.isActive);
        matrix[resource.id][action] = rule ? rule.roles : [];
      });
    });
    
    return matrix;
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Advanced Permission Matrix
            </CardTitle>
            <CardDescription>
              Manage granular permissions with role-based access control
            </CardDescription>
          </div>
          <Button onClick={handleAddRule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Label htmlFor="filterRole">Filter by Role:</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="filterResource">Filter by Resource:</Label>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {resources.map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>{resource.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Permission Rules Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Authorized Roles</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => {
                const resource = resources.find(r => r.id === rule.resource);
                return (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">{resource?.name}</p>
                          <p className="text-xs text-muted-foreground">{resource?.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(rule.action)}
                        <span className="capitalize">{rule.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.roles.map(roleId => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Badge key={roleId} className={role.color}>
                              {role.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">P{rule.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Permission Matrix Overview */}
        <div className="space-y-4">
          <h4 className="font-semibold">Permission Matrix Overview</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    {roles.map(role => {
                      const allowedActions = resource.availableActions.filter(action => {
                        const rule = permissionRules.find(r => 
                          r.resource === resource.id && 
                          r.action === action && 
                          r.roles.includes(role.id) && 
                          r.isActive
                        );
                        return !!rule;
                      });
                      
                      return (
                        <TableCell key={role.id} className="text-center">
                          <div className="flex flex-wrap justify-center gap-1">
                            {allowedActions.map(action => (
                              <Badge key={action} variant="secondary" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                            {allowedActions.length === 0 && (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule && !permissionRules.find(r => r.id === editingRule.id) ? 'Create Permission Rule' : 'Edit Permission Rule'}
              </DialogTitle>
              <DialogDescription>
                Configure resource permissions for specific roles
              </DialogDescription>
            </DialogHeader>
            
            {editingRule && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ruleResource">Resource</Label>
                    <Select
                      value={editingRule.resource}
                      onValueChange={(value) => setEditingRule(prev => prev ? { ...prev, resource: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map(resource => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ruleAction">Action</Label>
                    <Select
                      value={editingRule.action}
                      onValueChange={(value) => setEditingRule(prev => prev ? { ...prev, action: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.find(r => r.id === editingRule.resource)?.availableActions.map(action => (
                          <SelectItem key={action} value={action}>
                            <div className="flex items-center gap-2">
                              {getActionIcon(action)}
                              <span className="capitalize">{action}</span>
                            </div>
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rulePriority">Priority (1-100)</Label>
                  <Input
                    id="rulePriority"
                    type="number"
                    min="1"
                    max="100"
                    value={editingRule.priority}
                    onChange={(e) => setEditingRule(prev => prev ? { ...prev, priority: parseInt(e.target.value) || 50 } : null)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ruleActive"
                    checked={editingRule.isActive}
                    onCheckedChange={(checked) => setEditingRule(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label htmlFor="ruleActive">Active Rule</Label>
                </div>
                
                <div>
                  <Label>Authorized Roles</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={role.id}
                          checked={editingRule.roles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                        />
                        <Label htmlFor={role.id} className="flex-1">
                          <Badge className={role.color}>
                            {role.name}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                <Save className="w-4 h-4 mr-2" />
                Save Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PermissionMatrixManager;
