// Importa NextAuth, una solución de autenticación lista para usar con Next.js.
import NextAuth from "next-auth";

// Importa la configuración personalizada de autenticación desde el archivo `auth.config`.
import authConfig from "./auth.config";

// Exporta el middleware de NextAuth utilizando la configuración personalizada.
// Este middleware se encargará de gestionar la autenticación en las rutas especificadas.
export const { auth: middleware } = NextAuth(authConfig);



// Configuración del middleware:
// - `matcher`: Define las rutas que serán protegidas por el middleware.
// - Los patrones especificados aquí permiten excluir ciertas rutas y archivos estáticos.
export const config = {
  matcher: [
    // Excluye rutas que comienzan con `_next` y archivos estáticos como HTML, CSS, JS, imágenes, etc.
    // Esto asegura que los recursos públicos no estén protegidos por el middleware.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Protege las rutas que comienzan con `/api` o `/trpc`, que suelen manejar la lógica del backend.
    '/(api|trpc)(.*)',
  ],

  runtime: "nodejs"
};
