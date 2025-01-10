"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSession } from "next-auth/react";

interface IncidenciaData {
  estado: string;
  quienRegistra: string;
  createdAt: string;
  incidenciaCatalogo?: {
    rolesAcceso: string[];
  };
}

interface PieChartIncidencesProps {
  apiEndpoint: string; // Endpoint para obtener incidencias
  className?: string; // Prop opcional para estilos
}

const chartConfig = {
  pending: {
    label: "Pendientes",
    color: "hsl(var(--chart-1))",
  },
  approved: {
    label: "Aprobadas",
    color: "hsl(var(--chart-4))",
  },
  rejected: {
    label: "Rechazadas",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const PieChartIncidences: React.FC<PieChartIncidencesProps> = ({ apiEndpoint }) => {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState([
    { label: "Pendientes", value: 0, fill: chartConfig.pending.color },
    { label: "Aprobadas", value: 0, fill: chartConfig.approved.color },
    { label: "Rechazadas", value: 0, fill: chartConfig.rejected.color },
  ]);

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

  const fetchIncidences = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Error al obtener los datos de incidencias");
      const data: IncidenciaData[] = await response.json();

      const userRole = session?.user?.role || "";
      const userName = session?.user?.name || "";
      const { start, end } = getWeekRange();

      // Filtrar incidencias según rol, usuario y semana actual
      const filteredData = data.filter((item) => {
        const createdAt = new Date(item.createdAt);
        const rolesAcceso = item.incidenciaCatalogo?.rolesAcceso || [];
        const tieneAcceso = rolesAcceso.includes(userRole);
        const esRegistrador = item.quienRegistra === userName;

        return (tieneAcceso || esRegistrador) && createdAt >= start && createdAt <= end;
      });

      // Contar incidencias por estado
      const pendingCount = filteredData.filter(
        (item) => item.estado === "Pendiente_Ri" || item.estado === "Pendiente_Gerente"
      ).length;

      const approvedCount = filteredData.filter(
        (item) => item.estado === "Aprobado" || item.estado === "No_Aplica"
      ).length;

      const rejectedCount = filteredData.filter((item) => item.estado === "Rechazado").length;

      setChartData([
        { label: "Pendientes", value: pendingCount, fill: chartConfig.pending.color },
        { label: "Aprobadas", value: approvedCount, fill: chartConfig.approved.color },
        { label: "Rechazadas", value: rejectedCount, fill: chartConfig.rejected.color },
      ]);
    } catch (error) {
      console.error("Error al obtener las incidencias:", error);
    }
  }, [apiEndpoint, session]);

  useEffect(() => {
    fetchIncidences();
  }, [fetchIncidences]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardDescription>Distribución de incidencias</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={(props: PieSectorDataItem) => (
                <Sector {...props} outerRadius={props.outerRadius! + 10} />
              )}
            >
              <Label
                position="center"
                fill="hsl(var(--foreground))"
                className="text-base font-bold"
              >
                Total
              </Label>
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Estadísticas recientes <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground text-center">
          Estado de las incidencias registradas durante la semana actual
        </div>
      </CardFooter>
    </Card>
  );
};

export default PieChartIncidences;
