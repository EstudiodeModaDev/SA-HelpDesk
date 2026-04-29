import * as React from "react";
import { validateDocumentacionForm } from "../utils/documentarTicket.validation";
import type { Log, logErrors } from "../../../Models/Log";

const initialState: Log = {
  Actor: "",
  CorreoActor: "",
  Descripcion: "",
  Tipo_de_accion: "solucion",
  Title: "",
};

export function useDocumentarTicketForm() {
  const [state, setState] = React.useState<Log>(initialState);
  const [errors, setErrors] = React.useState<logErrors>({});

  const setField = React.useCallback(
    <K extends keyof Log>(key: K, value: Log[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = React.useCallback(() => {
    const nextErrors = validateDocumentacionForm(state);
    console.log(nextErrors)
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [state]);

  const reset = React.useCallback(() => {
    setState(initialState);
    setErrors({});
  }, []);

  return {
    state,
    errors,
    setField,
    validate,
    reset,
  };
}