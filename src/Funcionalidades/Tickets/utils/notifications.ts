import type { GraphRecipient } from "../../../graph/GraphRest";
import type { Ticket } from "../../../Models/Tickets";
import type { MailService } from "../../../services/Mail.service";
import { toISODateTimeFlex } from "../../../utils/Date";
import type { ApprovalTarget } from "./ticketApproval";

const appUrl = import.meta.env.VITE_ENTORNO === "dev" ? "http://localhost:5173/" : "https://victorious-field-074e1b00f.7.azurestaticapps.net/";



function buildRecipients(address: string): GraphRecipient[] {
  return [{ emailAddress: { address } }];
}

export async function notifyTicketCreatedSolicitante(mail: MailService, ticket: Ticket): Promise<void> {
  const address = (ticket.CorreoSolicitante ?? "").trim();
  if (!address) {
    throw new Error("notifyTicketCreatedSolicitante: correo del solicitante invalido");
  }

  const body = `
    <p>Hola ${ticket.Solicitante ?? ""},</p>
    <p>Tu solicitud ha sido registrada y asignada a un tecnico para su gestion.</p>
    <p><strong>ID del caso:</strong> ${ticket.ID}</p>
    <p><strong>Espacio fisico:</strong> ${ticket.Title ?? "—"}</p>
    <p><strong>Resolutor asignado:</strong> ${ticket.Nombreresolutor ?? "—"}</p>
    <p><strong>Fecha maxima de solucion:</strong> ${toISODateTimeFlex(ticket.TiempoSolucion) || "No aplica"}</p>
  `.trim();

  await mail.sendEmail({
    message: {
      subject: `Asignacion de caso - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}

export async function notifyTicketCreatedResolutor(mail: MailService, ticket: Ticket): Promise<void> {
  const address = (ticket.Correoresolutor ?? "").trim();
  if (!address) {
    throw new Error("notifyTicketCreatedResolutor: correo del resolutor invalido");
  }

  const body = `
    <p>Hola ${ticket.Nombreresolutor ?? ""},</p>
    <p>Tienes un nuevo caso asignado con estos detalles:</p>
    <p><strong>ID del caso:</strong> ${ticket.ID}</p>
    <p><strong>Solicitante:</strong> ${ticket.Solicitante ?? "—"}</p>
    <p><strong>Correo del solicitante:</strong> ${ticket.CorreoSolicitante ?? "—"}</p>
    <p><strong>Espacio fisico:</strong> ${ticket.Title ?? "—"}</p>
    <p><strong>Fecha maxima de solucion:</strong> ${toISODateTimeFlex(ticket.TiempoSolucion) || "No aplica"}</p>
  `.trim();

  await mail.sendEmail({
    message: {
      subject: `Nuevo caso asignado - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}

export async function notifyTicketPendingApprovalJefeZona(mail: MailService, ticket: Ticket, approvalTarget: ApprovalTarget): Promise<void> {
  const address = (approvalTarget.correoJefeZona ?? "").trim();
  const approvalUrl = `${appUrl}tickets/aprobaciones?ticketId=${ticket.ID}`;
  if (!address) {
    throw new Error("notifyTicketPendingApprovalJefeZona: correo del jefe de zona invalido");
  }

  const body = `
    <div style="max-width:600px;margin:40px auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <!-- Encabezado -->
      <div style="background:#2563eb;padding:20px;text-align:center;">
        <h2 style="margin:0;color:#ffffff;font-size:22px;">
          Ticket pendiente de aprobación
        </h2>
      </div>

      <!-- Contenido -->
      <div style="padding:24px;color:#374151;font-size:15px;line-height:1.6;">

        <p style="margin-top:0;">
          Hola <strong>${approvalTarget.jefeZona ?? ""}</strong>,
        </p>

        <p>
          Tienes un ticket pendiente de aprobación en <strong>SA HelpDesk</strong>.
          A continuación encontrarás la información del caso:
        </p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;width:40%;">
              ID del caso
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;">
              ${ticket.ID}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;">
              Solicitante
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;">
              ${ticket.Solicitante ?? "—"}
            </td>
          </tr>

          <tr>
            <td style="padding:10px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;">
              Espacio físico
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;">
              ${ticket.Title ?? "—"}
            </td>
          </tr>
        </table>

        <p>
          Ingresa a la aplicación para revisar la solicitud y aprobarla o rechazarla.
        </p>

        <!-- Botón -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${approvalUrl}"
            style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;font-size:15px;">
            Ir a SA HelpDesk
          </a>
        </div>

        <p style="font-size:13px;color:#6b7280;text-align:center;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        </p>

        <p style="text-align:center;word-break:break-all;">
          <a href="${approvalUrl}" style="color:#2563eb;">
            Link
          </a>
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
        Este es un mensaje automático generado por <strong>SA HelpDesk</strong>. Por favor, no respondas a este correo.
      </div>

    </div>
    `.trim();

  await mail.sendEmail({
    message: {
      subject: `Aprobacion pendiente de ticket - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}

export async function notifyTicketPendingApprovalSolicitante(mail: MailService, ticket: Ticket): Promise<void> {
  const address = (ticket.CorreoSolicitante ?? "").trim();
  if (!address) {
    throw new Error("notifyTicketPendingApprovalSolicitante: correo del solicitante invalido");
  }

  const body = `
    <p>Hola ${ticket.Solicitante ?? ""},</p>
    <p>Tu ticket fue registrado y quedo pendiente de aprobacion por parte del jefe de zona.</p>
    <p><strong>ID del caso:</strong> ${ticket.ID}</p>
    <p><strong>Espacio fisico:</strong> ${ticket.Title ?? "—"}</p>
    <p>Recibiras una nueva notificacion cuando el proceso finalice.</p>
  `.trim();

  await mail.sendEmail({
    message: {
      subject: `Ticket pendiente de aprobacion - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}

export async function notifyTicketRejectedSolicitante(mail: MailService, ticket: Ticket, motivo: string): Promise<void> {
  const address = (ticket.CorreoSolicitante ?? "").trim();
  if (!address) {
    throw new Error("notifyTicketRejectedSolicitante: correo del solicitante invalido");
  }

  const body = `
    <p>Hola ${ticket.Solicitante ?? ""},</p>
    <p>Tu ticket ${ticket.ID} no fue aprobado por el jefe de zona.</p>
    <p><strong>Espacio fisico:</strong> ${ticket.Title ?? "—"}</p>
    <p><strong>Detalle:</strong> ${motivo ?? "No fue aprobado por el jefe de zona."}</p>
  `.trim();

  await mail.sendEmail({
    message: {
      subject: `Ticket no aprobado - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}

export async function notifyClosedSolicitante(mail: MailService, ticket: Ticket, detalleSolucion: string): Promise<void> {
  const address = (ticket.CorreoSolicitante ?? "").trim();
  if (!address) {
    throw new Error("notifyClosedSolicitante: correo del solicitante invalido");
  }

  const body = `
    <p>Estimado/a ${ticket.Solicitante ?? ""},</p>
    <p>Tu caso en "${ticket.Title ?? "—"}" (ID: ${ticket.ID}) ha sido cerrado.</p>
    ${detalleSolucion ? `<hr><div>${detalleSolucion}</div>` : ""}
    <p>Gracias por tu colaboracion.</p>
  `.trim();

  await mail.sendEmail({
    message: {
      subject: `Cierre de ticket - ${ticket.ID}`,
      body: { contentType: "HTML", content: body },
      toRecipients: buildRecipients(address),
    },
  });
}
