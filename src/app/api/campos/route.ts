// src/app/api/campos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CampoSchema } from '@/lib/zod';
import { z } from 'zod';

export async function GET() {
  try {
    const campos = await prisma.campo.findMany();
    return NextResponse.json(campos);
  } catch (error) {
    console.error('Error fetching campos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar el cuerpo de la solicitud con Zod
    const validatedData = CampoSchema.parse(body);

    const nuevoCampo = await prisma.campo.create({
      data: validatedData,
    });

    return NextResponse.json(nuevoCampo);
  } catch (error) {
    console.error('Error creando campo:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
