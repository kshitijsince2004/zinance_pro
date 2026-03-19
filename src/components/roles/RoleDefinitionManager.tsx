
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Shield, Edit, Plus, Trash2, Save, Users, Lock } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  actions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isActive: boolean;
  isCustom: boolean;
  permissions: string[];
  inheritFrom?: string;
  color: string;
}

const RoleDefinitionManager: React.FC = () => {
  const { toast } = useToast();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [availablePermissions] = useState<Permission[]>([
    {
      id: 'assets_read',
      name: 'Read Assets',
      description: 'View asset information',
      category: 'Assets',
      actions: ['view', 'list', 'search']
    },
    {
      id: 'assets_write',
      name: 'Write Assets',
      description: 'Create and modify assets',
      category: 'Assets',
      actions: ['create', 'update', 'import']
    },
    {
      id: 'assets_delete',
      name: 'Delete Assets',
      description: 'Remove assets from system',
      category: 'Assets',
      actions: ['delete', 'bulk_delete']
    },
    {
      id: 'users_read',
      name: 'Read Users',
      description: 'View user information',
      category: 'Users',
      actions: ['view', 'list']
    },
    {
      id: 'users_write',
      name: 'Write Users',
      description: 'Create and modify users',
      category: 'Users',
      actions: ['create', 'update', 'assign_roles']
    },
    {
      id: 'users_delete',
      name: 'Delete Users',
      description: 'Remove users from system',
      category: 'Users',
      actions: ['delete', 'deactivate']
    },
    {
      id: 'amc_read',
      name: 'Read AMC',
      description: 'View AMC contracts',
      category: 'AMC',
      actions: ['view', 'list']
    },
    {
      id: 'amc_write',
      name: 'Write AMC',
      description: 'Create and modify AMC contracts',
      category: 'AMC',
      actions: ['create', 'update', 'renew']
    },
    {
      id: 'reports_generate',
      name: 'Generate Reports',
      description: 'Create and export reports',
      category: 'Reports',
      actions: ['generate', 'export', 'schedule']
    },
    {
      id: 'settings_read',
      name: 'Read Settings',
      description: 'View system settings',
      category: 'Settings',
      actions: ['view']
    },
    {
      id: 'settings_write',
      name: 'Write Settings',
      description: 'Modify system settings',
      category: 'Settings',
      actions: ['update', 'configure']
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Complete system access with all permissions',
      level: 100,
      isActive: true,
      isCustom: false,
      permissions: availablePermissions.map(p => p.id),
      color: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access to most features',
      level: 80,
      isActive: true,
      isCustom: false,
      permissions: ['assets_read', 'assets_write', 'assets_delete', 'users_read', 'users_write', 'amc_read', 'amc_write', 'reports_generate'],
      color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Departmental management and asset oversight',
      level: 60,
      isActive: true,
      isCustom: false,
      permissions: ['assets_read', 'assets_write', 'amc_read', 'amc_write', 'reports_generate'],
      color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    {
      id: 'amc_officer',
      name: 'AMC Officer',
      description: 'Specialized in maintenance contract management',
      level: 40,
      isActive: true,
      isCustom: false,
      permissions: ['assets_read', 'amc_read', 'amc_write'],
      color: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to assets and reports',
      level: 20,
      isActive: true,
      isCustom: false,
      permissions: ['assets_read', 'amc_read'],
      color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  ]);

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setIsDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    
    if (!roles.find(r => r.id === editingRole.id)) {
      setRoles(prev => [...prev, editingRole]);
    } else {
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id ? editingRole : role
      ));
    }
    
    setIsDialogOpen(false);
    setEditingRole(null);
    
    toast({
      title: 'Role Updated',
      description: `${editingRole.name} has been successfully updated.`
    });
  };

  const handleAddRole = () => {
    const newRole: Role = {
      id: `custom_${Date.now()}`,
      name: 'New Custom Role',
      description: 'Custom role description',
      level: 30,
      isActive: true,
      isCustom: true,
      permissions: [],
      color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    };
    
    setEditingRole(newRole);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role?.isCustom) {
      toast({
        title: 'Cannot Delete',
        description: 'System roles cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }
    
    setRoles(prev => prev.filter(role => role.id !== roleId));
    toast({
      title: 'Role Deleted',
      description: 'Custom role has been deleted.'
    });
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (!editingRole) return;
    
    const updatedPermissions = checked
      ? [...editingRole.permissions, permissionId]
      : editingRole.permissions.filter(id => id !== permissionId);
    
    setEditingRole({ ...editingRole, permissions: updatedPermissions });
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    availablePermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Role Definition Manager
            </CardTitle>
            <CardDescription>
              Create and manage custom roles with granular permissions
            </CardDescription>
          </div>
          <Button onClick={handleAddRole}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Level {role.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={role.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {role.permissions.length} permissions
                      </Badge>
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={role.isCustom ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}>
                      {role.isCustom ? 'Custom' : 'System'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {role.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole && !roles.find(r => r.id === editingRole.id) ? 'Create New Role' : 'Edit Role'}
              </DialogTitle>
              <DialogDescription>
                Configure role details and assign permissions
              </DialogDescription>
            </DialogHeader>
            
            {editingRole && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleLevel">Permission Level (1-100)</Label>
                    <Input
                      id="roleLevel"
                      type="number"
                      min="1"
                      max="100"
                      value={editingRole.level}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, level: parseInt(e.target.value) || 1 } : null)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="roleDescription">Description</Label>
                  <Textarea
                    id="roleDescription"
                    value={editingRole.description}
                    onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="roleActive"
                    checked={editingRole.isActive}
                    onCheckedChange={(checked) => setEditingRole(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label htmlFor="roleActive">Active Role</Label>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Permissions</h4>
                  <div className="space-y-6">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <h5 className="font-medium text-primary">{category}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                              <Checkbox
                                id={permission.id}
                                checked={editingRole.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={permission.id} className="text-sm font-medium">
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {permission.actions.map((action, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {action}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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
              <Button onClick={handleSaveRole}>
                <Save className="w-4 h-4 mr-2" />
                Save Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleDefinitionManager;
