import type { Ticket } from "../../../Models/Tickets";
import type { correoState } from "../hooks/useProveedoresMailForm";

export function proveedorMailInitialState(ticket: Ticket): correoState {

  return {
    adjuntos: [],
    asunto: `Escalamiento de ticket - Requiere intervención del proveedor`,
    correo: "",
    para: "",
    mensaje: `
      Estimado equipo,</br>
      Por medio del presente correo, se realiza el escalamiento del siguiente ticket, el cual requiere su pronta intervención:</br>
      <ul>
        <li><strong>Lugar que requiere acción: ${ticket.Title}</strong></li>
        <li><strong>Categoría del daño: ${ticket.Categoria} > ${ticket.SubCategoria}</strong></li>
        <li><strong>Descripción del daño: ${ticket.Descripcion}</strong></li>
      </ul>

    Agradecemos su apoyo en la validación y pronta gestión de este caso. Quedamos atentos a cualquier información adicional que requieran.`,
  };
}
