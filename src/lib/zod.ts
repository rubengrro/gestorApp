/* eslint-disable @typescript-eslint/no-unused-vars */
import { Planta } from "@prisma/client";
import { Estado } from "@prisma/client";
import { object, string, z } from "zod";

const PlantaEnum = z.enum(["Planta_A", "Planta_B", "Planta_C", "Planta_D", "Planta_E", "Planta_F", "Planta_G", "Planta_T", "All"]);

export const loginSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
});

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .optional(), // El nombre puede ser opcional
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  role: z.enum([
    "Superadministrador",
    "Administrador",
    "Inplant",
    "Ri",
    "Gerente",
    "GPS",
    "Supervisor",
  ]),
  plant: PlantaEnum,
  // Arrays de IDs para las relaciones opcionales
  relatedSupervisors: z.array(z.string()).optional(),
  relatedRis: z.array(z.string()).optional(),
  relatedInplants: z.array(z.string()).optional(),
  relatedGps: z.array(z.string()).optional(),
  relatedGerentes: z.array(z.string()).optional(),
});

export const incidenciaSchema = z.object({
  trabajadorNumeroWD: z.string().min(1, "Número WD es requerido"),
  incidenciaCatalogoId: z.number().min(1, "ID del catálogo de incidencias es requerido"),
  nombreSubtipo: z.string().optional(),
  nombreTrabajador: z.string(),
  infotipo: z.string(),
  concepto: z.string(),
  folio: z.string().optional(),
  email: z.string().optional(),
  cantidad: z.number().min(1, "Cantidad debe ser mayor a 0").optional(),
  importe: z.number().min(1, "Importe debe ser mayor a 0").optional(),
  fechaIncidencia: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Fecha de incidencia es inválida" }
  ),
  fechaAplica: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Fecha de aplicación es inválida" }
  ),
  quienRegistra: z.string().min(1, "Nombre del registrador es requerido"),
  requierePrimeraAprobacion: z.boolean(),
  requiereSegundaAprobacion: z.boolean().optional(),
  primerAprobadorId: z.string().optional(),
  requiereEvidencia: z.boolean().optional(), // Debe estar definido como opcional
  segundoAprobadorId: z.string().optional(),
  evidenciaUrl: z.string().url("Debe ser una URL válida").optional(),
  periodoId: z.number().optional(),
});

export const CampoSchema = z.object({
  nombre: z.string().min(1, "El nombre del campo es requerido"),
  tipo: z.enum(['text', 'number', 'date', 'file', 'select']),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional(),
  options: z.string().optional(),
  fileTypes: z.string().optional(),
  maxSize: z.number().int().positive().optional(),
  isShared: z.boolean().default(false),
});

export const FormularioCampoSchema = z.object({
  campoId: z.number().optional(),
  campo: CampoSchema.optional(),
}).refine((data) => data.campoId || data.campo, {
  message: 'Debes proporcionar un campoId o un campo.',
});

export const FormularioSchema = z.object({
  nombre: z.string().min(1, "El nombre del formulario es requerido"),
  incidenciaId: z.number(),
  campos: z.array(FormularioCampoSchema),
});

export const incidenciaDataSchema = z.object({
  infotype: z.string(),
  concepto: z.string(),
  nombreSubtipo: z.string(),
  rolesAcceso: z.array(z.enum(["Superadministrador", "Administrador", "Inplant", "Ri", "Gerente", "GPS", "Supervisor"])),
  requiereAprobacion: z.boolean(),
  plantaAcceso: z.array(PlantaEnum).optional(),
  formulario: FormularioSchema.optional(),
});

export const periodoSchema = z.object({
  numero: z.number().min(1, "El número de período debe ser un número positivo"),
  fechaInicio: z
    .string()
    .refine((dateStr) => !isNaN(Date.parse(dateStr)), { message: "Fecha de inicio inválida" })
    .transform((dateStr) => new Date(dateStr)),
  fechaCierre: z
    .string()
    .refine((dateStr) => !isNaN(Date.parse(dateStr)), { message: "Fecha de cierre inválida" })
    .transform((dateStr) => new Date(dateStr)),
}).refine(
  (data) => data.fechaCierre > data.fechaInicio,
  { message: "La fecha de cierre debe ser posterior a la fecha de inicio", path: ["fechaCierre"] }
);

export type Campo = z.infer<typeof CampoSchema>;

export const incidenciaFormSchema = z.object({
  trabajadorNumeroWD: z.string().min(1, "El número WD es obligatorio."),
  nombreTrabajador: z.string().min(1, "El nombre del trabajador es obligatorio."),
  infotipo: z.string(),
  planta: z.nativeEnum(Planta),
  concepto: z.string(),
  nombreSubtipo: z.string(),
  validoDe: z.string().min(1, "La fecha de inicio es obligatoria.").optional(),
  validoA: z.string().min(1, "La fecha de fin es obligatoria.").optional(),
  ccNomina: z.string().optional(),
  importe: z.number().nullable().optional(),
  folio: z.number().nullable().optional(),
  monto: z.number().nullable().optional(),
  horas: z.number().min(1, "La cantidad debe ser al menos 1 hora").max(24, "La cantidad no puede ser mayor a 24 horas").nullable().optional(),
  cantidad: z.number().nullable().optional(),
  email: z.string().nullable().optional(),
  quienRegistra: z.string().min(1, "El campo 'Quien Registra' es obligatorio."),
  comentarios: z.array(z.object({
    text: z.string(),
    user: z.string(),
    date: z.string(),
  })).optional(),
  evidencias: z.string().optional(),
  comentarioRechazo: z.string().min(10, "Por favor, añade más detalles al motivo de rechazo").optional(),
  estado: z.nativeEnum(Estado).optional(), // Refleja el enum Estado
  riAprobador: z.string().nullable().optional(), // Nuevo campo
  deletedAt: z.string().optional(),
  fechaEliminacion: z.string().optional(),
  quienElimino: z.string().optional(),
  gerenteAprobador: z.string().nullable().optional(), // Nuevo campo
  inplantAprobador: z.string().nullable().optional(), // Nuevo campo
  comentarioRi: z.string().optional(),
  comentarioGerente: z.string().optional(),
  comentarioGPS: z.string().optional(),
});


export const trabajadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  planta: z.nativeEnum(Planta), 
  numeroWD: z.string().min(1, "El número WD es obligatorio"),
  numeroGV: z.string().min(1, "El número GV es obligatorio"),
  numeroAnterior: z.string().optional(), // Campo opcional
  supervisorId: z.string().optional(), // Campo opcional, es un ID o puede ser null
  gerenteId: z.string().optional(), // Campo opcional, es un ID o puede ser null
});