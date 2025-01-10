/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import DataTableRegister from '@/app/_components/_incidencias/data-table';
import RegistrosAcumuladosTable from '@/app/_components/_incidenciasDef/IncidenciasDefinitivo';
import React, { useState } from 'react';

export interface IncidenciaForm {
  nombre: string;
  trabajadorNumeroWD: string;
  validoDe: string;
  validoA: string;
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
  estado: string; 
}

function Page() {
  const [selectedInfotipo, setSelectedInfotipo] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<IncidenciaForm[]>([]); // Estado para las incidencias

  const handleSelectInfotipo = (infotipo: string) => {
    setSelectedInfotipo(infotipo);
  };

  return (
    <div>      
      <RegistrosAcumuladosTable /> {/* Pasa las incidencias como prop */}
    </div>
  );
}

export default Page;
