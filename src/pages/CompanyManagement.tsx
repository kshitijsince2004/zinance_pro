
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Hash } from 'lucide-react';
import CompanySetup from '@/components/CompanySetup';
import SerialNumberSetup from '@/components/SerialNumberSetup';

const CompanyManagement = () => {
  console.log('CompanyManagement: Component mounted');
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Company Management</h1>
          <p className="text-gray-400">Manage companies, departments, and serial number formats</p>
        </div>
      </div>

      {/* Tabs for different management sections */}
      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/60 border-green-500/20">
          <TabsTrigger 
            value="companies" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-white text-gray-400"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Companies & Departments
          </TabsTrigger>
          <TabsTrigger 
            value="serial" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-white text-gray-400"
          >
            <Hash className="w-4 h-4 mr-2" />
            Serial Number Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <Card className="bg-black/60 border-green-500/20">
            <CardContent className="pt-6">
              <CompanySetup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="serial" className="space-y-6">
          <Card className="bg-black/60 border-green-500/20">
            <CardContent className="pt-6">
              <SerialNumberSetup />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyManagement;
