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

interface SuspensionLaboresFormProps {
  onClose: () => void;
  selectedIncidencia: {
    concepto: string;
    nombreSubtipo: string;
    infotype: string;
  };
}

const SuspensionLaboresForm: React.FC<SuspensionLaboresFormProps> = ({ onClose, selectedIncidencia }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "";;
  const numeroWDRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if(numeroWDRef.current){
      numeroWDRef.current.focus();
    }
  })

  // Obtén la fecha de hoy formateada
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const todayFormatted = formatDate(today);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<IncidenciaFormValues>({
    resolver: zodResolver(incidenciaFormSchema),
    defaultValues: {
      quienRegistra: userName,
      monto: null,
      cantidad: null,
      importe: null,
      trabajadorNumeroWD: "",
      nombreTrabajador: "",
      planta: undefined,
      infotipo: selectedIncidencia.infotype,
      concepto: selectedIncidencia.concepto,
      nombreSubtipo: selectedIncidencia.nombreSubtipo,
      validoDe: todayFormatted, // Establece por defecto como hoy
      validoA: todayFormatted, // Sincronizado por defecto con "validoDe"
    },
  });

  const [nombreTrabajador, setNombreTrabajador] = useState<string | null>(null);
  const [plantaTrabajador, setPlantaTrabajador] = useState<string | null>(null);
  const [numeroWD, setNumeroWD] = useState<string>("");

  // Observa los cambios en "validoDe" y ajusta "validoA"
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "validoDe") {
        const selectedDate = value.validoDe; // El valor actualizado de validoDe
        if (selectedDate) {
          setValue("validoA", selectedDate); // Sincroniza validoA con validoDe
        }
      }
    });

    return () => subscription.unsubscribe(); // Limpia la suscripción cuando el componente se desmonte
  }, [watch, setValue]);

  const rol = session?.user?.role || "Desconocido";

  const onSubmit = async (data: IncidenciaFormValues) => {
    const formData = {
      ...data,
      nombreTrabajador: nombreTrabajador || null,
      planta: plantaTrabajador || null,
      trabajadorNumeroWD: numeroWD || null,
      monto: data.monto ?? null,
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
        <Input type="date" {...register("validoDe")} className="border p-2 w-full" />
        {errors.validoDe && <span className="text-red-500">{errors.validoDe.message}</span>}
      </div>

      <div>
        <Label htmlFor="validoA">Válido A</Label>
        <Input type="date" {...register("validoA")} className="border p-2 w-full cursor-not-allowed" readOnly />
        {errors.validoA && <span className="text-red-500">{errors.validoA.message}</span>}
      </div>

      <Input type="hidden" {...register("concepto")} value={selectedIncidencia.concepto} />
      <Input type="hidden" {...register("infotipo")} value={selectedIncidencia.infotype} />
      <Input type="hidden" {...register("nombreSubtipo")} value={selectedIncidencia.nombreSubtipo} />

      <div className="sm:col-span-2">
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

export default SuspensionLaboresForm;
