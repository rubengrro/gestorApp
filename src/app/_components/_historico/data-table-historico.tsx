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
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidenciaCatalogo, Role } from "@prisma/client";
import { PresentacionActionsDialog } from "../_incidencias/presentacion-incidencia-actions";
import { ExportToExcelButton } from "./export-btn";

export interface IncidenciaForm {
  id: string;
  trabajadorNumeroWD: string;
  nombreTrabajador: string;
  trabajador?: {
    nombre: string;
    planta: string;
    numeroWD: string;
  },
  nombreSubtipo: string;
  concepto: string;
  infotype?: string;
  fechaIncidencia: string;
  fechaAplica: string;
  incidenciaCatalogo?: IncidenciaCatalogo;
  createdAt: string; // Fecha de registro
  updatedAt: string; // Última actualización
  monto: number | null;
  cantidad: number | null;
  estado: string;
  email: string;
  quienRegistra: string;
  role: string;
  requiereAprobacion: boolean;
}

export const DataTableHistoricoAll = () => {
  const { data: session } = useSession();
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<"edit" | "delete" | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);

  const userRole = session?.user?.role;

  const getFullHistoryRange = (data: any[]): { start: Date; end: Date } => {
    if (data.length === 0) {
      // Rango predeterminado si no hay datos
      const today = new Date();
      const start = new Date(today);
      start.setFullYear(today.getFullYear() - 1); // Un año atrás como predeterminado
      return { start, end: today };
    }
  
    // Ordenar los datos por fecha de creación (ascendente)
    const sortedData = data.sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  
    // Fecha más antigua (inicio del rango)
    const oldestRecordDate = new Date(sortedData[0].createdAt);
  
    // Fecha más reciente (final del rango)
    const newestRecordDate = new Date(sortedData[sortedData.length - 1].createdAt);
  
    return { start: oldestRecordDate, end: newestRecordDate };
  };
  
  const fetchIncidencias = useCallback(async () => {
    try {
      const response = await fetch("/api/registroIncidencia");
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data = await response.json();
  
      // Obtener el rango completo de datos
      const { start, end } = getFullHistoryRange(data);
  
      // Filtrar incidencias dentro del rango y enriquecerlas
      const incidenciasEnriquecidas = data.map((incidencia: any) => ({
        ...incidencia,
        requiereAprobacion: incidencia.incidenciaCatalogo?.requiereAprobacion || false,
      }));
  
      setIncidencias(incidenciasEnriquecidas);
  
      console.log(`Rango completo: ${start.toISOString()} - ${end.toISOString()}`);
    } catch (error) {
      console.error("Error al obtener las incidencias:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  const dataForExport = incidencias.map((incidencia) => ({
    "Nombre del Trabajador": incidencia.nombreTrabajador,
    "Id 1": incidencia.trabajadorNumeroWD,
    "Planta": incidencia.trabajador?.planta,
    "Nombre Subtipo": incidencia.nombreSubtipo,
    "Quién Registró": incidencia.quienRegistra,
    "Fecha de Registro": incidencia.createdAt
  ? new Date(incidencia.createdAt).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  : "No especificado",
    "Válido de": incidencia.fechaIncidencia
      ? new Date(incidencia.fechaIncidencia).toLocaleDateString()
      : "No especificado",
    "Válido A": incidencia.fechaAplica
      ? new Date(incidencia.fechaAplica).toLocaleDateString()
      : "No especificado",
    Estado: incidencia.estado,
    "Monto/Importe":
      incidencia.monto !== null
        ? Number.isInteger(incidencia.monto) // Verifica si el monto es un entero
          ? incidencia.monto // Muestra como entero si no tiene decimales
          : incidencia.monto.toFixed(2) // Muestra con decimales si los tiene
        : "0", // Si es null, deja el campo vacío
    Moneda: incidencia.monto !== null ? "MXN" : "", 
    Cantidad: incidencia.cantidad || "0", // Por defecto 0 si no existe
  }));

  const userFilteredIncidencias = useMemo(() => {
    const userEmail = session?.user?.email || "";
    const validUserRole = userRole as Role;
  
    return incidencias.filter((incidencia) => {
      // Verificar estado aprobado
      const esAprobada = incidencia.estado === "Aprobado";
  
      // Verificar vinculación con el usuario
      const esRegistradaPorUsuario = incidencia.quienRegistra === userEmail;
      const esAprobadaPorUsuario = incidencia.email === userEmail;
  
      // Verificar roles de acceso
      const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
      const tieneAccesoPorRol = rolesAcceso.includes(validUserRole);
  
      // Permisos especiales para Administrador y Superadministrador
      if (["Superadministrador", "Administrador"].includes(validUserRole)) {
        return esAprobada;
      }
  
      // Verificar acceso general
      const tieneAcceso =
        esRegistradaPorUsuario || esAprobadaPorUsuario || tieneAccesoPorRol;
  
      return esAprobada && tieneAcceso;
    });
  }, [incidencias, userRole, session?.user?.email]);
  

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
      accessorKey: "quienRegistra",
      header: "Quién Registró",
    },
    {
      accessorKey: "createdAt",
      header: "Fecha de Registro",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null | undefined;
        const date = value ? new Date(value) : null;
    
        if (!date) return "Fecha inválida";
    
        const formattedDate = date.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const formattedTime = date.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
    
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{formattedDate}</span>
            <span className="text-sm text-gray-500">{formattedTime}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Última Actualización",
      cell: ({ getValue }: CellContext<IncidenciaForm, unknown>) => {
        const value = getValue() as string | null | undefined;
        const date = value ? new Date(value) : null;
    
        if (!date) return "Fecha inválida";
    
        const formattedDate = date.toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const formattedTime = date.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
    
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{formattedDate}</span>
            <span className="text-sm text-gray-500">{formattedTime}</span>
          </div>
        );
      },
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }: CellContext<IncidenciaForm, unknown>) => {
        const estadoOriginal = row.original.estado;
      
        // Validar si estadoOriginal es null o undefined
        const estadoFormateado = estadoOriginal ? estadoOriginal.replace(/_/g, " ") : "Desconocido";
      
        // Determinar el color según el estado original
        const color =
          estadoOriginal === "Aprobado"
            ? "green"
            : estadoOriginal === "Rechazado"
            ? "red"
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
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: userFilteredIncidencias,
    columns: incidenciaColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { start, end } = getFullHistoryRange(incidencias); // Usa la función con los datos
  const weekRange = `${start.toLocaleDateString("es-MX")} - ${end.toLocaleDateString("es-MX")}`;
  

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
      {/* Título y Subtítulo */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-700">Registros Aprobados</h1>
          <p className="text-gray-500 text-sm">
          Mostrando todos los registros: {weekRange}
          </p>
        </div>
        {/* Botón de Exportar */}
        <ExportToExcelButton
        data={dataForExport}
        weekRange={weekRange}
        fileNameBase="IncidenciasSemana"
      />
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
    </div>
  );
};

export default DataTableHistoricoAll;
