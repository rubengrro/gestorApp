/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface ExportToExcelProps {
  data: Record<string, any>[]; // Datos para exportar
  weekRange?: string; // Rango de fechas de la semana
  fileNameBase?: string; // Nombre base del archivo
}



export const ExportToExcelButton: React.FC<ExportToExcelProps> = ({
  data,
  weekRange,
  fileNameBase = "ExportedData",
}) => {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      console.warn("No hay datos para exportar.");
      return;
    }

    // Generar nombre del archivo dinámicamente
    const sanitizedWeekRange = weekRange?.replace(/\//g, "-") || "SinRango";
    const fileName = `${fileNameBase}_${sanitizedWeekRange}.xlsx`;

    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de las columnas
    worksheet["!cols"] = [
      { wch: 30 }, // Nombre del Trabajador
      { wch: 15 }, // Id 1
      { wch: 15 }, // Planta
      { wch: 30 }, // Nombre Subtipo
      { wch: 25 }, // Concepto
      { wch: 30 }, // Quién Registró
      { wch: 20 }, // Fecha de Registro
      { wch: 20 }, // Válido de
      { wch: 20 }, // Válido A
      { wch: 20 }, // Estado
      { wch: 15 }, // Monto/Importe
      { wch: 10 }, // Moneda
      { wch: 8 }, // Cantidad
      { wch: 10 }, // Folio
      { wch: 20 }, // Email
      { wch: 20 }, // Horas
    ];

    Object.keys(worksheet).forEach((key) => {
      if (!key.startsWith("!")) {
        const cell = worksheet[key];
        // Alinear siempre a la derecha para las columnas específicas
        if (key.match(/I[0-9]+|J[0-9]+|K[0-9]+/)) { // Columnas I, J, K (Monto/Importe, Moneda, Cantidad)
          worksheet[key].s = {
            alignment: {
              horizontal: "right", 
            },
          };
          if (cell.v === "0") {
            cell.t = "n"; // Número
          } else if (cell.v === "MXN") {
            cell.t = "s"; // Texto
          }
        }
      }
    });
  
    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
  
    // Exportar archivo
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button variant="outline" onClick={exportToExcel} className="bg-blue-500 text-white font-semibold">
      Exportar a Excel
    </Button>
  );
};
