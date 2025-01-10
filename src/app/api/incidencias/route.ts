import prisma from "@/lib/db";
import { incidenciaDataSchema } from "@/lib/zod";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

// Definir el tipo para las incidencias que esperas recibir
type IncidenciaInput = {
  infotype: string;
  concepto: string;
  nombreSubtipo: string;
  rolesAcceso: Role[]; // Enum
  requiereAprobacion: boolean;
};

// GET: Maneja las solicitudes GET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const catalogo = searchParams.get("catalogo");

  try {
    const incidenciasCatalogo = catalogo
      ? await prisma.incidenciaCatalogo.findMany({ /* aquí incluir algún filtro si es necesario */ })
      : await prisma.incidenciaCatalogo.findMany();

    return new Response(JSON.stringify(incidenciasCatalogo), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener incidencias del catálogo:', error);
    return new Response(
      JSON.stringify({ message: 'Error al obtener incidencias del catálogo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


// POST: Maneja las solicitudes POST para crear una nueva incidencia
export async function POST(req: NextRequest) {
  try {
    const data: IncidenciaInput[] = await req.json();
    const parsedData = data.map(incidencia => incidenciaDataSchema.parse(incidencia));

    const incidencias = await Promise.all(
      parsedData.map(incidencia =>
        prisma.incidenciaCatalogo.create({
          data: {
            infotype: incidencia.infotype,
            concepto: incidencia.concepto,
            nombreSubtipo: incidencia.nombreSubtipo,
            rolesAcceso: incidencia.rolesAcceso,
            requiereAprobacion: incidencia.requiereAprobacion,
          },
        })
      )
    );

    return new Response(JSON.stringify(incidencias), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error al crear nuevas incidencias en el catálogo:', error);
    return new Response(JSON.stringify({ message: 'Error al crear las incidencias' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Maneja las solicitudes DELETE para eliminar una incidencia
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ message: "ID es requerido" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.incidenciaCatalogo.delete({
      where: { id: Number(id) },
    });

    return new Response(JSON.stringify({ message: "Incidencia eliminada exitosamente" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar la incidencia:', error);
    return new Response(JSON.stringify({ message: 'Error al eliminar la incidencia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT: Maneja las solicitudes PUT para actualizar una incidencia
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ message: "ID es requerido para actualizar" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await req.json();
    const validatedData = incidenciaDataSchema.parse(data);

    const updatedIncidencia = await prisma.incidenciaCatalogo.update({
      where: { id: Number(id) },
      data: validatedData,
    });

    return new Response(JSON.stringify(updatedIncidencia), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar la incidencia:', error);
    return new Response(JSON.stringify({ message: 'Error al actualizar la incidencia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
