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
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Archive {
  id: string;
  archiveNumber: string;
  title: string;
  letterNumber: string;
  date: string;
  division: string;
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

  const filteredData = useMemo(() => {
    if (!divisionFilter) return data;
    return data.filter((d) => d.division === divisionFilter);
  }, [data, divisionFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("archiveNumber", {
        header: "No. Arsip",
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Judul",
        cell: (info) => (
          <span className="font-medium">{info.getValue()}</span>
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
          <span className="text-sm">
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
            KEUANGAN: "bg-green-100 text-green-700",
            PENYELENGGARA: "bg-blue-100 text-blue-700",
            TATA_USAHA: "bg-purple-100 text-purple-700",
            UMUM: "bg-orange-100 text-orange-700",
          };
          return (
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                colors[div] || "bg-gray-100 text-gray-700"
              }`}
            >
              {DIVISION_LABELS[div] || div}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/archives/${info.row.original.id}`}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
              title="Lihat Detail"
            >
              <Eye size={16} />
            </Link>
            <a
              href={info.row.original.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
              title="Download"
            >
              <Download size={16} />
            </a>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(info.row.original.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari arsip..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Divisi</option>
          <option value="KEUANGAN">Keuangan</option>
          <option value="PENYELENGGARA">Penyelenggara</option>
          <option value="TATA_USAHA">Tata Usaha</option>
          <option value="UMUM">Umum</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  Tidak ada data arsip
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
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
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {table.getRowModel().rows.length} dari{" "}
          {filteredData.length} arsip
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
