import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PenBoxIcon, X } from "lucide-react";
import { FieldConfigBtn } from "./incidenceFieldConfig";
import { v4 as uuidv4 } from "uuid";
import { FieldConfig } from "@/types/types";

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "file", label: "Archivo" },
  { value: "select", label: "Select" },
];

type Field = {
  id: string | number | null;
  name: string;
  type: string;
  config: FieldConfig;
};

type CreateIncidenceFormProps = {
  infotype: string;
  concepto: string;
  nombreSubtipo: string;
  rolesAcceso: string[];
  incidenciaId: number;
  onSave: (fields: Field[]) => void;
};

export const CreateIncidenceForm: React.FC<CreateIncidenceFormProps> = ({
  infotype,
  concepto,
  nombreSubtipo,
  rolesAcceso,
  onSave,
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormExist] = useState(false);

  const handleFieldConfigChange = (fieldId: string | number | null, newConfig: FieldConfig) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, config: { ...newConfig } } : field
      )
    );
  };
  
  const addField = () => {
    if (selectedType) {
      const newField: Field = {
        id: uuidv4(),
        name: "Campo Nuevo",
        type: selectedType,
        config: { nombre: "Campo Nuevo", tipo: selectedType },
      };
      setFields((prevFields) => [...prevFields, newField]);
      setSelectedType(null);
    }
  };

  const removeFieldFromForm = (id: string | number | null) => {
    setFields((prevFields) => prevFields.filter((field) => field.id !== id));
  };

  const filteredRoles = rolesAcceso.filter(
    (role) => role !== "Superadministrador" && role !== "Administrador"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full p-2">
          <PenBoxIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Formulario de Incidencia</DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span><strong>Infotipo:</strong> {infotype}</span>
            <span><strong>Concepto:</strong> {concepto}</span>
            <span><strong>Subtipo:</strong> {nombreSubtipo}</span>
            <div className="flex gap-1 flex-wrap mt-2">
              <strong>Usuarios con Acceso:</strong>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">
                  Acceso para Superadministrador y Administrador
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {isFormExist && !isEditing ? (
          <>
            <p className="text-gray-500">Formulario ya existe y está deshabilitado.</p>
            <Button onClick={() => setIsEditing(true)} variant="secondary" className="mt-4">
              Editar Formulario
            </Button>
          </>
        ) : (
          <form onSubmit={() => onSave(fields)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fieldType" className="text-right">
                  Tipo de Campo
                </Label>
                <Select onValueChange={(value) => setSelectedType(value)} value={selectedType || ""}>
                  <SelectTrigger className="w-full col-span-2">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={addField}
                  disabled={!selectedType}
                  className="ml-2 px-6 py-2 w-full text-sm"
                  variant="ghost"
                >
                  Agregar
                </Button>
              </div>

              <hr className="my-4 border-gray-300" />

              {fields.length > 0 ? (
                fields.map((field) => (
                  <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-3 flex items-center space-x-2">
                      {field.config.isCurrency && field.config.currencyType && (
                        <span className="text-gray-500">
                          {field.config.currencyType === "USD"
                            ? "$"
                            : field.config.currencyType === "EUR"
                            ? "€"
                            : "MXN"}
                        </span>
                      )}
                      <Input
                        value={field.config.defaultValue || ""}
                        onChange={(e) => handleFieldConfigChange(field.id, { ...field.config, defaultValue: e.target.value })}
                        placeholder={field.config.placeholder || field.config.nombre || "Campo"}
                        className="flex-grow"
                        disabled={isFormExist && !isEditing}
                        type={field.type === "number" ? "number" : "text"}
                        maxLength={field.config.maxLength}
                        min={field.type === "number" ? field.config.min : undefined}
                        max={field.type === "number" ? field.config.max : undefined}
                        pattern={field.type === "text" && field.config.isEmail ? "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" : undefined}
                      />
                      {/* <Input
  value={field.config.defaultValue || field.config.nombre || ""}
  onChange={(e) =>
    handleFieldConfigChange(field.id, { ...field.config, defaultValue: e.target.value })
  }
  className="flex-grow"
  disabled={isFormExist && !isEditing}
  type={field.type === "number" ? "number" : "text"}
  maxLength={field.config.maxLength}
  min={field.type === "number" ? field.config.min : undefined}
  max={field.type === "number" ? field.config.max : undefined}
  pattern={
    field.type === "text" && field.config.isEmail
      ? "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      : undefined
  }
/> */}

                    </div>
                    <div className="flex space-x-2 items-center">
                      <FieldConfigBtn
                        id={typeof field.id === "number" ? field.id : null}
                        isFormExist={isFormExist}
                        isEditing={isEditing}
                        fieldType={field.type}
                        config={field.config}
                        onConfirm={(id, newConfig) => handleFieldConfigChange(id, newConfig)}
                        onCancel={(id) => removeFieldFromForm(id)}
                      />
                      <Button
                        variant="destructive"
                        onClick={() => field.id !== null && removeFieldFromForm(field.id)}
                        disabled={isFormExist && !isEditing}
                        className="p-1 rounded-full h-6 w-6 flex items-center justify-center"
                      >
                        <X size={10} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay campos en este formulario.</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isFormExist && !isEditing}>
                {isFormExist ? "Actualizar Formulario" : "Guardar Formulario"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
