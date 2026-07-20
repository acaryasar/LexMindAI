'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronUp, ChevronDown, MoreVertical, Download, Filter, 
  Columns, Search, Eye, Edit, Trash2, Copy, ExternalLink
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { spacing, borderRadius, typography, states } from '@/lib/design-system';

export interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  frozen?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  cell?: (value: any, row: T) => React.ReactNode;
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  disabled?: (row: T) => boolean;
}

export interface EnterpriseTableProps<T> {
  data: T[];
  columns: Column<T>[];
  idKey: keyof T;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  bulkActions?: Action<T>[];
  rowActions?: Action<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  pageSize?: number;
  showPagination?: boolean;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export function EnterpriseTable<T>({
  data,
  columns,
  idKey,
  sortable = true,
  filterable = true,
  resizable = true,
  bulkActions,
  rowActions,
  onRowClick,
  onSelectionChange,
  pageSize = 25,
  showPagination = true,
  emptyState,
  loading = false,
}: EnterpriseTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      result = result.filter((row) => {
        const values = Object.values(row as Record<string, unknown>);
        return values.some(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply column filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const column = columns.find((col) => col.id === columnId);
          if (!column) return true;
          
          const value = typeof column.accessor === 'function'
            ? column.accessor(row)
            : row[column.accessor];
          
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find((col) => col.id === sortConfig.key);
        if (!column) return 0;

        const aValue = typeof column.accessor === 'function'
          ? column.accessor(a)
          : a[column.accessor];
        const bValue = typeof column.accessor === 'function'
          ? column.accessor(b)
          : b[column.accessor];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortConfig, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Handle sort
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;
    
    setSortConfig((prev) => {
      if (prev?.key === columnId) {
        return prev.direction === 'asc' ? { key: columnId, direction: 'desc' } : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  }, [sortable]);

  // Handle filter
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
  }, []);

  // Handle selection
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((row) => String(row[idKey])));
      setSelectedRows(allIds);
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  }, [paginatedData, idKey, onSelectionChange]);

  const handleSelectRow = useCallback((rowId: string, checked: boolean, row: T) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });

    if (checked) {
      const selectedData = paginatedData.filter((r) => selectedRows.has(String(r[idKey])) || String(r[idKey]) === rowId);
      onSelectionChange?.(selectedData);
    } else {
      const selectedData = paginatedData.filter((r) => selectedRows.has(String(r[idKey])) && String(r[idKey]) !== rowId);
      onSelectionChange?.(selectedData);
    }
  }, [selectedRows, idKey, onSelectionChange, paginatedData]);

  // Handle bulk action
  const handleBulkAction = useCallback((action: Action<T>) => {
    const selectedData = data.filter((row) => selectedRows.has(String(row[idKey])));
    action.onClick(selectedData[0]); // Execute on first selected row for now
    setSelectedRows(new Set());
  }, [data, selectedRows, idKey]);

  const allSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.has(String(row[idKey])));
  const someSelected = selectedRows.size > 0 && !allSelected;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (processedData.length === 0 && emptyState) {
    return <div className="py-12">{emptyState}</div>;
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Search */}
        {filterable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-xl border-gray-200 focus:border-purple-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && bulkActions && (
            <>
              <span className="text-sm text-gray-500">{selectedRows.size} seçildi</span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => handleBulkAction(action)}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Columns className="w-4 h-4" />
                Sütunlar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  onClick={() => setColumnVisibility((prev) => ({ ...prev, [column.id]: !prev[column.id] }))}
                >
                  <Checkbox
                    checked={columnVisibility[column.id]}
                    className="mr-2"
                  />
                  {column.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Selection Checkbox */}
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    className="rounded-md"
                  />
                </th>

                {/* Column Headers */}
                {columns
                  .filter((col) => columnVisibility[col.id])
                  .map((column) => (
                    <th
                      key={column.id}
                      onClick={() => column.sortable && handleSort(column.id)}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                        column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                      style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {sortConfig?.key === column.id && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </th>
                  ))}

                {/* Actions Header */}
                {rowActions && rowActions.length > 0 && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => {
                const rowId = String(row[idKey]);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
                      isSelected && 'bg-purple-50'
                    )}
                  >
                    {/* Selection Checkbox */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(rowId, checked === true, row)}
                        className="rounded-md"
                      />
                    </td>

                    {/* Data Cells */}
                    {columns
                      .filter((col) => columnVisibility[col.id])
                      .map((column) => {
                        const value = typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : row[column.accessor];

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'px-4 py-3 text-sm text-gray-700',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {column.cell ? column.cell(value, row) : String(value)}
                          </td>
                        );
                      })}

                    {/* Row Actions */}
                    {rowActions && rowActions.length > 0 && (
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(row)}
                                disabled={action.disabled?.(row)}
                                className={cn(
                                  action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                                )}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
Gösteriliyor: {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, processedData.length)} / {processedData.length} sonuç
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
Önceki
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
