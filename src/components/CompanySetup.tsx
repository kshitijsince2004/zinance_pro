import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetService, Company } from '@/lib/assets';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save, Plus, X, Edit, Settings } from 'lucide-react';

const CompanySetup = () => {
  const [companies, setCompanies] = useState<Company[]>(assetService.getAllCompanies());
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newDepartments, setNewDepartments] = useState<string[]>(['']);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editDepartments, setEditDepartments] = useState<string[]>([]);
  const [settingDefaults, setSettingDefaults] = useState<string | null>(null);
  const [defaultMethods, setDefaultMethods] = useState<{[department: string]: 'SLM' | 'WDV' | 'WDV_FIXED_SLAB' | 'UNITS' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS'}>({});
  const { toast } = useToast();

  const depreciationMethods = [
    { value: 'SLM', label: 'Straight Line Method (SLM)' },
    { value: 'WDV', label: 'Written Down Value (WDV)' },
    { value: 'WDV_FIXED_SLAB', label: 'WDV Fixed Slab (IT Act)' },
    { value: 'UNITS', label: 'Units of Production' },
    { value: 'DOUBLE_DECLINING', label: 'Double Declining Balance' },
    { value: 'SUM_OF_YEARS', label: 'Sum of Years Digits' }
  ];

  const handleAddDepartment = () => {
    setNewDepartments([...newDepartments, '']);
  };

  const handleRemoveDepartment = (index: number) => {
    setNewDepartments(newDepartments.filter((_, i) => i !== index));
  };

  const handleDepartmentChange = (index: number, value: string) => {
    const updated = [...newDepartments];
    updated[index] = value;
    setNewDepartments(updated);
  };

  const handleEditDepartmentChange = (index: number, value: string) => {
    const updated = [...editDepartments];
    updated[index] = value;
    setEditDepartments(updated);
  };

  const handleAddEditDepartment = () => {
    setEditDepartments([...editDepartments, '']);
  };

  const handleRemoveEditDepartment = (index: number) => {
    setEditDepartments(editDepartments.filter((_, i) => i !== index));
  };

  const startEditingDepartments = (company: Company) => {
    setEditingCompany(company.id);
    setEditDepartments([...company.departments]);
  };

  const saveEditedDepartments = () => {
    if (!editingCompany) return;
    
    const company = companies.find(c => c.id === editingCompany);
    if (!company) return;

    const filteredDepartments = editDepartments.filter(dept => dept.trim() !== '');
    
    if (filteredDepartments.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one department is required.',
        variant: 'destructive',
      });
      return;
    }

    // Update company departments
    const updatedCompany = { ...company, departments: filteredDepartments };
    const updatedCompanies = companies.map(c => c.id === editingCompany ? updatedCompany : c);
    
    localStorage.setItem('fams-companies', JSON.stringify(updatedCompanies));
    setCompanies(updatedCompanies);
    setEditingCompany(null);
    setEditDepartments([]);

    toast({
      title: 'Departments Updated',
      description: `Departments for ${company.name} have been updated successfully.`,
    });
  };

  const cancelEditing = () => {
    setEditingCompany(null);
    setEditDepartments([]);
  };

  const startSettingDefaults = (company: Company) => {
    setSettingDefaults(company.id);
    setDefaultMethods(company.defaultDepreciationMethods || {});
  };

  const saveDefaultMethods = () => {
    if (!settingDefaults) return;
    
    const company = companies.find(c => c.id === settingDefaults);
    if (!company) return;

    const updatedCompany = { 
      ...company, 
      defaultDepreciationMethods: defaultMethods,
      updatedAt: new Date().toISOString()
    };
    
    const updatedCompanies = companies.map(c => c.id === settingDefaults ? updatedCompany : c);
    
    localStorage.setItem('fams-companies', JSON.stringify(updatedCompanies));
    setCompanies(updatedCompanies);
    setSettingDefaults(null);
    setDefaultMethods({});

    toast({
      title: 'Default Methods Updated',
      description: `Default depreciation methods for ${company.name} have been updated.`,
    });
  };

  const cancelSettingDefaults = () => {
    setSettingDefaults(null);
    setDefaultMethods({});
  };

  const handleCreateCompany = () => {
    if (!newCompanyName.trim()) {
      toast({
        title: 'Error',
        description: 'Company name is required.',
        variant: 'destructive',
      });
      return;
    }

    const filteredDepartments = newDepartments.filter(dept => dept.trim() !== '');
    if (filteredDepartments.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one department is required.',
        variant: 'destructive',
      });
      return;
    }

    const newCompany = assetService.createCompany({
      name: newCompanyName,
      departments: filteredDepartments,
      serialNumberFormat: {},
      defaultDepreciationMethods: {}
    });

    setCompanies([...companies, newCompany]);
    setNewCompanyName('');
    setNewDepartments(['']);

    toast({
      title: 'Company Created',
      description: `${newCompanyName} has been created successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Company */}
      <Card className="glass-effect border-dark-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neon-green" />
            Create New Company
          </CardTitle>
          <CardDescription className="text-dark-muted">
            Add a new company with departments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-white">Company Name *</Label>
            <Input
              id="companyName"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="bg-black border-green-500/30 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Departments *</Label>
            {newDepartments.map((dept, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={dept}
                  onChange={e => handleDepartmentChange(index, e.target.value)}
                  placeholder="Enter department name"
                  className="bg-black border-green-500/30 text-white placeholder:text-gray-400"
                />
                {newDepartments.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDepartment(index)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDepartment}
              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>

          <Button
            onClick={handleCreateCompany}
            className="bg-gradient-to-r from-neon-green to-black hover:from-neon-green/80 hover:to-black/80"
          >
            <Save className="w-4 h-4 mr-2" />
            Create Company
          </Button>
        </CardContent>
      </Card>

      {/* Existing Companies */}
      <Card className="glass-effect border-dark-border">
        <CardHeader>
          <CardTitle className="text-white">Existing Companies</CardTitle>
          <CardDescription className="text-dark-muted">
            Manage existing companies and their departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No companies found. Create your first company above.</p>
          ) : (
            <div className="space-y-4">
              {companies.map(company => (
                <div key={company.id} className="p-4 bg-black/30 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                    <div className="flex gap-2">
                      {editingCompany !== company.id && settingDefaults !== company.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startSettingDefaults(company)}
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Default Methods
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingDepartments(company)}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Departments
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {settingDefaults === company.id ? (
                    <div className="space-y-3">
                      <Label className="text-white">Set Default Depreciation Methods by Department</Label>
                      {company.departments.map(dept => (
                        <div key={dept} className="flex items-center gap-3">
                          <Label className="text-white w-32">{dept}:</Label>
                          <Select
                            value={defaultMethods[dept] || ''}
                            onValueChange={(value: 'SLM' | 'WDV' | 'WDV_FIXED_SLAB' | 'UNITS' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS') => setDefaultMethods(prev => ({ ...prev, [dept]: value }))}
                          >
                            <SelectTrigger className="bg-black border-green-500/30 text-white">
                              <SelectValue placeholder="Select default method..." />
                            </SelectTrigger>
                            <SelectContent>
                              {depreciationMethods.map(method => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={saveDefaultMethods}
                          size="sm"
                          className="bg-gradient-to-r from-neon-green to-black hover:from-neon-green/80 hover:to-black/80"
                        >
                          Save Defaults
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelSettingDefaults}
                          className="border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : editingCompany === company.id ? (
                    <div className="space-y-3">
                      <Label className="text-white">Edit Departments</Label>
                      {editDepartments.map((dept, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={dept}
                            onChange={e => handleEditDepartmentChange(index, e.target.value)}
                            placeholder="Enter department name"
                            className="bg-black border-green-500/30 text-white placeholder:text-gray-400"
                          />
                          {editDepartments.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveEditDepartment(index)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddEditDepartment}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Department
                        </Button>
                        <Button
                          onClick={saveEditedDepartments}
                          size="sm"
                          className="bg-gradient-to-r from-neon-green to-black hover:from-neon-green/80 hover:to-black/80"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          className="border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {company.departments.map(dept => (
                        <span
                          key={dept}
                          className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySetup;
