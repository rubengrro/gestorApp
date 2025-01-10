import React, { useEffect, useState } from "react";
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
import { User } from "@/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ApproversSelectorGerente } from "./approversSelectorGerente";
import { ApproversSelectorRi } from "./approversSelectorRi";
import { SelectorInplant } from "./selectorInplant";
import { SelectorSupervisor } from "./selectorSupervisor";
import { SelectorGps } from "./selectorGps";

type EditButtonProps = {
  userId: string;
  onUpdate: (updatedUser: User) => void;
};

export function UserEditBtn({ userId, onUpdate }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para gestionar qué roles mostrar
  const [visibleSelectors, setVisibleSelectors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    plant: "All",
    relatedGerentes: [] as { id: string; name: string; role: string }[],
    relatedRis: [] as { id: string; name: string; role: string }[],
    relatedInplants: [] as { id: string; name: string; role: string }[],
    relatedGps: [] as { id: string; name: string; role: string }[],
    relatedSupervisors: [] as { id: string; name: string; role: string }[],
  });

  useEffect(() => {
    if (open) {
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name,
            email: data.email,
            role: data.role,
            plant: data.plant,
            relatedGerentes: data.relatedGerentes || [],
            relatedRis: data.relatedRis || [],
            relatedInplants: data.relatedInplants || [],
            relatedGps: data.relatedGps || [],
            relatedSupervisors: data.relatedSupervisors || [],
          });
 // Inicializar los toggles visibles según las relaciones existentes
 const initialVisibleSelectors = [];
 if (data.relatedGerentes?.length) initialVisibleSelectors.push("relatedGerentes");
 if (data.relatedRis?.length) initialVisibleSelectors.push("relatedRis");
 if (data.relatedInplants?.length) initialVisibleSelectors.push("relatedInplants");
 if (data.relatedGps?.length) initialVisibleSelectors.push("relatedGps");
 if (data.relatedSupervisors?.length) initialVisibleSelectors.push("relatedSupervisors");
 setVisibleSelectors(initialVisibleSelectors);
})
.catch((error) => console.error("Error fetching user data:", error));
}
}, [open, userId]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePlantChange = (updatedPlant: string) => {
    setFormData((prev) => ({
      ...prev,
      plant: updatedPlant,
    }));
  };

  const handleApproverChange = (
    updatedUsers: { id: string; name: string; role: string }[],
    key: keyof typeof formData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: updatedUsers,
    }));
  };

  const toggleSelector = (selector: string) => {
    setVisibleSelectors((prev) =>
      prev.includes(selector)
        ? prev.filter((item) => item !== selector) // Ocultar si ya está visible
        : [...prev, selector] // Mostrar si no está visible
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        plant: formData.plant,
        relatedGerentes: formData.relatedGerentes.map((gerente) => gerente.id),
        relatedRis: formData.relatedRis.map((ri) => ri.id),
        relatedInplants: formData.relatedInplants.map((inplant) => inplant.id),
        relatedGps: formData.relatedGps.map((gps) => gps.id),
        relatedSupervisors: formData.relatedSupervisors.map((supervisor) => supervisor.id),
      };
  
      console.log("Payload enviado al servidor:", payload);
  
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }
  
      const updatedData = await response.json();
      onUpdate(updatedData);
      setOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const shouldShowRelations = formData.role !== "Superadministrador" && formData.role !== "Administrador";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full p-2">
          <Edit2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Realiza cambios en el usuario y guarda cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="col-span-2">
            <Label>Planta</Label>
            <Select value={formData.plant} onValueChange={handlePlantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una planta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planta_A">Planta A</SelectItem>
                <SelectItem value="Planta_B">Planta B</SelectItem>
                <SelectItem value="Planta_C">Planta C</SelectItem>
                <SelectItem value="All">Todas las plantas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
          <Label>Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(updatedRole) =>
              setFormData((prev) => ({ ...prev, role: updatedRole }))
            }
          >

    <SelectTrigger>
      <SelectValue placeholder="Selecciona un rol" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Superadministrador">Superadministrador</SelectItem>
      <SelectItem value="Administrador">Administrador</SelectItem>
      <SelectItem value="Inplant">Inplant</SelectItem>
      <SelectItem value="Ri">Ri</SelectItem>
      <SelectItem value="Gerente">Gerente</SelectItem>
      <SelectItem value="GPS">GPS</SelectItem>
      <SelectItem value="Supervisor">Supervisor</SelectItem>
    </SelectContent>
  </Select>
</div>
          {shouldShowRelations && (
            <>


          {/* ToggleGroup para seleccionar roles */}
          <div className="col-span-2 mt-4">
            <Label>Relaciones entre usuarios</Label>
            <ToggleGroup type="multiple" size="sm" className="flex space-x-2 mt-2" variant="outline">
              <ToggleGroupItem
                value="relatedGerentes"
                onClick={() => toggleSelector("relatedGerentes")}
              >
                Gerente
              </ToggleGroupItem>
              <ToggleGroupItem value="relatedRis" onClick={() => toggleSelector("relatedRis")}>
                Ri
              </ToggleGroupItem>
              <ToggleGroupItem value="relatedInplants" onClick={() => toggleSelector("relatedInplants")}>
                Inplant
              </ToggleGroupItem>
              <ToggleGroupItem value="relatedGps" onClick={() => toggleSelector("relatedGps")}>
                GPS
              </ToggleGroupItem>
              <ToggleGroupItem
                value="relatedSupervisors"
                onClick={() => toggleSelector("relatedSupervisors")}
              >
                Supervisor
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Mostrar selectores según el estado */}
          {visibleSelectors.includes("relatedGerentes") && (
            <div className="col-span-2">
              <Label>Gerentes Relacionados</Label>
              <ApproversSelectorGerente
            selectedApprovers={formData.relatedGerentes.map((gerente) => ({
              ...gerente,
              plant: "All", // Agrega un valor predeterminado para 'plant'
            }))}
            approvers={[]}
            onApproverChange={(updatedUsers) => handleApproverChange(updatedUsers, "relatedGerentes")}
          />


            </div>
          )}
          {visibleSelectors.includes("relatedRis") && (
            <div className="col-span-2">
              <Label>Ris Relacionados</Label>
              <ApproversSelectorRi
                selectedApprovers={formData.relatedRis}
                approvers={[]}
                onApproverChange={(updatedUsers) => handleApproverChange(updatedUsers, "relatedRis")}
              />
            </div>
          )}
          {visibleSelectors.includes("relatedInplants") && (
            <div className="col-span-2">
              <Label>Inplants Relacionados</Label>
              <SelectorInplant
                selectedApprovers={formData.relatedInplants}
                approvers={[]}
                onApproverChange={(updatedUsers) => handleApproverChange(updatedUsers, "relatedInplants")}
              />
            </div>
          )}
          {visibleSelectors.includes("relatedGps") && (
            <div className="col-span-2">
              <Label>GPS Relacionados</Label>
              <SelectorGps
                selectedApprovers={formData.relatedGps}
                approvers={[]}
                onApproverChange={(updatedUsers) => handleApproverChange(updatedUsers, "relatedGps")}
              />
            </div>
          )}
          {visibleSelectors.includes("relatedSupervisors") && (
            <div className="col-span-2">
              <Label>Supervisores Relacionados</Label>
              <SelectorSupervisor
                selectedApprovers={formData.relatedSupervisors}
                approvers={[]}
                onApproverChange={(updatedUsers) => handleApproverChange(updatedUsers, "relatedSupervisors")}
              />
            </div>
          )}
        </>
          )}
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
