"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
  userRole, // Asegúrate de que le pasas el rol de usuario como prop
  userPlant, // Asegúrate de que le pasas la planta de usuario como prop
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
  userRole: string;
  userPlant: string;
}) {
  const [activeTeam, setActiveTeam] = React.useState<null | { name: string; logo: React.ElementType; plan: string }>(null);

  React.useEffect(() => {
    if (teams.length > 0) {
      const displayPlant = userPlant === "All" ? "Todas las plantas" : userPlant.replace(/_/g, " ");
      setActiveTeam({
        name: userRole || "No Role", // Usa el rol del usuario
        logo: teams[0].logo, // Usa el logo del primer equipo
        plan: displayPlant || "No Plant", // Usa la planta del usuario formateada
      });
    }
  }, [teams, userRole, userPlant]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="flex items-center bg-[#F0F4FF] text-[#0B1B30] rounded-md p-2 hover:bg-[#E0E7FF] transition-colors duration-200 cursor-default"
            >
              {activeTeam ? (
                <>
                  <div className="flex aspect-square h-8 w-8 items-center justify-center rounded-lg bg-[#E0E7FF] text-[#0B1B30]">
                    <activeTeam.logo className="h-4 w-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">{activeTeam.name}</span>
                    <span className="truncate text-xs">{activeTeam.plan}</span>
                  </div>
                </>
              ) : (
                <span>No hay equipos disponibles</span>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
