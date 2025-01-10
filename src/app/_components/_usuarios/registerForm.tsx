"client";

import React, { useState, useTransition } from "react";
import { Role, Planta } from "@prisma/client";
import { signupSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { registerAction } from "@/actions/auth-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { User } from "@/types";

interface RegisterFormProps {
  onUserAdded: (user: User) => void;
}

function RegisterForm({ onUserAdded }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "Supervisor",
      plant: "All",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    startTransition(async () => {
      setError(null);
      const response = await registerAction(values);
      if (response.error) {
        setError(response.error);
      } else if (response.user) {
        onUserAdded({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          password: response.user.password,
          role: response.user.role,
          plant: response.user.plant,
          image: response.user.image || undefined, 
          createdAt: new Date(response.user.createdAt),
          updatedAt: new Date(response.user.updatedAt),
        });
        form.reset();
        setOpen(false);
      }
    });
  }
  
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nuevo usuario</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl mx-auto p-4">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            {/* Campos básicos */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Correo electrónico" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input placeholder="Contraseña" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planta</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una planta" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Planta).map((planta) => (
                          <SelectItem key={planta} value={planta}>
                            {planta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Role).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={isPending}>
                Crear usuario
              </Button>
            </div>
            {error && <p className="col-span-2 text-red-500 text-center">{error}</p>}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterForm;
