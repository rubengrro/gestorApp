"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSession } from 'next-auth/react';

interface Trabajador {
  numeroWD: string;
  nombre: string;
}

interface NamePickerProps {
  selectedName: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export function NamePicker({ selectedName, onChange }: NamePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(selectedName || ""); // Inicializa el valor como el nombre
  const [loading, setLoading] = useState(true);
  const [trabajadoresWD, setTrabajadoresWD] = useState<Trabajador[]>([]);

  useEffect(() => {
    const fetchTrabajadores = async () => {
      const session = await getSession();
      if (session) {
        try {
          const response = await fetch("/api/trabajadores?catalogo=true");
          if (!response.ok) {
            throw new Error('Error al obtener los trabajadores');
          }
          const data = await response.json();
          setTrabajadoresWD(data || []);
        } catch (error) {
          console.error('Error fetching trabajadores:', error);
        }
      }
      setLoading(false);
    };

    fetchTrabajadores();
  }, []);

  if (loading) {
    return <div>Cargando trabajadores...</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-auto justify-between"
        >
          {value || "Selecciona un trabajador..."} {/* Aquí se muestra el nombre */}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Buscar Nombre..." />
          <CommandList>
            {trabajadoresWD.length > 0 ? (
              <CommandGroup>
                {trabajadoresWD.map((trabajador) => (
                  <CommandItem
                    key={trabajador.numeroWD}
                    value={trabajador.nombre}
                    onSelect={(currentValue) => {
                      const selectedValue = currentValue === value ? "" : currentValue;
                      setValue(selectedValue); // Actualiza el valor con el nombre
                      onChange(selectedValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === trabajador.nombre ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {trabajador.nombre} {/* Muestra el nombre del trabajador aquí */}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>Sin resultados</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
