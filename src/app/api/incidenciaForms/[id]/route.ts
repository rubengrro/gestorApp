import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const incidenciaId = parseInt(params.id, 10); // Convierte el ID a un número
  
      if (isNaN(incidenciaId)) {
        return NextResponse.json({ error: "ID de incidencia inválido" }, { status: 400 });
      }
  
      const formulario = await prisma.formulario.findFirst({
        where: { incidenciaId },
      });
  
      if (!formulario) {
        return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });
      }
  
      return NextResponse.json(formulario);
    } catch (error) {
      console.error("Error al obtener el formulario:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }


/// POST handler en /api/incidenciaForms/[id]/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { fields } = await req.json();
  
    try {
      const form = await prisma.formulario.create({
        data: {
          incidenciaId: parseInt(params.id, 10),
          fields,
        },
      });
      return NextResponse.json(form);
    } catch (error) {
      console.error("Error al crear formulario:", error);
      return NextResponse.json({ error: "Error al crear formulario" }, { status: 500 });
    }
  }
  

// Actualizar un formulario específico de una incidencia (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const incidenciaId = parseInt(params.id);
    const body = await req.json();
    const { fields } = body;

    if (!fields) {
      return NextResponse.json({ error: "La estructura del formulario es requerida" }, { status: 400 });
    }

    const formulario = await prisma.formulario.updateMany({
      where: { incidenciaId },
      data: {
        fields,
      },
    });

    return NextResponse.json(formulario);
  } catch (error) {
    console.error("Error al actualizar el formulario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Eliminar un formulario específico de una incidencia (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const incidenciaId = parseInt(params.id);

    await prisma.formulario.deleteMany({
      where: { incidenciaId },
    });

    return NextResponse.json({ message: "Formulario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el formulario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
