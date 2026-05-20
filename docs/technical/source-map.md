# Mapa Tecnico del Proyecto

Este documento resume la responsabilidad de cada carpeta funcional para complementar la salida de `TypeDoc`. La API generada desde comentarios TSDoc describe simbolos exportados; este mapa ayuda a leer el sistema por modulos.

## Raiz de `src`

| Ruta | Responsabilidad |
| --- | --- |
| `main.tsx` | Punto de entrada de React y montaje de `App` con `BrowserRouter`. |
| `App.tsx` | Shell principal: autentica, construye navegacion, aplica permisos y monta rutas. |
| `Routes/index.tsx` | Registro central de pantallas navegables de la aplicacion. |
| `index.css`, `App.css` | Estilos globales y layout base. |

## `src/Auth`

| Archivo | Responsabilidad |
| --- | --- |
| `authContext.tsx` | Contexto React de autenticacion: sesion activa, login, logout y obtencion de token. |
| `msal.ts` | Inicializacion de MSAL y helpers de autenticacion con Microsoft. |
| `token.service.ts` | Helpers para solicitar tokens por alcance a Graph y SharePoint. |

## `src/graph`

| Archivo | Responsabilidad |
| --- | --- |
| `GraphRest.ts` | Cliente HTTP para Microsoft Graph con operaciones `get`, `post`, `patch` y `delete`. |
| `GrapServicesContext.tsx` | Fabrica de servicios de negocio y contexto compartido para acceder a Graph/SharePoint. |

## `src/Api`

| Archivo | Responsabilidad |
| --- | --- |
| `Api/Sharepoint/spClient.ts` | Cliente REST dedicado a SharePoint cuando no se usa la abstraccion de Graph. |
| `Api/Sharepoint/spEndpoints.ts` | Rutas y endpoints reutilizables para llamadas a SharePoint. |

## `src/config` y `src/consts`

| Archivo | Responsabilidad |
| --- | --- |
| `config/app.config.ts` | Configuracion general de sitios, listas y grupos SharePoint usados por la app. |
| `config/permissions.config.ts` | Catalogo canonico de permisos funcionales. |
| `config/groupPermissions.config.ts` | Mapeo entre grupos y permisos habilitados. |
| `consts/zonasConst.ts` | Catalogo de zonas fisicas usado en filtros y formularios. |

## `src/Models`

| Archivo | Responsabilidad |
| --- | --- |
| `Tickets.ts` | Tipos base de tickets, formularios, ordenamiento y relaciones. |
| `Usuarios.ts` | Tipos de usuarios internos y franquicias. |
| `TiendasZonas.ts` | Tipos del catalogo de espacios fisicos. |
| `Proveedores.ts` | Tipos de proveedores y sus validaciones. |
| `Plantilla.ts` | Tipos de plantillas de correo o contenido reutilizable. |
| `Log.ts` | Tipos de bitacora, seguimiento y documentacion de tickets. |
| `Commons.ts` | Tipos transversales de paginacion, opciones y rangos de fecha. |
| `Categorias.ts` | Tipos del arbol de categorias, subcategorias y ANS. |
| `Dashboard.ts` | Tipos agregados para graficas y metricas del tablero. |
| `HelpDesk.ts` | Tipos para el flujo alterno de Help Desk. |
| `Attachments.ts` | Tipos de archivos y adjuntos de seguimientos. |
| `Flows.ts` | Tipos para integraciones o flujos automatizados. |
| `Holiday.ts`, `SharepointGroups.ts` | Tipos auxiliares de calendario y permisos. |

## `src/services`

| Archivo | Responsabilidad |
| --- | --- |
| `base.Service.ts` | Clase base para listas SharePoint: resuelve ids, pagina y hace CRUD. |
| `Tickets.service.ts` | Acceso a la lista principal de tickets. |
| `Usuarios.service.ts` | Acceso al catalogo de usuarios/resolutores. |
| `Logs.service.ts` | Acceso a los logs y seguimientos de tickets. |
| `Categorias.service.ts`, `SubCategorias.service.ts`, `AnsTbl.service.ts` | Catalogos usados para clasificar tickets y calcular ANS. |
| `Franquicias.service.ts`, `Proveedor.service.ts`, `TiendasZonas.Service.ts` | Catalogos auxiliares operativos. |
| `Plantillas.service.ts` | Persistencia de plantillas configurables. |
| `Mail.service.ts` | Envio de correos a traves de Graph. |
| `TicketsAttachments.service.ts`, `SeguimentosAttachments.service.ts`, `Bibliotecas.service.ts` | Gestion de adjuntos en listas y bibliotecas SharePoint. |
| `GraphUsers.service.ts` | Busqueda de usuarios en el directorio de Microsoft Graph. |
| `Festivos.service.ts` | Consulta de festivos para calculo de ANS. |
| `LogHeldesk.service.ts`, `TicketsHelpdesk.Service.ts` | Servicios del flujo especifico de Help Desk. |
| `Sharepoint/spUser.service.ts` | Consulta de grupos del usuario autenticado. |
| `Permissions/*` | Construccion del motor de permisos y gestion de grupos de SharePoint. |

