import type { Ticket } from "../../../Models/Tickets";
import type { correoState } from "../hooks/useProveedoresMailForm";

export function proveedorMailInitialState(ticket: Ticket): correoState {

  return {
    adjuntos: [],
    asunto: `Escalamiento de ticket - Requiere intervención del proveedor`,
    correo: "",
    para: "",
    mensaje: `
      Estimado equipo,</br></br>

      Por medio del presente correo, se realiza el escalamiento del siguiente ticket, el cual requiere de su pronta intervención:</br>

      <ul>
        <li><strong>ID del caso:</strong> ${ticket.ID}</li>
        <li><strong>Lugar que requiere atención:</strong> ${ticket.Title}</li>
        <li><strong>Categoría del daño:</strong> ${ticket.Categoria} > ${ticket.SubCategoria}</li>
        <li><strong>Descripción del daño:</strong> ${ticket.Descripcion}</li>
        <li><strong>ANS del caso:</strong> ${ticket.ANS}</li>
        <li><strong>Fecha límite de ejecución:</strong> ${ticket.TiempoSolucion}</li>
      </ul>

      Por favor, confirmar la fecha estimada de visita a la tienda para la atención del caso.</br></br>

      Agradecemos su apoyo en la validación y pronta gestión de esta solicitud. Quedamos atentos a cualquier información adicional que requieran.
    `,
  };
}
