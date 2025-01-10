// Importa NextAuth, una solución de autenticación para Next.js.
import NextAuth from "next-auth";

// Importa el adaptador de Prisma para gestionar usuarios y sesiones directamente en la base de datos.
import { PrismaAdapter } from "@auth/prisma-adapter";

// Importa la instancia de Prisma configurada para interactuar con la base de datos.
import prisma from "./lib/db";

// Importa la configuración personalizada de NextAuth desde un archivo separado.
import authConfig from "./auth.config";

// Configuración y exportación de NextAuth, incluyendo adaptadores, estrategias de sesión y callbacks personalizados.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Usa el adaptador de Prisma para que NextAuth gestione usuarios, cuentas y sesiones en la base de datos.
  adapter: PrismaAdapter(prisma),

  // Configura la estrategia de sesión. En este caso, se utiliza JWT (JSON Web Token) para mantener la sesión.
  session: { strategy: "jwt" },

  // Combina la configuración personalizada de NextAuth (`authConfig`) con esta configuración.
  ...authConfig,

  // Callbacks personalizados para manejar el token JWT y la sesión.
  callbacks: {
    // Callback para personalizar el token JWT antes de enviarlo al cliente.
    async jwt({ token, user }) {
      if (user) {
        // Agrega información adicional al token JWT.
        token.id = user.id; // ID del usuario.
        token.role = user.role; // Rol del usuario.
        token.plant = user.plant; // Planta asignada al usuario.

        // Limpia el nombre del usuario eliminando tabs y espacios adicionales.
        const cleanName = user.name?.replace(/\t/g, "").trim();
        token.name = cleanName;
      }
      return token; // Retorna el token actualizado.
    },

    // Callback para personalizar la sesión antes de enviarla al cliente.
    async session({ session, token }) {
      if (session.user) {
        // Propaga información adicional del token JWT a la sesión.
        session.user.id = token.id as string; // ID del usuario.
        session.user.role = token.role as string; // Rol del usuario.
        session.user.plant = token.plant as string; // Planta asignada al usuario.

        // Limpia el nombre del usuario eliminando tabs y espacios adicionales.
        const cleanName = session.user.name?.replace(/\t/g, "").trim();
        session.user.name = cleanName;
      }
      return session; // Retorna la sesión actualizada.
    },
  },
});
