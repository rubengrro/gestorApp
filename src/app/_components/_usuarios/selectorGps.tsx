import * as React from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Approver = {
  id: string;
  name: string;
  role: string; // Rol del aprobador, como "Gps"
};

type ApproversSelectorProps = {
  approvers: Approver[]; // Lista de aprobadores disponibles
  selectedApprovers: Approver[]; // Lista seleccionada
  onApproverChange: (updatedApprovers: Approver[]) => void; // Callback para actualizar seleccionados
};
export function SelectorGps({
  selectedApprovers,
  onApproverChange,
}: ApproversSelectorProps) {
  const [approvers, setApprovers] = React.useState<Approver[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Fetch para obtener la lista de gps
  React.useEffect(() => {
    const fetchGerentes = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/users?role=GPS"); // Endpoint para obtener gps
        if (!response.ok) throw new Error("Error al cargar gps");
        const data: Approver[] = await response.json();
        setApprovers(data);
      } catch (error) {
        console.error("Error al cargar gps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGerentes();
  }, []);

  // Manejar selección y deselección de gps
  const toggleApprover = (approver: Approver) => {
    const alreadySelected = selectedApprovers.some((a) => a.id === approver.id);
    const updatedApprovers = alreadySelected
      ? selectedApprovers.filter((a) => a.id !== approver.id) // Eliminar si ya está seleccionado
      : [...selectedApprovers, approver]; // Agregar si no está seleccionado
    onApproverChange(updatedApprovers);
  };

  // Filtrar gps según la búsqueda
  const filteredApprovers = approvers.filter((approver) =>
    approver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
  <Button
    variant="outline"
    size="sm"
    className="w-full justify-start min-h-[48px]" // Aumentar altura mínima
  >
    {selectedApprovers.length > 0 ? (
      <div className="flex items-center gap-2 max-h-32 overflow-hidden">
        {selectedApprovers.slice(0, 2).map((approver) => (
          <Badge key={approver.id} variant="secondary">
            {approver.name}
          </Badge>
        ))}
        {selectedApprovers.length > 2 && (
          <span className="text-muted-foreground">
            ... y {selectedApprovers.length - 2} más
          </span>
        )}
      </div>
    ) : (
      <>+ Seleccionar usuarios GPS</>
    )}
  </Button>
</PopoverTrigger>
        <PopoverContent className="p-0 w-full max-w-xs" side="bottom" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar gps..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>Cargando gps...</CommandEmpty>
              ) : filteredApprovers.length > 0 ? (
                <CommandGroup>
                  {filteredApprovers.map((approver) => (
                    <CommandItem key={approver.id} onSelect={() => toggleApprover(approver)}>
                      <PlusCircle
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedApprovers.some((a) => a.id === approver.id)
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span>
                        {approver.name} ({approver.role})
                      </span>
                      {selectedApprovers.some((a) => a.id === approver.id) && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
