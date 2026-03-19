
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Index from '@/pages/Index';
import Assets from '@/pages/Assets';
import AssetForm from '@/pages/AssetForm';
import AssetDetail from '@/pages/AssetDetail';
import ImportExport from '@/pages/Import';
import AssetLookup from '@/pages/AssetLookup';
import QRCodes from '@/pages/QRCodes';
import Calculations from '@/pages/Calculations';
import DetailedCalculations from '@/pages/DetailedCalculations';
import ITActDepreciation from '@/pages/ITActDepreciation';
import Blocks from '@/pages/Blocks';
import Reports from '@/pages/Reports';
import Integrations from '@/pages/Integrations';
import CompanyManagement from '@/pages/CompanyManagement';
import AssetVerification from '@/pages/AssetVerification';
import AMC from '@/pages/AMC';
import Roles from '@/pages/Roles';
import Admin from '@/pages/Admin';
import Settings from '@/pages/Settings';
import Impact from '@/pages/Impact';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/new" element={<AssetForm />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="assets/:id/edit" element={<AssetForm />} />
          <Route path="import" element={<ImportExport />} />
          <Route path="qr-codes" element={<QRCodes />} />
          <Route path="calculations" element={<Calculations />} />
          <Route path="calculations/:id" element={<DetailedCalculations />} />
          <Route path="calculations/detailed" element={<DetailedCalculations />} />
          <Route path="it-act-depreciation" element={<ITActDepreciation />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="verification" element={<AssetVerification />} />
          <Route path="amc" element={<AMC />} />
          <Route path="roles" element={<Roles />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
          <Route path="impact" element={<Impact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Public route for asset lookup */}
        <Route path="/lookup/:serialNumber" element={<AssetLookup />} />
      </Routes>
    </Router>
  );
}

export default App;
