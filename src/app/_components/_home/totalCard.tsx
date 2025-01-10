'use client';

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidenciaForm } from "../_historico/data-table-semana-actual";
import { Session } from "next-auth";
import { Role } from "@prisma/client";

interface TotalCardProps {
  apiEndpoint: string; // Endpoint para obtener las incidencias
  session: Session | null; // Sesión del usuario
}

const TotalCard: React.FC<TotalCardProps> = ({ apiEndpoint, session }) => {
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchTotalIncidencias = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Error al obtener las incidencias");
      const data: IncidenciaForm[] = await response.json();

      // Obtener datos del usuario
      const userRole = session?.user?.role as Role; // Conversión explícita al tipo Role
      const userName = session?.user?.name || "";

      // Filtrar incidencias dentro de la semana actual
      const { start, end } = getWeekRange();
      const currentWeekData = data.filter((incidencia) => {
        const createdAt = new Date(incidencia.createdAt);
        return createdAt >= start && createdAt <= end;
      });

      // Filtrar incidencias según el rol y usuario
      const filtered = currentWeekData.filter((incidencia) => {
        const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];
        const tieneAcceso = rolesAcceso.includes(userRole);
        const esRegistrador = incidencia.quienRegistra === userName;

        return tieneAcceso || esRegistrador;
      });

      setTotalCount(filtered.length); // Total de incidencias visibles para el usuario en la semana actual
    } catch (error) {
      console.error("Error al obtener el total de incidencias:", error);
    }
  }, [apiEndpoint, session]);

  useEffect(() => {
    fetchTotalIncidencias();
  }, [fetchTotalIncidencias]);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle>Total</CardTitle>
        <CardDescription>Incidencias registradas</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{totalCount}</p>
      </CardContent>
    </Card>
  );
};

export default TotalCard;
