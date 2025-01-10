/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "gestorapp.notifier@gmail.com", // puedes reemplazar por otro correo
    pass: "yiqk tckl mymc ston", // Contraseña de la aplicación
  },
});

// Tipos para los parámetros de la función
interface SendMailOptions {
  to: string; // Dirección del destinatario
  subject: string; // Asunto del correo
  text?: string; // Texto plano del correo (opcional)
  html?: string; // Contenido en HTML del correo (opcional)
}

// Función para enviar correos
export async function sendMail(options: SendMailOptions): Promise<void> {
  const { to, subject, text, html } = options;

  try {
    const info = await transporter.sendMail({
      from: `"Gestor de Incidencias" <payrollapp.notifier.test@gmail.com>`, // Remitente
      to, // Destinatario
      subject, // Asunto
      text, // Texto plano (opcional)
      html, // Contenido HTML (opcional)
    });

    console.log(`Correo enviado: ${info.messageId}`);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo.");
  }
}

export async function sendApprovalEmail(to: string, incidenciaId: string, incidenciaData: any) {
  const appUrl = `http://localhost:3000/dashboard/home`;

  // Validación de datos de la incidencia
  const {
    nombreTrabajador = "No especificado",
    planta = "No especificada",
    nombreSubtipo = "No especificado",
    concepto = "No especificado",
    valor = "No especificado",
    quienRegistra = "No especificado",
    fechaRegistro,
  } = incidenciaData;

  const formattedFechaRegistro = fechaRegistro
    ? new Date(fechaRegistro).toLocaleString()
    : "No especificada";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); background-color: #ffffff;">
      <h1 style="background-color: #1D4ED8; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0;">Nueva Incidencia Registrada</h1>
      <div style="padding: 20px;">
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Detalles de la Incidencia</h2>
        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background-color: #f9fafb;">
          <p><strong>Trabajador:</strong> ${nombreTrabajador}</p>
          <p><strong>Planta:</strong> ${planta}</p>
          <p><strong>Subtipo:</strong> ${nombreSubtipo}</p>
          <p><strong>Concepto:</strong> ${concepto}</p>
          <p><strong>Valor:</strong> ${valor}</p>
          <p><strong>Registrada por:</strong> ${quienRegistra}</p>
          <p><strong>Fecha de Registro:</strong> ${formattedFechaRegistro}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appUrl}" style="background-color: #1D4ED8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600;">Ir a la Plataforma</a>
        </div>
      </div>
    </div>
  `;

  await sendMail({
    to,
    subject: "Nueva incidencia pendiente de revisión",
    html,
  });
}
