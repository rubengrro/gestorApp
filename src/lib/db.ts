// Archivo: db.ts
// Este archivo configura la instancia de Prisma Client para interactuar con la base de datos.
// Se utiliza un patrón singleton para garantizar que solo se cree una instancia de Prisma Client,
// evitando problemas de múltiples conexiones en entornos de desarrollo o producción.

import { PrismaClient } from '@prisma/client'; // Importa PrismaClient para manejar la base de datos.

/**
 * Función que crea una nueva instancia de PrismaClient.
 * Esto asegura que Prisma Client se inicialice correctamente cuando sea necesario.
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Declaración para el objeto global `globalThis`.
// Esto permite mantener una única instancia de Prisma Client durante la ejecución de la aplicación,
// incluso si el archivo se importa en múltiples lugares.
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>; // Instancia de Prisma almacenada globalmente.
} & typeof global;

/**
 * Inicializa Prisma:
 * - Si `prismaGlobal` ya existe (en entornos de desarrollo), reutiliza esa instancia.
 * - Si no existe, crea una nueva instancia llamando a `prismaClientSingleton()`.
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma; // Exporta la instancia de Prisma para ser utilizada en toda la aplicación.

// En entornos de desarrollo, asegura que la instancia de Prisma se asigne al objeto global.
// Esto evita problemas con múltiples instancias de Prisma que pueden surgir debido a reinicios
// del servidor cuando está en modo de desarrollo.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
