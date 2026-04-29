import { Route, Routes } from "react-router-dom";
import DashBoardPage from "../Components/DashBoard/DashboardPage";
import NuevoTicketForm from "../Components/NuevoTicket/NuevoTicket";
import TablaTickets from "../Components/Tickets/Tickets";
import TicketsComplianceReport from "../Components/Report/TicketsReport";
import CrearPlantilla from "../Components/NuevaPlantilla/NuevaPlantilla";
import UsuariosApp from "../Components/Security/PermisosApp/PermisosApp";
import TiendasZonasForm from "../Components/TiendasZonas/TiendasZonas";
import Proveedor from "../Components/Proveedor/Proveedor";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/home" element={<DashBoardPage/>} />
      <Route path="/tickets/nuevo" element={<NuevoTicketForm/>} />
      <Route path="/tickets" element={<TablaTickets/>} />
      <Route path="/metrics" element={<TicketsComplianceReport/>} />
      <Route path="/templates" element={<CrearPlantilla />} />
      <Route path="/access" element={<UsuariosApp />} />
      <Route path="/tiendasZonas" element={<TiendasZonasForm />} />
      <Route path="/proveedores" element={<Proveedor />} />
    </Routes>
  );
}
