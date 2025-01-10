/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  CellContext,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { PresentacionIncidenciaPicker } from "./presentacion-incidenciaPicker";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidenciaCatalogo, Role } from "@prisma/client";
import { PresentacionActionsDialog } from "./presentacion-incidencia-actions";
import MoveToBinIncidencia from "./_crudOptions/moveToBin";
import { AdvancedFilter } from "../tablesFilter";

export interface IncidenciaForm {
  id: string;
  trabajadorNumeroWD: string;
  nombreTrabajador: string;
  nombreSubtipo: string;
  concepto: string;
  infotype?: string;
  incidenciaCatalogo?: IncidenciaCatalogo;
  validoDe: string;
  validoA: string;
  monto: number | null;
  cantidad: number | null;
  estado: string;
  email: string;
  quienRegistra: string;
  role: string;
  requiereAprobacion: boolean;
}

const DataTableRegister = () => {
  const { data: session } = useSession();
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [filteredIncidencias, setFilteredIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<"edit" | "delete" | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);

  const userRole = session?.user?.role;

  const getWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
  
    // Calcular el lunes de la semana actual
    const dayOfWeek = now.getDay(); // 0: domingo, 6: sábado
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajuste para obtener el lunes
    const start = new Date(now);
    start.setDate(now.getDate() + daysToMonday);
    start.setHours(0, 0, 0, 0); // Inicio del lunes
  
    // Calcular el domingo de la semana actual
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Domingo
    end.setHours(23, 59, 59, 999); // Fin del domingo
  
    return { start, end };
  };
  

  const fetchIncidencias = useCallback(async () => {
    try {
      const response = await fetch("/api/registroIncidencia");
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data = await response.json();

      setIncidencias(data);
      setFilteredIncidencias(data);

      const { start, end } = getWeekRange();

      const incidenciasSemanaActual = data.filter((incidencia: any) => {
        const createdAt = new Date(incidencia.createdAt);
        return createdAt >= start && createdAt <= end;
      });

      const incidenciasEnriquecidas = incidenciasSemanaActual.map((incidencia: any) => ({
        ...incidencia,
        requiereAprobacion: incidencia.incidenciaCatalogo?.requiereAprobacion || false,
      }));

      setIncidencias(incidenciasEnriquecidas);
    } catch (error) {
      console.error("Error al obtener las incidencias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const userFilteredIncidencias = useMemo(() => {
    const validUserRole = userRole as Role;
  
    return incidencias.filter((incidencia) => {
      const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
      const tieneAcceso = rolesAcceso.includes(validUserRole);
  
      // Excluir únicamente incidencias con estado 'Pendiente_Gerente'
      const esPendienteGerente = incidencia.estado === "Pendiente_Gerente";
  
      // Mostrar todas las incidencias accesibles excepto 'Pendiente_Gerente'
      return tieneAcceso && !esPendienteGerente;
    });
  }, [incidencias, userRole]);
  

  const formatDateToLocal = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "Fecha inválida";

    try {
      const [year, month, day] = isoDate.split("T")[0].split("-");
      const date = new Date(Number(year), Number(month) - 1, Number(day));

      return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error al formatear la fecha:", isoDate, error);
      return "Fecha inválida";
    }
  };

  const incidenciaColumns: ColumnDef<IncidenciaForm>[] = [
    { accessorKey: "nombreTrabajador", header: "Nombre del Trabajador" },
    {
      accessorKey: "trabajadorNumeroWD",
      header: "Número WD",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string;
        return (
          <Badge variant="secondary" className="px-2 py-1">
            {value}
          </Badge>
        );
      },
    },
    { accessorKey: "nombreSubtipo", header: "Nombre Subtipo" },
    {
      accessorKey: "validoDe",
      header: "Válido de",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null | undefined;
        return formatDateToLocal(value);
      },
    },
    {
      accessorKey: "validoA",
      header: "Válido a",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null | undefined;
        return formatDateToLocal(value);
      },
    },
    {
      id: "valor",
      header: "Valor",
      cell: ({ row }: CellContext<IncidenciaForm, unknown>) => {
        const { monto, cantidad, email } = row.original;
        const value = monto ?? cantidad ?? email ?? "-";
        return (
          <Badge variant="outline" className="px-2 py-1">
            {value}
          </Badge>
        );
      },
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }: CellContext<IncidenciaForm, unknown>) => {
        const estadoOriginal = row.original.estado || ""; // Valor predeterminado vacío
    
        // Reemplazar guion bajo (_) por espacio
        const estadoFormateado = estadoOriginal.replace(/_/g, " ");
    
        // Determinar el color según el estado
        const color =
          estadoOriginal === "Aprobado"
            ? "green"
            : estadoOriginal === "Rechazado"
            ? "red"
            : estadoOriginal === "Pendiente_RI"
            ? "blue"
            : "gray";
    
        return (
          <Badge variant="outline" className={`px-2 py-1 text-${color}-600`}>
            {estadoFormateado}
          </Badge>
        );
      },
    },
    
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }: CellContext<IncidenciaForm, unknown>) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="rounded-full p-2 text-blue-600"
            onClick={() => {
              setSelectedAction("edit");
              setSelectedIncidencia(row.original);
            }}
          >
            <Edit size={16} />
          </Button>
          {/* <Button
            variant="outline"
            className="rounded-full p-2 text-red-600"
            onClick={() => {
              setSelectedAction("delete");
              setSelectedIncidencia(row.original);
            }}
            disabled={row.original.estado !== "Pendiente"}
          >
            <Trash2 size={16} />
          </Button> */}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: userFilteredIncidencias,
    columns: incidenciaColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  const applyFilter = (filter: string) => {
    if (!filter) {
      setFilteredIncidencias(incidencias); // Restaurar todas las incidencias si no hay filtro
      return;
    }
    const sortedData = [...incidencias];
    switch (filter) {
      case "recent":
        sortedData.sort((a, b) => new Date(b.validoDe).getTime() - new Date(a.validoDe).getTime());
        break;
      case "oldest":
        sortedData.sort((a, b) => new Date(a.validoDe).getTime() - new Date(b.validoDe).getTime());
        break;
      case "subtipoAsc":
        sortedData.sort((a, b) => a.nombreSubtipo.localeCompare(b.nombreSubtipo));
        break;
      case "subtipoDesc":
        sortedData.sort((a, b) => b.nombreSubtipo.localeCompare(a.nombreSubtipo));
        break;
      case "trabajadorAsc":
        sortedData.sort((a, b) => a.nombreTrabajador.localeCompare(b.nombreTrabajador));
        break;
      case "trabajadorDesc":
        sortedData.sort((a, b) => b.nombreTrabajador.localeCompare(a.nombreTrabajador));
        break;
    }
    setFilteredIncidencias(sortedData);
  };

  const { start, end } = getWeekRange();
  const weekRange = `${start.toLocaleDateString("es-MX")} - ${end.toLocaleDateString("es-MX")}`;

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Registro de Incidencias</h1>
          <p className="text-gray-500 text-sm mt-1">Semana actual: {weekRange}</p>
        </div>
        {userRole !== "Gerente" && (
          <div>
            {/* <AdvancedFilter onFilterChange={applyFilter}/> */}
            <PresentacionIncidenciaPicker />
          </div>
        )}
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-300">
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
      {selectedIncidencia && selectedAction === "edit" && (
        <PresentacionActionsDialog
          selectedIncidencia={{
            ...selectedIncidencia,
            infotype: selectedIncidencia.infotype || "Sin tipo de información",
          }}
          onClose={() => {
            setSelectedAction(null);
            setSelectedIncidencia(null);
          }}
          onUpdate={fetchIncidencias}
        />
      )}
      {/* {selectedIncidencia && selectedAction === "delete" && (
      <MoveToBinIncidencia
        selectedIncidencia={{
          id: selectedIncidencia.id,
          concepto: selectedIncidencia.concepto,
          nombreSubtipo: selectedIncidencia.nombreSubtipo,
          infotype: selectedIncidencia.incidenciaCatalogo?.infotype,
        }}
        onClose={() => {
          setSelectedAction(null);
          setSelectedIncidencia(null);
        }}
        onMoveToBin={(id) => {
          setIncidencias((prev) => prev.filter((incidencia) => incidencia.id !== id));
        }}
      />
    )} */}
    </div>
  );
};

export default DataTableRegister;
