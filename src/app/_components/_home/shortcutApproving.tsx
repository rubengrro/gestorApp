'use client';

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IncidenciaForm } from "../_historico/data-table-semana-actual";
import { PresentacionActionsDialog } from "../_incidencias/presentacion-incidencia-actions";
import { Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface ShortcutApprovingCardProps {
  apiEndpoint: string; // Endpoint para obtener las incidencias
  className?: string; // Agregar className como prop opcional
}

const ShortcutApprovingCard: React.FC<ShortcutApprovingCardProps> = ({
  apiEndpoint,
  className,
}) => {
  const { data: session } = useSession(); // Obtener datos de la sesión
  const [pendingApprovals, setPendingApprovals] = useState<IncidenciaForm[]>([]);
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaForm | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Inicio de la semana (lunes)
    const start = new Date(now);
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(now.getDate() + offsetToMonday);
    start.setHours(0, 0, 0, 0);

    // Fin de la semana (domingo)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const fetchPendingApprovals = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data: IncidenciaForm[] = await response.json();
  
      const userRole = session?.user?.role as Role;
      const userName = session?.user?.name || "";
      const { start, end } = getWeekRange();
  
      const filtered = data.filter((incidencia) => {
        const createdAt = new Date(incidencia.createdAt);
        const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
        const tieneAcceso = rolesAcceso.includes(userRole);
        const esRegistrador = incidencia.quienRegistra === userName;
  
        // Condición específica por rol
        if (userRole === "Gerente" && incidencia.estado === "Pendiente_RI") {
          return false; // Gerente no ve incidencias Pendiente_RI
        }
  
        if (userRole === "Ri" && incidencia.estado === "Pendiente_Gerente") {
          return false; // RI no ve incidencias Pendiente_Gerente
        }
  
        if (["Supervisor", "Inplant"].includes(userRole)) {
          // Supervisores e Inplants ven solo sus propios registros y excluyen Aprobado o Rechazado
          return (
            esRegistrador &&
            incidencia.estado !== "Aprobado" &&
            incidencia.estado !== "Rechazado"
          );
        }
  
        // Condición general para roles distintos
        const esPendiente = ["Pendiente_Gerente", "Pendiente_RI"].includes(incidencia.estado);
        return esPendiente && (tieneAcceso || esRegistrador) && createdAt >= start && createdAt <= end;
      });
  
      setPendingApprovals(filtered);
    } catch (error) {
      console.error("Error al obtener las incidencias pendientes:", error);
    }
  }, [apiEndpoint, session]);
  

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleEditClick = (incidencia: IncidenciaForm) => {
    setSelectedIncidencia(incidencia);
    setIsEditOpen(true);
  };

  return (
    <>
      <Card className={`bg-white shadow-lg h-[500px] ${className || ""}`}>
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-lg font-bold text-blue-600">Incidencias Pendientes</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Lista de incidencias para aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((incidencia) => (
                  <div
                    key={incidencia.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{incidencia.nombreSubtipo}</p>
                      <p className="text-xs text-gray-500">
                        Registrado por{" "}
                        <span className="font-medium">{incidencia.quienRegistra}</span> el{" "}
                        <span className="font-medium">
                          {new Date(incidencia.createdAt).toLocaleDateString("es-MX")}
                        </span>
                      </p>
                    </div>
                    <Button
                      className="rounded-full text-blue-500 hover:text-blue-700"
                      variant="ghost"
                      onClick={() => handleEditClick(incidencia)}
                    >
                      <Edit size={20} />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">No hay incidencias pendientes.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedIncidencia && isEditOpen && (
        <PresentacionActionsDialog
          selectedIncidencia={{
            ...selectedIncidencia,
            infotype: selectedIncidencia.infotype || "Sin tipo de información",
          }}
          onClose={() => setIsEditOpen(false)}
          onUpdate={fetchPendingApprovals}
        />
      )}
    </>
  );
};

export default ShortcutApprovingCard;
