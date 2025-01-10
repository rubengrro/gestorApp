import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.trabajadorNumeroWD || !data.validoDe || !data.validoA || !data.tipo || !data.quienRegistra) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const nuevaIncidencia = await prisma.incidenciaForms.create({
      data: {
        trabajadorNumeroWD: data.trabajadorNumeroWD,
        validoDe: new Date(data.validoDe), // Asegúrate de que el formato sea correcto
        validoA: new Date(data.validoA), // Asegúrate de que el formato sea correcto
        tipo: parseInt(data.tipo, 10), // Asegúrate de que esto sea un número
        ccNomina: data.ccNomina || null,
        importe: data.importe ? parseFloat(data.importe) : null,
        cantidad: data.cantidad ? parseInt(data.cantidad, 10) : null,
        quienRegistra: data.quienRegistra,
      },
    });

    return NextResponse.json(nuevaIncidencia, { status: 201 });
  } catch (error) {
    console.error("Error al guardar la incidencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
