
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService, User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Building, Users, Eye, Edit } from 'lucide-react';

const AccessControlManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(authService.getAllUsers());
  const currentUser = authService.getCurrentUser();

  const handleAccessLevelChange = (userId: string, newAccessLevel: 'global' | 'company' | 'department') => {
    try {
      authService.updateUser(userId, { accessLevel: newAccessLevel });
      setUsers(authService.getAllUsers());
      toast({
        title: 'Access Level Updated',
        description: 'User access level has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update access level.',
        variant: 'destructive',
      });
    }
  };

  const getAccessLevelBadge = (accessLevel: string) => {
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
      <Badge className={colors[accessLevel as keyof typeof colors]}>
        {labels[accessLevel as keyof typeof labels]}
      </Badge>
    );
  };

  const getHeadBadges = (user: User) => {
    const badges = [];
    if (user.isCompanyHead) {
      badges.push(
        <Badge key="company-head" className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Company Head
        </Badge>
      );
    }
    if (user.isDepartmentHead) {
      badges.push(
        <Badge key="dept-head" className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
          Dept Head
        </Badge>
      );
    }
    return badges;
  };

  const canManageUser = (targetUser: User) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin' && targetUser.role !== 'super_admin') return true;
    return false;
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Access Control Management
        </CardTitle>
        <CardDescription>
          Manage department and company-wise access control for users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Access Level Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Global Access</p>
                    <p className="text-xl font-bold">
                      {users.filter(u => u.accessLevel === 'global').length}
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
                    <p className="text-sm text-muted-foreground">Company Level</p>
                    <p className="text-xl font-bold">
                      {users.filter(u => u.accessLevel === 'company').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department Level</p>
                    <p className="text-xl font-bold">
                      {users.filter(u => u.accessLevel === 'department').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Access Control Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Special Roles</TableHead>
                  <TableHead>Allowed Access</TableHead>
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
                    <TableCell>{user.company}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      {canManageUser(user) ? (
                        <Select 
                          value={user.accessLevel} 
                          onValueChange={(value) => handleAccessLevelChange(user.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="department">Department</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getAccessLevelBadge(user.accessLevel)
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getHeadBadges(user)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Companies:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.allowedCompanies.slice(0, 2).map(company => (
                              <Badge key={company} variant="outline" className="text-xs">
                                {company}
                              </Badge>
                            ))}
                            {user.allowedCompanies.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.allowedCompanies.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Departments:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.allowedDepartments.slice(0, 2).map(dept => (
                              <Badge key={dept} variant="outline" className="text-xs">
                                {dept}
                              </Badge>
                            ))}
                            {user.allowedDepartments.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.allowedDepartments.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canManageUser(user) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessControlManager;
