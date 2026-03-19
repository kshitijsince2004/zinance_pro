
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, X } from 'lucide-react';
import { ImportData } from '@/pages/Import';

interface DataTableProps {
  data: ImportData[];
  headers: string[];
  onDataChange?: (updatedData: ImportData[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, headers, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [localData, setLocalData] = useState(data);

  const startEdit = (rowIndex: number, header: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, col: header });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const updatedData = [...localData];
    updatedData[editingCell.row] = {
      ...updatedData[editingCell.row],
      [editingCell.col]: editValue
    };
    
    setLocalData(updatedData);
    onDataChange?.(updatedData);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  return (
    <ScrollArea className="h-96 w-full border border-gray-600 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-600">
            <TableHead className="text-gray-300 font-medium sticky left-0 bg-black/80 border-r border-gray-600">
              Row
            </TableHead>
            {headers.map((header, index) => (
              <TableHead key={index} className="text-gray-300 font-medium min-w-32">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {localData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-gray-600 hover:bg-white/5">
              <TableCell className="text-gray-400 sticky left-0 bg-black/80 border-r border-gray-600">
                {rowIndex + 1}
              </TableCell>
              {headers.map((header, colIndex) => (
                <TableCell key={colIndex} className="text-white text-sm p-1">
                  {editingCell?.row === rowIndex && editingCell?.col === header ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-6 text-xs bg-black border-blue-500/50 text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={saveEdit}
                        className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="max-w-32 truncate cursor-pointer hover:bg-blue-500/20 p-1 rounded group flex items-center gap-1" 
                      title={String(row[header] || '')}
                      onClick={() => startEdit(rowIndex, header, row[header])}
                    >
                      <span>{String(row[header] || '')}</span>
                      <Edit className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default DataTable;
