// app/api/getLastPrestamoCajaChica/route.ts
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("userName");

  if (!userName) {
    return NextResponse.json(
      { error: "El nombre de usuario es requerido" },
      { status: 400 }
    );
  }

  try {
    const lastRecord = await prisma.incidencia.findFirst({
      where: {
        concepto: "9X08",
        quienRegistra: userName,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lastRecord) {
      return NextResponse.json(
        { error: "No se encontró ningún registro para el usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json(lastRecord);
  } catch (error) {
    console.error("Error al obtener el registro:", error);
    return NextResponse.json(
      { error: "Error al obtener el último registro de Préstamo Caja Chica" },
      { status: 500 }
    );
  }
}
