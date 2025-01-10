// src/actions/create-period.ts

export interface CreatePeriodParams {
  numero: number;
  fechaInicio: Date; // Cambiar a Date
  fechaCierre: Date; // Cambiar a Date
}

  
  export async function createPeriod(params: CreatePeriodParams) {
    const response = await fetch("/api/periodo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      return { error: true, message: errorData.error, errors: errorData.errors };
    }
  
    const data = await response.json();
    return { error: false, data };
  }
  