## `src/utils`

| Archivo | Responsabilidad |
| --- | --- |
| `Date.ts` | Conversiones entre fechas de UI, ISO y formatos compatibles con Graph. |
| `Commons.ts` | Utilidades de escape OData, texto plano/HTML, adjuntos y helpers genericos. |
| `Ans.ts` | Calculo de fechas objetivo y niveles de ANS basado en festivos. |
| `roles.ts` | Resolucion de roles por grupos de Graph o SharePoint. |

## `src/Components`

### Operacion y tickets

| Archivo | Responsabilidad |
| --- | --- |
| `Tickets/Tickets.tsx` | Bandeja principal de tickets con filtros, ordenamiento y navegacion al detalle. |
| `NuevoTicket/NuevoTicket.tsx` | Formulario de creacion de tickets con clasificacion, adjuntos y solicitante. |
| `DetallesTickets/DetallesTickets.tsx` | Vista de detalle del caso y acciones disponibles sobre el ticket. |
| `Seguimiento/Seguimiento.tsx` | Historial de documentacion, soluciones y seguimientos del caso. |
| `Documentar/Documentar.tsx` | Formulario para registrar solucion o seguimiento sobre un ticket. |
| `DetallesTickets/Correo/Correo.tsx` | Modal de correo para notificaciones o mensajes asociados al ticket. |
| `DetallesTickets/Modals/*` | Modales operativos: observador, recategorizacion y formularios de seleccion. |
| `DetallesTickets/TicketsRelacionados/*` | Visualizacion y relacionamiento de casos padre/hijo. |

### Catalogos y mantenimiento

| Archivo | Responsabilidad |
| --- | --- |
| `TiendasZonas/*` | Pantallas para administrar espacios fisicos o tiendas por zona. |
| `Proveedor/*` | CRUD visual del catalogo de proveedores. |
| `NuevaPlantilla/NuevaPlantilla.tsx` | Alta o edicion de plantillas reutilizables. |
| `Security/PermisosApp/PermisosApp.tsx` | Pantalla de administracion de permisos de aplicacion. |
| `Security/AddGraphUsers/ModalAgregarPermiso.tsx` | Modal para otorgar acceso a usuarios desde Graph. |

### Visualizacion y soporte

| Archivo | Responsabilidad |
| --- | --- |
| `DashBoard/*` | Vistas de resumen y detalle con graficas operativas del backlog. |
| `Report/TicketsReport.tsx` | Presentacion del reporte de cumplimiento para exportacion o consulta. |
| `Welcome/Welcome.tsx` | Pantalla de bienvenida previa al login. |
| `Header/Header.tsx` | Encabezado principal, tema y controles de sesion. |
| `Sidebar/*` | Navegacion lateral y definicion de items/agrupaciones. |
| `HelpDesk/HelpDesk.tsx` | Flujo alterno de alta de casos Help Desk. |
| `HtmlContent/Renderizador.tsx` | Render seguro de HTML enriquecido con soporte de lightbox. |
| `RichTextBase64/RichTextBase64.tsx` | Editor enriquecido con soporte de imagen embebida en base64. |
| `Common/*` | Componentes reutilizables para tablas, formularios modales y adjuntos. |

## `src/Funcionalidades`

### Hooks transversales

| Archivo | Responsabilidad |
| --- | --- |
| `Theme.ts` | Hook para alternar tema visual. |
| `Workers.ts` | Hook que carga resolutores y construye opciones de seleccion. |
| `usePermissions.ts` | Hook que arma el motor de permisos del usuario autenticado. |
| `useSharepointGroups.ts`, `useSharepointGroupMembers.ts` | Hooks de consulta para grupos SharePoint y sus miembros. |
| `Commons/hooks/useFiles.ts` | Estado reutilizable de archivos seleccionados en formularios. |

