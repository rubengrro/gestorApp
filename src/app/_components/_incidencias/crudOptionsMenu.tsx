// "use client"

// import * as React from "react"
// import {
//   NavigationMenu,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu"

// // Configuración de los elementos del menú para CRUD
// const menuItems = [
//   {
//     title: "Editar",
//     href: "/editar-incidencia",
//     description: "Modificar los detalles de la incidencia seleccionada.",
//   },
//   {
//     title: "Eliminar",
//     href: "/eliminar-incidencia",
//     description: "Eliminar esta incidencia de manera permanente.",
//   },
//   {
//     title: "Ver Detalles",
//     href: "/detalles-incidencia",
//     description: "Consultar toda la información de esta incidencia.",
//   },
// ]

// export function IncidenciaMenu() {
//   return (
//     <NavigationMenu>
//       <NavigationMenuList>
//         <NavigationMenuItem>
//           <NavigationMenuTrigger>Operaciones CRUD</NavigationMenuTrigger>
//           <NavigationMenuContent>
//             <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
//               <li className="row-span-3">
//                 <NavigationMenuLink asChild>
//                   <a
//                     className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
//                     href="#"
//                   >
//                     {/* Emoji como ícono de ejemplo */}
//                     <div className="h-6 w-6 text-3xl">📁</div>
//                     <div className="mb-2 mt-4 text-lg font-medium">
//                       Catálogo de Incidencias
//                     </div>
//                     <p className="text-sm leading-tight text-muted-foreground">
//                       Realiza operaciones CRUD sobre las incidencias en el
//                       sistema, como editar, eliminar o ver detalles específicos
//                       de cada incidencia.
//                     </p>
//                   </a>
//                 </NavigationMenuLink>
//               </li>
//               {menuItems.map((item) => (
//                 <CrudListItem
//                   key={item.title}
//                   title={item.title}
//                   href={item.href}
//                 >
//                   {item.description}
//                 </CrudListItem>
//               ))}
//             </ul>
//           </NavigationMenuContent>
//         </NavigationMenuItem>
//       </NavigationMenuList>
//     </NavigationMenu>
//   )
// }

// // Componente ListItem adaptado para las opciones de CRUD
// const CrudListItem = React.forwardRef<
//   React.ElementRef<"a">,
//   React.ComponentPropsWithoutRef<"a">
// >(({ className, title, children, ...props }, ref) => {
//   return (
//     <li>
//       <NavigationMenuLink asChild>
//         <a
//           ref={ref}
//           className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
//           {...props}
//         >
//           <div className="text-sm font-medium leading-none">{title}</div>
//           <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//             {children}
//           </p>
//         </a>
//       </NavigationMenuLink>
//     </li>
//   )
// })
// CrudListItem.displayName = "CrudListItem"

// export default IncidenciaMenu
