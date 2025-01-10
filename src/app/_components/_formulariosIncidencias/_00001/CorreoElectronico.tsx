/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incidenciaFormSchema } from "@/lib/zod";
import { NumeroWDPicker } from "../../_incidencias/presentacionNumeroWDPicker";
import { Button } from "@/components/ui/button";
import { Planta } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type IncidenciaFormValues = z.infer<typeof incidenciaFormSchema>;

interface CorreoElectronicoFormProps {
  onClose: () => void;
  selectedIncidencia: {
    concepto: string;
    nombreSubtipo: string;
    infotype: string;
  };
}

// Función para calcular el lunes de una semana dada
const getMonday = (date: Date): Date => {
  const day = date.getDay(); // Día de la semana (0: Domingo, 6: Sábado)
  const diff = day === 0 ? -6 : 1 - day; // Ajuste para que el lunes sea el primer día
  const monday = new Date(date); // Copia de la fecha
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0); // Eliminar desfases de hora
  return monday;
};

// Función para formatear una fecha como YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mes base 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CorreoElectronicoForm: React.FC<CorreoElectronicoFormProps> = ({ onClose, selectedIncidencia }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const numeroWDRef = useRef<HTMLInputElement>(null);
  const montoRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if(numeroWDRef.current){
      numeroWDRef.current.focus();
    }
  })

  const [validoDeState, setValidoDeState] = useState<string>(formatDate(getMonday(new Date()))); // Estado local para manejar "Válido De"

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IncidenciaFormValues>({
    resolver: zodResolver(incidenciaFormSchema),
    defaultValues: {
      quienRegistra: userName,
      monto: null,
      cantidad: null,
      importe: null,
      email: null,
      trabajadorNumeroWD: "",
      nombreTrabajador: "",
      planta: undefined,
      infotipo: selectedIncidencia.infotype,
      concepto: selectedIncidencia.concepto,
      nombreSubtipo: selectedIncidencia.nombreSubtipo,
      validoDe: validoDeState, // Inicialmente el lunes de la semana actual
      validoA: "9999-12-31", // Fecha infinita
    },
  });

  const [nombreTrabajador, setNombreTrabajador] = useState<string | null>(null);
  const [plantaTrabajador, setPlantaTrabajador] = useState<string | null>(null);
  const [numeroWD, setNumeroWD] = useState<string>("");

    // Ajustar "Válido De" al lunes de la semana seleccionada
    const handleValidoDeChange = (newDate: string) => {
      const selectedDate = new Date(newDate);
      const monday = getMonday(selectedDate); // Calcular el lunes correspondiente
      const formattedMonday = formatDate(monday);
      setValidoDeState(formattedMonday); // Actualizar el estado local
      setValue("validoDe", formattedMonday); // Sincronizar con el formulario
    };

    const rol = session?.user?.role || "Desconocido";

    const onSubmit = async (data: IncidenciaFormValues) => {
    const formData = {
      ...data,
      nombreTrabajador: nombreTrabajador || null,
      planta: plantaTrabajador || null,
      trabajadorNumeroWD: numeroWD || null,
      monto: data.monto ?? null,
      email: data.email ?? null,
      cantidad: data.cantidad ?? null,
      importe: data.importe ?? null,
      infotipo: data.infotipo || null,
      concepto: data.concepto || null,
      nombreSubtipo: data.nombreSubtipo || null,
      rol,
    };
  
    console.log("Datos enviados:", formData);
  
    try {
    const response = await fetch("/api/registroIncidencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // Intenta leer el mensaje de error de la respuesta
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar la incidencia");
    }

    alert("Incidencia guardada con éxito");
    onClose();
    window.location.reload();
  } catch (error) {
    console.error("Error al guardar la incidencia:", error);

    // Verifica si el error tiene un mensaje
    if (error instanceof Error) {
      alert(`Hubo un problema al guardar la incidencia: ${error.message}`);
    } else {
      alert("Hubo un problema desconocido al guardar la incidencia.");
    }
  }
};

  const handleWorkerSelect = (numeroWD: string, nombre: string, planta: Planta) => {
    setNumeroWD(numeroWD);
    setNombreTrabajador(nombre);
    setPlantaTrabajador(planta);
    setValue("trabajadorNumeroWD", numeroWD);
    setValue("nombreTrabajador", nombre);
    setValue("planta", "Planta_A");

    if (montoRef.current){
      montoRef.current.focus();
    }
  };



  const handleReset = () => {
    reset();
    setNombreTrabajador(null);
    setNumeroWD("");
    setPlantaTrabajador("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Label htmlFor="trabajadorNumeroWD" className="hidden">Número WD del Trabajador</Label>
        <NumeroWDPicker onSelect={handleWorkerSelect} />
        {errors.trabajadorNumeroWD && <span className="text-red-500">{errors.trabajadorNumeroWD.message}</span>}
      </div>

      
      {nombreTrabajador && (
        <div className="sm:col-span-2">
          <Label htmlFor="nombreTrabajador">Nombre del Trabajador</Label>
          <Input
            id="nombreTrabajador"
            value={nombreTrabajador}
            readOnly
            className="border p-2 w-full bg-gray-100"
          />
        </div>
      )}
      {plantaTrabajador && (
        <div className="sm:col-span-2">
          <Label htmlFor="plantaTrabajador">Planta del Trabajador</Label>
          <Input
            id="plantaTrabajador"
            value={plantaTrabajador}
            readOnly
            className="border p-2 w-full bg-gray-100"
          />
        </div>
      )}


      <div>
        <Label htmlFor="validoDe">Válido De</Label>
        <Input
          type="date"
          {...register("validoDe")}
          value={validoDeState} // Usa el estado local
          onChange={(e) => handleValidoDeChange(e.target.value)} // Maneja cambios
          className="border p-2 w-full"
        />
      </div>

      <div>
        <Label htmlFor="validoA">Válido A</Label>
        <Input type="date" {...register("validoA")} className="border p-2 w-full" readOnly/>
        {errors.validoA && <span className="text-red-500">{errors.validoA.message}</span>}
      </div>

      {/* Campos para Monto, Importe y Cantidad siempre visibles */}
      <div>
      <Label htmlFor="email">Correo Electrónico</Label>
      <Input
        type="email" // Cambiado de "number" a "email"
        {...register("email", {
          required: "El correo electrónico es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex para validar formato de correo
            message: "Formato de correo inválido",
          },
        })}
        placeholder="Ingrese el correo electrónico"
        className="border p-2 w-full"
         
      />
      {errors.monto && <span className="text-red-500">{errors.monto.message}</span>}
    </div>

      {/* Campos ocultos que envían infotipo, concepto y nombreSubtipo */}
      <Input type="hidden" {...register("concepto")} value={selectedIncidencia.concepto} />
      <Input type="hidden" {...register("infotipo")} value={selectedIncidencia.infotype} />
      <Input type="hidden" {...register("nombreSubtipo")} value={selectedIncidencia.nombreSubtipo} />

      <div className="sm:col-span-1">
        <Label htmlFor="quienRegistra">Quien Registra</Label>
        <Input {...register("quienRegistra")} readOnly className="border p-2 w-full bg-gray-100" />
      </div>

      <div className="sm:col-span-2 flex flex-row gap-3">
        <Button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Guardar Incidencia</Button>
        {/* <Button type="button" onClick={handleReset} className="bg-red-400 text-white p-2 rounded w-full">Reiniciar</Button> */}
      </div>
    </form>
  );
};

export default CorreoElectronicoForm;
