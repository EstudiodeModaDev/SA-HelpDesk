import * as React from "react";
import "./PermisosApp.css";
import { useGraphServices } from "../../../graph/GrapServicesContext";
import { useUsuarios } from "../../../Funcionalidades/Usuarios/hooks/useUsuarios";
import { useWorkers } from "../../../Funcionalidades/Workers";
import ModalOtorgarPermiso from "../AddGraphUsers/ModalAgregarPermiso";
import type { UsuariosSP } from "../../../Models/Usuarios";
import { norm } from "../../../utils/Commons";

const ACTIVE_STATUS = "Disponible";
const INACTIVE_STATUS = "Inactivo";

export default function UsuariosApp() {
  const { Usuarios } = useGraphServices();
  const {usuarios, loading, error, submitting, refreshUsuers, deleteUser, createUser,} = useUsuarios(Usuarios);

  const { workers, loadingWorkers, refresh: refreshWorkers } = useWorkers();

  const [isOpenAdd, setIsOpenAdd] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [actingId, setActingId] = React.useState<string | null>(null);

  const resolutores = React.useMemo(
    () => usuarios.filter((user) => norm(user.Rol) === "Tecnico"),
    [usuarios]
  );

  const stats = React.useMemo(() => {
    
    const activos = resolutores.filter((user) => norm(user.Disponible || ACTIVE_STATUS) !== norm(INACTIVE_STATUS)).length;

    return {
      total: resolutores.length,
      activos,
      inactivos: Math.max(resolutores.length - activos, 0),
    };
  }, [resolutores]);

  const filteredRows = React.useMemo(() => {
    const term = search;
    console.log(!term)
    if (!term) return resolutores;

    return resolutores.filter((user) =>
      norm(`${user.Title} ${user.Correo} ${user.Disponible ?? ""} ${user.Numerodecasos ?? 0}`).includes(term)
    );
  }, [resolutores, search]);

    React.useEffect(() => {
    console.log(usuarios)
  }, [usuarios]);


  const openAddModal = React.useCallback(async () => {
    try {
      if (!workers.length) {
        await refreshWorkers();
      }
    } finally {
      setIsOpenAdd(true);
    }
  }, [refreshWorkers, workers.length]);

  const closeAddModal = React.useCallback(() => {
    setIsOpenAdd(false);
  }, []);

  const reactivateUser = React.useCallback(async (user: UsuariosSP) => {
    if (!user.Id) return;

    try {
      setActingId(user.Id);
      await Usuarios.update(user.Id, {
        Title: user.Title,
        Correo: user.Correo,
        Rol: "Tecnico",
        Disponible: ACTIVE_STATUS,
      });
      await refreshUsuers();
    } finally {
      setActingId(null);
    }
  }, [Usuarios, refreshUsuers]);

  const handleSaveFromModal = React.useCallback(async (worker: { name: string; mail: string }) => {
    const email = norm(worker.mail);
    if (!email) return;

    const existing = resolutores.find((user) => norm(user.Correo) === email);

    if (existing?.Id) {
      if (norm(existing.Disponible) === norm(INACTIVE_STATUS)) {
        await reactivateUser({
          ...existing,
          Title: worker.name || existing.Title,
          Correo: worker.mail || existing.Correo,
        });
        closeAddModal();
        return;
      }

      throw new Error("El resolutor seleccionado ya existe y se encuentra activo.");
    }

    console.log("No existente")

    const created = await createUser({
      Title: worker.name,
      Correo: worker.mail,
      Rol: "Tecnico",
      Disponible: ACTIVE_STATUS,
      Numerodecasos: 0,
    });

    if (!created) {
      throw new Error("No se pudo crear el resolutor.");
    }

    closeAddModal();
  }, [closeAddModal, createUser, reactivateUser, resolutores]);

  const handleDeactivate = React.useCallback(async (user: UsuariosSP) => {
    if (!user.Id) return;

    const ok = window.confirm(`¿Marcar a "${user.Title}" como inactivo?`);
    if (!ok) return;

    try {
      setActingId(user.Id);
      await deleteUser(user.Id);
    } finally {
      setActingId(null);
    }
  }, [deleteUser]);

  return (
    <section className="usersPage">
      <div className="usersCard">
        <header className="usersHero">
          <div className="usersHero__copy">
            <span className="usersHero__eyebrow">Configuracion</span>
            <h1 className="usersHero__title">Resolutores</h1>
          </div>

          <div className="usersHero__actions">
            <button className="button buttonPrimary" type="button" onClick={openAddModal} disabled={submitting}>
              Agregar resolutor
            </button>
          </div>
        </header>

        <section className="usersStats">
          <article className="usersStat usersStat--accent">
            <span className="usersStat__label">Resolutores</span>
            <strong className="usersStat__value">{stats.total}</strong>
          </article>
          <article className="usersStat">
            <span className="usersStat__label">Activos</span>
            <strong className="usersStat__value">{stats.activos}</strong>
          </article>
          <article className="usersStat">
            <span className="usersStat__label">Inactivos</span>
            <strong className="usersStat__value">{stats.inactivos}</strong>
          </article>
        </section>

        <section className="usersFilters">
          <div className="usersFilters__top">
            <div>
              <h2 className="tableWrap__title">Equipo resolutor</h2>
              <p className="tableWrap__subtitle">
                Busca por nombre, correo o estado para encontrar rápidamente un técnico.
              </p>
            </div>
          </div>

          <div className="searchForm">
            <input
              className="searchInput"
              type="text"
              placeholder="Buscar por nombre, correo o estado"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="searchClear"
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </section>

        <section className="usersContent">
          {loading && <div className="info">Cargando resolutores...</div>}

          {error && !loading && <div className="errorMsg">{error}</div>}

          {!loading && !error && (
            <>
              {filteredRows.length === 0 ? (
                <div className="emptyState">
                  <div className="emptyStateIcon">👥</div>
                  <h3 className="emptyStateTitle">No hay resolutores para mostrar</h3>
                  <p className="emptyStateText">
                    No encontramos coincidencias con la búsqueda actual o todavía no se han agregado técnicos.
                  </p>
                </div>
              ) : (
                <div className="tableWrap">
                  <div className="tableWrap__head">
                    <div>
                      <h2 className="tableWrap__title">Listado de resolutores</h2>
                      <p className="tableWrap__subtitle">
                        Estado operativo del equipo y número de casos asignados visibles en la lista.
                      </p>
                    </div>
                  </div>

                  <table className="table">
                    <thead>
                      <tr className="theadRow">
                        <th className="th">Nombre</th>
                        <th className="th">Correo electrónico</th>
                        <th className="th">Estado</th>
                        <th className="th">Casos</th>
                        <th className="th thActions">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows.map((user) => {
                        const isActive = norm(user.Disponible || ACTIVE_STATUS) !== norm(INACTIVE_STATUS);
                        const isActing = actingId === user.Id;

                        return (
                          <tr key={user.Id ?? user.Correo}>
                            <td className="td tdName">
                              <div className="userIdentity">
                                <div className="userIdentity__avatar">{user.Title?.[0] ?? "T"}</div>
                                <div className="userIdentity__copy">
                                  <span className="userIdentity__name">{user.Title}</span>
                                  <span className="userIdentity__meta">Rol: Tecnico</span>
                                </div>
                              </div>
                            </td>
                            <td className="td tdEmail">{user.Correo}</td>
                            <td className="td">
                              <span className={`statusPill ${isActive ? "statusPill--active" : "statusPill--inactive"}`}>
                                {isActive ? ACTIVE_STATUS : INACTIVE_STATUS}
                              </span>
                            </td>
                            <td className="td">{user.Numerodecasos ?? 0}</td>
                            <td className="td tdActions">
                              <div className="actionGroup">
                                {isActive ? (
                                  <button
                                    type="button"
                                    className="iconBtn iconBtnDanger iconBtnText"
                                    onClick={() => handleDeactivate(user)}
                                    disabled={loading || submitting || isActing}
                                  >
                                    {isActing ? "..." : "Inactivar"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="iconBtn iconBtnSuccess iconBtnText"
                                    onClick={() => reactivateUser(user)}
                                    disabled={loading || submitting || isActing}
                                  >
                                    {isActing ? "..." : "Reactivar"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <ModalOtorgarPermiso
          isOpen={isOpenAdd}
          onClose={closeAddModal}
          onSave={handleSaveFromModal}
          slotsLoading={false}
          workers={workers}
          workersLoading={loadingWorkers}
        />
      </div>
    </section>
  );
}
