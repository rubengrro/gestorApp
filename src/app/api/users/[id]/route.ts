/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Obtener un usuario por su ID (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    // Obtener el usuario con sus IDs relacionados
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Consultar los usuarios relacionados
    const [supervisors, ris, inplants, gps, gerentes] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: user.relatedSupervisors } },
        select: { id: true, name: true, role: true },
      }),
      prisma.user.findMany({
        where: { id: { in: user.relatedRis } },
        select: { id: true, name: true, role: true },
      }),
      prisma.user.findMany({
        where: { id: { in: user.relatedInplants } },
        select: { id: true, name: true, role: true },
      }),
      prisma.user.findMany({
        where: { id: { in: user.relatedGps } },
        select: { id: true, name: true, role: true },
      }),
      prisma.user.findMany({
        where: { id: { in: user.relatedGerentes } },
        select: { id: true, name: true, role: true },
      }),
    ]);

    return NextResponse.json(
      {
        ...user,
        relatedSupervisors: supervisors,
        relatedRis: ris,
        relatedInplants: inplants,
        relatedGps: gps,
        relatedGerentes: gerentes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const body = await req.json();

    const {
      name,
      email,
      password,
      role,
      plant,
      relatedSupervisors = [],
      relatedGerentes = [],
      relatedRis = [],
      relatedInplants = [],
      relatedGps = [],
    } = body;

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Mapeo explícito de roles a campos inversos
    const roleToFieldMap: Record<string, string> = {
      Supervisor: "relatedSupervisors",
      Gerente: "relatedGerentes",
      Ri: "relatedRis",
      Inplant: "relatedInplants",
      GPS: "relatedGps", // Caso especial manejado explícitamente
    };

    // Función para sincronizar relaciones dinámicas
    const syncRelations = async (
      userId: string,
      relatedIds: string[],
      field: string
    ) => {
      const currentRole = currentUser.role;
      const newRole = role;

      if (["Superadministrador", "Administrador"].includes(currentRole) || ["Superadministrador", "Administrador"].includes(newRole)) {
        console.log(`Sincronización omitida para rol especial: ${currentRole} -> ${newRole}`);
        return;
      }

      // Obtener campos inversos para el rol actual y nuevo
      const reverseField = roleToFieldMap[currentRole];
      const newReverseField = roleToFieldMap[newRole];

      if (!reverseField || !newReverseField) {
        throw new Error(`El rol ${currentRole} o ${newRole} no está definido en roleToFieldMap`);
      }

      // Eliminar relaciones antiguas
      const usersToRemove = await prisma.user.findMany({
        where: {
          id: { notIn: relatedIds },
          [field]: { has: userId },
        },
      });

      for (const user of usersToRemove) {
        const currentRelations = user[reverseField as keyof typeof user] as string[];
        if (Array.isArray(currentRelations)) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              [reverseField]: {
                set: currentRelations.filter((id) => id !== userId),
              },
            },
          });
        }
      }

      // Agregar nuevas relaciones o actualizar relaciones existentes
      for (const relatedId of relatedIds) {
        const relatedUser = await prisma.user.findUnique({ where: { id: relatedId } });

        if (relatedUser) {
          const currentRelations = relatedUser[reverseField as keyof typeof relatedUser] as string[] || [];
          const updatedRelations = relatedUser[newReverseField as keyof typeof relatedUser] as string[] || [];

          // Si la relación ya existe pero el rol cambió
          if (currentRelations.includes(userId)) {
            await prisma.user.update({
              where: { id: relatedId },
              data: {
                [reverseField]: {
                  set: currentRelations.filter((id) => id !== userId), // Elimina del campo inverso actual
                },
                [newReverseField]: {
                  push: userId, // Agrega al campo inverso actualizado
                },
              },
            });
          } else if (!updatedRelations.includes(userId)) {
            // Si la relación no existe, agregarla al nuevo rol
            await prisma.user.update({
              where: { id: relatedId },
              data: {
                [newReverseField]: {
                  push: userId,
                },
              },
            });
          }
        }
      }
    };

    // Sincronizar dinámicamente relaciones basadas en roles
    await Promise.all([
      syncRelations(userId, relatedSupervisors, "relatedSupervisors"),
      syncRelations(userId, relatedGerentes, "relatedGerentes"),
      syncRelations(userId, relatedRis, "relatedRis"),
      syncRelations(userId, relatedInplants, "relatedInplants"),
      syncRelations(userId, relatedGps, "relatedGps"),
    ]);

    // Actualizar el usuario principal con su nuevo rol
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        password,
        role,
        plant,
        relatedSupervisors,
        relatedGerentes,
        relatedRis,
        relatedInplants,
        relatedGps,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}



// Eliminar un usuario (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
