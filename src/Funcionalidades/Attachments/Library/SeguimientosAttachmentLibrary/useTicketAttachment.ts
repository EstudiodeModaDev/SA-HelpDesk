import * as React from "react";
import { useExplorerActions } from "./useTicketAttachmentAction";
import { useSeguimientosAttachmentData } from "./useSeguimientosAttachmentData";


export function useSeguimientosAttachment() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { load } = useSeguimientosAttachmentData({ setLoading, setError });

  const actions = useExplorerActions();

  return {
    loading,
    error,
    reload: load,
    ...actions,
  };
}