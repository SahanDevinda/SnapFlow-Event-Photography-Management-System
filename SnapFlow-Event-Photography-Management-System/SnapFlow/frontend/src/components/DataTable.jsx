import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  searchPlaceholder = 'Search records...',
  filterOptions = [], // [{ key: 'status', label: 'Status', options: [{ value: 'PENDING', label: 'Pending' }] }]
  initialSortField = '',
  rowsPerPage = 10,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortField, setSortField] = useState(initialSortField);
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = columns.some((col) => {
          if (!col.accessor) return false;
          const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
          return val != null && String(val).toLowerCase().includes(term);
        });
        if (!matches) return false;
      }
      // Active filters
      for (const [filterKey, filterVal] of Object.entries(activeFilters)) {
        if (filterVal && item[filterKey] !== filterVal) {
          return false;
        }
      }
      return true;
    });
  }, [data, searchTerm, activeFilters, columns]);

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.key === sortField || c.accessor === sortField);
      let valA = col && typeof col.accessor === 'function' ? col.accessor(a) : a[sortField];
      let valB = col && typeof col.accessor === 'function' ? col.accessor(b) : b[sortField];

      if (valA == null) return sortAsc ? -1 : 1;
      if (valB == null) return sortAsc ? 1 : -1;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredData, sortField, sortAsc, columns]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (fieldKey) => {
    if (sortField === fieldKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(fieldKey);
      setSortAsc(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="input-field pl-10 text-sm"
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="flex items-center gap-1.5 bg-white border border-dark-200 rounded-lg px-3 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-dark-400" />
                <span className="text-xs font-medium text-dark-600">{filter.label}:</span>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="text-xs border-none bg-transparent font-semibold text-dark-800 focus:ring-0 cursor-pointer p-0 pr-4"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      {paginatedData.length === 0 ? (
        <EmptyState title="No Records" description={emptyMessage} />
      ) : (
        <div className="card p-0 overflow-hidden border border-dark-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-50 border-b border-dark-100 text-xs font-semibold uppercase tracking-wider text-dark-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.header} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key || col.accessor)}
                          className="flex items-center gap-1 hover:text-dark-900 transition-colors"
                        >
                          {col.header}
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 bg-white">
                {paginatedData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-dark-50/60 transition-colors">
                    {columns.map((col) => (
                      <td key={col.header} className={`px-5 py-4 ${col.className || ''}`}>
                        {col.cell ? col.cell(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-dark-100 bg-dark-50/50 text-xs text-dark-600">
            <div>
              Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, sortedData.length)}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * rowsPerPage, sortedData.length)}</span> of{' '}
              <span className="font-semibold">{sortedData.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-dark-200 bg-white disabled:opacity-40 hover:bg-dark-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-dark-200 bg-white disabled:opacity-40 hover:bg-dark-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
