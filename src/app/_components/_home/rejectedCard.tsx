'use client';

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidenciaForm } from "../_historico/data-table-semana-actual";
import { Session } from "next-auth";
import { Role } from "@prisma/client";

interface RejectedCardProps {
  apiEndpoint: string; // Endpoint para obtener las incidencias
  session: Session | null; // Sesión del usuario
}

const RejectedCard: React.FC<RejectedCardProps> = ({ apiEndpoint, session }) => {
  const [rejectedCount, setRejectedCount] = useState(0);

  // Función para obtener el rango de la semana actual
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

  const fetchRejectedIncidencias = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data: IncidenciaForm[] = await response.json();

      // Obtener datos del usuario
      const userRole = session?.user?.role as Role; // Cast explícito al tipo Role
      const userName = session?.user?.name || "";

      // Obtener el rango de la semana actual
      const { start, end } = getWeekRange();
      const currentWeekData = data.filter((incidencia) => {
        const createdAt = new Date(incidencia.createdAt);
        return createdAt >= start && createdAt <= end;
      });

      // Filtrar incidencias rechazadas relevantes al usuario
      const filtered = currentWeekData.filter((incidencia) => {
        const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
        const tieneAcceso = rolesAcceso.includes(userRole);
        const esRegistrador = incidencia.quienRegistra === userName;
        const esRechazado = incidencia.estado === "Rechazado";

        return esRechazado && (tieneAcceso || esRegistrador);
      });

      setRejectedCount(filtered.length); // Contar incidencias rechazadas relevantes
    } catch (error) {
      console.error("Error al obtener las incidencias rechazadas:", error);
    }
  }, [apiEndpoint, session]);

  useEffect(() => {
    fetchRejectedIncidencias();
  }, [fetchRejectedIncidencias]);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle>Rechazado</CardTitle>
        <CardDescription>Incidencias rechazadas</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{rejectedCount}</p>
      </CardContent>
    </Card>
  );
};

export default RejectedCard;
