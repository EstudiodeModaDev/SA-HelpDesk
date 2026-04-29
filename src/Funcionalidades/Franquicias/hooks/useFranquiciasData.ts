import * as React from "react";
import type { FranquiciasService } from "../../../services/Franquicias.service";
import type { Franquicias } from "../../../Models/Usuarios";
import type { UserOption } from "../../../Models/Commons";
import { mapFranqToOptions } from "../utils/mapper";

export function useFranquiciasData(FranquiciasSvc: FranquiciasService) {
  const [franquicias, setFranquicias] = React.useState<Franquicias[]>([]);
  const [franqOptions, setFranqOptions] = React.useState<UserOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [nextLink, setNextLink] = React.useState<string | null>(null);

  const loadFranquicias = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await FranquiciasSvc.getAll();

      const rawItems: Franquicias[] = res.items
      const newNextLink: string | null = Array.isArray(res) ? null : (res?.nextLink ?? null);

      const items = rawItems;

      setFranquicias(items);
      setFranqOptions(mapFranqToOptions(items));
      setNextLink(newNextLink);
      setPageIndex(1);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando franquicias");
      setFranquicias([]);
      setFranqOptions([]);
      setNextLink(null);
      setPageIndex(1);
    } finally {
      setLoading(false);
    }
  }, [FranquiciasSvc]);

  React.useEffect(() => {
    void loadFranquicias();
  }, [loadFranquicias]);

  const refresh = React.useCallback(async () => {
    await loadFranquicias();
  }, [loadFranquicias]);

  return {
    franquicias,
    franqOptions,
    loading,
    error,
    pageSize,
    pageIndex,
    nextLink,
    hasNext: !!nextLink,
    setPageSize,
    refresh,
    setError,
    loadFranquicias,
  };
}