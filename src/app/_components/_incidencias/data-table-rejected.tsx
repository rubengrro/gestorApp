/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidenciaCatalogo, Role } from "@prisma/client";
import { PresentacionActionsDialog } from "./presentacion-incidencia-actions";
import MoveToBinIncidencia from "./_crudOptions/moveToBin";

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

export const DataTableRegisterRejected = () => {
  const { data: session } = useSession();
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
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
  
      const { start, end } = getWeekRange();
  
      const incidenciasSemanaActual = data.filter((incidencia: any) => {
        const createdAt = new Date(incidencia.createdAt);
        return createdAt >= start && createdAt <= end;
      });

      // Mapear y enriquecer las incidencias
      const incidenciasEnriquecidas = incidenciasSemanaActual.map((incidencia: any) => ({
        ...incidencia,
        requiereAprobacion: incidencia.incidenciaCatalogo?.requiereAprobacion || false,
        estado: incidencia.estado || "", // Asegúrate de que estado siempre tenga un valor
      }));

      setIncidencias(incidenciasEnriquecidas);
    } catch (error) {
      console.error("Error al obtener las incidencias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  const userFilteredIncidencias = useMemo(() => {
    const validUserRole = userRole as Role;
  
    const filtered = incidencias.filter((incidencia) => {
      const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
      const tieneAcceso = rolesAcceso.includes(validUserRole);
  
      const estadosExcluidos: Record<Role, string[]> = {
        Inplant: ["Pendiente_Gerente", "Pendiente_RI"],
        Ri: ["Pendiente_Gerente"],
        Superadministrador: [], // Sin exclusiones para este rol
        Administrador: [], // Sin exclusiones para este rol
        GPS: [], // Sin exclusiones para este rol
        Supervisor: [], // Sin exclusiones para este rol
        Gerente: [], // Sin exclusiones para este rol
      };
  
      if (estadosExcluidos[validUserRole]?.includes(incidencia.estado)) {
        return false; // Excluir estas incidencias según el rol
      }
  
      // Los usuarios Superadministrador, Administrador y GPS siempre ven todas las incidencias
      if (["Superadministrador", "Administrador", "GPS"].includes(validUserRole)) {
        return incidencia.estado === "Rechazado"; // Solo incidencias rechazadas
      }
  
      return tieneAcceso && incidencia.estado === "Rechazado"; // Solo incidencias rechazadas con acceso válido
    });
  
    console.log("Incidencias rechazadas filtradas:", filtered);
    return filtered;
  }, [incidencias, userRole]);
  

  const formatDateToLocal = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "Fecha inválida";
    
    try {
      const [year, month, day] = isoDate.split("T")[0].split("-");
      const date = new Date(Number(year), Number(month) - 1, Number(day)); // Mes en JavaScript es 0-indexed

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

  const { start, end } = getWeekRange();
  const weekRange = `${start.toLocaleDateString("es-MX")} - ${end.toLocaleDateString("es-MX")}`;

  return (
    <div className="p-4 bg-gray-100">
      {/* Contenedor del encabezado */}
      <div className="flex justify-between items-center mb-4">
        {/* Título y Subtítulo */}
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Registros Rechazados</h1>
          <p className="text-gray-500 text-sm mt-1">Semana actual: {weekRange}</p>
        </div>
  
        {/* Botón de Nuevo Registro */}
        {userRole !== "Gerente" && (
          <div>
            <PresentacionIncidenciaPicker />
          </div>
        )}
      </div>
  
      {/* Contenedor de la tabla */}
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
  
      {/* Modales */}
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
          onUpdate={fetchIncidencias} // Recarga la tabla después de actualizar
        />
      )}
      {selectedIncidencia && selectedAction === "delete" && (
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
      )}
    </div>
  );
  }