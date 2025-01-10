// src/actions/create-incidencia.ts
import { incidenciaSchema } from "@/lib/zod";
import prisma from "@/lib/db";

interface CreateIncidenciaParams {
  trabajadorNumeroWD: string;
  incidenciaCatalogoId: number;
  nombreSubtipo?: string;
  cantidad: number;
  fechaIncidencia: string;
  fechaAplica: string;
  quienRegistra: string;
  requierePrimeraAprobacion: boolean;
  requiereSegundaAprobacion?: boolean;
  primerAprobadorId?: string;
  segundoAprobadorId?: string;
  requiereEvidencia?: boolean;
  evidenciaUrl?: string;
  periodoId?: number;
}

export async function createnewIncidencia(params: CreateIncidenciaParams) {
  // Validar los datos de entrada usando Zod
  const result = incidenciaSchema.safeParse(params);
  if (!result.success) {
    return {
      error: true,
      message: "Datos inválidos",
      errors: result.error.errors,
    };
  }

  try {
    // Ajustar requiereEvidencia a `false` si está undefined para Prisma
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        ...result.data,
        fechaIncidencia: new Date(result.data.fechaIncidencia),
        fechaAplica: new Date(result.data.fechaAplica),
        requiereEvidencia: result.data.requiereEvidencia ?? false,
        nombreSubtipo: result.data.nombreSubtipo ?? "", // Proporciona un valor predeterminado si está undefined
      },
    });
    

    return {
      error: false,
      data: nuevaIncidencia,
    };
  } catch (error) {
    console.error("Error al crear la incidencia:", error);
    return {
      error: true,
      message: "Error al crear la incidencia en la base de datos",
    };
  }
}