### `Funcionalidades/Tickets`

| Archivo | Responsabilidad |
| --- | --- |
| `hooks/Queries/useTickets.ts` | Hook principal de la bandeja: filtros, paginacion, conteos y acciones sobre tickets. |
| `hooks/Queries/useTicketsRelacionados.ts` | Consulta ticket padre e hijos de un caso. |
| `hooks/forms/useNuevoTicketForm.ts` | Estado y envio del formulario de nuevo ticket. |
| `hooks/forms/useAsignarObservador.ts` | Estado del modal para asignar observador. |
| `hooks/shared/useTicketCatalogos.ts` | Carga categorias y subcategorias del catalogo de tickets. |
| `hooks/shared/useTicketFilters.ts` | Construye filtros OData segun permisos, rango, zona y ordenamiento. |
| `hooks/shared/useTicketHolidays.ts` | Carga festivos requeridos para calculo de ANS. |
| `utils/ticketPayloads.ts` | Mapeo de formularios a payloads persistibles. |
| `utils/ticketValidators.ts` | Validaciones de ticket, observador y reasignacion. |
| `utils/ticketRelation.ts` | Reglas para relacionar casos padre/hijo. |
| `utils/ticketAssignment.ts` | Balanceo de carga y seleccion de resolutor. |
| `utils/notifications.ts` | Notificaciones por correo durante el ciclo del ticket. |
| `utils/ticketMappers.ts`, `ticketsFilters.ts`, `ticketsColors.ts`, `ticketConstants.ts` | Mapeos, filtros, colores de estado y constantes operativas. |

### `Funcionalidades/Documentar`

| Archivo | Responsabilidad |
| --- | --- |
| `hooks/useDocumentarTickets.ts` | Orquesta el registro de solucion/seguimiento y su postproceso. |
| `hooks/useDocumentarTicketForm.ts` | Estado local y validacion del formulario de documentacion. |
| `utils/documentar.Actions.ts` | Acciones de negocio: crear log, cerrar ticket y recuperar solucion. |
| `utils/documentarTicket.*` | Reglas, validaciones y mapeos del flujo de documentacion. |

### `Funcionalidades/Dashboard`

| Archivo | Responsabilidad |
| --- | --- |
| `hooks/useDashboard.ts` | Hook de resumen con rango y datos agregados. |
| `hooks/useDashboardData.ts` | Consulta tickets y los transforma a metricas de tablero. |
| `hooks/useDashboardDetallado.ts`, `useDashboardRange.ts` | Variantes de consulta y manejo de rango de fechas. |
| `utils/dashboardAggregations.ts` | Calculo de KPIs, top categorias, resolutores y series temporales. |
| `utils/dashboardMapper.ts`, `dashboardDates.ts`, `dahsboardFilters.ts` | Normalizacion de tickets, fechas y filtros del dashboard. |

### CRUD funcionales

| Carpeta | Responsabilidad |
| --- | --- |
| `Usuarios` | Hooks, validaciones y mapeos para administrar usuarios/resolutores. |
| `Franquicias` | CRUD de franquicias y transformacion a opciones de seleccion. |
| `Proveedores` | CRUD de proveedores y filtros de busqueda. |
| `TiendasZonas` | CRUD de espacios fisicos y filtros por zona. |
| `Templates` | CRUD de plantillas y mapeo del formulario a entidad persistida. |

### Adjuntos, reportes y soporte

| Carpeta | Responsabilidad |
| --- | --- |
| `Attachments` | Hooks para relacionar adjuntos de tickets y seguimientos con listas o bibliotecas. |
| `Report/utils` | Exportacion a Excel y metricas de cumplimiento. |
| `Log/utils` | Registro automatico de eventos importantes del ticket. |
| `ProveedoresNotifications` | Estado, validacion y envio de correos hacia proveedores. |
| `HelpDesk` | Catalogo de categorias y ANS para el flujo de Help Desk. |

## Convencion sugerida para seguir documentando

1. Documentar cada simbolo exportado con TSDoc breve: que hace, parametros, retorno y side effects.
2. Mantener comentarios de alto nivel en hooks orquestadores y servicios de acceso a datos.
3. Usar este mapa para contexto de modulo y `TypeDoc` para detalle de API.
