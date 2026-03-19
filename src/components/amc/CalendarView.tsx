import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, isWithinInterval, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Download, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Asset } from '@/lib/assets';

interface ServiceRecord {
  id: string;
  assetId: string;
  type: 'amc' | 'warranty' | 'insurance';
  vendor: string;
  startDate: string;
  endDate: string;
  policyNumber: string;
  amount: number;
  status: 'active' | 'expired' | 'pending_renewal';
  documents: string[];
  notes: string;
}

interface CalendarViewProps {
  assets: Asset[];
  serviceRecords: ServiceRecord[];
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'start' | 'end' | 'expiring';
  serviceType: 'amc' | 'warranty' | 'insurance';
  assetName: string;
  vendor: string;
  policyNumber: string;
  status: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  assets,
  serviceRecords
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [filterType, setFilterType] = useState<'all' | 'amc' | 'warranty' | 'insurance'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');

  // Generate calendar events from service records
  const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    serviceRecords.forEach(record => {
      const asset = assets.find(a => a.id === record.assetId);
      if (!asset) return;

      // Ensure we have a valid service type, fallback to 'amc' if undefined
      const serviceType = record.type || 'amc';
      
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);

      // Start date event
      events.push({
        id: `${record.id}-start`,
        title: `${serviceType.toUpperCase()} Starts`,
        date: startDate,
        type: 'start',
        serviceType,
        assetName: asset.name,
        vendor: record.vendor || 'Unknown Vendor',
        policyNumber: record.policyNumber || record.id,
        status: record.status || 'active'
      });

      // End date event
      events.push({
        id: `${record.id}-end`,
        title: `${serviceType.toUpperCase()} Expires`,
        date: endDate,
        type: 'end',
        serviceType,
        assetName: asset.name,
        vendor: record.vendor || 'Unknown Vendor',
        policyNumber: record.policyNumber || record.id,
        status: record.status || 'active'
      });

      // Expiring soon event (30 days before)
      const reminderDate = addDays(endDate, -30);
      if (reminderDate >= today && reminderDate <= thirtyDaysFromNow) {
        events.push({
          id: `${record.id}-expiring`,
          title: `${serviceType.toUpperCase()} Expiring Soon`,
          date: reminderDate,
          type: 'expiring',
          serviceType,
          assetName: asset.name,
          vendor: record.vendor || 'Unknown Vendor',
          policyNumber: record.policyNumber || record.id,
          status: record.status || 'active'
        });
      }
    });

    return events;
  };

  // Filter events based on selected filters
  const filterEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    return events.filter(event => {
      // Filter by service type
      if (filterType !== 'all' && event.serviceType !== filterType) {
        return false;
      }

      // Filter by status
      if (filterStatus !== 'all') {
        if (filterStatus === 'expiring' && event.type !== 'expiring') {
          return false;
        }
        if (filterStatus !== 'expiring' && event.status !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  };

  const allEvents = generateEvents();
  const filteredEvents = filterEvents(allEvents);

  // Get events for selected date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  // Get events for current month view
  const getEventsForMonth = (): CalendarEvent[] => {
    if (!selectedDate) return [];
    
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    return filteredEvents.filter(event =>
      isWithinInterval(event.date, { start: monthStart, end: monthEnd })
    );
  };

  const getEventColor = (event: CalendarEvent): string => {
    switch (event.serviceType) {
      case 'amc':
        return event.type === 'expiring' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300';
      case 'warranty':
        return event.type === 'expiring' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300';
      case 'insurance':
        return event.type === 'expiring' ? 'bg-orange-500/20 text-orange-300' : 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getEventIcon = (event: CalendarEvent): string => {
    switch (event.type) {
      case 'start':
        return '🟢';
      case 'end':
        return '🔴';
      case 'expiring':
        return '⚠️';
      default:
        return '📅';
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const monthEvents = getEventsForMonth();

  // Custom day content to show event indicators
  const dayContent = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <span>{day.getDate()}</span>
        {hasEvents && (
          <div className="absolute bottom-0 flex gap-0.5">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  event.serviceType === 'amc' ? 'bg-blue-400' :
                  event.serviceType === 'warranty' ? 'bg-green-400' : 'bg-purple-400'
                }`}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Service Calendar
          </CardTitle>
          <CardDescription className="text-gray-400">
            View and manage AMC, warranty, and insurance schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Service Type</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-green-500/30">
                  <SelectItem value="all" className="text-white hover:bg-green-500/20">All Types</SelectItem>
                  <SelectItem value="amc" className="text-white hover:bg-green-500/20">AMC</SelectItem>
                  <SelectItem value="warranty" className="text-white hover:bg-green-500/20">Warranty</SelectItem>
                  <SelectItem value="insurance" className="text-white hover:bg-green-500/20">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Status</label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-green-500/30">
                  <SelectItem value="all" className="text-white hover:bg-green-500/20">All Status</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-green-500/20">Active</SelectItem>
                  <SelectItem value="expired" className="text-white hover:bg-green-500/20">Expired</SelectItem>
                  <SelectItem value="expiring" className="text-white hover:bg-green-500/20">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-end">
              <Button variant="outline" className="border-gray-600 text-gray-400">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-black/60 border-green-500/20">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-gray-600 pointer-events-auto"
              components={{
                DayContent: ({ date }) => dayContent(date)
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card className="bg-black/60 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No events on this date</p>
            ) : (
              selectedDateEvents.map(event => (
                <div key={event.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getEventIcon(event)}</span>
                      <Badge className={getEventColor(event)}>
                        {event.serviceType.toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-blue-500/20">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  <h4 className="font-medium text-white text-sm">{event.title}</h4>
                  <p className="text-gray-400 text-xs">{event.assetName}</p>
                  <p className="text-gray-500 text-xs">{event.vendor}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">
            {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Current Month'} Summary
          </CardTitle>
          <CardDescription className="text-gray-400">
            {monthEvents.length} total events this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthEvents.slice(0, 9).map(event => (
              <div key={event.id} className="p-3 rounded-lg bg-gray-800/30 border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">{getEventIcon(event)}</span>
                  <Badge className={getEventColor(event)} variant="outline">
                    {event.serviceType}
                  </Badge>
                </div>
                <p className="text-white text-sm font-medium">{event.assetName}</p>
                <p className="text-gray-400 text-xs">{event.title}</p>
                <p className="text-gray-500 text-xs">{format(event.date, 'MMM d')}</p>
              </div>
            ))}
            {monthEvents.length > 9 && (
              <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-600 flex items-center justify-center">
                <p className="text-gray-400 text-sm">+{monthEvents.length - 9} more events</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
