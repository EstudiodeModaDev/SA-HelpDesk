export type HelpDeskANS = "ANS 1" | "ANS 2" | "ANS 3";

export type HelpDeskIssue = {
  title: string;
  detail: string;
};

export type HelpDeskSubcategory = {
  title: string;
  ans: HelpDeskANS;
  summary: string;
  issues: HelpDeskIssue[];
};

export type HelpDeskCategory = {
  title: string;
  summary: string;
  subcategories: HelpDeskSubcategory[];
};

export const HELP_DESK_ANS_HOURS: Record<HelpDeskANS, number> = {
  "ANS 1": 8,
  "ANS 2": 40,
  "ANS 3": 56,
};

export const HELP_DESK_CATALOG: HelpDeskCategory[] = [
  {
    title: "Autenticacion y permisos",
    summary: "Solicitudes relacionadas con ingreso a la aplicacion, visibilidad de menus y acceso a funcionalidades.",
    subcategories: [
      {
        title: "Permisos y accesos",
        ans: "ANS 2",
        summary: "Ajustes de acceso para usuarios, resolutores o administradores.",
        issues: [
          { title: "Solicitud de permisos a un modulo", detail: "El usuario necesita acceso a Bandeja, Reportes, Proveedores, Tiendas y Zonas u otra opcion del sistema." },
          { title: "No visualiza una opcion del sidebar", detail: "El usuario no puede ver una seccion que deberia estar habilitada segun su rol." },
          { title: "Cambio de rol o alcance", detail: "Se requiere actualizar el rol funcional del usuario dentro de la aplicacion." },
        ],
      },
      {
        title: "Falla de autenticacion",
        ans: "ANS 1",
        summary: "Problemas que impiden entrar o utilizar la aplicacion con normalidad.",
        issues: [
          { title: "No puede iniciar sesion", detail: "El usuario no logra autenticarse o queda fuera del sistema." },
          { title: "Sesion expirada constantemente", detail: "La aplicacion cierra la sesion o redirige de forma inesperada." },
          { title: "Error al cargar permisos", detail: "La aplicacion no reconoce el grupo del usuario y no habilita el acceso esperado." },
        ],
      },
    ],
  },
  {
    title: "Creacion y gestion de tickets",
    summary: "Solicitudes relacionadas con el flujo principal de registro, consulta y atencion de tickets.",
    subcategories: [
      {
        title: "Falla funcional en tickets",
        ans: "ANS 1",
        summary: "Errores que bloquean la creacion, consulta o actualizacion de tickets.",
        issues: [
          { title: "No se puede crear un ticket", detail: "El formulario de Nuevo Ticket no permite guardar el caso." },
          { title: "La bandeja no carga", detail: "La lista de tickets no muestra resultados o falla al consultar." },
          { title: "No se pueden actualizar estados o detalles", detail: "La edicion del ticket falla al guardar cambios." },
        ],
      },
      {
        title: "Comportamiento incorrecto del flujo",
        ans: "ANS 2",
        summary: "El modulo funciona parcialmente pero presenta inconsistencias operativas.",
        issues: [
          { title: "ANS calculado incorrectamente", detail: "El caso toma un ANS distinto al esperado para su clasificacion." },
          { title: "Asignacion de resolutor incorrecta", detail: "El ticket no se asigna al resolutor esperado o queda incompleto." },
          { title: "Notificaciones no enviadas", detail: "Los correos asociados al flujo del ticket no estan llegando." },
        ],
      },
      {
        title: "Nueva funcionalidad para tickets",
        ans: "ANS 3",
        summary: "Requerimientos de mejora o ampliacion del flujo actual de tickets.",
        issues: [
          { title: "Nuevo campo en el formulario", detail: "Se necesita capturar informacion adicional en la creacion o edicion del ticket." },
          { title: "Nueva regla de negocio", detail: "Se requiere una validacion o automatizacion nueva en el flujo." },
          { title: "Nuevo paso operativo", detail: "Se solicita ampliar el proceso con una etapa adicional de aprobacion o seguimiento." },
        ],
      },
    ],
  },
  {
    title: "Dashboard y reportes",
    summary: "Solicitudes sobre indicadores, metricas, exportaciones y visualizacion de informacion consolidada.",
    subcategories: [
      {
        title: "Error en reportes o dashboard",
        ans: "ANS 2",
        summary: "Consultas o metricas que no muestran la informacion esperada.",
        issues: [
          { title: "Dashboard no carga", detail: "El Centro de mando o los indicadores no muestran datos." },
          { title: "Metricas incorrectas", detail: "Los conteos, porcentajes o agrupaciones no coinciden con la realidad operativa." },
          { title: "Exportacion con error", detail: "La descarga del reporte falla o genera informacion incompleta." },
        ],
      },
      {
        title: "Solicitud de nuevo reporte",
        ans: "ANS 3",
        summary: "Nuevas vistas o salidas de informacion para analisis operativo.",
        issues: [
          { title: "Crear nuevo indicador", detail: "Se necesita una nueva metrica o visualizacion en dashboard." },
          { title: "Agregar columnas a reporte", detail: "Se requiere ampliar la informacion exportada o visible." },
          { title: "Nuevo reporte por filtro especifico", detail: "Se solicita una consulta orientada a un proceso o grupo de usuarios." },
        ],
      },
    ],
  },
  {
    title: "Plantillas y comunicaciones",
    summary: "Solicitudes asociadas a plantillas, contenido reutilizable y mensajes del sistema.",
    subcategories: [
      {
        title: "Falla en plantillas",
        ans: "ANS 2",
        summary: "Errores en la creacion, edicion o uso de plantillas dentro de la aplicacion.",
        issues: [
          { title: "No se puede guardar una plantilla", detail: "El modulo de Plantillas falla al crear o editar registros." },
          { title: "Plantilla no aparece para usar", detail: "La informacion guardada no se refleja en el flujo operativo." },
          { title: "Contenido de plantilla inconsistente", detail: "La plantilla muestra texto incorrecto o incompleto." },
        ],
      },
      {
        title: "Solicitud de nueva plantilla o mensaje",
        ans: "ANS 3",
        summary: "Necesidad de crear nuevos formatos o textos de apoyo dentro del software.",
        issues: [
          { title: "Nueva plantilla operativa", detail: "Se requiere una plantilla adicional para responder o documentar casos." },
          { title: "Ajuste de texto automatico", detail: "Se necesita cambiar el contenido de un correo o mensaje del sistema." },
          { title: "Nueva comunicacion automatizada", detail: "Se solicita incorporar una notificacion nueva dentro del flujo." },
        ],
      },
    ],
  },
  {
    title: "Catalogos administrativos",
    summary: "Solicitudes sobre catalogos que parametrizan el software como resolutores, tiendas, zonas y proveedores.",
    subcategories: [
      {
        title: "Falla en administracion de catalogos",
        ans: "ANS 2",
        summary: "Problemas guardando o consultando informacion parametrica del sistema.",
        issues: [
          { title: "No se pueden administrar resolutores", detail: "El modulo de Resolutores no permite crear, inactivar o consultar usuarios." },
          { title: "Tiendas y zonas no actualizan", detail: "El catalogo de espacios no refleja cambios o presenta errores." },
          { title: "Proveedores no cargan correctamente", detail: "La configuracion de proveedores falla o no se guarda." },
        ],
      },
      {
        title: "Solicitud de ajuste de catalogo",
        ans: "ANS 3",
        summary: "Cambios funcionales o de estructura en catalogos ya existentes.",
        issues: [
          { title: "Nuevo atributo en catalogo", detail: "Se requiere agregar un nuevo campo a un catalogo administrativo." },
          { title: "Nueva relacion entre catalogos", detail: "Se necesita enlazar informacion adicional entre modulos parametrizables." },
          { title: "Cambio en reglas de parametrizacion", detail: "Se solicita modificar como el software usa la informacion del catalogo." },
        ],
      },
    ],
  },
  {
    title: "Integraciones y comportamiento general",
    summary: "Solicitudes relacionadas con cargas, servicios internos, adjuntos y estabilidad general del software.",
    subcategories: [
      {
        title: "Error tecnico general",
        ans: "ANS 1",
        summary: "Fallas que afectan de forma transversal la operacion de la aplicacion.",
        issues: [
          { title: "Error al guardar informacion", detail: "La aplicacion arroja error al persistir cambios en cualquier modulo." },
          { title: "Archivos adjuntos no cargan", detail: "Los componentes de carga o consulta de archivos fallan." },
          { title: "Pantalla en blanco o modulo congelado", detail: "Una vista deja de responder o no renderiza correctamente." },
        ],
      },
      {
        title: "Solicitud de mejora transversal",
        ans: "ANS 3",
        summary: "Requerimientos que impactan mas de un modulo o mejoran la experiencia general.",
        issues: [
          { title: "Nueva funcionalidad compartida", detail: "Se necesita una capacidad reutilizable en varios modulos." },
          { title: "Mejora de experiencia de usuario", detail: "Se solicita simplificar, reorganizar o mejorar la interfaz." },
          { title: "Automatizacion adicional", detail: "Se requiere automatizar una tarea manual que hoy depende del usuario." },
        ],
      },
    ],
  },
];

export function findHelpDeskCategory(title: string) {
  return HELP_DESK_CATALOG.find((category) => category.title === title) ?? null;
}

export function findHelpDeskSubcategory(categoryTitle: string, subcategoryTitle: string) {
  return (
    findHelpDeskCategory(categoryTitle)?.subcategories.find(
      (subcategory) => subcategory.title === subcategoryTitle
    ) ?? null
  );
}

export function getHelpDeskAnsHours(ans?: string) {
  if (!ans) return 0;
  return HELP_DESK_ANS_HOURS[ans as HelpDeskANS] ?? 0;
}
