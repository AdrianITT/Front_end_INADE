import React, { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  HomeOutlined,
  BankOutlined,
  TeamOutlined,
  ToolOutlined,
  DollarOutlined,
  SettingOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Dropdown,
  Avatar,
  Space,
  Grid,
  Typography,
  Skeleton,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logout_Api from "../../apis/ApisServicioCliente/LogoutApi";
import { getOrganizacionById } from "../../apis/ApisServicioCliente/organizacionapi";
import "./Header.css";

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const navItems = [
  { key: "home", label: <Link to="/home">Home</Link>, icon: <HomeOutlined /> },
  { key: "empresa", label: <Link to="/empresa">Empresa</Link>, icon: <BankOutlined /> },
  { key: "cliente", label: <Link to="/cliente">Cliente</Link>, icon: <TeamOutlined /> },
  { key: "servicio", label: <Link to="/servicio">Servicios</Link>, icon: <ToolOutlined /> },
  { key: "cotizar", label: <Link to="/cotizar">Cotizar</Link>, icon: <DollarOutlined /> },
  {
    key: "mas",
    label: "Más",
    icon: <AppstoreOutlined />,
    children: [
      { key: "generar_orden", label: <Link to="/generar_orden">Generar Orden de Trabajo</Link>, icon: <FileDoneOutlined /> },
      { key: "usuario", label: <Link to="/usuario">Usuarios</Link>, icon: <UserOutlined /> },
      { key: "configuracion", label: <Link to="/configuracionorganizacion">Configuración de la organización</Link>, icon: <SettingOutlined /> },
      { key: "facturas", label: <Link to="/factura">Facturas</Link>, icon: <FileTextOutlined /> },
      { key: "Pre-Cotizaciones", label: <Link to="/PreCotizacion">Pre-Cotizaciones</Link>, icon: <FileTextOutlined /> },
    ],
  },
];

export default function Header() {
  const [logoOrg, setLogoOrg] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint(); // xs, sm, md, lg...

  // Carga del logo/nombre
  useEffect(() => {
    (async () => {
      try {
        const organizationId = parseInt(localStorage.getItem("organizacion_id") || "0", 10);
        if (organizationId) {
          const res = await getOrganizacionById(organizationId);
          setLogoOrg(res.data?.logo || null);
          setOrgName(res.data?.nombre || "");
        }
      } catch (e) {
        console.error("Error obteniendo organización:", e);
      } finally {
        setLoadingOrg(false);
      }
    })();
  }, []);

  // Ruta activa
  const selectedKey = useMemo(() => {
    const findKey = (items) => {
      for (const it of items) {
        const lbl = it.label;
        if (lbl?.props?.to && location.pathname.startsWith(lbl.props.to)) return it.key;
        if (it.children) {
          const child = findKey(it.children);
          if (child) return child;
        }
      }
      return "";
    };
    return findKey(navItems);
  }, [location.pathname]);

  // Menú de usuario (avatar)
  const onLogout = async () => {
    try {
      await Logout_Api.post(
        "",
        {},
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      );
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("rol");
      localStorage.removeItem("organizacion");
      localStorage.removeItem("organizacion_id");
      window.location.href = "/";
    }
  };

  const userMenu = {
    items: [
      // {
      //   key: "profile",
      //   label: (
      //     <span onClick={() => navigate("/usuario")}>
      //       Perfil / Usuarios
      //     </span>
      //   ),
      //   icon: <UserOutlined />,
      // },
      {
        type: "divider",
      },
      {
        key: "logout",
        label: <span onClick={onLogout}>Cerrar sesión</span>,
        icon: <LogoutOutlined />,
      },
    ],
  };

  // ¿Desktop? (md en adelante)
  const isDesktop = screens.md;

  return (
    <AntHeader className="app-header" role="banner">
      {/* IZQUIERDA: Logo + nombre */}
      <Link to="/home" className="logo-wrap" aria-label="Ir a inicio">
        {loadingOrg ? (
          <Skeleton.Avatar active size="large" shape="square" />
        ) : logoOrg ? (
          <img src={logoOrg} alt="Logo de la organización" className="org-logo" />
        ) : (
          <div className="org-logo placeholder" />
        )}
        <Text className="org-name" ellipsis={{ tooltip: orgName }}>
          {orgName || "Mi Organización"}
        </Text>
      </Link>

      {/* CENTRO: menú horizontal en desktop */}
      {isDesktop && (
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems}
          className="nav-horizontal"
        />
      )}

      {/* DERECHA: acciones */}
      <Space size="middle" className="right-actions">
        {/* En móvil: botón hamburguesa */}
        {!isDesktop && (
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          />
        )}

        {/* Avatar + menú usuario (también en móvil, así cierras sesión fácil) */}
        <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
          <div className="user-trigger" role="button" aria-label="Abrir menú de usuario">
            <Avatar size={36} icon={<UserOutlined />} />
            {screens.lg && (
              <span className="user-name">{localStorage.getItem("username") || "Usuario"}</span>
            )}
          </div>
        </Dropdown>

      </Space>

      {/* Drawer para móvil */}
      <Drawer
        title={
          <Space>
            {logoOrg ? (
              <img src={logoOrg} alt="Logo" className="org-logo sm" />
            ) : (
              <div className="org-logo placeholder sm" />
            )}
            <Text strong>{orgName || "Mi Organización"}</Text>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ borderInlineEnd: "none" }}
          items={[
            ...navItems,
            { type: "divider" },
            {
              key: "logout_inline",
              icon: <LogoutOutlined />,
              label: <span onClick={onLogout}>Cerrar sesión</span>,
            },
          ]}
          onClick={() => setDrawerOpen(false)}
        />
      </Drawer>
    </AntHeader>
  );
}
