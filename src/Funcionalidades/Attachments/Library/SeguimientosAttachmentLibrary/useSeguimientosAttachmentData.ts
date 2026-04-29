import * as React from "react";
import type { Archivo, SeguimientoAttachment } from "../../../../Models/Attachments";
import { useGraphServices } from "../../../../graph/GrapServicesContext";

type UseTicketDataParams = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useSeguimientosAttachmentData({ setLoading, setError,}: UseTicketDataParams) {
  const graph = useGraphServices()

  const load = React.useCallback(async (items: SeguimientoAttachment[]): Promise<Archivo[]> => {
    setLoading(true);
    setError(null);

    try {
      let archivos: Archivo[] = [];
      for(const item of items) {
        const file = await graph.seguimientosBiblioteca.getFileById(item.IdAttachment);
        if(file) {
          archivos.push(file)
        }
      }
      return archivos
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Error cargando elementos de la carpeta.");
      return []
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);


  return { load };
}