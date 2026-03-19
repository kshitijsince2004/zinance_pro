
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EnhancedDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(date ? date.getFullYear().toString() : new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(date ? date.getMonth().toString() : new Date().getMonth().toString());
  const [selectedDay, setSelectedDay] = useState(date ? date.getDate().toString() : '1');

  // Generate years from 1980 to 2050, but filter based on minDate and maxDate
  const getAvailableYears = () => {
    let startYear = 1980;
    let endYear = 2050;
    
    if (minDate) {
      startYear = Math.max(startYear, minDate.getFullYear());
    }
    if (maxDate) {
      endYear = Math.min(endYear, maxDate.getFullYear());
    }
    
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const years = getAvailableYears();
  
  // Months
  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  // Generate days based on selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getAvailableDays = () => {
    const daysInMonth = getDaysInMonth(parseInt(selectedYear), parseInt(selectedMonth));
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const testDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), day);
      
      // Check if this day is within min/max date constraints
      let isValidDay = true;
      if (minDate && testDate < minDate) {
        isValidDay = false;
      }
      if (maxDate && testDate > maxDate) {
        isValidDay = false;
      }
      
      if (isValidDay) {
        days.push(day.toString());
      }
    }
    
    return days;
  };

  const availableDays = getAvailableDays();

  const handleDateSelection = () => {
    // Create date at noon to avoid timezone issues
    const newDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), parseInt(selectedDay), 12, 0, 0, 0);
    
    // Validate against min/max constraints
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onDateChange(undefined);
    setIsOpen(false);
  };

  // Update day if it's invalid for the selected month or constraints
  React.useEffect(() => {
    const availableDays = getAvailableDays();
    if (!availableDays.includes(selectedDay)) {
      if (availableDays.length > 0) {
        setSelectedDay(availableDays[0]);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal bg-black border-green-500/30 text-white hover:bg-black/90 hover:border-green-500/50",
            !date && "text-gray-400",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-black border-green-500/40 z-50" align="start">
        <div className="space-y-4">
          <div className="text-white font-medium text-center">Select Date</div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40 max-h-48">
                  {years.map(year => (
                    <SelectItem key={year} value={year} className="text-white hover:bg-green-500/20">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40 max-h-48">
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value} className="text-white hover:bg-green-500/20">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-black border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/40 max-h-48">
                  {availableDays.map(day => (
                    <SelectItem key={day} value={day} className="text-white hover:bg-green-500/20">
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDateSelection}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black"
              disabled={availableDays.length === 0}
            >
              Select
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedDatePicker;
