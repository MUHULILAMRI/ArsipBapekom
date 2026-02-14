"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { enUS as enLocale } from "date-fns/locale";
import {
  ArrowUpDown,
  Download,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CalendarDays,
  X,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Archive {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
  status?: string;
  description: string | null;
  fileUrl: string;
  createdAt: string;
  user?: { name: string; email: string };
}

interface ArchiveTableProps {
  data: Archive[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

const DIVISION_LABELS: Record<string, string> = {
  KEUANGAN: "Keuangan",
  PENYELENGGARA: "Penyelenggara",
  TATA_USAHA: "Tata Usaha",
  UMUM: "Umum",
};

const columnHelper = createColumnHelper<Archive>();

export default function ArchiveTable({
  data,
  onDelete,
  canDelete = false,
}: ArchiveTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasDateFilter = dateFrom || dateTo;

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (divisionFilter) {
      result = result.filter((d) => d.division === divisionFilter);
    }
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((d) => new Date(d.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((d) => new Date(d.date) <= to);
    }
    return result;
  }, [data, divisionFilter, statusFilter, dateFrom, dateTo]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("archiveNumber", {
        header: "Archive No.",
        cell: (info) => (
          <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div>
            <span className="font-semibold text-gray-800">{info.getValue()}</span>
            {info.row.original.user && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                oleh {info.row.original.user.name}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("letterNumber", {
        header: "Letter No.",
        cell: (info) => (
          <span className="text-sm text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-sm text-gray-500">
            {format(new Date(info.getValue()), "dd MMM yyyy", {
              locale: enLocale,
            })}
          </span>
        ),
      }),
      columnHelper.accessor("division", {
        header: "Division",
        cell: (info) => {
          const div = info.getValue();
          const colors: Record<string, string> = {
            KEUANGAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
            PENYELENGGARA: "bg-blue-50 text-blue-700 border-blue-200",
            TATA_USAHA: "bg-violet-50 text-violet-700 border-violet-200",
            UMUM: "bg-amber-50 text-amber-700 border-amber-200",
          };
          return (
            <span
              className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                colors[div] || "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {DIVISION_LABELS[div] || div}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                status === "AKTIF"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }`}
            >
              {status === "AKTIF" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {status === "AKTIF" ? "Active" : "Inactive"}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/archives/${info.row.original.id}`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="View Details"
              aria-label="View Details"
            >
              <Eye size={16} />
            </Link>
            <Link
              href={`/archives/${info.row.original.id}/edit`}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Edit"
              aria-label="Edit"
            >
              <Edit3 size={16} />
            </Link>
            <a
              href={info.row.original.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Download"
              aria-label="Download"
            >
              <Download size={16} />
            </a>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(info.row.original.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [canDelete, onDelete]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search archives..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all appearance-none"
          >
            <option value="">All Divisions</option>
            <option value="KEUANGAN">Keuangan</option>
            <option value="PENYELENGGARA">Penyelenggara</option>
            <option value="TATA_USAHA">Tata Usaha</option>
            <option value="UMUM">Umum</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all appearance-none"
          >
            <option value="">All Status</option>
            <option value="AKTIF">Active</option>
            <option value="INAKTIF">Inactive</option>
          </select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="px-4 pb-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <CalendarDays size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">Date Filter</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
          <span className="text-xs text-gray-400 font-medium">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
        {hasDateFilter && (
          <button
            onClick={clearDateFilter}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
          >
            <X size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-600 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={12} className="text-gray-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                      <FileText size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">No archives found</p>
                    <p className="text-gray-300 text-sm mt-1">Try changing filters or search keywords</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{table.getRowModel().rows.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{filteredData.length}</span> archives
          </p>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
            <span>·</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          {(() => {
            const currentPage = table.getState().pagination.pageIndex;
            const totalPages = table.getPageCount();
            const pages: (number | "ellipsis")[] = [];
            if (totalPages <= 7) {
              for (let i = 0; i < totalPages; i++) pages.push(i);
            } else {
              pages.push(0);
              if (currentPage > 2) pages.push("ellipsis");
              for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
                pages.push(i);
              }
              if (currentPage < totalPages - 3) pages.push("ellipsis");
              pages.push(totalPages - 1);
            }
            return pages.map((page, idx) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  {page + 1}
                </button>
              )
            );
          })()}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
