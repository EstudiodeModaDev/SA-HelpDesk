import * as React from "react";
import { useUsuariosData } from "./useUsuariosData";
import { useUsuariosForm } from "./useUsuariosForm";
import type { UsuariosSPService } from "../../../services/Usuarios.service";
import type { UsuariosSP } from "../../../Models/Usuarios";
import { isUsuarioValid, validateUsuario } from "../utils/UsersValidation";

export function useUsuarios(usuariosSvc: UsuariosSPService) {
  const data = useUsuariosData(usuariosSvc);
  const form = useUsuariosForm();

  const addUser = React.useCallback(async () => {
    const isValid = form.validate();
    if (!isValid) return false;

    form.setSubmitting(true);
    data.setError(null);

    try {
      await usuariosSvc.create(form.state);
      await data.refreshUsers();
      form.resetForm();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando usuario");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [usuariosSvc, form, data]);

  const createUser = React.useCallback(async (payload: UsuariosSP) => {
    const nextErrors = validateUsuario(payload);
    if (!isUsuarioValid(nextErrors)) {
      return false;
    }

    form.setSubmitting(true);
    data.setError(null);

    try {
      await usuariosSvc.create(payload);
      await data.refreshUsers();
      return true;
    } catch (e: any) {
      data.setError(e?.message ?? "Error creando usuario");
      return false;
    } finally {
      form.setSubmitting(false);
    }
  }, [usuariosSvc, form, data]);

  return {
    usuarios: data.usuarios,
    UseruserOptions: data.userOptions,
    loading: data.loading,
    error: data.error,
    pageSize: data.pageSize,
    pageIndex: data.pageIndex,
    hasNext: data.hasNext,
    nextLink: data.nextLink,

    state: form.state,
    errors: form.errors,
    submitting: form.submitting,

    setPageSize: data.setPageSize,
    refreshUsuers: data.refreshUsers,
    deleteUser: data.deleteUser,
    setField: form.setField,
    addUser,
    createUser,
  };
}
