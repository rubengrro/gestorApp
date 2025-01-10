/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTableRegister from '@/app/_components/_incidencias/data-table';
import { DataTableRegisterPending } from '@/app/_components/_incidencias/data-table-pending';
import { DataTableRegisterApproved } from '@/app/_components/_incidencias/data-table-approved';
import { DataTableRegisterRejected } from '@/app/_components/_incidencias/data-table-rejected';

function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Incidencias</h1>
      
      {/* Componente Tabs */}
      <Tabs defaultValue="pending">
        {/* Lista de Tabs */}
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="pending" className="text-sm">Pendientes</TabsTrigger>
          <TabsTrigger value="all" className="text-sm">Todas</TabsTrigger>
          <TabsTrigger value="approved" className="text-sm">Aprobadas</TabsTrigger>
          <TabsTrigger value="rejected" className="text-sm">Rechazadas</TabsTrigger>
        </TabsList>

        {/* Contenido de cada pestaña */}

        <TabsContent value="pending">
          <DataTableRegisterPending /> {/* Incidencias pendientes */}
        </TabsContent>

        <TabsContent value="all">
          <DataTableRegister /> {/* Todas las incidencias */}
        </TabsContent>

        <TabsContent value="approved">
          <DataTableRegisterApproved /> {/* Incidencias aprobadas */}
        </TabsContent>

        <TabsContent value="rejected">
          <DataTableRegisterRejected /> {/* Incidencias rechazadas */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Page;
