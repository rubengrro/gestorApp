import * as React from "react"
import { CheckCircle2, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

// Opciones para "Usuarios con acceso", excluyendo Superadministrador y Administrador de la UI
const rolesOptions = [
  { value: "Supervisor", label: "Supervisor" },
  { value: "Gerente", label: "Gerente" },
  { value: "Inplant", label: "Inplant" },
  { value: "Ri", label: "RI" },
  { value: "GPS", label: "GPS" },
]

type RolesSelectorProps = {
  selectedRoles: string[]
  onRoleChange: (updatedRoles: string[]) => void
}

export function RolesSelector({ selectedRoles, onRoleChange }: RolesSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Los roles predeterminados Superadministrador y Administrador solo se incluyen una vez
  const baseRoles = ["Superadministrador", "Administrador"]
  const uniqueRoles = Array.from(new Set([...baseRoles, ...selectedRoles]))

  const toggleRole = (role: string) => {
    const updatedRoles = uniqueRoles.includes(role)
      ? uniqueRoles.filter((r) => r !== role) // Eliminar si ya está seleccionado
      : [...uniqueRoles, role] // Agregar si no está seleccionado
    onRoleChange(updatedRoles)
  }

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start min-h-[48px]" // Aumentar altura mínima
          >
            {uniqueRoles.length > 2 ? ( // Checar si tiene roles adicionales a los predefinidos
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto"> {/* Contenedor flexible */}
                {uniqueRoles
                  .filter((role) => role !== "Superadministrador" && role !== "Administrador")
                  .map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
              </div>
            ) : (
              <>+ Agregar usuarios con acceso</>
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
                  <CommandItem key={role.value} onSelect={() => toggleRole(role.value)}>
                    <PlusCircle
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRoles.includes(role.value) ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{role.label}</span>
                    {selectedRoles.includes(role.value) && (
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
  )
}
