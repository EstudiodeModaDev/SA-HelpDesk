import { Navigate, Route, Routes } from "react-router-dom";
import DashBoardPage from "../Components/DashBoard/DashboardPage";
import NuevoTicketForm from "../Components/NuevoTicket/NuevoTicket";
import TablaTickets from "../Components/Tickets/Tickets";
import TicketsComplianceReport from "../Components/Report/TicketsReport";
import CrearPlantilla from "../Components/NuevaPlantilla/NuevaPlantilla";
import UsuariosApp from "../Components/Security/PermisosApp/PermisosApp";
import TiendasZonasForm from "../Components/TiendasZonas/TiendasZonas";
import Proveedor from "../Components/Proveedor/Proveedor";
import HelpDeskForm from "../Components/HelpDesk/HelpDesk";
import JefeZona from "../Components/JefeZona/JefeZona";
import AprobacionesTickets from "../Components/Aprobaciones/Aprobaciones";
import CargaMasivaTickets from "../Components/CargaMasivaTickets/CargaMasivaTickets";
import { RequirePermission } from "./RequirePermission";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/home" element={<RequirePermission><DashBoardPage/></RequirePermission>} />
      <Route path="/tickets/nuevo" element={<RequirePermission><NuevoTicketForm/></RequirePermission>} />
      <Route path="/tickets/carga-masiva" element={<RequirePermission><CargaMasivaTickets/></RequirePermission>} />
      <Route path="/tickets/aprobaciones" element={<RequirePermission><AprobacionesTickets/></RequirePermission>} />
      <Route path="/tickets" element={<RequirePermission><TablaTickets/></RequirePermission>} />
      <Route path="/helpdesk/nuevo" element={<RequirePermission><HelpDeskForm/></RequirePermission>} />
      <Route path="/metrics" element={<RequirePermission><TicketsComplianceReport/></RequirePermission>} />
      <Route path="/templates" element={<RequirePermission><CrearPlantilla /></RequirePermission>} />
      <Route path="/access" element={<RequirePermission><UsuariosApp /></RequirePermission>} />
      <Route path="/tiendasZonas" element={<RequirePermission><TiendasZonasForm /></RequirePermission>} />
      <Route path="/proveedores" element={<RequirePermission><Proveedor /></RequirePermission>} />
      <Route path="/jefes-zona" element={<RequirePermission><JefeZona /></RequirePermission>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
