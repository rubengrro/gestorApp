/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/db";
import { fieldsConfig } from "@/lib/fieldsConfig";
import { sendApprovalEmail } from "@/lib/transporter";
import { Estado } from "@prisma/client";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id) },
      include: {
        incidenciaCatalogo: true, // Incluye el catálogo
        trabajador: {              // Incluye el trabajador relacionado
          select: {
            planta: true,          // Solo selecciona el campo "planta"
          },
        },
      },
    });

    if (!incidencia) {
      return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
    }

    // Extraer roles de acceso del catálogo
    const rolesAcceso = incidencia.incidenciaCatalogo?.rolesAcceso || [];

    // Formatear los campos para incluir valores y fechas
    const infotype = incidencia.incidenciaCatalogo?.infotype;
    const fields = (fieldsConfig[infotype || "default"] || fieldsConfig.default).map((field) => ({
      ...field,
      value:
        field.name === "validoDe"
          ? incidencia.fechaIncidencia
            ? new Date(incidencia.fechaIncidencia).toISOString().split("T")[0]
            : ""
          : field.name === "validoA"
          ? incidencia.fechaAplica
            ? new Date(incidencia.fechaAplica).toISOString().split("T")[0]
            : ""
          : incidencia[field.name as keyof typeof incidencia] ?? "",
    }));

    return NextResponse.json({
      id: incidencia.id,
      nombreSubtipo: incidencia.nombreSubtipo || "No especificado",
      concepto: incidencia.concepto || "No especificado",
      infotype: incidencia.incidenciaCatalogo?.infotype || "No especificado",
      fields, // Configuración de campos
      estado: incidencia.estado || "No especificado",
      quienRegistra: incidencia.quienRegistra || "Desconocido",
      riAprobador: incidencia.riAprobador || null,
      gerenteAprobador: incidencia.gerenteAprobador || null,
      inplantAprobador: incidencia.inplantAprobador || null,
      deletedAt: incidencia.deletedAt || null,
      evidencias: incidencia.evidencias || null,
      comentarioRechazo: incidencia.comentarioRechazo || null,
      comentarioGerente: incidencia.comentarioGerente || null,
      comentarioRi: incidencia.comentarioRi || null,
      comentarioGPS: incidencia.comentarioGPS || null,
      validoDe: incidencia.fechaIncidencia
        ? new Date(incidencia.fechaIncidencia).toISOString().split("T")[0]
        : null,
      validoA: incidencia.fechaAplica
        ? new Date(incidencia.fechaAplica).toISOString().split("T")[0]
        : null,
      monto: incidencia.monto || null,
      cantidad: incidencia.cantidad || null,
      horas: incidencia.horas || null,
      folio: incidencia.folio || null,
      email: incidencia.email || null,
      planta: incidencia.trabajador?.planta || "No especificada",
    });
    
  } catch (error) {
    console.error("Error al obtener la incidencia:", error);
    return NextResponse.json({ error: "Error al obtener la incidencia" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();

  try {
    console.log("Datos recibidos para actualizar incidencia:", body);

    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id, 10) },
      include: { incidenciaCatalogo: true },
    });

    if (!incidencia) {
      console.error("Incidencia no encontrada para el ID:", id);
      return NextResponse.json({ error: "La incidencia no existe." }, { status: 404 });
    }

    const requiereAprobacion = incidencia.incidenciaCatalogo?.requiereAprobacion || false;
    const { estado: estadoSolicitado, riAprobador, gerenteAprobador, inplantAprobador, ...otrosCampos } = body;

    const estadoActual = incidencia.estado;

    // Validación de estado y envío de correo
    if (estadoActual === Estado.Pendiente_Gerente && estadoSolicitado === Estado.Pendiente_RI) {
      const riUsers = await prisma.user.findMany({
        where: { role: "Ri" }, // Corregir el role si está mal escrito en la base de datos
        select: { email: true },
      });

      const emails = riUsers.map((ri) => ri.email);

      // Enviar correo a los usuarios RI con los enlaces de acción
      await Promise.all(
        emails.map((email) =>
          sendApprovalEmail(email, id, {
            nombreTrabajador: incidencia.nombreTrabajador,
            nombreSubtipo: incidencia.nombreSubtipo,
          })
        )
      );
    }

    console.log("Estado actual:", estadoActual);
    console.log("Estado solicitado:", estadoSolicitado);

    const validTransitions: Record<Estado, Estado[]> = {
      Pendiente_Gerente: ["Pendiente_RI", "Rechazado"],
      Pendiente_RI: ["Aprobado", "Rechazado"],
      No_Aplica: [],
      Aprobado: [],
      Rechazado: [],
    };

    if (!estadoActual || !validTransitions[estadoActual]?.includes(estadoSolicitado)) {
      console.error(`Transición no permitida o estado actual no válido: ${estadoActual} -> ${estadoSolicitado}`);
      return NextResponse.json(
        { error: `Transición de estado no permitida o estado actual no válido: ${estadoActual} -> ${estadoSolicitado}` },
        { status: 400 }
      );
    }

    const dataToUpdate = {
      ...(otrosCampos.nombreTrabajador && { nombreTrabajador: otrosCampos.nombreTrabajador }),
      ...(otrosCampos.monto !== undefined && { monto: parseFloat(otrosCampos.monto) }),
      ...(otrosCampos.cantidad !== undefined && { cantidad: parseInt(otrosCampos.cantidad, 10) }),
      ...(otrosCampos.validoDe && { fechaIncidencia: new Date(otrosCampos.validoDe) }),
      ...(otrosCampos.validoA && { fechaAplica: new Date(otrosCampos.validoA) }),
      ...(otrosCampos.infotipo && { infotipo: otrosCampos.infotipo }),
      ...(otrosCampos.concepto && { concepto: otrosCampos.concepto }),
      ...(otrosCampos.email && { email: otrosCampos.email }),
      ...(otrosCampos.comentario && { comentario: otrosCampos.comentario }),
      ...(gerenteAprobador ? { gerenteAprobador } : null),
      ...(riAprobador ? { riAprobador } : null),
      ...(inplantAprobador ? { inplantAprobador } : null),
      ...(estadoSolicitado && { estado: estadoSolicitado }),
      ...(requiereAprobacion && { requiereAprobacion }),
      ...(otrosCampos.evidencias && { evidencias: otrosCampos.evidencias }),
      ...(otrosCampos.comentarioRechazo && { comentarioRechazo: otrosCampos.comentarioRechazo }),
      ...(otrosCampos.comentarioGerente && { comentarioGerente: otrosCampos.comentarioGerente }),
      ...(otrosCampos.comentarioRi && { comentarioRi: otrosCampos.comentarioRi }),
      ...(otrosCampos.comentarioGPS && { comentarioGPS: otrosCampos.comentarioGPS }),
    };

    console.log("Datos preparados para actualizar:", dataToUpdate);

    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
    });

    console.log("Incidencia actualizada exitosamente:", updatedIncidencia);

    return NextResponse.json(updatedIncidencia);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al actualizar la incidencia:", {
        message: error.message,
        stack: error.stack,
        data: body,
      });
    } else {
      console.error("Error desconocido al actualizar la incidencia:", error);
    }
    return NextResponse.json({ error: "Error al actualizar la incidencia" }, { status: 500 });
  }
}



export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id) },
    });

    if (!incidencia) {
      return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
    }

    await prisma.incidencia.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Incidencia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la incidencia:", error);
    return NextResponse.json({ error: "Error al eliminar la incidencia" }, { status: 500 });
  }
}

// En tu archivo de la API (ej. route.ts)

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();

  try {
    const incidencia = await prisma.incidencia.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!incidencia) {
      return NextResponse.json({ error: "La incidencia no existe." }, { status: 404 });
    }

    // Actualiza los campos 'deletedAt' y 'quienElimino'
    const dataToUpdate = {
      deletedAt: body.deletedAt, // Establecer la fecha de eliminación
      quienElimino: body.quienElimino, // Establecer quién eliminó la incidencia
    };

    const updatedIncidencia = await prisma.incidencia.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedIncidencia);
  } catch (error) {
    console.error("Error al actualizar la incidencia:", error);
    return NextResponse.json({ error: "Error al mover la incidencia a la papelera" }, { status: 500 });
  }
}
