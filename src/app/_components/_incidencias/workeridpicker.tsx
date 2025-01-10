"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
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

interface SelectedWorker {
    numeroWD: string;
    nombre: string;
  }
  

  interface IdPickerProps {
    selectedWorker: SelectedWorker;
    onChange: (worker: SelectedWorker) => void;  // Cambia a un tipo directo
  }
  

export function IdPicker({ selectedWorker, onChange }: IdPickerProps) {
  const [open, setOpen] = useState(false);
  const [trabajadoresWD, setTrabajadoresWD] = useState<SelectedWorker[]>([]);
  const [loading, setLoading] = useState(true);

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
          {selectedWorker.numeroWD || "Selecciona un trabajador..."} 
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Buscar Id..." />
          <CommandList>
            {trabajadoresWD.length > 0 ? (
              <CommandGroup>
                {trabajadoresWD.map((trabajador) => (
                  <CommandItem
                  key={trabajador.numeroWD}
                  onSelect={() => {
                    const selectedValue: SelectedWorker = {
                      numeroWD: trabajador.numeroWD,
                      nombre: trabajador.nombre,
                    };
                    onChange(selectedValue);
                    setOpen(false);
                  }}
                  
                >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWorker.numeroWD === trabajador.numeroWD ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {trabajador.numeroWD} - {trabajador.nombre} 
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
