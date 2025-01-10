import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import LoadingSpinner from "../loadingSpinner";

// Función para convertir un nombre a "Title Case" y normalizar
const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function TrabajadoresBtnFile({ onFileProcessed }: { onFileProcessed: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true); // Iniciar la carga
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convertir el archivo a JSON como arreglos, asumiendo que no tiene encabezados
      const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

      for (const row of rows) {
        if (row.length < 7) {
          console.warn(`Fila incompleta omitida: ${JSON.stringify(row)}`);
          continue;
        }

        const [nombre, planta, numeroWD, numeroGV, numeroAnterior, supervisorNombre, gerenteNombre] = row;

        // Preparar los datos para enviar, asegurando que numeroAnterior sea opcional
        const trabajador = {
          nombre: nombre ? toTitleCase(nombre) : "Nombre no especificado",
          planta,
          numeroWD: numeroWD || "WD no especificado",
          numeroGV: numeroGV || "GV no especificado",
          numeroAnterior: numeroAnterior || null, // Envía null si numeroAnterior está vacío
          supervisorNombre: supervisorNombre ? toTitleCase(supervisorNombre) : "Supervisor no asignado",
          gerenteNombre: gerenteNombre ? toTitleCase(gerenteNombre) : "Gerente no asignado",
        };

        try {
          // Crear el trabajador con los datos y nombres de supervisor y gerente
          const response = await fetch("/api/trabajadores", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(trabajador),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en la respuesta del servidor para ${trabajador.nombre}:`, errorText);
            alert(`Error al cargar ${trabajador.nombre}: ${errorText}`);
          } else {
            // Llamar a la función para refrescar la tabla después de cada carga exitosa
            onFileProcessed();
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error al procesar el archivo:", error.message);
            alert(`Error al procesar el archivo: ${error.message}`);
          } else {
            console.error("Error inesperado:", error);
          }
        }
      }
      console.log("Carga de trabajadores completada.");
      setIsLoading(false); // Terminar la carga
    }
  };

  return (
    <div className="flex items-center">
      <Button variant="outline" onClick={handleClick} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : "Cargar Trabajadores"}
      </Button>
      <Input
        ref={fileInputRef}
        id="file"
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
