/* eslint-disable @typescript-eslint/no-unused-vars */
// Desactiva la regla de ESLint que marca variables no utilizadas, ya que algunas configuraciones no requieren uso explícito.

import type { NextAuthConfig } from "next-auth"; // Importa el tipo para la configuración de NextAuth.
import Credentials from "next-auth/providers/credentials"; // Proveedor de credenciales personalizado.
import { loginSchema } from "./lib/zod"; // Esquema de validación para las credenciales.
import prisma from "./lib/db"; // Instancia de Prisma para interactuar con la base de datos.
import bcrypt from "bcryptjs"; // Biblioteca para comparar y encriptar contraseñas.

export default {
  // Configuración de los proveedores de autenticación disponibles.
  providers: [
    Credentials({
      // Define los campos necesarios para el proveedor de credenciales.
      credentials: {
        email: {}, // Campo para el email del usuario.
        password: {}, // Campo para la contraseña del usuario.
      },

      // Función `authorize`: Lógica personalizada para autenticar a un usuario.
      authorize: async (credentials) => {
        // Valida las credenciales recibidas contra el esquema definido con Zod.
        const { data, success } = loginSchema.safeParse(credentials);

        // Si las credenciales no son válidas según el esquema, lanza un error.
        if (!success) {
          throw new Error("Invalid Credentials");
        }

        // Busca al usuario en la base de datos por su email.
        const user = await prisma.user.findUnique({
          where: {
            email: data.email, // Utiliza el email proporcionado en las credenciales.
          },
        });

        // Si el usuario no existe o no tiene contraseña configurada, lanza un error.
        if (!user || !user.password) {
          throw new Error("Invalid Credentials");
        }

        // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos.
        const isValid = await bcrypt.compare(data.password, user.password);

        // Si la contraseña no coincide, lanza un error.
        if (!isValid) {
          throw new Error("Invalid Credentials");
        }

        // Si todo es válido, retorna el objeto `user`, que será utilizado por NextAuth.
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig; // Garantiza
