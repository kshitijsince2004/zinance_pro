
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { auditService } from '@/lib/audit';
import { Sliders, Save, RefreshCcw } from 'lucide-react';

interface FieldConfig {
  id: string;
  name: string;
  visible: boolean;
  required: boolean;
  category: 'basic' | 'technical' | 'financial' | 'administrative';
}

const FieldConfiguration = () => {
  const { toast } = useToast();

  // Define field configurations for different forms
  const [addFormFields, setAddFormFields] = useState<FieldConfig[]>([
    // Basic Information
    { id: 'name', name: 'Asset Name/Description', visible: true, required: true, category: 'basic' },
    { id: 'serialNumber', name: 'Serial Number/TAG No.', visible: true, required: true, category: 'basic' },
    { id: 'category', name: 'Category', visible: true, required: true, category: 'basic' },
    { id: 'type', name: 'Asset Type', visible: true, required: true, category: 'basic' },
    { id: 'itemName', name: 'Item Name', visible: true, required: false, category: 'basic' },
    { id: 'tagNo', name: 'TAG Number', visible: true, required: false, category: 'basic' },
    { id: 'newTagNo', name: 'New TAG Number', visible: true, required: false, category: 'basic' },
    
    // Financial Information
    { id: 'purchaseDate', name: 'Date of Acquisition', visible: true, required: true, category: 'financial' },
    { id: 'putToUseDate', name: 'Date of Put to Use', visible: true, required: false, category: 'financial' },
    { id: 'purchasePrice', name: 'Cost of Acquisition', visible: true, required: true, category: 'financial' },
    { id: 'usefulLife', name: 'Useful Life (Years)', visible: true, required: true, category: 'financial' },
    { id: 'residualValue', name: 'Residual Value', visible: true, required: true, category: 'financial' },
    { id: 'depreciationRate', name: 'Depreciation Rate (%)', visible: true, required: false, category: 'financial' },
    { id: 'depreciationMethod', name: 'Depreciation Method', visible: true, required: true, category: 'financial' },
    { id: 'invoiceNumber', name: 'Invoice/Bill Number', visible: true, required: false, category: 'financial' },
    { id: 'currentValue', name: 'Current Book Value', visible: true, required: false, category: 'financial' },
    
    // Administrative Information  
    { id: 'company', name: 'Company Name', visible: true, required: true, category: 'administrative' },
    { id: 'department', name: 'Department', visible: true, required: true, category: 'administrative' },
    { id: 'location', name: 'Location/Place', visible: true, required: true, category: 'administrative' },
    { id: 'office', name: 'Office', visible: true, required: false, category: 'administrative' },
    { id: 'owner', name: 'Assigned To/Owner', visible: true, required: false, category: 'administrative' },
    { id: 'vendor', name: 'Vendor/Party Name', visible: true, required: true, category: 'administrative' },
    { id: 'status', name: 'Asset Status', visible: true, required: false, category: 'administrative' },
    
    // Technical Information
    { id: 'manufacturer', name: 'Manufacturer', visible: true, required: false, category: 'technical' },
    { id: 'model', name: 'Model', visible: true, required: false, category: 'technical' },
    { id: 'warrantyStartDate', name: 'Warranty Start Date', visible: true, required: false, category: 'technical' },
    { id: 'warrantyEndDate', name: 'Warranty End Date', visible: true, required: false, category: 'technical' },
    { id: 'amcStartDate', name: 'AMC Start Date', visible: true, required: false, category: 'technical' },
    { id: 'amcEndDate', name: 'AMC End Date', visible: true, required: false, category: 'technical' },
    { id: 'insuranceStartDate', name: 'Insurance Start Date', visible: true, required: false, category: 'technical' },
    { id: 'insuranceEndDate', name: 'Insurance End Date', visible: true, required: false, category: 'technical' },
    { id: 'insuranceProvider', name: 'Insurance Provider', visible: true, required: false, category: 'technical' },
    { id: 'insuranceAmount', name: 'Insurance Amount', visible: true, required: false, category: 'technical' },
    { id: 'notes', name: 'Notes/Remarks', visible: true, required: false, category: 'basic' },
  ]);

  const [editFormFields, setEditFormFields] = useState<FieldConfig[]>([
    ...addFormFields.map(field => ({ ...field }))
  ]);

  const [importFields, setImportFields] = useState<FieldConfig[]>([
    ...addFormFields.map(field => ({ ...field }))
  ]);

  const toggleVisibility = (fieldId: string, formType: 'add' | 'edit' | 'import') => {
    if (formType === 'add') {
      setAddFormFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, visible: !field.visible, required: !field.visible ? false : field.required } 
            : field
        )
      );
    } else if (formType === 'edit') {
      setEditFormFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, visible: !field.visible, required: !field.visible ? false : field.required } 
            : field
        )
      );
    } else {
      setImportFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, visible: !field.visible, required: !field.visible ? false : field.required } 
            : field
        )
      );
    }
  };

  const toggleRequired = (fieldId: string, formType: 'add' | 'edit' | 'import') => {
    if (formType === 'add') {
      setAddFormFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, required: !field.required } 
            : field
        )
      );
    } else if (formType === 'edit') {
      setEditFormFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, required: !field.required } 
            : field
        )
      );
    } else {
      setImportFields(fields => 
        fields.map(field => 
          field.id === fieldId 
            ? { ...field, required: !field.required } 
            : field
        )
      );
    }
  };

  const saveConfiguration = (formType: string) => {
    // In a real app, this would save to a database or localStorage
    // For now, we'll just log to the audit trail
    auditService.log(
      'field_config_updated', 
      'system', 
      'field_config', 
      { 
        formType,
        timestamp: new Date().toISOString(),
        updatedBy: 'current_user'
      }
    );

    toast({
      title: 'Configuration Saved',
      description: `Field configuration for ${formType} form has been updated.`,
    });
  };

  const resetToDefaults = (formType: 'add' | 'edit' | 'import') => {
    const defaultFields = [
      // Basic Information
      { id: 'name', name: 'Asset Name/Description', visible: true, required: true, category: 'basic' as const },
      { id: 'serialNumber', name: 'Serial Number/TAG No.', visible: true, required: true, category: 'basic' as const },
      { id: 'category', name: 'Category', visible: true, required: true, category: 'basic' as const },
      { id: 'type', name: 'Asset Type', visible: true, required: true, category: 'basic' as const },
      { id: 'itemName', name: 'Item Name', visible: true, required: false, category: 'basic' as const },
      { id: 'tagNo', name: 'TAG Number', visible: true, required: false, category: 'basic' as const },
      { id: 'newTagNo', name: 'New TAG Number', visible: true, required: false, category: 'basic' as const },
      
      // Financial Information
      { id: 'purchaseDate', name: 'Date of Acquisition', visible: true, required: true, category: 'financial' as const },
      { id: 'putToUseDate', name: 'Date of Put to Use', visible: true, required: false, category: 'financial' as const },
      { id: 'purchasePrice', name: 'Cost of Acquisition', visible: true, required: true, category: 'financial' as const },
      { id: 'usefulLife', name: 'Useful Life (Years)', visible: true, required: true, category: 'financial' as const },
      { id: 'residualValue', name: 'Residual Value', visible: true, required: true, category: 'financial' as const },
      { id: 'depreciationRate', name: 'Depreciation Rate (%)', visible: true, required: false, category: 'financial' as const },
      { id: 'depreciationMethod', name: 'Depreciation Method', visible: true, required: true, category: 'financial' as const },
      { id: 'invoiceNumber', name: 'Invoice/Bill Number', visible: true, required: false, category: 'financial' as const },
      { id: 'currentValue', name: 'Current Book Value', visible: true, required: false, category: 'financial' as const },
      
      // Administrative Information  
      { id: 'company', name: 'Company Name', visible: true, required: true, category: 'administrative' as const },
      { id: 'department', name: 'Department', visible: true, required: true, category: 'administrative' as const },
      { id: 'location', name: 'Location/Place', visible: true, required: true, category: 'administrative' as const },
      { id: 'office', name: 'Office', visible: true, required: false, category: 'administrative' as const },
      { id: 'owner', name: 'Assigned To/Owner', visible: true, required: false, category: 'administrative' as const },
      { id: 'vendor', name: 'Vendor/Party Name', visible: true, required: true, category: 'administrative' as const },
      { id: 'status', name: 'Asset Status', visible: true, required: false, category: 'administrative' as const },
      
      // Technical Information
      { id: 'manufacturer', name: 'Manufacturer', visible: true, required: false, category: 'technical' as const },
      { id: 'model', name: 'Model', visible: true, required: false, category: 'technical' as const },
      { id: 'warrantyStartDate', name: 'Warranty Start Date', visible: true, required: false, category: 'technical' as const },
      { id: 'warrantyEndDate', name: 'Warranty End Date', visible: true, required: false, category: 'technical' as const },
      { id: 'amcStartDate', name: 'AMC Start Date', visible: true, required: false, category: 'technical' as const },
      { id: 'amcEndDate', name: 'AMC End Date', visible: true, required: false, category: 'technical' as const },
      { id: 'insuranceStartDate', name: 'Insurance Start Date', visible: true, required: false, category: 'technical' as const },
      { id: 'insuranceEndDate', name: 'Insurance End Date', visible: true, required: false, category: 'technical' as const },
      { id: 'insuranceProvider', name: 'Insurance Provider', visible: true, required: false, category: 'technical' as const },
      { id: 'insuranceAmount', name: 'Insurance Amount', visible: true, required: false, category: 'technical' as const },
      { id: 'notes', name: 'Notes/Remarks', visible: true, required: false, category: 'basic' as const },
    ];

    if (formType === 'add') {
      setAddFormFields([...defaultFields]);
    } else if (formType === 'edit') {
      setEditFormFields([...defaultFields]);
    } else {
      setImportFields([...defaultFields]);
    }

    toast({
      title: 'Reset Complete',
      description: `Field configuration for ${formType} form has been reset to defaults.`,
    });
  };

  const renderFieldsTable = (fields: FieldConfig[], formType: 'add' | 'edit' | 'import') => {
    const categories = ['basic', 'technical', 'financial', 'administrative'];
    
    return categories.map(category => {
      const categoryFields = fields.filter(field => field.category === category);
      
      return categoryFields.length > 0 ? (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold capitalize mb-2">{category} Fields</h3>
          <div className="rounded-md border">
            <div className="bg-muted/50 p-2 grid grid-cols-12 gap-4 font-medium">
              <div className="col-span-5">Field Name</div>
              <div className="col-span-3 text-center">Visible</div>
              <div className="col-span-4 text-center">Required</div>
            </div>
            {categoryFields.map(field => (
              <div 
                key={field.id} 
                className="p-2 grid grid-cols-12 gap-4 border-t items-center"
              >
                <div className="col-span-5">{field.name}</div>
                <div className="col-span-3 flex justify-center">
                  <Switch 
                    checked={field.visible}
                    onCheckedChange={() => toggleVisibility(field.id, formType)}
                  />
                </div>
                <div className="col-span-4 flex justify-center">
                  <Switch 
                    checked={field.required}
                    onCheckedChange={() => toggleRequired(field.id, formType)}
                    disabled={!field.visible}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          Field Configuration
        </CardTitle>
        <CardDescription>
          Configure which fields are visible and required in different forms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Asset Form</TabsTrigger>
            <TabsTrigger value="edit">Edit Asset Form</TabsTrigger>
            <TabsTrigger value="import">Import Module</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4 pt-4">
            {renderFieldsTable(addFormFields, 'add')}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => resetToDefaults('add')}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={() => saveConfiguration('add')}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4 pt-4">
            {renderFieldsTable(editFormFields, 'edit')}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => resetToDefaults('edit')}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={() => saveConfiguration('edit')}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 pt-4">
            {renderFieldsTable(importFields, 'import')}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => resetToDefaults('import')}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={() => saveConfiguration('import')}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FieldConfiguration;
