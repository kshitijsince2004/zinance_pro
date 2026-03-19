import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { authService, User } from '@/lib/auth';
import { auditService } from '@/lib/audit';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onUserSaved: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, user, onUserSaved }) => {
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'viewer' as User['role'],
    department: user?.department || '',
    location: user?.location || '',
    company: user?.company || 'Hero Corporate Services',
    accessLevel: user?.accessLevel || 'department' as 'global' | 'company' | 'department',
    allowedCompanies: user?.allowedCompanies || ['Hero Corporate Services'],
    allowedDepartments: user?.allowedDepartments || [''],
    isCompanyHead: user?.isCompanyHead || false,
    isDepartmentHead: user?.isDepartmentHead || false
  });

  const isEditing = Boolean(user);
  const availableCompanies = ['Hero Corporate Services', 'Hero FinCorp', 'Hero Tech'];
  const availableDepartments = ['IT', 'Finance', 'HR', 'Operations'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && user) {
        // Update existing user
        authService.updateUser(user.id, formData);
        auditService.log('user_updated', 'user', user.id, {
          updatedFields: Object.keys(formData),
          newRole: formData.role,
          newAccessLevel: formData.accessLevel
        });
        toast({
          title: 'User Updated',
          description: 'User has been successfully updated.',
        });
      } else {
        // Create new user
        const newUser = await authService.register({
          ...formData,
          password: 'password123' // Default password
        });
        auditService.log('user_created', 'user', newUser.id, {
          role: formData.role,
          department: formData.department,
          accessLevel: formData.accessLevel
        });
        toast({
          title: 'User Created',
          description: 'New user has been successfully created with default password: password123',
        });
      }
      onUserSaved();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save user.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyToggle = (company: string, checked: boolean) => {
    const updatedCompanies = checked
      ? [...formData.allowedCompanies, company]
      : formData.allowedCompanies.filter(c => c !== company);
    handleInputChange('allowedCompanies', updatedCompanies);
  };

  const handleDepartmentToggle = (department: string, checked: boolean) => {
    const updatedDepartments = checked
      ? [...formData.allowedDepartments, department]
      : formData.allowedDepartments.filter(d => d !== department);
    handleInputChange('allowedDepartments', updatedDepartments);
  };

  const canManageAccessLevel = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update user information and permissions.' : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="amc_officer">AMC Officer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Primary Company</Label>
              <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {availableCompanies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Primary Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          {canManageAccessLevel && (
            <>
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Access Control Settings</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select value={formData.accessLevel} onValueChange={(value) => handleInputChange('accessLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global Access</SelectItem>
                      <SelectItem value="company">Company Level</SelectItem>
                      <SelectItem value="department">Department Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isCompanyHead"
                      checked={formData.isCompanyHead}
                      onCheckedChange={(checked) => handleInputChange('isCompanyHead', checked)}
                    />
                    <Label htmlFor="isCompanyHead">Company Head</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDepartmentHead"
                      checked={formData.isDepartmentHead}
                      onCheckedChange={(checked) => handleInputChange('isDepartmentHead', checked)}
                    />
                    <Label htmlFor="isDepartmentHead">Department Head</Label>
                  </div>
                </div>

                {formData.accessLevel !== 'global' && (
                  <>
                    <div className="space-y-2">
                      <Label>Allowed Companies</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableCompanies.map(company => (
                          <div key={company} className="flex items-center space-x-2">
                            <Checkbox
                              id={`company-${company}`}
                              checked={formData.allowedCompanies.includes(company)}
                              onCheckedChange={(checked) => handleCompanyToggle(company, checked as boolean)}
                            />
                            <Label htmlFor={`company-${company}`} className="text-sm">{company}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.accessLevel === 'department' && (
                      <div className="space-y-2">
                        <Label>Allowed Departments</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableDepartments.map(department => (
                            <div key={department} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dept-${department}`}
                                checked={formData.allowedDepartments.includes(department)}
                                onCheckedChange={(checked) => handleDepartmentToggle(department, checked as boolean)}
                              />
                              <Label htmlFor={`dept-${department}`} className="text-sm">{department}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
