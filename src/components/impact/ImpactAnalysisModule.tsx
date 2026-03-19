import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  Eye,
  DollarSign
} from 'lucide-react';
import { impactAnalysisService } from '@/lib/impact-analysis';
import { AssetChangeImpact, ImpactSummary } from '@/types/impact-analysis';
import { useToast } from '@/hooks/use-toast';

const ImpactAnalysisModule = () => {
  const [impacts, setImpacts] = useState<AssetChangeImpact[]>([]);
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<AssetChangeImpact | null>(null);
  const [bookingMonth, setBookingMonth] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allImpacts = impactAnalysisService.getAllImpacts();
    const impactSummary = impactAnalysisService.getImpactSummary();
    setImpacts(allImpacts);
    setSummary(impactSummary);
  };

  const handleApproveImpact = (impactId: string) => {
    impactAnalysisService.approveImpact(impactId, 'current_user'); // Replace with actual user
    loadData();
    toast({
      title: 'Impact Approved',
      description: 'The impact analysis has been approved for booking.',
    });
  };

  const handleBookImpact = (impactId: string) => {
    if (!bookingMonth) {
      toast({
        title: 'Error',
        description: 'Please select a booking month.',
        variant: 'destructive',
      });
      return;
    }

    impactAnalysisService.bookImpact(impactId, bookingMonth, 'current_user'); // Replace with actual user
    loadData();
    setBookingMonth('');
    setSelectedImpact(null);
    toast({
      title: 'Impact Booked',
      description: 'The impact has been successfully booked in the selected month.',
    });
  };

  const getStatusColor = (status: AssetChangeImpact['status']) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'booked': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getImpactTypeIcon = (type: 'excess_depreciation' | 'shortfall_depreciation') => {
    return type === 'excess_depreciation' ? 
      <TrendingDown className="w-4 h-4 text-red-400" /> : 
      <TrendingUp className="w-4 h-4 text-green-400" />;
  };

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalPendingImpacts}</div>
            <div className="text-sm text-gray-400">₹{summary.totalPendingAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalApprovedImpacts}</div>
            <div className="text-sm text-gray-400">₹{summary.totalApprovedAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.totalBookedImpacts}</div>
            <div className="text-sm text-gray-400">₹{summary.totalBookedAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="impacts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="impacts">Impact Analysis</TabsTrigger>
          <TabsTrigger value="summary">Summary Reports</TabsTrigger>
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
        </TabsList>

        <TabsContent value="impacts" className="space-y-4">
          <Card className="glass-effect border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Asset Change Impacts</CardTitle>
              <CardDescription className="text-dark-muted">
                Review and approve asset changes that require impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {impacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No impact analyses found. Changes will appear here when assets are modified.
                </div>
              ) : (
                <div className="space-y-4">
                  {impacts.map(impact => (
                    <div key={impact.id} className="p-4 bg-black/30 border border-green-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{impact.assetName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {impact.changeType.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(impact.status)}>
                              {impact.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-white">
                            {getImpactTypeIcon(impact.impactAnalysis.impactType)}
                            <span className="font-semibold">
                              ₹{impact.impactAnalysis.impactAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {impact.impactAnalysis.impactType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Change Date:</span>
                          <span className="ml-2 text-white">
                            {new Date(impact.changeDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Created By:</span>
                          <span className="ml-2 text-white">{impact.createdBy}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImpact(impact)}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        {impact.status === 'pending_review' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveImpact(impact.id)}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {impact.status === 'approved' && (
                          <div className="flex gap-2">
                            <Input
                              type="month"
                              placeholder="Booking month"
                              value={bookingMonth}
                              onChange={(e) => setBookingMonth(e.target.value)}
                              className="w-40 bg-black border-green-500/30 text-white"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleBookImpact(impact.id)}
                              className="bg-gradient-to-r from-neon-green to-black"
                            >
                              Book Impact
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="glass-effect border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Impact Summary by Change Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Change Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(summary.byChangeType).map(([type, data]) => (
                    <TableRow key={type}>
                      <TableCell className="text-white">
                        {type.replace('_', ' ').toUpperCase()}
                      </TableCell>
                      <TableCell className="text-right text-white">{data.count}</TableCell>
                      <TableCell className="text-right text-white">
                        ₹{data.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="glass-effect border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Booking History</CardTitle>
              <CardDescription className="text-dark-muted">
                Track when impacts were booked and applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Booking history will be displayed here once impacts are booked.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Impact Details Modal */}
      {selectedImpact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="glass-effect border-dark-border max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Impact Analysis Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImpact(null)}
                className="absolute top-4 right-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Asset Name</Label>
                  <div className="text-gray-300">{selectedImpact.assetName}</div>
                </div>
                <div>
                  <Label className="text-white">Change Type</Label>
                  <div className="text-gray-300">
                    {selectedImpact.changeType.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Year-wise Impact Breakdown</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Financial Year</TableHead>
                      <TableHead className="text-right">Old Method</TableHead>
                      <TableHead className="text-right">New Method</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedImpact.yearWiseImpact.map((yearData, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-white">{yearData.financialYear}</TableCell>
                        <TableCell className="text-right text-white">
                          ₹{yearData.oldDepreciation.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          ₹{yearData.newDepreciation.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${yearData.difference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          ₹{Math.abs(yearData.difference).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Impact Summary:</strong> This change results in a{' '}
                  {selectedImpact.impactAnalysis.impactType === 'excess_depreciation' ? 'excess' : 'shortfall'} 
                  {' '}depreciation of ₹{selectedImpact.impactAnalysis.impactAmount.toFixed(2)}. 
                  The impact should be booked in the next available month to correct the books.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysisModule;