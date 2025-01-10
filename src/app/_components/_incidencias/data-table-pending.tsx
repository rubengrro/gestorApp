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
  horas: number | null;
  quienRegistra: string;
  role: string;
  requiereAprobacion: boolean;
}

export const DataTableRegisterPending = () => {
  const { data: session } = useSession();
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<"edit" | "delete" | null>(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // Estado para almacenar el nombre del usuario
  const [userId, setUserId] = useState<string | null>(null);
  const [userRelations, setUserRelations] = useState<any>({});
  const [quienRegistraRelations, setQuienRegistraRelations] = useState<any>({});



  const userRole = session?.user?.role;

  useEffect(() => {
    if (session === undefined) {
      console.log("La sesión aún se está cargando...");
      return; // Esperar a que la sesión esté lista
    }

    if (session?.user?.name) {
      console.log("Nombre del usuario con sesión activa:", session.user.name);
      setUserName(session.user.name); // Guardar el nombre en el estado
    } else {
      console.error("No se encontró un usuario con sesión activa.");
    }
  }, [session]);

  // Buscar al usuario por nombre en la API y obtener su ID
  const fetchUserId = useCallback(async () => {
    if (!userName) {
      console.error("El nombre del usuario no está disponible.");
      return;
    }

    try {
      const response = await fetch(`/api/users?nombre=${encodeURIComponent(userName)}`);
      if (!response.ok) {
        throw new Error(`Error al buscar el usuario por nombre: ${response.statusText}`);
      }

      const userData = await response.json();
      console.log("ID del usuario encontrado:", userData.id); // Mostrar el ID en consola
      setUserId(userData.id); // Guardar el ID en el estado
    } catch (error) {
      console.error("Error al buscar el usuario por nombre:", error);
    }
    
  }, [userName]);

  // Llamar a `fetchUserId` cuando sea necesario
  useEffect(() => {
    if (userName) {
      fetchUserId();
    }
  }, [userName, fetchUserId]);

  const fetchQuienRegistraRelations = useCallback(async (quienRegistra: string) => {
    try {
      // Obtener el ID del usuario quienRegistra
      const userResponse = await fetch(`/api/users?nombre=${encodeURIComponent(quienRegistra)}`);
      if (!userResponse.ok) throw new Error("Error al obtener el ID de quienRegistra");

      const userData = await userResponse.json();
      const quienRegistraId = userData.id;

      // Log del ID del usuario quienRegistra
      console.log("ID del usuario quienRegistra:", quienRegistraId);

      // Obtener relaciones del usuario quienRegistra
      const relationsResponse = await fetch(`/api/users/${quienRegistraId}`);
      if (!relationsResponse.ok) throw new Error("Error al obtener relaciones de quienRegistra");

      const relationsData = await relationsResponse.json();
      setQuienRegistraRelations(relationsData);
    } catch (error) {
      console.error("Error al obtener relaciones de quienRegistra:", error);
    }
}, []);

useEffect(() => {
  const fetchRelationsForIncidencias = async () => {
    for (const incidencia of incidencias) {
      if (incidencia.quienRegistra) {
        console.log("Quien registra:", incidencia.quienRegistra); // Confirmar el nombre de quienRegistra
        await fetchQuienRegistraRelations(incidencia.quienRegistra);
      }
    }
  };

  if (incidencias.length > 0) {
    fetchRelationsForIncidencias();
  }
}, [incidencias, fetchQuienRegistraRelations]);


  
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
      const incidenciasEnriquecidas = incidenciasSemanaActual.map((incidencia: any) => {
        console.log("Quien registra:", incidencia.quienRegistra); // Log para verificar quienRegistra
        return {
          ...incidencia,
          requiereAprobacion: incidencia.incidenciaCatalogo?.requiereAprobacion || false,
          estado: incidencia.estado || "", // Asegúrate de que estado siempre tenga un valor
        };
      });
  
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
    if (!userName || !userId) {
      return []; // Si no hay usuario o ID, no mostramos nada
    }
  
    console.log("Nombre del usuario en sesión:", userName);
    console.log("ID del usuario en sesión:", userId);
  
    const validUserRole = userRole as Role;
  
    const filtered = incidencias.filter((incidencia) => {
      // Si el usuario tiene rol Superadministrador o Administrador, mostrar todas las incidencias
      if (["Superadministrador", "Administrador"].includes(validUserRole)) {
        return true;
      }
  
      // Verificar si el usuario es quien registra
      const esQuienRegistra =
        incidencia.quienRegistra.trim().toLowerCase() === userName.trim().toLowerCase();
  
      // Obtener relaciones de quienRegistra y extraer IDs
      const relaciones = [
        ...(quienRegistraRelations.relatedSupervisors || []),
        ...(quienRegistraRelations.relatedRis || []),
        ...(quienRegistraRelations.relatedInplants || []),
        ...(quienRegistraRelations.relatedGps || []),
        ...(quienRegistraRelations.relatedGerentes || []),
      ].map((relacion) => (typeof relacion === "string" ? relacion : relacion.id)); // Extraer ID si es un objeto
  
      console.log("Relaciones combinadas (IDs extraídos) de quienRegistra:", relaciones);
  
      const esRelacionado = relaciones.includes(userId);
      console.log(
        `El usuario ${userId} está relacionado con quienRegistra (${incidencia.quienRegistra}):`,
        esRelacionado
      );
  
      // Condición adicional para roles y estados
      const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
      const tieneAcceso = rolesAcceso.includes(validUserRole);
  
      const estadosPermitidos = ["Pendiente_RI", "Pendiente_Gerente"];
      const estadoValido = estadosPermitidos.includes(incidencia.estado);
  
      // Mostrar si el usuario registra o es relacionado y cumple las condiciones adicionales
      return (esQuienRegistra || esRelacionado) && tieneAcceso && estadoValido;
    });
  
    console.log("Incidencias filtradas para el usuario:", filtered);
    return filtered;
  }, [incidencias, userRole, userName, userId, quienRegistraRelations]);
  
  
  
  
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
      id: "estado",
      header: "Estado",
      cell: ({ row }: CellContext<IncidenciaForm, unknown>) => {
        const estadoOriginal = row.original.estado;
    
        // Reemplazar guion bajo (_) por espacio
        const estadoFormateado = estadoOriginal.replace(/_/g, " ");
    
        // Determinar el color según el estado
        const color =
          estadoOriginal === "Pendiente_RI"
            ? "yellow"
            : estadoOriginal === "Pendiente_Gerente"
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
            disabled={row.original.estado !== "Pendiente_Gerente" || row.original.quienRegistra !== session?.user?.email}
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Pendientes de Aprobación</h1>
          <p className="text-gray-500 text-sm mt-1">Semana actual: {weekRange}</p>
        </div>
        {userRole !== "Gerente" && (
          <div>
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
