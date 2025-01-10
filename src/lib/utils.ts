/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Importa 'clsx' para manejar clases dinámicas de manera eficiente y 'tailwind-merge' para fusionar clases de Tailwind CSS.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función `cn` para combinar clases de CSS de manera eficiente.
 * Utiliza `clsx` para combinar clases y `twMerge` para resolver conflictos en clases de Tailwind.
 * @param inputs: Lista de valores de clase que se combinarán.
 * @returns Una cadena de texto con las clases combinadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Combina las clases y resuelve conflictos.
}

/**
 * Función `handleApproval` para gestionar la aprobación o rechazo de una incidencia.
 * Dependiendo del rol del usuario y el estado de la incidencia, se actualizará su estado y se agregarán comentarios relevantes.
 * @param action: Acción a realizar, puede ser 'aprobar' o 'rechazar'.
 * @param id: ID de la incidencia que se está actualizando.
 * @param userRole: Rol del usuario que está realizando la acción (e.g., Gerente, Ri, GPS).
 * @param userName: Nombre del usuario que está realizando la acción.
 * @param estado: Estado actual de la incidencia.
 * @param newComment: Comentario adicional proporcionado por el usuario al aprobar o rechazar la incidencia.
 * @param comentarioRechazo: Comentario si la incidencia es rechazada.
 * @param comentarioGerente: Comentario del Gerente al aprobar una incidencia.
 * @param comentarioRi: Comentario del Ri al aprobar una incidencia.
 * @param comentarioGPS: Comentario del GPS al aprobar una incidencia.
 * @param setIsSubmitting: Función para activar o desactivar el estado de envío mientras se procesa la solicitud.
 * @param onUpdate: Función para actualizar los datos después de realizar la acción.
 * @param onClose: Función para cerrar el modal o interfaz que muestra la incidencia.
 */
export const handleApproval = async ({
  action,
  id,
  userRole,
  userName,
  estado,
  newComment, // Comentario proporcionado por el usuario
  comentarioRechazo,
  comentarioGerente,
  comentarioRi,
  comentarioGPS,
  setIsSubmitting,
  onUpdate,
  onClose,
}: {
  action: "aprobar" | "rechazar"; // Acción de aprobar o rechazar la incidencia
  id: string; // ID de la incidencia
  userRole: string; // Rol del usuario realizando la acción
  userName: string; // Nombre del usuario realizando la acción
  estado: string; // Estado actual de la incidencia
  newComment?: string; // Comentario adicional proporcionado por el usuario
  comentarioRechazo?: string; // Comentario proporcionado si la incidencia es rechazada
  comentarioGerente?: string; // Comentario proporcionado si la incidencia es aprobada por el Gerente
  comentarioRi?: string; // Comentario proporcionado si la incidencia es aprobada por el Ri
  comentarioGPS?: string; // Comentario proporcionado si la incidencia es aprobada por el GPS
  setIsSubmitting: (value: boolean) => void; // Función para cambiar el estado de envío
  onUpdate: (updatedData: Record<string, string | number | null>) => void; // Función para actualizar los datos después de la aprobación o rechazo
  onClose: () => void; // Función para cerrar el modal o ventana de incidencia
}) => {
  // Si no hay id, rol o nombre de usuario, no se realiza nada
  if (!id || !userRole || !userName) return;

  // Establece el estado de "enviando" en true mientras se procesa la solicitud
  if (setIsSubmitting) setIsSubmitting(true);

  try {
    let newStatus = ""; // Variable para almacenar el nuevo estado de la incidencia
    const body: Record<string, any> = {}; // Objeto para almacenar los datos que se enviarán al servidor

    // Lógica para aprobar la incidencia según el rol del usuario
    if (action === "aprobar") {
      // Gerente aprueba incidencia pendiente de Gerente
      if (userRole === "Gerente" && estado.trim().toLowerCase() === "pendiente_gerente") {
        newStatus = "Pendiente_RI"; // Cambia el estado a "Pendiente_RI"
        body["comentarioGerente"] = comentarioGerente || `Aprobado por: ${userName}`; // Agrega el comentario del Gerente
      } 
      // Ri aprueba incidencia pendiente de Ri
      else if (userRole === "Ri" && estado.trim().toLowerCase() === "pendiente_ri") {
        newStatus = "Aprobado";
        body["comentarioRi"] = comentarioRi || `Aprobado por: ${userName}`;
      }
      // GPS aprueba incidencia pendiente de GPS
      else if (userRole === "GPS" && estado.trim().toLowerCase() === "pendiente_gps") {
        newStatus = "Aprobado";
        body["comentarioGPS"] = comentarioGPS || `Aprobado por: ${userName}`;
      } else {
        alert(`Transición no válida: ${estado} con rol ${userRole}`); // Muestra un error si la transición no es válida
        setIsSubmitting(false);
        return;
      }
    }
    // Lógica para rechazar la incidencia
    else if (action === "rechazar") {
      // Valida que el comentario de rechazo tenga al menos 25 caracteres
      if (!comentarioRechazo || comentarioRechazo.trim().length < 25) {
        alert("El comentario debe tener al menos 25 caracteres.");
        setIsSubmitting(false);
        return;
      }
      newStatus = "Rechazado"; // Cambia el estado a "Rechazado"
      body["comentarioRechazo"] = `${comentarioRechazo} (Rechazado por: ${userName})`; // Agrega el comentario de rechazo
    }

    // Agrega el nombre del aprobador según el rol
    if (userRole === "Gerente") {
      body["gerenteAprobador"] = userName;
    } else if (userRole === "Ri") {
      body["riAprobador"] = userName;
    } else if (userRole === "GPS") {
      body["gpsAprobador"] = userName;
    }

    body["estado"] = newStatus; // Actualiza el estado en el objeto `body`

    // Realiza la solicitud de actualización de la incidencia
    const response = await fetch(`/api/registroIncidencia/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`); // Maneja errores de la respuesta

    const updatedData = await response.json(); // Obtiene los datos actualizados del servidor
    onUpdate(updatedData); // Actualiza los datos en el frontend

    alert(`Incidencia marcada como: ${newStatus}`); // Muestra un mensaje de éxito
    onClose(); // Cierra el modal o ventana de incidencia
  } catch (error) {
    console.error("Error en handleApproval:", error); // Maneja errores en la consola
    alert("Error al actualizar la incidencia."); // Muestra un mensaje de error
  } finally {
    setIsSubmitting(false); // Establece el estado de "enviando" en false cuando termina la operación
  }
};
