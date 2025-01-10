import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Role, Planta } from '@prisma/client';
import { signupSchema } from '@/lib/zod';
import { z } from 'zod';

// Función para normalizar nombres a "Title Case"
const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;
  const plant = searchParams.get("planta") as Planta | null;
  const nombre = searchParams.get("nombre");

  try {
    if (nombre) {
      // Si se proporciona un nombre, buscar al usuario por nombre
      const nombreNormalizado = toTitleCase(nombre);
      const usuario = await prisma.user.findFirst({
        where: {
          name: {
            equals: nombreNormalizado,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plant: true,
        },
      });

      if (!usuario) {
        return NextResponse.json(
          { error: `Usuario con nombre ${nombreNormalizado} no encontrado.` },
          { status: 404 }
        );
      }

      return NextResponse.json(usuario, { status: 200 });
    }

    // Si no se proporciona un nombre, aplicar los filtros de role y plant
    const filters: { role?: Role; plant?: Planta } = {};
    if (role) filters.role = role;
    if (plant) filters.plant = plant;

    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plant: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos con Zod usando signupSchema
    const parsedData = signupSchema.parse(body);

    // Normalizar el nombre si se proporciona, o usar un valor por defecto
    const normalizedName = parsedData.name ? toTitleCase(parsedData.name) : "Sin Nombre";

    // Crear usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name: normalizedName,
        email: parsedData.email,
        password: parsedData.password,
        role: parsedData.role,
        plant: parsedData.plant,
        relatedSupervisors: parsedData.relatedSupervisors || [],
        relatedRis: parsedData.relatedRis || [],
        relatedInplants: parsedData.relatedInplants || [],
        relatedGps: parsedData.relatedGps || [],
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
