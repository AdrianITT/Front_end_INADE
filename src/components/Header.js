import React, { useState, useEffect } from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { Menu, Button, Drawer } from 'antd';
import { Link } from "react-router-dom";
import Logout_Api from '../apis/LogoutApi';
//import imglogo from '../img/logo.png';
import '../Header.css';
import { getOrganizacionById } from '../apis/organizacionapi';

const items = [
  {
    label: (<Link to="/home" rel="noopener noreferrer">Home</Link>),
    key: 'inade',
  },
  {
    key: 'empresa',
    label: (
      <Link to="/empresa" rel="noopener noreferrer">
        Empresa
      </Link>
    ),
  },
  {
    key: 'cliente',
    label: (
      <Link to="/cliente" rel="noopener noreferrer">
        Cliente
      </Link>
    ),
  },
  {
    key: 'servicio',
    label: (
      <Link to="/servicio" rel="noopener noreferrer">
        Servicios
      </Link>
    ),
  },
  {
    key: 'cotizar',
    label: (
      <Link to="/cotizar" rel="noopener noreferrer">
        Cotizar
      </Link>
    ),
  },
  {
    key: 'sub2',
    label: 'Mas',
    icon: <AppstoreOutlined />,
    children: [
      {
        key: 'generar_orden',
        label: (
          <Link to="/generar_orden" rel="noopener noreferrer">
            Generar Orden de Trabajo
          </Link>
        ),
      },
      {
        key: 'usuario',
        label: (
          <Link to="/usuario" rel="noopener noreferrer">
            Usuarios
          </Link>
        ),
      },
      {
        key: 'configuracion',
        label: (
          <Link to="/configuracionorganizacion" rel="noopener noreferrer">
            Configuración de la organización
          </Link>
        ),
      },
      {
        key: 'facturas',
        label: (
          <Link to="/factura" rel="noopener noreferrer">
            Facturas
          </Link>
        ),
      },
    ],
  },
  {
    key: 'logout',
    label: (
      <div className="logout-button">
        <Button
          onClick={async () => {
            try {
              await Logout_Api.post("", {}, {
                headers: {
                  Authorization: `Token ${localStorage.getItem('token')}`,
                },
              });
              // Limpiar localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user_id');
              localStorage.removeItem('username');
              localStorage.removeItem('rol');
              localStorage.removeItem('organizacion');
              localStorage.removeItem('organizacion_id');
              // Redirige al usuario a la página principal
              window.location.href = '/';
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    ),
  },
];

// Función para obtener los niveles de las claves (para el menú)
const getLevelKeys = (items1) => {
  const key = {};
  const func = (items2, level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};
const levelKeys = getLevelKeys(items);

const Header = () => {
  // Estado para almacenar el logo obtenido de la organización
  const [logoOrganizacion, setLogoOrganizacion] = useState(null);

  useEffect(() => {
    const fetchLogoOrganizacion = async () => {
      const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);
      try {
        const response = await getOrganizacionById(organizationId);
        // Guarda el logo en el estado (asumiendo que la respuesta tiene la estructura: { data: { logo: 'url' } })
        setLogoOrganizacion(response.data);
        console.log("Logo de la organización:", response.data.logo);
      } catch (error) {
        console.error("Error al obtener la organización:", error);
      }
    };

    fetchLogoOrganizacion();
  }, []);

  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const [stateOpenKeys, setStateOpenKeys] = useState(['2', '23']);
  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  return (
    <div className="header-container">
      <Link to="/home">
        {/* Si existe logoOrganizacion, muéstralo; de lo contrario, muestra una imagen por defecto */}
        {logoOrganizacion && logoOrganizacion.logo ? (
          <div className="header-logo">
            <img alt="Logo de la Organización" src={logoOrganizacion.logo} style={{ height: '40px', marginRight: '8px' }} />
          </div>
        ) : (
          <div className="header-logo">
            <img alt="INADE" style={{ height: '40px', marginRight: '8px' }} />
          </div>
        )}
      </Link>

        <div class="header-button">
          <Button color='primary' variant='filled' onClick={showDrawer}>
            Menu
          </Button>
        </div>

        <Drawer title="Menu" onClose={onClose} open={open}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['231']}
            openKeys={stateOpenKeys}
            onOpenChange={onOpenChange}
            style={{
              width: 256,
            }}
            items={items}
          />
        </Drawer>
      </div>
  );
};

export default Header;