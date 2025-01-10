/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import DataTableRegister from '@/app/_components/_incidencias/data-table';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'; // Asegúrate de que la ruta es correcta

// Definir la interfaz para las incidencias
interface IncidenciaForm {
  trabajadorNumeroWD: string;
  validoDe: string; // Cambiado a string para manejar las fechas
  validoA: string; // Cambiado a string para manejar las fechas
  ccNomina?: string;
  importe?: number;
  cantidad?: number;
  unidad?: string;
  numeroAsignacion?: string;
  sociedad?: string;
  centroCoste?: string;
  wbsElement?: string;
  orden?: string;
  quienRegistra: string;
}

function Page() {
  const [selectedInfotipo, setSelectedInfotipo] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]); // Estado para almacenar las incidencias

  const handleSelectInfotipo = (infotipo: string) => {
    setSelectedInfotipo(infotipo);
  };

  const handleRegister = (newIncidencia: IncidenciaForm) => {
    setIncidencias((prev) => [...prev, newIncidencia]); // Agregar la nueva incidencia al estado
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <DataTableRegister />
      </div>
  );
}

export default Page;
