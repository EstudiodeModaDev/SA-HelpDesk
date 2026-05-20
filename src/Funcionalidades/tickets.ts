import { useEffect, useState } from "react";
import type { TZDate } from "@date-fns/tz";
import type { Holiday } from "festivos-colombianos";
import { useAuth } from "../Auth/authContext";
import { useGraphServices } from "../graph/GrapServicesContext";
import type { GraphSendMailPayload } from "../graph/GraphRest";
import type { FormErrors, FormState, TicketHelpdesk } from "../Models/HelpDesk";
import { fetchHolidays } from "../services/Festivos.service";
import { calcularFechaSolucion, calculoANS } from "../utils/Ans";
import { toGraphDateTime } from "../utils/Date";
import { getHelpDeskAnsHours } from "./HelpDesk/helpDeskCatalog";

export const first = (...vals: any[]) => vals.find((v) => v !== undefined && v !== null && v !== "");

const initialState = (name?: string, email?: string): FormState => ({
  solicitante: name ?? "",
  correoSolicitante: email ?? "",
  usarFechaApertura: false,
  fechaApertura: null,
  fuente: "",
  motivo: "",
  descripcion: "",
  categoria: "",
  subcategoria: "",
  articulo: "",
  ANS: "",
  archivo: null,
});

export function useHelpDeskTicket() {
  const { account } = useAuth();
  const { ticketHelpDesk, logHelpDesk, mail } = useGraphServices();
  const [state, setState] = useState<FormState>(initialState(account?.name, account?.username));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [fechaSolucion, setFechaSolucion] = useState<Date | null>(null);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const hs = await fetchHolidays();
        if (!cancel) setHolidays(hs);
      } catch (e) {
        if (!cancel) console.error("Error festivos:", e);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((prev) => ({ ...prev, [k]: v }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!state.motivo.trim()) nextErrors.motivo = "Ingrese el asunto del caso";
    if (!state.descripcion.trim()) nextErrors.descripcion = "Describa el problema";
    if (!state.categoria) nextErrors.categoria = "Seleccione una categoria";
    if (!state.subcategoria) nextErrors.subcategoria = "Seleccione una subcategoria";
    if (!state.ANS) nextErrors.ANS = "Seleccione una categoria y subcategoria para calcular el ANS";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      alert("Hay campos sin llenar correctamente.");
      return;
    }

    setSubmitting(true);

    try {
      const apertura =
        state.usarFechaApertura && state.fechaApertura
          ? new Date(state.fechaApertura)
          : new Date();

      const ans = state.ANS || calculoANS(state.categoria, state.subcategoria, state.articulo);
      const horasAns = getHelpDeskAnsHours(ans);
      let solucion: TZDate | null = null;

      if (horasAns > 0) {
        solucion = calcularFechaSolucion(apertura, horasAns, holidays);
        setFechaSolucion(solucion);
      }

      const payload: TicketHelpdesk = {
        Title: state.motivo,
        Descripcion: state.descripcion,
        FechaApertura: toGraphDateTime(apertura),
        TiempoSolucion: toGraphDateTime(solucion as any),
        Fuente: "Aplicacion",
        Categoria: state.categoria,
        SubCategoria: state.subcategoria,
        SubSubCategoria: state.articulo,
        Nombreresolutor: "Daniel Palacios Viveros",
        Correoresolutor: "dpalacios@estudiodemoda.com.co",
        Solicitante: state.solicitante,
        CorreoSolicitante: state.correoSolicitante,
        Estadodesolicitud: "En Atención",
        ANS: ans,
      };

      if (!ticketHelpDesk?.create) {
        console.error("Tickets service no disponible. Verifica el GraphServicesProvider.");
        return;
      }

      const created = await ticketHelpDesk.create(payload);
      const createdId = created?.ID ?? "";
      const idTexto = String(createdId || "-");
      const fechaSolTexto = solucion
        ? new Date(solucion as unknown as string).toLocaleString()
        : "No aplica";

      await logHelpDesk.create({
        Actor: "Sistema",
        Descripcion: `Se ha creado un nuevo ticket para el siguiente requerimiento: ${idTexto}`,
        CorreoActor: "",
        Tipo_de_accion: "Creacion",
        Title: idTexto,
      });

      const solicitanteEmail = state.correoSolicitante;
      const resolutorEmail = created.Correoresolutor;

      if (solicitanteEmail) {
        const message = `
          <p>Hola ${payload.Solicitante ?? ""}.<br><br>
          Tu solicitud ha sido registrada exitosamente y ha sido asignada a un tecnico para su gestion.<br><br>
          <strong>ID del caso:</strong> ${idTexto}<br>
          <strong>Asunto:</strong> ${payload.Title}<br>
          <strong>Resolutor asignado:</strong> ${payload.Nombreresolutor ?? "-"}<br>
          <strong>Fecha maxima de solucion:</strong> ${fechaSolTexto}<br><br>
          Este es un mensaje automatico, por favor no respondas.
          </p>
        `.trim();

        const mailPayload: GraphSendMailPayload = {
          message: {
            subject: `Asignacion de caso - ${idTexto}`,
            body: { content: message, contentType: "HTML" },
            toRecipients: [{ emailAddress: { address: solicitanteEmail } }],
          },
        };

        try {
          await mail.sendEmail(mailPayload);
        } catch (err) {
          console.error("[Flow] Error enviando a solicitante:", err);
        }
      }

      if (resolutorEmail) {
        const message = `
          <p>Hola.<br><br>
          Tienes un nuevo caso asignado con estos detalles:<br><br>
          <strong>ID del caso:</strong> ${idTexto}<br>
          <strong>Solicitante:</strong> ${payload.Solicitante ?? "-"}<br>
          <strong>Correo del solicitante:</strong> ${payload.CorreoSolicitante ?? "-"}<br>
          <strong>Asunto:</strong> ${payload.Title}<br>
          <strong>Fecha maxima de solucion:</strong> ${fechaSolTexto}<br><br>
          Este es un mensaje automatico, por favor no respondas.
          </p>
        `.trim();

        const mailPayload: GraphSendMailPayload = {
          message: {
            subject: `Nuevo caso asignado - ${idTexto}`,
            body: { content: message, contentType: "HTML" },
            toRecipients: [{ emailAddress: { address: resolutorEmail } }],
          },
        };

        try {
          await mail.sendEmail(mailPayload);
        } catch (err) {
          console.error("[Flow] Error enviando a resolutor:", err);
        }
      }

      setState(initialState(account?.name, account?.username));
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state,
    errors,
    submitting,
    fechaSolucion,
    handleSubmit,
    setField,
  };
}
