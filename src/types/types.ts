// Archivo: types.ts
// Este archivo define las interfaces y tipos utilizados en la aplicación.
// Se centralizan los tipos comunes para facilitar el mantenimiento y reutilización en distintas partes del código.

/**
 * Interfaz `CustomField`
 * Representa la configuración de un campo personalizado en formularios dinámicos.
 */
export interface CustomField {
  type: "file" | "amount" | "text" | "select" | "apiSelect" | "number"; // Tipos permitidos para el campo.
  name: string; // Nombre único del campo.
  content: string; // Contenido del campo, ahora obligatorio.
  options: {
    formats?: string | string[]; // Formatos permitidos si el campo es de tipo archivo (e.g., "jpg", "png").
    placeholder?: string; // Texto de ejemplo para mostrar en el campo.
    includeInOutput: boolean; // Indica si el campo debe incluirse en la salida final del formulario.
    currency?: string; // Código de moneda asociado si el campo es de tipo monetario.
    characterLimit?: number; // Límite de caracteres si el campo es de texto.
    options?: string[]; // Opciones disponibles si el campo es de tipo select.
    apiEndpoint?: string; // Endpoint de API para obtener opciones dinámicas (usado en `apiSelect`).
    dataType?: string; // Tipo de dato esperado para validación adicional (e.g., "string", "number").
  };
}

/**
 * Interfaz `Trabajador`
 * Representa la estructura básica de un trabajador en la aplicación.
 */
export interface Trabajador {
  id: string; // Identificador único del trabajador.
  nombre: string; // Nombre completo del trabajador.
  planta: string; // Planta a la que pertenece el trabajador.
}

/**
 * Interfaz `Incidencia`
 * Representa una incidencia laboral registrada en el sistema.
 */
export interface Incidencia {
  id: string; // Identificador único de la incidencia.
  nombre: string; // Nombre descriptivo de la incidencia.
  infotipo: string; // Tipo o categoría de la incidencia.
}

/**
 * Interfaz `User`
 * Representa un usuario registrado en la aplicación.
 */
export interface User {
  id: string; // Identificador único del usuario.
  nombre: string; // Nombre completo del usuario.
  planta: string; // Planta asociada al usuario.
}

/**
 * Interfaz `Periodo`
 * Representa un período de tiempo dentro del sistema (e.g., una semana laboral).
 */
export interface Periodo {
  id: string; // Identificador único del período.
  displayName: string; // Nombre amigable del período (e.g., "Semana 42").
}

/**
 * Tipo `FieldConfig`
 * Configuración para campos reutilizables en formularios dinámicos.
 */
export type FieldConfig = {
  nombre?: string; // Nombre del campo.
  defaultValue?: string; // Valor predeterminado del campo.
  placeholder?: string; // Texto de ejemplo para mostrar en el campo.
  maxLength?: number; // Límite máximo de caracteres para el campo.
  min?: number; // Valor mínimo permitido si el campo es numérico.
  max?: number; // Valor máximo permitido si el campo es numérico.
  isEmail?: boolean; // Indica si el campo debe validar un correo electrónico.
  isCurrency?: boolean; // Indica si el campo maneja valores monetarios.
  currencyType?: "USD" | "EUR" | "MXN"; // Moneda asociada si es un campo monetario.
  options?: string[]; // Opciones disponibles si el campo es de tipo select.
  tipo?: string; // Tipo personalizado adicional, si aplica.
};
