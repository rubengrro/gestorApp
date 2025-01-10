// src/actions/createTrabajador.ts
import { z } from 'zod';
import { trabajadorSchema } from '@/lib/zod';

export const createTrabajador = async (values: z.infer<typeof trabajadorSchema>) => {
  try {
    const response = await fetch('/api/trabajadores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en la solicitud de creación de trabajador');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createTrabajador:', error);
    return { error: (error as Error).message || 'Error creando trabajador en la base de datos.' };
  }
};
