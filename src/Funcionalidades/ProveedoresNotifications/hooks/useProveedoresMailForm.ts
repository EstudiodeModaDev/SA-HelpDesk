import * as React from "react";
import { proveedorMailInitialState } from "../utils/ProveedoresMailState";
import type { Ticket } from "../../../Models/Tickets";
import { isCorreoValid, proveedorMailValidation } from "../utils/ProveedorMailValidation";

export type correoState = {
  para: string;
  correo: string;
  asunto: string
  mensaje: string;
  adjuntos: File[]
}

export type CorreoErrors = Partial<Record<keyof correoState, string>>;

export function useProveedoresMailForm(ticket: Ticket) {
  const [state, setState] = React.useState<correoState>(proveedorMailInitialState(ticket));
  const [errors, setErrors] = React.useState<CorreoErrors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const setField = React.useCallback(<K extends keyof correoState>(key: K, value: correoState[K]) => { setState((prev) => ({ ...prev, [key]: value }));}, []);

  const validate = React.useCallback(() => {
    const nextErrors = proveedorMailValidation(state);
    setErrors(nextErrors);
    return isCorreoValid(nextErrors);
  }, [state]);

  const resetForm = React.useCallback(() => {
    setState(proveedorMailInitialState(ticket));
    setErrors({});
    setSubmitting(false);
  }, []);

 const handleAddFiles = React.useCallback((files: FileList | File[]) => {
    const nextFiles = Array.from(files);
    setState((prev) => ({
      ...prev,
      adjuntos: [...prev.adjuntos, ...nextFiles],
    }));
  }, []);

  const handleRemoveFile = React.useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    state,
    errors,
    submitting,
    setSubmitting,
    setField,
    validate,
    resetForm,
    handleAddFiles,
    handleRemoveFile
  };
}