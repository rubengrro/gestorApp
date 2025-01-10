// src/app/api/campos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CampoSchema } from '@/lib/zod';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const campoId = req.nextUrl.searchParams.get('id');
  try {
    const campo = await prisma.campo.findUnique({
      where: { id: Number(campoId) },
    });
    return NextResponse.json(campo);
  } catch (error) {
    console.error('Error fetching campo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const campoId = req.nextUrl.searchParams.get('id');

  try {
    const body = await req.json();
    
    // Validar datos con Zod
    const validatedData = CampoSchema.parse(body);

    const campoActualizado = await prisma.campo.update({
      where: { id: Number(campoId) },
      data: validatedData,
    });

    return NextResponse.json(campoActualizado);
  } catch (error) {
    console.error('Error actualizando campo:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const campoId = req.nextUrl.searchParams.get('id');
  try {
    await prisma.campo.delete({
      where: { id: Number(campoId) },
    });
    return NextResponse.json({ message: 'Campo eliminado' });
  } catch (error) {
    console.error('Error eliminando campo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
