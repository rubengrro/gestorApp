import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Normalización de nombres a "Title Case" para asegurar que los nombres se buscan correctamente
const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Esquema de validación Zod para el trabajador
const TrabajadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  planta: z.enum(["Planta_A", "Planta_B", "Planta_C", "Planta_D", "Planta_E", "Planta_F", "Planta_G", "Planta_T", "All"]),
  numeroWD: z.string().min(1, "El número WD es obligatorio"),
  numeroGV: z.string().min(1, "El número GV es obligatorio"),
  numeroAnterior: z.string().nullable(),
  supervisorNombre: z.string().min(1),
  gerenteNombre: z.string().min(1),
});

export async function GET() {
  try {
    const trabajadores = await prisma.trabajador.findMany({
      include: {
        supervisor: {
          select: { name: true },
        },
        gerente: {
          select: { name: true },
        },
      },
    });

    const trabajadoresConNombres = trabajadores.map((trabajador) => ({
      ...trabajador,
      supervisorNombre: trabajador.supervisor ? trabajador.supervisor.name : 'No asignado',
      gerenteNombre: trabajador.gerente ? trabajador.gerente.name : 'No asignado',
    }));

    return NextResponse.json(trabajadoresConNombres);
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    return NextResponse.json({ error: 'Error al obtener trabajadores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = TrabajadorSchema.parse(body);

    // Normalizar nombres para búsqueda en la base de datos
    const normalizedSupervisorName = toTitleCase(validatedData.supervisorNombre);
    const normalizedGerenteName = toTitleCase(validatedData.gerenteNombre);

    // Buscar supervisor en la base de datos por nombre
    const supervisor = await prisma.user.findFirst({
      where: {
        name: {
          equals: normalizedSupervisorName,
          mode: "insensitive",
        },
      },
    });

    if (!supervisor) {
      return NextResponse.json(
        { error: `Supervisor con nombre ${normalizedSupervisorName} no encontrado.` },
        { status: 400 }
      );
    }

    // Buscar gerente en la base de datos por nombre
    const gerente = await prisma.user.findFirst({
      where: {
        name: {
          equals: normalizedGerenteName,
          mode: "insensitive",
        },
      },
    });

    if (!gerente) {
      return NextResponse.json(
        { error: `Gerente con nombre ${normalizedGerenteName} no encontrado.` },
        { status: 400 }
      );
    }

    // Crear el trabajador con los IDs de supervisor y gerente
    const trabajador = await prisma.trabajador.create({
      data: {
        nombre: validatedData.nombre,
        planta: validatedData.planta,
        numeroWD: validatedData.numeroWD,
        numeroGV: validatedData.numeroGV,
        numeroAnterior: validatedData.numeroAnterior,
        supervisorId: supervisor.id,
        gerenteId: gerente.id,
      },
    });

    return NextResponse.json(trabajador, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    } else if (error instanceof Error) {
      // Aquí se maneja el caso de error estándar
      console.error("Error al crear trabajador:", error.message);
      return NextResponse.json({ error: `Error al crear trabajador: ${error.message}` }, { status: 500 });
    } else {
      // Caso genérico para errores que no sean de tipo Error
      console.error("Error al crear trabajador: Error desconocido", error);
      return NextResponse.json({ error: "Error desconocido al crear trabajador" }, { status: 500 });
    }
  }
}

