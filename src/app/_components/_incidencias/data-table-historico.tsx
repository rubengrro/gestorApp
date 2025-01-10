/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  CellContext,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidenciaCatalogo, Role } from "@prisma/client";
import { PresentacionActionsDialog } from "./presentacion-incidencia-actions";
import DeleteIncidencia from "./_crudOptions/deleteIncidencia";
import RecoverIncidencia from "./_crudOptions/recoverIncidencia";
import { useSession } from "next-auth/react";

export interface IncidenciaForm {
  id: string;
  trabajadorNumeroWD: string;
  nombreTrabajador: string;
  nombreSubtipo: string;
  concepto: string;
  infotype?: string; // Infotype puede ser undefined, lo que causaría error
  incidenciaCatalogo?: IncidenciaCatalogo;
  estado: string;
  email: string;
  horas: number | null;
  quienRegistra: string;
  role: string;
  deletedAt: string | null;  // Fecha de eliminación
  quienElimino: string | null;  // Quién eliminó la incidencia
}

const DataTableHistorico = () => {
  const { data: session } = useSession();  // Obtiene la sesión del usuario
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<"edit" | "delete" | "recover" | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);

  const userRole = session?.user?.role || "Superadministrador";  // Usar el rol del usuario desde la sesión
  const userName = session?.user?.name || "";  // Usar el nombre del usuario desde la sesión

  const userFilteredIncidencias = useMemo(() => {
    const validUserRole = userRole as Role;
  
    // Definir los estados excluidos por cada rol
    const estadosExcluidos: Record<Role, string[]> = {
      Inplant: ["Pendiente_Gerente", "Pendiente_RI"],
      Ri: ["Pendiente_Gerente"],
      Superadministrador: [], // Sin exclusiones para este rol
      Administrador: [], // Sin exclusiones para este rol
      GPS: [], // Sin exclusiones para este rol
      Supervisor: [], // Sin exclusiones para este rol
      Gerente: [], // Sin exclusiones para este rol
    };
  
    const filtered = incidencias.filter((incidencia) => {
      const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
      const tieneAcceso = rolesAcceso.includes(validUserRole);
  
      // Verificar que la incidencia tiene un valor en deletedAt
      if (!incidencia.deletedAt) {
        return false; // Excluir si no tiene una fecha de eliminación
      }
  
      // Filtrar según los roles y los estados excluidos
      if (estadosExcluidos[validUserRole]?.includes(incidencia.estado)) {
        return false; // Excluir las incidencias según el rol y el estado
      }
  
      // Los usuarios Superadministrador, Administrador y GPS siempre ven todas las incidencias
      if (["Superadministrador", "Administrador", "GPS"].includes(validUserRole)) {
        return true;
      }
  
      return tieneAcceso; // Filtrar por roles de acceso definidos
    });
  
    console.log("Incidencias filtradas para el usuario:", filtered);
    return filtered;
  }, [incidencias, userRole]);

  const fetchIncidencias = async () => {
    try {
      const response = await fetch("/api/registroIncidencia");
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data = await response.json();

      // Se filtra solo las incidencias que tienen una fecha en deletedAt
      const incidenciasEliminadas = data.filter((incidencia: any) => incidencia.deletedAt);

      setIncidencias(incidenciasEliminadas);
    } catch (error) {
      console.error("Error al obtener las incidencias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidencias();
  }, []);

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
    { accessorKey: "nombreSubtipo", header: "Nombre Subtipo" },
    {
      accessorKey: "deletedAt",
      header: "Fecha de Eliminación",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null;
        return formatDateToLocal(value);
      },
    },
    {
      accessorKey: "quienElimino",
      header: "Quién Elimino",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null;
        return value || "No disponible";
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

          {/* Verificar que el usuario que está viendo la incidencia es quien la eliminó */}
          {row.original.quienElimino === userName && (
            <Button
              variant="outline"
              className="rounded-full p-2 text-green-600"
              onClick={() => {
                setSelectedAction("recover");
                setSelectedIncidencia(row.original);
              }}
            >
              <RefreshCw size={16} />
            </Button>
          )}

          {row.original.quienElimino === userName && (
                      <Button
                      variant="outline"
                      className="rounded-full p-2 text-red-600"
                      onClick={() => {
                        setSelectedAction("delete");
                        setSelectedIncidencia(row.original);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
          )}
        </div>
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
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-100 transition-colors duration-200`}
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

{selectedIncidencia && selectedAction === "recover" && (
  <RecoverIncidencia
    selectedIncidencia={{
      ...selectedIncidencia,
      infotype: selectedIncidencia.infotype || "Sin tipo de información", 
    }}
    onClose={() => {
      setSelectedAction(null);
      setSelectedIncidencia(null);
    }}
    onRecover={(id) => {
      setIncidencias((prev) => prev.filter((incidencia) => incidencia.id !== id));
    }}
  />
)}



      {selectedIncidencia && selectedAction === "delete" && (
        <DeleteIncidencia
          selectedIncidencia={selectedIncidencia}
          onClose={() => {
            setSelectedAction(null);
            setSelectedIncidencia(null);
          }}
          onDelete={(id) => {
            setIncidencias((prev) => prev.filter((incidencia) => incidencia.id !== id));
          }}
        />
      )}

      
    </div>
  );
};

export default DataTableHistorico;
