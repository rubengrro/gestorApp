/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { GalleryVerticalEnd, Home, Network, NotebookPen } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

const MainComponent = () => {
  const { data: session } = useSession(); 

  const user = session?.user || {};
  const plant = user.plant || "No Plant"; 
  const role = user.role === "Superadministrador" ? "Super Administrador" : (user.role || "No Role");

  const data = {
    user: {
      name: user.name || "Usuario Desconocido",  
      email: user.email || "email@desconocido.com",  
      avatar: "/avatars/shadcn.jpg",  
    },
    teams: [
      {
        name: role, // Muestra el rol del usuario
        logo: GalleryVerticalEnd,
        plan: plant, // Muestra la planta del usuario
      },
    ],
    navMain: [
      {
        title: "Home",
        url: "/dashboard/home",
        icon: Home,
      },
      {
        title: "Incidencias",
        url: "#",
        icon: NotebookPen,
        isActive: true,
        items: [
          {
            title: "Registros",
            url: "/dashboard/tablero",
          },
          // {
          //   title: "Papelera de reciclaje",
          //   url: "/dashboard/papelera",
          // },
          {
            title: "Histórico",
            url: "/dashboard/historico",
          },
          // ...(role === "Super Administrador" || role === "Administrador" ? [
          //   {
          //     title: "Neto",
          //     url: "/dashboard/neto",
          //   },
          // ] : []),
          // },
          // ...(role === 'Administrador' || role === 'Gerente' ? [] : [{
          //     title: "Nuevo registro",
          //     url: "/dashboard/registro",
          // }]),
          // {
          //   title: "Histórico",
          //   url: "/dashboard/historico",
          // },
        ],
      },
      {
        title: "Administración",
        url: "#",
        icon: Network,
        isActive: false,
        items: [
          // {
          //   title: "Periodos",
          //   url: "/dashboard/periodos",
          // },
          {
            title: "Catálogo de incidencias",
            url: "/dashboard/incidencias",
          },
          {
            title: "Listado de trabajadores",
            url: "/dashboard/trabajadores",
          },
          // Agregar el nuevo item solo si el rol es Super Administrador
          ...(role === 'Super Administrador' ? [{
            title: "Usuarios",
            url: "/dashboard/usuarios",
          }] : []), // Solo se incluye si el rol del usuario es Super Administrador
          // {
          //   title: "Documentos",
          //   url: "/dashboard/documentos",
          // },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} userRole={role} userPlant={plant} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return <MainComponent {...props} />;
}
