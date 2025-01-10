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
import { getSession } from "next-auth/react";

interface SelectedApprover {
  id: string;
  nombre: string;
}

interface ApproverPickerProps {
  selectedApprover: SelectedApprover;
  onChange: (approver: SelectedApprover) => void;
  planta: string;
  incidenciaTipo: string;
}

export function PrimerAprobadorPicker({
  selectedApprover,
  onChange,
  planta,
  incidenciaTipo,
}: ApproverPickerProps) {
  const [open, setOpen] = useState(false);
  const [usuariosAprobadores, setUsuariosAprobadores] = useState<SelectedApprover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuariosAprobadores = async () => {
      const session = await getSession();
      if (session) {
        try {
          const response = await fetch(
            `/api/usuarios?rol=gerente&planta=${planta}&incidenciaTipo=${incidenciaTipo}`
          );
          if (!response.ok) {
            throw new Error("Error al obtener los usuarios aprobadores");
          }
          const data = await response.json();
          setUsuariosAprobadores(data || []);
        } catch (error) {
          console.error("Error fetching usuarios aprobadores:", error);
        }
      }
      setLoading(false);
    };

    fetchUsuariosAprobadores();
  }, [planta, incidenciaTipo]);

  if (loading) {
    return <div>Cargando aprobadores...</div>;
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
          {selectedApprover.nombre || "Selecciona un aprobador..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Buscar aprobador..." />
          <CommandList>
            {usuariosAprobadores.length > 0 ? (
              <CommandGroup>
                {usuariosAprobadores.map((usuario) => (
                  <CommandItem
                    key={usuario.id}
                    onSelect={() => {
                      onChange(usuario);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedApprover.id === usuario.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {usuario.nombre}
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
