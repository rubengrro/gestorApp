'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Planta } from "@prisma/client";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Trabajador {
  numeroWD: string;
  nombre: string;
  planta: Planta;
  numeroGV: string;
  numeroAnterior?: string;
}

export const NumeroWDPicker = React.forwardRef<HTMLInputElement, { onSelect: (numeroWD: string, nombre: string, planta: Planta) => void }>(
  ({ onSelect }, ref) => {
    const [numero, setNumero] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [trabajadores, setTrabajadores] = React.useState<Trabajador[]>([]);
    const [badgeData, setBadgeData] = React.useState<{ type: string; value: string } | null>(null);

    React.useEffect(() => {
      const fetchTrabajadores = async () => {
        try {
          const response = await fetch("/api/trabajadores");
          if (!response.ok) throw new Error("Error al obtener trabajadores");
          const data: Trabajador[] = await response.json();
          setTrabajadores(data);
        } catch (error) {
          console.error("Error al obtener trabajadores:", error);
        }
      };
      fetchTrabajadores();
    }, []);

    const handleBuscar = () => {
      const trimmedNumero = numero.trim();
      if (!trimmedNumero) {
        setError("Por favor ingrese un número válido.");
        return;
      }
    
      // Buscar en todas las posibles claves
      const trabajador = trabajadores.find(
        (t) =>
          t.numeroWD === trimmedNumero ||
          t.numeroGV === trimmedNumero ||
          t.numeroAnterior === trimmedNumero
      );
    
      if (trabajador) {
        setError(null);
    
        const formattedPlanta = trabajador.planta.replace(/_/g, " ");
        onSelect(trabajador.numeroWD, trabajador.nombre, formattedPlanta as Planta);
    
        // Mapear los valores genéricos
        const idMap: { [key: string]: string } = {
          numeroWD: "ID #1",
          numeroGV: "ID #2",
          numeroAnterior: "ID #3",
        };
    
        // Determinar por cuál clave se encontró y asignar el badge genérico
        if (trabajador.numeroWD === trimmedNumero) {
          setBadgeData({ type: idMap["numeroWD"], value: trabajador.numeroWD });
        } else if (trabajador.numeroGV === trimmedNumero) {
          setBadgeData({ type: idMap["numeroGV"], value: trabajador.numeroGV });
        } else if (trabajador.numeroAnterior === trimmedNumero) {
          setBadgeData({ type: idMap["numeroAnterior"], value: trabajador.numeroAnterior });
        }
      } else {
        setError("No se encontró un trabajador con ese número.");
        setBadgeData(null); // Limpiar los badges en caso de error
      }
    };
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanedValue = e.target.value.replace(/[^0-9]/g, "").trim();
      setNumero(cleanedValue);
    };

    return (
      <div>
<div className="flex items-center">
  <Label htmlFor="numero" className="block mb-2 text-sm font-medium text-gray-700">
    Buscar Trabajador
  </Label>
  {badgeData && (
    <div className="flex ml-2 mb-2">
      <Badge variant="outline">{`${badgeData.type}: ${badgeData.value}`}</Badge>
      {badgeData.type !== "ID #1" && (
        <Badge variant="outline" className="ml-1">
          {`ID #1: ${trabajadores.find(
            (t) =>
              t.numeroWD === badgeData.value ||
              t.numeroGV === badgeData.value ||
              t.numeroAnterior === badgeData.value
          )?.numeroWD}`}
        </Badge>
      )}
    </div>
  )}
</div>


        <div className="flex items-center space-x-2">
          <Input
            id="numero"
            ref={ref}
            value={numero}
            onChange={handleInputChange}
            placeholder="Búscar por ID #1, ID #2 ó ID #3"
            className="flex-1 border p-2 h-auto text-sm"
          />
          <Button onClick={handleBuscar} type="button" className="p-2 bg-blue-500">
            <Search className="h-5 w-5 text-white" />
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-2">
            {error}
          </Alert>
        )}
      </div>
    );
  }
);

NumeroWDPicker.displayName = "NumeroWDPicker";
