"use client";

import CatalogoIncidencias from "@/app/_components/_catalogo/incidence-cat";
// import IncidenciasForm from "@/app/_components/_incidencias/incidenciasForm";
// import ExcelUploadBtn from "@/app/_components/_catalogo/ExcelUploadBtn"; // Asegúrate de que la ruta sea correcta
import React from "react";

function Page() {
  return (
    <div className="space-y-8">
      {/* Agrega el botón de carga de Excel */}
      {/* <ExcelUploadBtn /> */}
      
      {/* Renderiza solo el componente CatalogoIncidencias */}
      <CatalogoIncidencias />
      {/* <IncidenciasForm /> */}
    </div>
  );
}

export default Page;
