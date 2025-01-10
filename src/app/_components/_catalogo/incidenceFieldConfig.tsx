import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldConfig } from "@/types/types";

type FieldConfigBtnProps = {
  id: number | null;
  isFormExist: boolean;
  isEditing: boolean;
  fieldType: string;
  config: FieldConfig;
  onConfirm: (id: number | null, config: FieldConfig) => void;
  onCancel: (id: number | null) => void;
};

export function FieldConfigBtn({
  id,
  isFormExist,
  isEditing,
  fieldType,
  config: initialConfig,
  onConfirm,
  onCancel,
}: FieldConfigBtnProps) {
  const [config, setConfig] = useState<FieldConfig>(initialConfig);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleConfigChange = (field: keyof FieldConfig, value: unknown) => {
    setConfig((prevConfig) => {
      const updatedConfig = {
        ...prevConfig,
        [field]: value,
      };
      // Notificar al padre cada vez que haya un cambio en la configuración
      onConfirm(id, updatedConfig);
      return updatedConfig;
    });
  };
  

  const handleConfirm = () => {
    onConfirm(id, config);
    setIsOpen(false);
  };

  const handleCancel = () => {
    onCancel(id);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="p-1 rounded-full h-8 w-8 flex items-center justify-center"
          disabled={isFormExist && !isEditing}
          onClick={() => setIsOpen(true)}
        >
          <Ellipsis size={24} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Configuración del Campo</h4>
          </div>

          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={config.nombre || ""}
                onChange={(e) => handleConfigChange("nombre", e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="defaultValue">Valor por defecto</Label>
              <Input
                id="defaultValue"
                value={config.defaultValue || ""}
                onChange={(e) => handleConfigChange("defaultValue", e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
  <Label htmlFor="placeholder">Placeholder</Label>
  <Input
    id="placeholder"
    value={config.placeholder || ""}
    onChange={(e) => handleConfigChange("placeholder", e.target.value)}
    placeholder="Placeholder del campo"
    className="col-span-2 h-8"
/>
</div>

          </div>

          {fieldType === "text" && (
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxLength">Longitud máxima</Label>
              <Input
                id="maxLength"
                type="number"
                value={config.maxLength || ""}
                onChange={(e) => handleConfigChange("maxLength", e.target.valueAsNumber)}
                className="col-span-2 h-8"
              />
            </div>
          )}

          {fieldType === "number" && (
            <>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="min">Valor mínimo</Label>
                <Input
                  id="min"
                  type="number"
                  value={config.min || ""}
                  onChange={(e) => handleConfigChange("min", e.target.valueAsNumber)}
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="max">Valor máximo</Label>
                <Input
                  id="max"
                  type="number"
                  value={config.max || ""}
                  onChange={(e) => handleConfigChange("max", e.target.valueAsNumber)}
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>Tipo de moneda</Label>
                <Select
                  onValueChange={(value) => handleConfigChange("currencyType", value)}
                  value={config.currencyType || ""}
                >
                  <SelectTrigger className="w-full col-span-2">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - $</SelectItem>
                    <SelectItem value="EUR">EUR - €</SelectItem>
                    <SelectItem value="MXN">MXN - $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {fieldType === "select" && (
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="options">Opciones</Label>
              <Input
                id="options"
                value={config.options?.join(", ") || ""}
                onChange={(e) =>
                  handleConfigChange("options", e.target.value.split(",").map((opt) => opt.trim()))
                }
                placeholder="Opción 1, Opción 2"
                className="col-span-2 h-8"
              />
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={handleConfirm}>
              Confirmar
            </Button>
            <Button variant="outline" onClick={handleCancel} className="ml-2">
              Cancelar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
