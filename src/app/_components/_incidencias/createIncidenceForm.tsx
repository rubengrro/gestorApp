// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Edit2 } from "lucide-react" // Icono de ejemplo, puedes cambiarlo

// export function createIncidenceForm() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" className="rounded-full p-2">
//           <Edit2 size={16} /> {/* Icono de edición */}
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Editar perfil</DialogTitle>
//           <DialogDescription>
//             Realiza cambios en el perfil y guarda cuando hayas terminado.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="name" className="text-right">
//               Nombre
//             </Label>
//             <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
//           </div>
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="username" className="text-right">
//               Usuario
//             </Label>
//             <Input id="username" defaultValue="@peduarte" className="col-span-3" />
//           </div>
//         </div>
//         <DialogFooter>
//           <Button type="submit">Guardar cambios</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
