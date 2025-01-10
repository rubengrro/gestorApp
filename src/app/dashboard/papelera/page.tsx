/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import DataTablePapelera from '@/app/_components/_incidencias/data-table-papelera';

function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Papelera de Reciclaje</h1>
      
      <DataTablePapelera />
    </div>
  );
}

export default Page;
