import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Estado } from "@prisma/client";
import { sendApprovalEmail } from "@/lib/transporter";

// Función para validar si un valor es una fecha válida
function isValidDate(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const requiredFields = [
      "trabajadorNumeroWD",
      "nombreTrabajador",
      "infotipo",
      "concepto",
      "nombreSubtipo",
      "validoDe",
      "validoA",
      "quienRegistra",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es obligatorio.` },
          { status: 400 }
        );
      }
    }

        // Verificar duplicados
        const incidenciaDuplicada = await prisma.incidencia.findFirst({
          where: {
            trabajadorNumeroWD: data.trabajadorNumeroWD,
            nombreSubtipo: data.nombreSubtipo,
            concepto: data.concepto,
            fechaIncidencia: new Date(data.validoDe),
            fechaAplica: new Date(data.validoA),
            monto: data.monto || undefined,
            cantidad: data.cantidad || undefined,
            horas: data.horas || undefined,
            folio: data.folio || undefined,
            email: data.email || undefined,
            quienRegistra: data.quienRegistra,
          },
        });
    
        if (incidenciaDuplicada) {
          return NextResponse.json(
            { error: "Ya existe una incidencia similar para el trabajador en la semana actual." },
            { status: 409 }
          );
        }

    // Validar las fechas antes de usarlas
    if (!isValidDate(data.validoDe) || !isValidDate(data.validoA)) {
      return NextResponse.json(
        { error: "Las fechas proporcionadas no son válidas." },
        { status: 400 }
      );
    }

    // Verificar si la incidencia requiere aprobación
    const incidenciaCatalogo = await prisma.incidenciaCatalogo.findUnique({
      where: { nombreSubtipo: data.nombreSubtipo },
    });

    if (!incidenciaCatalogo) {
      return NextResponse.json(
        { error: "El subtipo de incidencia no existe." },
        { status: 404 }
      );
    }

    const requiereAprobacion = incidenciaCatalogo.requiereAprobacion;
    const rol = data.rol || "UsuarioDesconocido";


    // Determinar el estado inicial basado en el rol y si requiere aprobación
    const estadoAsignado =
    requiereAprobacion && rol === "Inplant"
      ? Estado.Pendiente_RI
      : requiereAprobacion
      ? Estado.Pendiente_Gerente
      : Estado.No_Aplica;
  

    // Crear la incidencia
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        trabajadorNumeroWD: data.trabajadorNumeroWD,
        nombreTrabajador: data.nombreTrabajador || "",
        infotipo: data.infotipo,
        nombreSubtipo: data.nombreSubtipo,
        concepto: data.concepto,
        cantidad: data.cantidad ?? undefined,
        monto: data.monto ?? undefined,
        horas: data.horas ?? undefined,
        folio: data.folio ?? undefined,
        email: data.email ?? undefined,
        fechaIncidencia: new Date(data.validoDe),
        fechaAplica: new Date(data.validoA),
        quienRegistra: data.quienRegistra,
        requiereAprobacion: requiereAprobacion,
        estado: estadoAsignado,
      },
    });

    // Crear el objeto con los datos necesarios para el correo
  const incidenciaData = {
    nombreTrabajador: nuevaIncidencia.nombreTrabajador || "No especificado",
    planta: data.planta || "No especificada",
    nombreSubtipo: nuevaIncidencia.nombreSubtipo || "No especificado",
    concepto: nuevaIncidencia.concepto || "No especificado",
    valor:
      nuevaIncidencia.monto ??
      nuevaIncidencia.cantidad ??
      nuevaIncidencia.horas ??
      nuevaIncidencia.folio ??
      nuevaIncidencia.email ??

      "No especificado",
    quienRegistra: nuevaIncidencia.quienRegistra || "No especificado",
    fechaRegistro: nuevaIncidencia.createdAt || new Date().toISOString(),
    comentarioGerente: nuevaIncidencia.comentarioGerente || "Sin comentarios por parte de gerente",
    comentarioRi: nuevaIncidencia.comentarioRi || "Sin comentarios por parte de Ri",
  };

  if (estadoAsignado === Estado.Pendiente_Gerente) {
    const gerentes = await prisma.user.findMany({
      where: { role: "Gerente" },
      select: { email: true },
    });
  
    const emails = gerentes.map((g) => g.email);
  
    // Enviar correo usando incidenciaData original
    await Promise.all(
      emails.map((email) =>
        sendApprovalEmail(email, nuevaIncidencia.id.toString(), incidenciaData)
      )
    );
  } else if (estadoAsignado === Estado.Pendiente_RI) {
    console.log("Datos de nuevaIncidencia:", nuevaIncidencia);
  
    const ris = await prisma.user.findMany({
      where: { role: "Ri" },
      select: { email: true },
    });
  
    const emails = ris.map((ri) => ri.email);
  
    await Promise.all(
      emails.map((email) =>
        sendApprovalEmail(email, nuevaIncidencia.id.toString(), incidenciaData)
      )
    );
  }
  
  

    return NextResponse.json(nuevaIncidencia, { status: 201 });
  } catch (error) {
    console.error("Error al guardar la incidencia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


// GET: Obtener todas las incidencias
export async function GET() {
  try {
    const incidencias = await prisma.incidencia.findMany({
      include: {
        trabajador: true,
        incidenciaCatalogo: true,
        periodo: true,
      },
    });

    

    // Asegúrate de devolver fechas en formato ISO
    const incidenciasFormateadas = incidencias.map((incidencia) => ({
      ...incidencia,
      validoDe: incidencia.fechaIncidencia?.toISOString(),
      validoA: incidencia.fechaAplica?.toISOString(),
      planta: incidencia.trabajador?.planta
      ? incidencia.trabajador.planta.replace(/_/g, " ") // Reemplaza los guiones bajos
      : "No especificada",
    }));

    return NextResponse.json(incidenciasFormateadas);
  } catch (error) {
    console.error("Error al obtener las incidencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
