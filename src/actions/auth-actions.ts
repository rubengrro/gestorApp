/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { signIn } from "@/auth";
import prisma from "@/lib/db";
import { loginSchema, signupSchema } from "@/lib/zod";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";


export const loginAction = async(
    values: z.infer<typeof loginSchema>
) => {
    try {
        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });
          return { success: true }; 
    } catch (error) {
        if (error instanceof AuthError){
            return { error: error.cause?.err?.message };
        }
        return { error: "error 500"};
    }
}

export const registerAction = async (values: z.infer<typeof signupSchema>) => {
  try {
    const { data, success } = signupSchema.safeParse(values);
    if (!success) {
      return { error: "Invalid data" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Verifica que `data.name` no sea `undefined`
    if (!data.name) {
      return { error: "Name is required" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name, // Aquí sabemos que `data.name` es un string válido
        password: hashedPassword,
        role: data.role,
        plant: data.plant,
      },
    });

    return { success: true, user: newUser }; // Devolvemos el usuario creado

  } catch (error) {
    return { error: "Error creating user." };
  }
};
