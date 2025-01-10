// src/app/api/formularios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FormularioSchema } from '@/lib/zod';
import { z } from 'zod';

export async function GET() {
  try {
    const formularios = await prisma.formularioIncidencia.findMany({
      include: { campos: { include: { campo: true } } }, // Incluye detalles de los campos
    });
    return NextResponse.json(formularios);
  } catch (error) {
    console.error('Error fetching formularios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validación con Zod
    const validatedData = FormularioSchema.parse(body);

    // Creación del formulario
    const nuevoFormulario = await prisma.formularioIncidencia.create({
      data: {
        nombre: validatedData.nombre,
        incidenciaId: validatedData.incidenciaId,
        campos: {
          create: validatedData.campos.map((campo) => ({
            campo: campo.campoId 
              ? { connect: { id: campo.campoId } } // Campo compartido
              : { create: campo.campo },         // Nuevo campo
          })),
        },
      },
    });
    return NextResponse.json(nuevoFormulario);
  } catch (error) {
    console.error('Error creando formulario:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
