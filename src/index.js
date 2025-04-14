import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Login from "./components/Loginjs/Login";
import Home from "./App";
import Empresa from "./components/ServicioCliente/Empresasjs/Empresa";
import Cliente from "./components/ServicioCliente/Clientejs/Cliente";
import Servicio from "./components/ServicioCliente/Serviciosjs/Servicio";
import Cotizar from "./components/ServicioCliente/Cotizacionesjs/Cotizar";
import GenerarOrden from "./components/ServicioCliente/OrdenTabajojs/OrdenTrabajo";
import Usuario from "./components/ServicioCliente/Userjs/Usuario";
import ConfiguracionOrganizacion from "./components/ServicioCliente/Configuracion/ConfiguracionOrganizacion";
import Factura from "./components/ServicioCliente/Facturacionjs/Factura";
import Layout from "./components/Layoutsjs/Layout";
import CrearCotizacion from "./components/ServicioCliente/Cotizacionesjs/CrearCotizacion";
import DetallesCotizacion from "./components/ServicioCliente/Cotizacionesjs/DetallesCotiza";
import DetallesOrden from "./components/ServicioCliente/OrdenTabajojs/DetallesOrdenTrabajo";
import Proyectos from "./components/ServicioCliente/OrdenTabajojs/ProyectosOrdenTrabajando";
import DetalleOrdenTrabajo from "./components/ServicioCliente/OrdenTabajojs/DetallesOrdenTrabajo";
import DetallesFactura from "./components/ServicioCliente/Facturacionjs/DetallesFactura";
import CotizacionEstadistica from "./components/ServicioCliente/Estadisticas/CotizacionEstadisticas";
import GenerarOrdenTrabajo from "./components/ServicioCliente/OrdenTabajojs/GenerarOrdenTrabajo";
import EditarCliente from "./components/ServicioCliente/Clientejs/EditarCliente";
import EditarServicio from "./components/ServicioCliente/Serviciosjs/EditarServicio";
import EditarUsuario from "./components/ServicioCliente/Userjs/EditarUsuario";
import CrearFactura from "./components/ServicioCliente/Facturacionjs/CrearFactura";
import CargarCSD from "./components/ServicioCliente/CargaCertificadosDijitales/CargarCSD";
import HomeAdmin from "./components/ServicioCliente/VentanasAdmin/AdminHome";
import RegistroUsuarios from "./components/ServicioCliente/RegistroUsuario/RegistroUsuarios";
import ProtectedRoute from "./components/ServicioCliente/ProtectedRoute"; // Importa el componente de Ruta Protegida
import PreCotizacion from "./components/ServicioCliente/preCotizacion/PreCotizacion";
import CrearPreCotizacion from "./components/ServicioCliente/preCotizacion/CrearpreCotizacion";
import PreCotizacionDetalles from "./components/ServicioCliente/preCotizacion/preCotizacionDetalles";
import EditarCotizacion from "./components/ServicioCliente/Cotizacionesjs/EditarCotizacion";
import Pagos from "./components/ServicioCliente/Pagosjs/Pagos";
import CrearPagos from "./components/ServicioCliente/Pagosjs/CrearPagos";
import EditarOrdenTrabajo from "./components/ServicioCliente/OrdenTabajojs/EditarOrdenTrabajo";
import FacturaOTMultiples from "./components/ServicioCliente/Facturacionjs/FacturaOTMultiples";
import EditarPreCotizacion from "./components/ServicioCliente/preCotizacion/EditarPreCotizacion";
import VerificarExpiracionLocalStorage from "./components/DataLocalStorage/LocalStorage";

// Hook para cambiar el título de la pestaña
const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    let pageTitle = "INADE"; // Título por defecto

    switch (pathname) {
      case "/home":
        pageTitle = "Inicio | INADE";
        break;
      case "/empresa":
        pageTitle = "Empresas | INADE";
        break;
      case "/cliente":
        pageTitle = "Clientes | INADE";
        break;
      case "/servicio":
        pageTitle = "Servicios | INADE";
        break;
      case "/cotizar":
        pageTitle = "Cotizar | INADE";
        break;
      case "/usuario":
        pageTitle = "Usuarios | INADE";
        break;
      case "/configuracionorganizacion":
        pageTitle = "Configuración | INADE";
        break;
      // Agrega más rutas según sea necesario
      default:
        pageTitle = "INADE";
    }

    document.title = pageTitle; // Cambia el título
  }, [location]);
};

