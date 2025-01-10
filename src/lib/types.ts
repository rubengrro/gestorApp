/* eslint-disable @typescript-eslint/no-unused-vars */
type DataForExportTypes = {
    "Nombre del Trabajador": string;
    "Número WD": string;
    "Quién Registró": string;
    "Fecha de Registro": string;
    "Válido de": string;
    "Válido A": string;
    Estado: string;
    "Monto/Importe": string;
    Moneda: string;
    Cantidad: string | number;
  };

  export const incidenceValidRules = {
    // valido de Lunes semana actual > valido a siguiente lunes
    grupo1: [
      "Deducción Gafette"
    ],
    grupo2: [
      // valido de y valido a mismo día
      "Convenio T",
      "Premio de Asistencia",
      "Premio de Asistencia Virtual",
      "Becas Educacionales",
      "Bono Días AD",
      "Pago Bono E",
      "Bono Productividad",
      "Incentivo",
      "Estimulo Especial (Otros)",
      "Préstamo Caja Chica",
      "Pago de Préstamos (Externo)",
      "Falta Injustificada",
      "Suspensión",
      "Suspensión de Labores",
      "Ausencia por Hora Planta T",
      "Permiso Sin Goce Sueldo Planta T",
      "Permiso Sin Goce/Sueldo",
      "Festivo Trabajado Planta T",
      "Descanso Trabajado Planta T",
      "Prima Dominical (Horas) Planta T",
      "Ayuda por Defunción Virtual",
      "Dote Matrimonial",
      "Ayuda por Nacimiento",
      "Premio Anual Asistencia",
      "Premio de Lealtad",
      "Vacaciones",
      "Festivo Trabajado Doble Omitido",
      "Descanso Trabajado Doble Omitido",
      "Prima Dominical Omitida",
      "Festivo Trabajado Triple Omitido",
      "Tiempo Extra Doble Omitido",
      "Tiempo Extra Triple Omitido"


    ],
    grupo3: [
      // valido de Lunes semana actual > valido a infinito 31/12/9999
      "Compensación",
      "Correo Electrónico",
      "MX",
      "FOA1",
      "MX-3217",
      "VA02",
      "Datos bancarios",
      "Cuota Sindical Planta T",
      "Plan Retención Planta T"
    ],
    grupo4: [
      // valido de y valido a edtables
      "Enfermedad General",
      "Riesgo de Trabajo",
      "Maternidad"
    ],
  }
  