import * as React from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const filterOptions = [
  { value: "recent", label: "Más recientes primero" },
  { value: "oldest", label: "Más antiguas primero" },
  { value: "subtipoAsc", label: "Subtipo ascendente" },
  { value: "subtipoDesc", label: "Subtipo descendente" },
  { value: "trabajadorAsc", label: "Trabajador ascendente" },
  { value: "trabajadorDesc", label: "Trabajador descendente" },
];

export function AdvancedFilter({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null);

  const handleSelectFilter = (value: string) => {
    setSelectedFilter(value);
    setOpen(false);
    onFilterChange(value); // Notifica el cambio
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedFilter
            ? filterOptions.find((option) => option.value === selectedFilter)?.label
            : "Seleccionar filtro..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar filtro..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró el filtro.</CommandEmpty>
            <CommandGroup>
              {filterOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelectFilter(option.value)}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedFilter === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
