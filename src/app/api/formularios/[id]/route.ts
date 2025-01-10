// src/app/api/formularios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FormularioSchema } from '@/lib/zod';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const formularioId = req.nextUrl.searchParams.get('id');
  try {
    const formulario = await prisma.formularioIncidencia.findUnique({
      where: { id: Number(formularioId) },
      include: { campos: { include: { campo: true } } },
    });
    return NextResponse.json(formulario);
  } catch (error) {
    console.error('Error fetching formulario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const formularioId = req.nextUrl.searchParams.get('id');
  try {
    const body = await req.json();
    const validatedData = FormularioSchema.parse(body);

    const formularioActualizado = await prisma.formularioIncidencia.update({
      where: { id: Number(formularioId) },
      data: {
        nombre: validatedData.nombre,
        incidenciaId: validatedData.incidenciaId,
        campos: {
          deleteMany: {}, // Limpia campos previos
          create: validatedData.campos.map((campo) => ({
            campo: campo.campoId 
              ? { connect: { id: campo.campoId } } 
              : { create: campo.campo },
          })),
        },
      },
    });
    return NextResponse.json(formularioActualizado);
  } catch (error) {
    console.error('Error actualizando formulario:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const formularioId = req.nextUrl.searchParams.get('id');
  try {
    await prisma.formularioIncidencia.delete({
      where: { id: Number(formularioId) },
    });
    return NextResponse.json({ message: 'Formulario eliminado' });
  } catch (error) {
    console.error('Error eliminando formulario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
