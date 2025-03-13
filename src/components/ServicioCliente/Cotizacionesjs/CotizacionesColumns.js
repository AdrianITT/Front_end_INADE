// src/components/CotizacionesColumns.js
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Menu } from "antd";

// Custom hook para definir las columnas de la tabla de cotizaciones
export const useCotizacionesColumns = () => {
  const columnsCotizaciones = useMemo(() => [
    {
      title: "Cotización",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="cotizacion-text">{text}</span>,
    },
    {
      title: "Empresa",
      dataIndex: "empresa",
      key: "empresa",
      render: (text, record) =>
        record.incompleto ? (
          <Link to="/empresa">
            <span className="empresa-link" style={{ color: "red", fontWeight: "bold" }}>
              {text} (Completar)
            </span>
          </Link>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "Contacto",
      dataIndex: "contacto",
      key: "contacto",
      render: (text, record) =>
        record.incompleto ? (
          <Link to="/cliente">
            <span className="contacto-link" style={{ color: "red", fontWeight: "bold" }}>
              {text} (Completar)
            </span>
          </Link>
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: "Solicitud",
      dataIndex: "fechaSolicitud",
      key: "fechaSolicitud",
      sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Expiración",
      dataIndex: "fechaCaducidad",
      key: "fechaCaducidad",
      sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
      sortDirections: ["ascend", "descend"],
    },
    { title: "Moneda", dataIndex: "moneda", key: "moneda" },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Menu
            onClick={({ key }) => {
              setSelectedKeys(key === "all" ? [] : [key]);
              confirm();
            }}
            selectedKeys={selectedKeys}
          >
            <Menu.Item key="all">Todos</Menu.Item>
            <Menu.Item key="Pendiente">Pendiente</Menu.Item>
            <Menu.Item key="En proceso">En proceso</Menu.Item>
            <Menu.Item key="Completado">Completado</Menu.Item>
          </Menu>
        </div>
      ),
      onFilter: (value, record) => value === "all" || record.estado === value,
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Link to={`/detalles_cotizaciones/${record.id}`}>
          <Button type="primary" className="detalles-button">
            Detalles
          </Button>
        </Link>
      ),
    },
  ], []);

  return columnsCotizaciones;
};
