/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PresentacionFormsDialog } from "./presentacion-formulario";
import { remove as removeDiacritics } from "diacritics";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface IncidenciaCatalogo {
  id: string;
  infotype: string;
  concepto: string;
  nombreSubtipo: string;
  rolesAcceso: string[];
  requiereAprobacion: boolean;
  configuracion: any;
  createdAt: Date;
  updatedAt: Date;
}

export function PresentacionIncidenciaPicker() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [incidencias, setIncidencias] = useState<IncidenciaCatalogo[]>([]);
  const [filteredIncidencias, setFilteredIncidencias] = useState<IncidenciaCatalogo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncidencia, setSelectedIncidencia] = useState<IncidenciaCatalogo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const response = await fetch("/api/incidencias");
        if (!response.ok) throw new Error("Error al obtener las incidencias");
        const data: IncidenciaCatalogo[] = await response.json();
        setIncidencias(data);
        setFilteredIncidencias(data);
      } catch (error) {
        console.error("Error al obtener incidencias:", error);
      }
    };
    fetchIncidencias();
  }, []);

  const handleSelectIncidencia = (id: string) => {
    const selected = incidencias.find((incidencia) => incidencia.id === id);
    if (selected) {
      setSelectedIncidencia(selected);
      setIsDialogOpen(true);
      setOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Normaliza texto: elimina acentos, convierte a minúsculas y remueve espacios extra
  const normalizeText = (text: string): string =>
    removeDiacritics(text).toLowerCase().trim().replace(/\s+/g, " ");

  useEffect(() => {
    const normalizedSearchTerm = normalizeText(searchTerm);

    const results = incidencias.filter((incidencia) => {
      const normalizedSubtipo = normalizeText(incidencia.nombreSubtipo);
      const normalizedConcepto = normalizeText(incidencia.concepto);

      const matchesSearchTerm =
        normalizedSubtipo.includes(normalizedSearchTerm) ||
        normalizedConcepto.includes(normalizedSearchTerm);

      if (userRole === "Superadministrador" || userRole === "Administrador") {
        return matchesSearchTerm;
      }

      return (
        incidencia.rolesAcceso.includes(userRole || "") && matchesSearchTerm
      );
    });

    setFilteredIncidencias(results);
  }, [searchTerm, incidencias, userRole]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-auto justify-between bg-blue-700 text-white font-semibold"
          >
            {selectedIncidencia
              ? `${selectedIncidencia.nombreSubtipo} - ${selectedIncidencia.concepto}`
              : "Nuevo Registro"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Command>
            <CommandInput
              placeholder="Buscar incidencia..."
              value={searchTerm}
              onValueChange={(value: string) => setSearchTerm(value)}
              className="h-9 text-sm"
            />
            <ScrollArea className="max-h-full p-2">
              <CommandList className="space-y-0">
                <CommandEmpty>No se encontraron incidencias.</CommandEmpty>
                <CommandGroup>
                  {filteredIncidencias.map((incidencia) => (
                    <React.Fragment key={incidencia.id}>
                      <CommandItem
                        onSelect={() => handleSelectIncidencia(incidencia.id)}
                        className="text-sm flex-col items-start cursor-pointer h-auto"
                      >
                        <span className="font-semibold text-sm">
                          {incidencia.nombreSubtipo}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {incidencia.concepto}
                        </span>
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedIncidencia?.id === incidencia.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <Separator />
                      </CommandItem>
                    </React.Fragment>
                  ))}
                </CommandGroup>
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedIncidencia && isDialogOpen && (
        <PresentacionFormsDialog
          selectedIncidencia={selectedIncidencia}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
