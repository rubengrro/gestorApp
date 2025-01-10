// src/app/api/periodo/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { periodoSchema } from "@/lib/zod";

export async function GET() {
  try {
    const periodos = await prisma.periodo.findMany({
      orderBy: { numero: 'asc' },
    });
    return NextResponse.json(periodos, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los períodos:", error);
    return NextResponse.json(
      { error: "Error al obtener los períodos en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = periodoSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { numero, fechaInicio, fechaCierre } = result.data;
    const newPeriod = await prisma.periodo.create({
      data: {
        numero,
        fechaInicio: new Date(fechaInicio),
        fechaCierre: new Date(fechaCierre),
      },
    });

    return NextResponse.json(newPeriod, { status: 201 });
  } catch (error) {
    console.error("Error al crear el período:", error);
    return NextResponse.json(
      { error: "Error al crear el período en el servidor" },
      { status: 500 }
    );
  }
}