// Componente con lógica para cambiar el título
const PageWrapper = ({ children }) => {
  usePageTitle(); // Llama al hook para actualizar el título dinámicamente
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <VerificarExpiracionLocalStorage/>
      <Routes>
        {/* Ruta para el login sin el Layout */}
        <Route path="/" element={<Login />} />
        <Route path="/RegistroUsuarios" element={<RegistroUsuarios />} />
        
        {/* Rutas envueltas con Layout */}
        <Route path="/" element={
            <PageWrapper>
              <Layout />
            </PageWrapper>
          }
        >
          <Route path="/Homeadmin" element={<ProtectedRoute allowedRoles={['Administrador']}><HomeAdmin /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Home /></ProtectedRoute>} />
          <Route path="/editarOrdenTrabajo/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarOrdenTrabajo/></ProtectedRoute>} />
          <Route path="/FacturaOTMultiples" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><FacturaOTMultiples/></ProtectedRoute>} />
          <Route path="/empresa" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Empresa /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Cliente /></ProtectedRoute>} />
          <Route path="/servicio" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Servicio /></ProtectedRoute>} />
          <Route path="/cotizar" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Cotizar /></ProtectedRoute>} />
          <Route path="/generar_orden" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><GenerarOrden /></ProtectedRoute>} />
          <Route path="/usuario" element={<ProtectedRoute allowedRoles={['Administradororganizacion']}><Usuario /></ProtectedRoute>} />
          <Route path="/configuracionorganizacion" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><ConfiguracionOrganizacion /></ProtectedRoute>} />
          <Route path="/factura" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Factura /></ProtectedRoute>} />
          <Route path="/crear_cotizacion/:clienteId" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CrearCotizacion /></ProtectedRoute>} />
          <Route path="/detalles_cotizaciones/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><DetallesCotizacion /></ProtectedRoute>} />
          <Route path="/detalles_orden" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><DetallesOrden /></ProtectedRoute>} />
          <Route path="/proyectos" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Proyectos /></ProtectedRoute>} />
          <Route path="/DetalleOrdenTrabajo/:orderId" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><DetalleOrdenTrabajo /></ProtectedRoute>} />
          <Route path="/detallesfactura/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><DetallesFactura /></ProtectedRoute>} />
          <Route path="/CotizacionEstadisticas" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CotizacionEstadistica /></ProtectedRoute>} />
          <Route path="/GenerarOrdenTrabajo/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><GenerarOrdenTrabajo /></ProtectedRoute>} />
          <Route path="/EditarCliente/:clienteId" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarCliente /></ProtectedRoute>} />
          <Route path="/EditarServicio" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarServicio /></ProtectedRoute>} />
          <Route path="/EditarUsuario/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarUsuario /></ProtectedRoute>} />
          <Route path="/CrearFactura/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CrearFactura /></ProtectedRoute>} />
          <Route path="/CargaCSD" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CargarCSD /></ProtectedRoute>} />
          <Route path="/CrearPreCotizacion" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CrearPreCotizacion /></ProtectedRoute>} />
          <Route path="/PreCotizacion" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><PreCotizacion/></ProtectedRoute>} />
          <Route path="/PreCotizacionDetalles/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><PreCotizacionDetalles/></ProtectedRoute>} />
          <Route path="/EditarCotizacion/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarCotizacion/></ProtectedRoute>} />
          <Route path="/Pagos" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><Pagos/></ProtectedRoute>} />
          <Route path="/CrearPagos" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CrearPagos/></ProtectedRoute>} />
          <Route path="/CrearPagos/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><CrearPagos/></ProtectedRoute>} />
          <Route path="/EditarPreCotizacion/:id" element={<ProtectedRoute allowedRoles={['UsuarioOrganizacion', 'Administradororganizacion']}><EditarPreCotizacion/></ProtectedRoute>} /> 
        </Route>
      </Routes>

    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

reportWebVitals();