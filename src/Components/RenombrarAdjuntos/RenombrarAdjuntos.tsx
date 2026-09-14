import * as React from "react";
import "../NuevoTicket/NuevoTicket.css";
import "../Common/CatalogUI.css";
import "./RenombrarAdjuntos.css";
import { useGraphServices } from "../../graph/GrapServicesContext";
import type { Archivo } from "../../Models/Attachments";

// Modulo temporal para corregir el nombre (incluida la extension) de archivos ya
// subidos a la biblioteca "Tickets SA" (adjuntos de tickets y seguimientos).
// Eliminar una vez cerrada la limpieza.

const CARPETAS_SUGERIDAS = ["/Adjuntos", "/Seguimientos"];

export default function RenombrarAdjuntos() {
  const { ticketBiblioteca } = useGraphServices();

  const [carpeta, setCarpeta] = React.useState("/Adjuntos");
  const [archivos, setArchivos] = React.useState<Archivo[]>([]);
  const [busqueda, setBusqueda] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nombres, setNombres] = React.useState<Record<string, string>>({});
  const [guardandoId, setGuardandoId] = React.useState<string | null>(null);

  const cargar = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await ticketBiblioteca.getFilesInFolder(carpeta);
      setArchivos(items);
      setNombres(Object.fromEntries(items.map((a) => [a.id, a.name])));
    } catch (e: any) {
      setError(e?.message ?? "Error cargando archivos de la carpeta");
      setArchivos([]);
      setNombres({});
    } finally {
      setLoading(false);
    }
  }, [carpeta, ticketBiblioteca]);

  React.useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = React.useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return archivos;
    return archivos.filter((a) => a.name.toLowerCase().includes(term));
  }, [archivos, busqueda]);

  const handleRenombrar = React.useCallback(
    async (archivo: Archivo) => {
      const nuevoNombre = (nombres[archivo.id] ?? "").trim();
      if (!nuevoNombre) {
        alert("El nombre no puede estar vacio");
        return;
      }

      setGuardandoId(archivo.id);

      try {
        const actualizado = await ticketBiblioteca.renameArchivoCompleto(archivo, nuevoNombre);
        setArchivos((prev) => prev.map((a) => (a.id === archivo.id ? actualizado : a)));
        setNombres((prev) => ({ ...prev, [archivo.id]: actualizado.name }));
      } catch (e: any) {
        alert("Error renombrando el archivo: " + (e?.message ?? ""));
      } finally {
        setGuardandoId(null);
      }
    },
    [nombres, ticketBiblioteca]
  );

  return (
    <section className="ra-page">
      <div className="ra-helper">
        <span className="ra-helper__badge">Herramienta temporal</span>
        <h2 className="ra-helper__title">Renombrar adjuntos</h2>
        <p className="ra-helper__text">
          Corrige el nombre completo (incluida la extensión) de los archivos ya almacenados
          en la biblioteca de documentos "Tickets SA" (adjuntos de tickets y de seguimientos).
          Este módulo es temporal, pensado solo para una limpieza puntual.
        </p>
      </div>

      <div className="catalog-filters">
        <div className="ntk-field">
          <label className="ntk-label" htmlFor="ra-carpeta">Carpeta</label>
          <input
            id="ra-carpeta"
            className="ntk-input"
            list="ra-carpetas-sugeridas"
            value={carpeta}
            onChange={(e) => setCarpeta(e.target.value)}
            placeholder="/Adjuntos"
          />
          <datalist id="ra-carpetas-sugeridas">
            {CARPETAS_SUGERIDAS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="ntk-field">
          <label className="ntk-label" htmlFor="ra-busqueda">Buscar por nombre</label>
          <input
            id="ra-busqueda"
            className="ntk-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar archivos cargados..."
          />
        </div>
      </div>

      <div className="ra-actions">
        <button type="button" className="ntk-btn ntk-btn--primary" onClick={cargar} disabled={loading}>
          {loading ? "Cargando..." : "Cargar archivos"}
        </button>
        <span className="ra-actions__count">
          {filtrados.length} de {archivos.length} archivos
        </span>
      </div>

      {error && <p className="catalog-table__error">{error}</p>}

      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>Nombre actual</th>
              <th>Nuevo nombre (con extensión)</th>
              <th>Modificado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((archivo) => {
              const valorActual = nombres[archivo.id] ?? "";
              const sinCambios = valorActual === archivo.name;
              const guardando = guardandoId === archivo.id;

              return (
                <tr key={archivo.id}>
                  <td title={archivo.path}>{archivo.name}</td>
                  <td>
                    <input
                      className="ntk-input"
                      value={valorActual}
                      onChange={(e) =>
                        setNombres((prev) => ({ ...prev, [archivo.id]: e.target.value }))
                      }
                      disabled={guardando}
                    />
                  </td>
                  <td>
                    {archivo.lastModified ? new Date(archivo.lastModified).toLocaleString() : "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="catalog-action-btn"
                      onClick={() => handleRenombrar(archivo)}
                      disabled={guardando || sinCambios || !valorActual.trim()}
                    >
                      {guardando ? "Guardando..." : "Renombrar"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && filtrados.length === 0 && (
              <tr>
                <td colSpan={4} className="catalog-table__empty">
                  {archivos.length === 0
                    ? "No se han cargado archivos para esta carpeta."
                    : "Sin coincidencias para el filtro."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
