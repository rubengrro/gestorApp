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
  horas: number | null;
  folio: number | null;
  estado: string;
  email: string;
  quienRegistra: string;
  role: string;
  requiereAprobacion: boolean;
}

export const DataTableHistoricoSemanaActual = () => {
  const { data: session } = useSession();
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<"edit" | "delete" | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);

  const userRole = session?.user?.role;

  const getWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
  
    // Calcula el inicio de la semana (lunes a las 00:00 horas)
    const start = new Date(now);
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retrocede 6 días, de lo contrario ajusta al lunes
    start.setDate(now.getDate() + offsetToMonday);
    start.setHours(0, 0, 0, 0); // Inicio del día
  
    // Calcula el final de la semana (domingo a las 23:59:59)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Avanza 6 días hasta el domingo
    end.setHours(23, 59, 59, 999); // Fin del día
  
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

      // Enriquecer las incidencias con requiereAprobacion por defecto si no está definido
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

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  const dataForExport = incidencias.map((incidencia) => ({
    "Nombre del Trabajador": incidencia.nombreTrabajador,
    "Id 1": incidencia.trabajadorNumeroWD,
    "Planta": incidencia.trabajador?.planta,
    "Nombre Subtipo": incidencia.nombreSubtipo,
    "Concepto": incidencia.concepto,
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
    Horas: incidencia.horas || "0", // Por defecto 0 si no existe
    Folio: incidencia.folio || "", // Por defecto 0 si no existe
    Email: incidencia.email || "", // Por defecto 0 si no existe
  }));
  
  

  const userFilteredIncidencias = useMemo(() => {
    const userEmail = session?.user?.email || "";
    const validUserRole = userRole as Role;
  
    return incidencias.filter((incidencia) => {
      // Condición para que esté aprobada
      const esAprobada = incidencia.estado === "Aprobado";
  
      // Condición para verificar si el usuario está vinculado
      const esRegistradaPorUsuario = incidencia.quienRegistra === userEmail;
      const esAprobadaPorUsuario = incidencia.email === userEmail; // Aprobada/Rechazada por este usuario (si el campo email lo indica)
  
      // Usuarios Superadministrador y Administrador ven todas las aprobadas
      if (["Superadministrador", "Administrador", "Inplant", "Ri"].includes(validUserRole)) {
        return esAprobada;
      }
  
      // Condición general: Vinculada al usuario y está aprobada
      return esAprobada && (esRegistradaPorUsuario || esAprobadaPorUsuario);
    });
  }, [incidencias, userRole, session?.user?.email]);
  

  const formatDateTimeToLocal = (isoDate: string | null | undefined): string => {
    if (!isoDate) return "Fecha inválida";
  
    try {
      const date = new Date(isoDate);
      return date.toLocaleString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("Error al formatear la fecha y hora:", isoDate, error);
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

  const { start, end } = getWeekRange();
  const weekRange = `${start.toLocaleDateString("es-MX")} - ${end.toLocaleDateString("es-MX")}`;

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
      {/* Título y Subtítulo */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-700">Registros Aprobados</h1>
          <p className="text-gray-500 text-sm">
          Mostrando los registros de la semana actual: {weekRange}
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

export default DataTableHistoricoSemanaActual;
