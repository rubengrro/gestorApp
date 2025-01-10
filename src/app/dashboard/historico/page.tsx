'use client';

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTableHistoricoSemanaActual from "@/app/_components/_historico/data-table-semana-actual";
import DataTableHistoricoDosSemanas from "@/app/_components/_historico/data-table-dos-semanas";
import DataTableHistoricoAll from "@/app/_components/_historico/data-table-historico";
import DataTableHistoricoSemanaAnterior from "@/app/_components/_historico/data-table-semana-anterior";

function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Histórico de Incidencias</h1>
      
      {/* Componente Tabs */}
      <Tabs defaultValue="semanaAnterior">
        {/* Lista de Tabs */}
        <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full mb-4">
          <TabsTrigger value="semanaActual" className="text-sm">Semana actual</TabsTrigger>
          <TabsTrigger value="semanaAnterior" className="text-sm">Incidencias Nómina</TabsTrigger>
          <TabsTrigger value="dosSemanasAnterior" className="text-sm">Dos semanas anteriores</TabsTrigger>
          <TabsTrigger value="historico" className="text-sm">Total</TabsTrigger>
        </TabsList>

        {/* Contenido de cada pestaña */}

        <TabsContent value="semanaActual">
          <DataTableHistoricoSemanaActual /> {/* Incidencias de la semana actual */}
        </TabsContent>

        <TabsContent value="semanaAnterior">
          <DataTableHistoricoSemanaAnterior /> {/* Incidencias de la semana anterior */}
        </TabsContent>

        <TabsContent value="dosSemanasAnterior">
          <DataTableHistoricoDosSemanas /> {/* Incidencias de las últimas dos semanas */}
        </TabsContent>


        <TabsContent value="historico">
          <DataTableHistoricoAll /> {/* Histórico completo de incidencias */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Page;
