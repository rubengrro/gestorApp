import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RolesSelector } from "./RolesSelector"
import { Switch } from "@/components/ui/switch"
import { IncidenciaCatalogo } from "@prisma/client"

// Definición del esquema Zod para validar el formulario
export const incidenciaDataSchema = z.object({
  infotype: z.string().nonempty("El infotipo es requerido"),
  concepto: z.string().nonempty("El concepto es requerido"),
  nombreSubtipo: z.string().nonempty("El nombre del subtipo es requerido"),
  rolesAcceso: z
    .array(z.enum(["Superadministrador", "Administrador", "Inplant", "Ri", "Gerente", "GPS", "Supervisor"]))
    .nonempty("Selecciona al menos un usuario con acceso"),
  requiereAprobacion: z.boolean().default(false),
  plantaAcceso: z.array(z.string()).optional(),
})

interface IncidenciaCatFormProps {
  onAddIncidencia: (newIncidencia: Omit<IncidenciaCatalogo, "id" | "configuracion" | "createdAt" | "updatedAt">) => void
}

export function IncidenciaCatForm({ onAddIncidencia }: IncidenciaCatFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof incidenciaDataSchema>>({
    resolver: zodResolver(incidenciaDataSchema),
    defaultValues: {
      infotype: "",
      concepto: "",
      nombreSubtipo: "",
      requiereAprobacion: false,
      rolesAcceso: ["Superadministrador", "Administrador"],
    },
  })

  async function onSubmit(data: z.infer<typeof incidenciaDataSchema>) {
    try {
      const response = await fetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([data]),
      })

      if (!response.ok) {
        throw new Error("Error al enviar los datos")
      }

      console.log("Incidencia creada exitosamente")
      form.reset()
      setOpen(false)

      onAddIncidencia({
        ...data,
        requiereAprobacion: data.requiereAprobacion || false,
      })
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cargar incidencia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Incidencia</DialogTitle>
          <DialogDescription>
            Añade una nueva incidencia al catálogo. Completa los campos y guarda los cambios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
            {/* Campo Infotipo */}
            <FormField
              control={form.control}
              name="infotype"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Infotipo</FormLabel>
                  <Input placeholder="Ingresa el infotipo" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Nombre Subtipo */}
            <FormField
              control={form.control}
              name="nombreSubtipo"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nombre Subtipo</FormLabel>
                  <Input placeholder="Ingresa el nombre del subtipo" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Concepto */}
            <FormField
              control={form.control}
              name="concepto"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Concepto</FormLabel>
                  <Input placeholder="Ingresa el concepto" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Requiere Aprobación con Switch */}
            <FormField
              control={form.control}
              name="requiereAprobacion"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start col-span-2 mt-4">
                  <FormLabel>Requiere Aprobación</FormLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    className="mt-2"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Usuarios con Acceso usando RolesSelector */}
            <FormField
              control={form.control}
              name="rolesAcceso"
              render={() => (
                <FormItem className="col-span-2">
                  <FormLabel>Usuarios con Acceso</FormLabel>
                  <Controller
                    control={form.control}
                    name="rolesAcceso"
                    render={({ field }) => (
                      <RolesSelector
                        selectedRoles={field.value}
                        onRoleChange={(updatedRoles: string[]) => field.onChange(updatedRoles)}
                      />
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="col-span-2">
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
