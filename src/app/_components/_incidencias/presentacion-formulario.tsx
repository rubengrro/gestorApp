/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'; 

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  // import { Button } from "@/components/ui/button";
import { IncidenciasProvider } from "../_formulariosIncidencias/context/IncidenciasContext";
import { useState } from "react";
import { incidenciaFormSchema } from "@/lib/zod";
import { z } from "zod";
import CorreoElectronicoForm from "../_formulariosIncidencias/_00001/CorreoElectronico";
import VacacionesForm from "../_formulariosIncidencias/_00002/Vacaciones";
import EnfermedadGeneralForm from "../_formulariosIncidencias/_00002/EnfermedadGeneral";
import RiesgoTrabajoForm from "../_formulariosIncidencias/_00002/RiesgoTrabajo";
import MaternidadForm from "../_formulariosIncidencias/_00002/Maternidad";
import FaltaInjustificadaForm from "../_formulariosIncidencias/_00002/FaltaInjustificada";
import SuspensionForm from "../_formulariosIncidencias/_00002/Suspension";
  
  interface PresentacionFormsDialogProps {
    selectedIncidencia: {
      id: string;
      concepto: string;
      nombreSubtipo: string;
      infotype: string;
    };
    onClose: () => void;
  }

  type IncidenciaFormValues = z.infer<typeof incidenciaFormSchema>;

  
  export function PresentacionFormsDialog({
    selectedIncidencia,
    onClose,
  }: PresentacionFormsDialogProps) {
    const { nombreSubtipo, infotype, concepto } = selectedIncidencia;
     // Control de pasos del formulario
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [registroId, setRegistroId] = useState<string | null>(null);
  const [relacionId, setRelacionId] = useState<number | null>(null);
  const [monto, setMonto] = useState<number | null>(null);

  const handleNextForm = (data: { relacionId: number; monto: number | null }) => {
    setRelacionId(data.relacionId);
    setMonto(data.monto);
    setFormStep(2); // Cambia al segundo formulario
  };
  


  // Identificar si es un flujo especial
  const isSpecialFlow = ["Préstamo Caja Chica", "Pago de Préstamos (Externo)"].includes(nombreSubtipo);

  // Manejo de envío del primer formulario
  const handlePrimarySubmit = async (data: any) => {
    try {
      const response = await fetch("/api/registroIncidencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error al guardar el registro");

      const result = await response.json();
      setRegistroId(result.id);
      setFormStep(2); // Avanza al siguiente paso solo en flujo especial
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al guardar el primer formulario.");
    }
  };

  // Manejo de envío del segundo formulario
  const handleSecondarySubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/registroIncidencia/${registroId}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error al guardar el segundo formulario");

      alert("Registro completado con éxito.");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al guardar el segundo formulario.");
    }
  };

  // Cancelar flujo y eliminar el registro temporal si existe
  const handleCancel = async () => {
    if (registroId) {
      try {
        await fetch(`/api/registroIncidencia/${registroId}`, { method: "DELETE" });
        alert("Registro cancelado.");
      } catch (error) {
        console.error("Error al eliminar el registro:", error);
      }
    }
    onClose();
  };
    console.log("Nombre Subtipo recibido en el diálogo:", nombreSubtipo);
    
    const formComponentsMap: Record<string, JSX.Element> = {
      "Correo Electrónico": <CorreoElectronicoForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Vacaciones": <VacacionesForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Enfermedad General": <EnfermedadGeneralForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Riesgo de Trabajo": <RiesgoTrabajoForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Maternidad": <MaternidadForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Falta Injustificada": <FaltaInjustificadaForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
      "Suspension": <SuspensionForm onClose={onClose} selectedIncidencia={selectedIncidencia} />,
    };
    
  
  // Obtener el componente correspondiente o mostrar un mensaje por defecto
  const formComponent = formComponentsMap[nombreSubtipo] || <p>No hay un formulario específico para este subtipo.</p>;
 
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] transform transition-all duration-300 ease-in-out">
          <DialogHeader>
            <DialogTitle>Nuevo Registro</DialogTitle>
            <DialogDescription className="flex flex-col gap-1">
              <span><strong>Infotipo:</strong> {infotype}</span>
              <span><strong>Concepto:</strong> {concepto}</span>
              <span><strong>Subtipo:</strong> {nombreSubtipo}</span>
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4 py-4">
          {isSpecialFlow && formStep === 1
          ? formComponentsMap["Préstamo Caja Chica"]
          : isSpecialFlow && formStep === 2
          ? formComponentsMap["Pago de Préstamos (Externo)"]
          : formComponent}
        </div>

  
          <DialogFooter>
            {/* <Button onClick={onClose}>Cancelar</Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  