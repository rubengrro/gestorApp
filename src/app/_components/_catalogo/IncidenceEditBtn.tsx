"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { Switch } from "@/components/ui/switch"; 
import { RolesSelector } from "./RolesSelector";
import { IncidenciaCatalogo } from "@prisma/client";

type EditButtonProps = {
  incidenciaId: number;
  onUpdate: (updatedIncidencia: IncidenciaCatalogo) => void;
};

export function EditButton({ incidenciaId, onUpdate }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    infotype: "",
    concepto: "",
    nombreSubtipo: "",
    requiereAprobacion: false,
    rolesAcceso: [] as string[],
  });

  // Cargar datos del registro cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      // Fetch para obtener datos de la incidencia
      fetch(`/api/incidencias/${incidenciaId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            infotype: data.infotype,
            concepto: data.concepto,
            nombreSubtipo: data.nombreSubtipo,
            requiereAprobacion: data.requiereAprobacion,
            rolesAcceso: data.rolesAcceso,
          });
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [open, incidenciaId]);

  // Actualizar el campo de entrada
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Actualizar el estado del switch
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      requiereAprobacion: checked,
    }));
  };

  // Manejar cambios en roles
  const handleRolesChange = (updatedRoles: string[]) => {
    setFormData((prevData) => ({
      ...prevData,
      rolesAcceso: updatedRoles,
    }));
  };

  // Enviar datos actualizados al servidor
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/incidencias/${incidenciaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update incidencia");

      const updatedData = await response.json();
      onUpdate(updatedData); // Reflejar cambios en la lista principal
      setOpen(false); // Cerrar el diálogo
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full p-2">
          <Edit2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Incidencia</DialogTitle>
          <DialogDescription>
            Realiza cambios en la incidencia y guarda cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Infotipo */}
          <div className="col-span-2">
            <Label htmlFor="infotype">Infotipo</Label>
            <Input
              id="infotype"
              value={formData.infotype}
              onChange={handleInputChange}
              placeholder="Ingresa el infotipo"
            />
          </div>

          {/* Concepto */}
          <div className="col-span-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              value={formData.concepto}
              onChange={handleInputChange}
              placeholder="Ingresa el concepto"
            />
          </div>

          {/* Nombre Subtipo */}
          <div className="col-span-2">
            <Label htmlFor="nombreSubtipo">Nombre Subtipo</Label>
            <Input
              id="nombreSubtipo"
              value={formData.nombreSubtipo}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del subtipo"
            />
          </div>

          {/* Requiere Aprobación (Switch) */}
          <div className="flex flex-col items-start col-span-2 mt-4">
            <Label>Requiere Aprobación</Label>
            <Switch
              checked={formData.requiereAprobacion}
              onCheckedChange={handleSwitchChange}
              className="mt-2"
            />
          </div>

          {/* Usuarios con Acceso */}
          <div className="col-span-2">
            <Label>Usuarios con Acceso</Label>
            <RolesSelector
              selectedRoles={formData.rolesAcceso}
              onRoleChange={handleRolesChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
