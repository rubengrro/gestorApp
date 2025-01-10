/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomField } from "@/types/types";

interface PopoverFieldCreatorProps {
  onFieldAdd: (field: CustomField) => void;
}

export function PopoverFieldCreator({ onFieldAdd }: PopoverFieldCreatorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [fieldType, setFieldType] = useState<CustomField["type"] | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fileFormats, setFileFormats] = useState<string[]>([]);
  const [amountFormat, setAmountFormat] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [textFormat, setTextFormat] = useState<string | null>(null);
  const [includeInOutput, setIncludeInOutput] = useState(false);
  const [characterLimit, setCharacterLimit] = useState<number>(200);
  const [selectOptions, setSelectOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const toggleFileFormat = (format: string) => {
    setFileFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const addOption = () => {
    if (newOption) {
      setSelectOptions((prev) => [...prev, newOption]);
      setNewOption(""); // Limpia el input después de añadir la opción
    }
  };

  const removeOption = (index: number) => {
    setSelectOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldCreation = () => {
    if (!fieldType || !fieldName) return; // Validación simple antes de continuar
  
    const newField: CustomField = {
      type: fieldType!,
      name: fieldName,
      content: "", // Inicializa con un valor vacío o predeterminado
      options: {
        placeholder: fieldPlaceholder,
        includeInOutput,
        options: fieldType === "select" ? selectOptions : undefined,
      },
    };
  
    onFieldAdd(newField);
    resetForm();
    setIsPopoverOpen(false); // Cierra el Popover
  };
  

  const resetForm = () => {
    setStep(1);
    setFieldType(null);
    setFieldName("");
    setFieldPlaceholder("");
    setFileFormats([]);
    setAmountFormat(null);
    setCurrency("USD");
    setTextFormat(null);
    setIncludeInOutput(false);
    setCharacterLimit(200);
    setSelectOptions([]);
    setNewOption("");
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" onClick={() => setIsPopoverOpen(true)}>
          Añadir Campo Personalizado
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="grid gap-4">
          {step === 1 && (
            <div>
              <h4 className="font-medium">Selecciona el tipo de campo</h4>
              <div className="grid gap-2">
                <Button variant="outline" onClick={() => { setFieldType("file"); handleNextStep(); }}>Archivo</Button>
                <Button variant="outline" onClick={() => { setFieldType("amount"); handleNextStep(); }}>Cantidad</Button>
                <Button variant="outline" onClick={() => { setFieldType("text"); handleNextStep(); }}>Texto</Button>
                <Button variant="outline" onClick={() => { setFieldType("select"); handleNextStep(); }}>Selección</Button>
                {/* Eliminado el botón para selección desde API */}
              </div>
            </div>
          )}

          {step === 2 && fieldType === "file" && (
            <div>
              <h4 className="font-medium">Configura el Campo de Archivo</h4>
              <Label>Nombre del Campo</Label>
              <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="Nombre del Campo" />
              <Label className="mt-2">Placeholder del Campo</Label>
              <Input value={fieldPlaceholder} onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Placeholder del Campo" />
              <Label className="mt-2">Formatos Aceptados</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["jpg", "jpeg", "png", "pdf", "xlsx", "txt"].map((format) => (
                  <div key={format} className="flex items-center">
                    <Checkbox id={format} checked={fileFormats.includes(format)} onCheckedChange={() => toggleFileFormat(format)} />
                    <Label htmlFor={format} className="ml-2">{format.toUpperCase()}</Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePreviousStep}>Atrás</Button>
                <Button variant="outline" onClick={handleNextStep} disabled={!fieldName || fileFormats.length === 0}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 2 && fieldType === "select" && (
            <div>
              <h4 className="font-medium">Configura el Campo de Selección</h4>
              <Label>Nombre del Campo</Label>
              <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="Nombre del Campo" />
              <Label className="mt-2">Opciones de Selección Personalizadas</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="Nueva opción" />
                <Button variant="outline" onClick={addOption}>Añadir</Button>
              </div>
              <ul className="mt-2">
                {selectOptions.map((option, index) => (
                  <li key={index} className="p-1 flex items-center">
                    {option}
                    <Button variant="ghost" onClick={() => removeOption(index)}>❌</Button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePreviousStep}>Atrás</Button>
                <Button variant="outline" onClick={handleNextStep} disabled={!fieldName || selectOptions.length === 0}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 2 && fieldType === "amount" && (
            <div>
              <h4 className="font-medium">Configura el Campo de Cantidad</h4>
              <Label>Nombre del Campo</Label>
              <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="Nombre del Campo" />
              <Label className="mt-2">Placeholder del Campo</Label>
              <Input value={fieldPlaceholder} onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Placeholder del Campo" />
              <Label className="mt-2">Formato de Cantidad</Label>
              <select onChange={(e) => setAmountFormat(e.target.value)} className="w-full mt-2">
                <option value="">Seleccione un formato</option>
                <option value="fecha">Fecha</option>
                <option value="dinero">Dinero</option>
                <option value="numero">Número</option>
              </select>
              {amountFormat === "dinero" && (
                <div className="mt-4">
                  <Label>Seleccionar Moneda</Label>
                  <select onChange={(e) => setCurrency(e.target.value)} className="w-full mt-2">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                  </select>
                </div>
              )}
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePreviousStep}>Atrás</Button>
                <Button variant="outline" onClick={handleNextStep} disabled={!fieldName || !amountFormat}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 2 && fieldType === "text" && (
            <div>
              <h4 className="font-medium">Configura el Campo de Texto</h4>
              <Label>Nombre del Campo</Label>
              <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="Nombre del Campo" />
              <Label className="mt-2">Placeholder del Campo</Label>
              <Input value={fieldPlaceholder} onChange={(e) => setFieldPlaceholder(e.target.value)} placeholder="Placeholder del Campo" />
              <Label className="mt-2">Formato de Texto</Label>
              <select onChange={(e) => setTextFormat(e.target.value)} className="w-full mt-2">
                <option value="">Seleccione un formato</option>
                <option value="textoPlano">Texto Plano</option>
                <option value="comentarios">Comentarios</option>
                <option value="email">Email</option>
              </select>
              {textFormat === "textoPlano" && (
                <div className="mt-4">
                  <Label>Límite de Caracteres</Label>
                  <Input type="number" value={characterLimit} onChange={(e) => setCharacterLimit(Number(e.target.value))} placeholder="200" />
                </div>
              )}
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePreviousStep}>Atrás</Button>
                <Button variant="outline" onClick={handleNextStep} disabled={!fieldName || !textFormat}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h4 className="font-medium">Configuración Final</h4>
              <div className="flex items-center">
                <Checkbox checked={includeInOutput} onCheckedChange={() => setIncludeInOutput((prev) => !prev)} />
                <Label className="ml-2">¿Incluir en archivo de salida?</Label>
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePreviousStep}>Atrás</Button>
                <Button variant="outline" onClick={handleFieldCreation}>Guardar Campo</Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
