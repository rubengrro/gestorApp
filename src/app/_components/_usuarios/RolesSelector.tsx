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

const rolesOptions = [
  { value: "Super Administrador", label: "Super Administrador" },
  { value: "Administrador", label: "Administrador" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Gerente", label: "Gerente" },
  { value: "Inplant", label: "Inplant" },
  { value: "Ri", label: "RI" },
  { value: "GPS", label: "GPS" },
];

type RoleSelectorProps = {
  selectedRole: string;
  onRoleChange: (updatedRole: string) => void;
};

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start min-h-[48px]">
            {selectedRole ? (
              <Badge variant="secondary">{selectedRole}</Badge>
            ) : (
              <>+ Seleccionar Rol</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full max-w-xs" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Buscar rol..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {rolesOptions.map((role) => (
                  <CommandItem key={role.value} onSelect={() => onRoleChange(role.value)}>
                    <PlusCircle
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRole === role.value ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{role.label}</span>
                    {selectedRole === role.value && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
