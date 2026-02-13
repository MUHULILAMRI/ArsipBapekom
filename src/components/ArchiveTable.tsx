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
import { id as idLocale } from "date-fns/locale";
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

  const filteredData = useMemo(() => {
    let result = data;
    if (divisionFilter) {
      result = result.filter((d) => d.division === divisionFilter);
    }
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }
    return result;
  }, [data, divisionFilter, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("archiveNumber", {
        header: "No. Arsip",
        cell: (info) => (
          <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Judul",
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
        header: "No. Surat",
        cell: (info) => (
          <span className="text-sm text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("date", {
        header: "Tanggal",
        cell: (info) => (
          <span className="text-sm text-gray-500">
            {format(new Date(info.getValue()), "dd MMM yyyy", {
              locale: idLocale,
            })}
          </span>
        ),
      }),
      columnHelper.accessor("division", {
        header: "Divisi",
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
              {status === "AKTIF" ? "Aktif" : "Inaktif"}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/archives/${info.row.original.id}`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Lihat Detail"
            >
              <Eye size={16} />
            </Link>
            <Link
              href={`/archives/${info.row.original.id}/edit`}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit3 size={16} />
            </Link>
            <a
              href={info.row.original.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Download"
            >
              <Download size={16} />
            </a>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(info.row.original.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Hapus"
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
            placeholder="Cari arsip..."
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
            <option value="">Semua Divisi</option>
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
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="INAKTIF">Inaktif</option>
          </select>
        </div>
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
                    <p className="text-gray-400 font-medium">Tidak ada data arsip</p>
                    <p className="text-gray-300 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
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
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{table.getRowModel().rows.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredData.length}</span> arsip
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 border border-gray-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
