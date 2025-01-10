// api/registroIncidencia/[id]/rechazar.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Estado } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { comentarioRechazo } = await req.json();

  try {
    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!incidencia) {
      return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
    }

    if (incidencia.estado === Estado.Aprobado || incidencia.estado === Estado.Rechazado) {
      return NextResponse.json({ error: "Estado no válido para rechazo" }, { status: 400 });
    }

    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id, 10) },
      data: { estado: Estado.Rechazado, comentarioRechazo },
    });

    return NextResponse.json({ message: "Incidencia rechazada con éxito", data: updatedIncidencia });
  } catch (error) {
    console.error("Error al rechazar incidencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
