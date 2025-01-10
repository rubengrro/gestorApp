import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Obtener todos los formularios (GET)
export async function GET() {
    try {
      const formularios = await prisma.formulario.findMany({
        include: {
          incidencia: true, // Si necesitas incluir detalles de la incidencia
        },
      });
  
      return NextResponse.json(formularios);
    } catch (error) {
      console.error("Error al obtener todos los formularios:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }
  

// Crear un nuevo formulario (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidenciaId, fields } = body;

    // Validación básica de datos
    if (!incidenciaId || !fields) {
      return NextResponse.json({ error: "incidenciaId y fields son requeridos" }, { status: 400 });
    }

    const nuevoFormulario = await prisma.formulario.create({
      data: {
        incidenciaId,
        fields,
      },
    });

    return NextResponse.json(nuevoFormulario);
  } catch (error) {
    console.error("Error al crear un nuevo formulario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
