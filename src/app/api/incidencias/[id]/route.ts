import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Maneja la solicitud GET para obtener una incidencia por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    const incidencia = await prisma.incidenciaCatalogo.findUnique({ where: { id } });
    if (!incidencia) return new NextResponse("Incidencia no encontrada", { status: 404 });

    return NextResponse.json(incidencia);
  } catch (error) {
    console.error("Error al obtener la incidencia:", error);
    return new NextResponse("Error al obtener la incidencia", { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    const data = await req.json();
    console.log("Datos recibidos en la API:", data); // Verifica que los datos sean correctos

    // Asegúrate de que todos los campos necesarios estén presentes y que no haya valores nulos o vacíos
    if (!data.infotype || !data.concepto || !data.nombreSubtipo) {
      return new NextResponse("Faltan datos requeridos", { status: 400 });
    }

    const updatedIncidencia = await prisma.incidenciaCatalogo.update({
      where: { id },
      data: {
        infotype: data.infotype,
        concepto: data.concepto,
        nombreSubtipo: data.nombreSubtipo,
        requiereAprobacion: data.requiereAprobacion,
        rolesAcceso: {
          set: data.rolesAcceso,  // Se asegura de usar "set" si rolesAcceso es un array
        },
      },
    });
    

    console.log("Datos actualizados en la BD:", updatedIncidencia); // Verifica que los datos se actualicen correctamente
    return NextResponse.json(updatedIncidencia);
  } catch (error) {
    console.error("Error al actualizar la incidencia:", error);
    return new NextResponse("Error al actualizar la incidencia", { status: 500 });
  }
}


// Maneja la solicitud DELETE para eliminar una incidencia por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return new NextResponse("ID inválido", { status: 400 });
  }

  try {
    await prisma.incidenciaCatalogo.delete({ where: { id } });
    return new NextResponse("Incidencia eliminada correctamente", { status: 200 });
  } catch (error) {
    console.error("Error al eliminar la incidencia:", error);
    return new NextResponse("Error al eliminar la incidencia", { status: 500 });
  }
}