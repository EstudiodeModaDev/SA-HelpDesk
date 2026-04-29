import * as React from "react";
import { components, type OptionProps } from "react-select";
import type { UserOption } from "../../../Models/Commons";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import type { Ticket } from "../../../Models/Tickets";
import { useWorkers } from "../../../Funcionalidades/Workers";
import { useAsignarObservador } from "../../../Funcionalidades/Tickets/hooks/forms/useAsignarObservador";
import { useFranquicias } from "../../../Funcionalidades/Franquicias/hooks/useFranquicias";
import SelectActionForm from "./SelectActionForm";

type UserOptionEx = UserOption & { source?: "Empleado" | "Franquicia" };

export default function AsignarObservador({ ticket, onDone }: { ticket: Ticket; onDone: () => void }) {
  const { Franquicias: FranquiciasSvc } = useGraphServices();
  const { state, errors, submitting, setField, handleObservador } = useAsignarObservador(ticket);
  const { franqOptions, loading: loadingFranq, error: franqError } = useFranquicias(FranquiciasSvc!);
  const { workersOptions, loadingWorkers, error: usersError } = useWorkers({ onlyEnabled: true });

  const combinedOptions: UserOptionEx[] = React.useMemo(() => {
    const map = new Map<string, UserOptionEx>();
    for (const o of [...workersOptions, ...franqOptions]) {
      const key = (o.value || "").toLowerCase();
      if (!map.has(key)) map.set(key, o);
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [workersOptions, franqOptions]);

  const Option = (props: OptionProps<UserOptionEx, false>) => {
    const { data, label } = props;
    return (
      <components.Option {...props}>
        <div className="rs-opt">
          <div className="rs-opt__text">
            <span className="rs-opt__title">{label}</span>
            {(data as any).email && <span className="rs-opt__meta">{(data as any).email}</span>}
            {(data as any).jobTitle && <span className="rs-opt__meta">{(data as any).jobTitle}</span>}
          </div>
          {data.source && <span className="rs-opt__tag">{data.source}</span>}
        </div>
      </components.Option>
    );
  };

  const onSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      const ok = await handleObservador(e);
      if (ok) onDone();
    },
    [handleObservador, onDone]
  );

  return (
    <SelectActionForm<UserOptionEx>
      label="Observador"
      options={combinedOptions}
      value={state.observador as UserOptionEx | null}
      onChange={(opt) => setField("observador", opt)}
      onSubmit={onSubmit}
      placeholder={loadingWorkers || loadingFranq ? "Cargando opciones..." : "Buscar observador..."}
      error={errors.observador}
      submitting={submitting}
      loading={loadingWorkers || loadingFranq}
      submitText={submitting ? "Asignando..." : "Asignar observador"}
      noOptionsMessage={() => (usersError || franqError ? "Error cargando opciones" : "Sin coincidencias")}
      components={{ Option }}
    />
  );
}
