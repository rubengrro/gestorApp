import { useEffect, useState } from 'react';
import { CellContext, ColumnDef, flexRender, useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trabajador } from '@prisma/client';
import { TrabajadoresBtnFile } from './trabajadoresBtn';
import LoadingSpinner from '../loadingSpinner';

// Tipo extendido para añadir los nombres de supervisor y gerente
type TrabajadorConNombres = Trabajador & {
  supervisorNombre: string;
  gerenteNombre: string;
};

const TrabajadorTable = () => {
  const [trabajadores, setTrabajadores] = useState<TrabajadorConNombres[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const cargarTrabajadores = async () => {
    try {
      const response = await fetch('/api/trabajadores');
      const data = await response.json();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const handleFileProcessed = () => {
    cargarTrabajadores();
  };

  if (initialLoading) {
    return (
      <div className="text-center mt-4">
        <LoadingSpinner /> 
        <p className="text-gray-500">Cargando trabajadores...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex justify-center w-full">
      <div className="w-full max-w-[1200px] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 bg-gray-100">
          <h2 className="text-2xl font-bold text-gray-700">Trabajadores Registrados</h2>
          <TrabajadoresBtnFile onFileProcessed={handleFileProcessed} />
        </div>

        <DataTable columns={trabajadorColumns} data={trabajadores} />
      </div>
    </div>
  );
};

// Columnas de la tabla
const trabajadorColumns: ColumnDef<TrabajadorConNombres, unknown>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  {
    accessorKey: 'planta',
    header: 'Planta',
    cell: ({ getValue }: CellContext<TrabajadorConNombres, unknown>) => String(getValue()).replace(/_/g, ' '),
  },
  { accessorKey: 'numeroWD', header: 'Id #1' },
  { accessorKey: 'numeroGV', header: 'Id #2' },
  {
    accessorKey: 'numeroAnterior',
    header: 'Id #3',
    cell: ({ getValue }: CellContext<TrabajadorConNombres, unknown>) => String(getValue() || 'N/A'),
  },
  { accessorKey: 'supervisorNombre', header: 'Supervisor' },
  { accessorKey: 'gerenteNombre', header: 'Gerente' },
];

// Componente de tabla genérica
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]; 
  data: TData[];
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full bg-white">
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups().map((headerGroup) => (
              headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-left p-4 font-semibold text-white bg-blue-500">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow 
                key={row.id} 
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-100 transition-colors duration-200`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4 border-b border-gray-200 text-gray-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${table.getCanPreviousPage() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${table.getCanPreviousPage() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${table.getCanNextPage() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${table.getCanNextPage() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {'>>'}
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Página{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </strong>{' '}
        </span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            setPagination({ ...pagination, pageSize: Number(e.target.value) });
            table.setPageSize(Number(e.target.value));
          }}
          className="border rounded-lg p-2 text-sm"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TrabajadorTable;
