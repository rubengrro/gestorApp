import { useEffect, useState } from "react";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PresentacionActionsDialog } from "../_incidencias/presentacion-incidencia-actions";

export interface IncidenciaForm {
  id: string;
  trabajadorNumeroWD: string;
  nombreTrabajador: string;
  nombreSubtipo: string;
  concepto: string;
  estado: string;
  quienRegistra: string;
  aprobador?: string;
  monto: number | null;
  cantidad: number | null;
  infotype?: string;
}

const RegistrosAcumuladosTable = () => {
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const response = await fetch("/api/registroIncidencia");
        if (!response.ok) throw new Error("Error al obtener las incidencias");
        const data: IncidenciaForm[] = await response.json();

        const formattedData = data.map((incidencia) => ({
          ...incidencia,
          estado: incidencia.estado === "No requiere aprobación" ? "Aprobado NR" : incidencia.estado,
          quienRegistra: formatName(incidencia.quienRegistra),
          aprobador: incidencia.aprobador ? formatName(incidencia.aprobador) : "-",
        }));

        // Filtrar registros que solo tengan estado Aprobado o Aprobado NR
        const filteredData = formattedData.filter(
          (incidencia) => incidencia.estado === "Aprobado" || incidencia.estado === "Aprobado NR"
        );

        setIncidencias(filteredData);
      } catch (error) {
        console.error("Error al obtener las incidencias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, []);

  // Función para extraer el primer nombre y el primer apellido
  const formatName = (fullName: string) => {
    const [firstName = "", lastName = ""] = fullName.split(" ");
    return `${firstName} ${lastName}`.trim();
  };

  const incidenciaColumns: ColumnDef<IncidenciaForm>[] = [
    { accessorKey: "nombreTrabajador", header: "Nombre del Trabajador" },
    {
      accessorKey: "trabajadorNumeroWD",
      header: "Número WD",
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="px-2 py-1">
          {getValue() as string}
        </Badge>
      ),
    },
    { accessorKey: "nombreSubtipo", header: "Subtipo" },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="px-2 py-1">
          {getValue() as string}
        </Badge>
      ),
    },
    {
      accessorKey: "quienRegistra",
      header: "Quien Registra",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
    },
    {
      accessorKey: "aprobador",
      header: "Quien Aprueba",
      cell: ({ getValue }) => <span>{getValue() as string}</span>,
    },
    {
      id: "valor",
      header: "Valor",
      cell: ({ row }) => {
        const { monto, cantidad } = row.original;
        const value = monto ?? cantidad ?? "-";
        return (
          <Badge variant="outline" className="px-2 py-1">
            {value as string | number}
          </Badge>
        );
      },
    },
    {
      id: "detalles",
      header: "Detalles",
      cell: ({ row }) => (
        <Button
          variant="outline"
          className="rounded-full p-2 text-blue-600"
          onClick={() => setSelectedIncidencia(row.original)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: incidencias,
    columns: incidenciaColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 flex justify-center w-full">
      <div className="w-full max-w-[1200px] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 bg-gray-100">
          <h1 className="text-2xl font-bold text-gray-700">Neto Incidencias</h1>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-left p-4 font-semibold text-white bg-blue-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={incidenciaColumns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-100 transition-colors duration-200`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="p-4 border-b border-gray-200 text-gray-800"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedIncidencia && (
        <PresentacionActionsDialog
          selectedIncidencia={{
            ...selectedIncidencia,
            infotype: selectedIncidencia.infotype || "Sin tipo de información",
          }}
          onClose={() => setSelectedIncidencia(null)}
          onUpdate={(updatedData) => {
            setIncidencias((prev) =>
              prev.map((incidencia) =>
                incidencia.id === updatedData.id ? updatedData : incidencia
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default RegistrosAcumuladosTable;
