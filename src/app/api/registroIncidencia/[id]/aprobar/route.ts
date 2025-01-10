// api/registroIncidencia/[id]/aprobar.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Estado } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!incidencia) {
      return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
    }

    if (incidencia.estado !== Estado.Pendiente_Gerente && incidencia.estado !== Estado.Pendiente_RI) {
      return NextResponse.json({ error: "Estado no válido para aprobación" }, { status: 400 });
    }

    const nuevoEstado =
      incidencia.estado === Estado.Pendiente_Gerente ? Estado.Pendiente_RI : Estado.Aprobado;

    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id, 10) },
      data: { estado: nuevoEstado },
    });

    return NextResponse.json({ message: "Incidencia aprobada con éxito", data: updatedIncidencia });
  } catch (error) {
    console.error("Error al aprobar incidencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
