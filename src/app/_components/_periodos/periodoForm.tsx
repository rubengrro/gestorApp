'use client';

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { periodoSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createPeriod } from "@/actions/create-period";
import { getSession } from "next-auth/react";

// Obtener las fechas formateadas
const getCurrentWeekMonday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysToMonday);
  monday.setHours(15, 0, 0, 0);
  
  return monday.toISOString().slice(0, 16); // Formato yyyy-MM-ddTHH:mm
};

const getNextWeekMonday = () => {
  const currentMonday = new Date(getCurrentWeekMonday());
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  nextMonday.setHours(12, 0, 0, 0);
  
  return nextMonday.toISOString().slice(0, 16); // Formato yyyy-MM-ddTHH:mm
};

// Cambia tipo de PeriodoFormData
type PeriodoFormData = {
  numero: number;
  fechaInicio: string; // Se mantiene como string para evitar problemas de tipo de datos
  fechaCierre: string; 
};

interface Periodo {
  id: number;
  numero: number;
  fechaInicio: Date;
  fechaCierre: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PeriodoForm = () => {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PeriodoFormData>({
    resolver: zodResolver(periodoSchema),
    defaultValues: {
      numero: 0,
      fechaInicio: getCurrentWeekMonday(),
      fechaCierre: getNextWeekMonday(),
    },
  });

  const onSubmit = async (data: PeriodoFormData) => {
    // Se convierten explícitamente las fechas en el momento de enviar
    const periodoData = {
      numero: Number(data.numero),
      fechaInicio: new Date(data.fechaInicio),
      fechaCierre: new Date(data.fechaCierre),
    };

    const response = await createPeriod(periodoData);

    if (!response.error && response.data) {
      // Se convierte a tipo Date solo al recibir los datos de la API
      const newPeriod: Periodo = {
        ...response.data,
        fechaInicio: new Date(response.data.fechaInicio),
        fechaCierre: new Date(response.data.fechaCierre),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };

      setPeriodos((prev) => [...prev, newPeriod]);
      reset({
        numero: 0,
        fechaInicio: getCurrentWeekMonday(),
        fechaCierre: getNextWeekMonday(),
      });
    } else {
      console.error(response.message, response.errors);
    }
  };

  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const response = await fetch("/api/periodo");
        if (response.ok) {
          const data: Periodo[] = await response.json();
          const formattedData = data.map((periodo) => ({
            ...periodo,
            fechaInicio: new Date(periodo.fechaInicio),
            fechaCierre: new Date(periodo.fechaCierre),
            createdAt: new Date(periodo.createdAt),
            updatedAt: new Date(periodo.updatedAt),
          }));
          setPeriodos(formattedData);
        }
      } catch (error) {
        console.error("Error al cargar los periodos:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkAccess = async () => {
      const session = await getSession();
      if (session?.user?.role === "Superadministrador" || session?.user?.role === "Administrador") {
        setHasAccess(true);
      }
    };

    fetchPeriodos();
    checkAccess();
  }, []);

  const formatToDDMMYYYYHHMM = (date: Date) => {
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 p-4">
      {hasAccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-lg font-semibold">Crear Nuevo Periodo</h2>
          <div>
            <label htmlFor="numero">Número de Periodo</label>
            <Input type="number" {...register("numero", { valueAsNumber: true })} placeholder="Número de Periodo" />
            {errors.numero && <p className="text-red-500">{errors.numero.message}</p>}
          </div>
          <div>
            <label htmlFor="fechaInicio">Fecha de Inicio</label>
            <Input type="datetime-local" {...register("fechaInicio")} placeholder="Fecha de Inicio" />
            {errors.fechaInicio && <p className="text-red-500">{errors.fechaInicio.message}</p>}
          </div>
          <div>
            <label htmlFor="fechaCierre">Fecha de Cierre</label>
            <Input type="datetime-local" {...register("fechaCierre")} placeholder="Fecha de Cierre" />
            {errors.fechaCierre && <p className="text-red-500">{errors.fechaCierre.message}</p>}
          </div>
          <Button type="submit">Crear Periodo</Button>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold">Periodos Existentes</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full border border-gray-200 shadow-md">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2 border">Número</TableHead>
                  <TableHead className="px-4 py-2 border">Fecha de Inicio</TableHead>
                  <TableHead className="px-4 py-2 border">Fecha de Cierre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodos.length > 0 ? (
                  periodos.map((periodo) => (
                    <TableRow key={periodo.id}>
                      <TableCell className="px-4 py-2 border">{periodo.numero}</TableCell>
                      <TableCell className="px-4 py-2 border">{formatToDDMMYYYYHHMM(periodo.fechaInicio)}</TableCell>
                      <TableCell className="px-4 py-2 border">{formatToDDMMYYYYHHMM(periodo.fechaCierre)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-2 text-center border">
                      No hay periodos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodoForm;
