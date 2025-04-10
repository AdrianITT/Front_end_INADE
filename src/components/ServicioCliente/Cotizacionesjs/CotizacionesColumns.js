// src/components/CotizacionesColumns.js
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Menu } from "antd";

// Custom hook para definir las columnas de la tabla de cotizaciones
export const useCotizacionesColumns = () => {
  const columnsCotizaciones = useMemo(() => [
    {
      title: "Cotización",
      dataIndex: "Cotización",
      key: "Cotización",
      render: (text) => <span className="cotizacion-text">{text}</span>,
    },
    {
      title: "Empresa",
      dataIndex: "Empresa",
      key: "Empresa",
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
      dataIndex: "Contacto",
      key: "Contacto",
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
      dataIndex: "Solicitud",
      key: "Solicitud",
      sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Expiración",
      dataIndex: "Expiración",
      key: "Expiración",
      sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
      sortDirections: ["ascend", "descend"],
    },
    { title: "Moneda", dataIndex: "Moneda", key: "Moneda", render: (moneda) => moneda?.codigo || "—", },
    {
      title: "Estado",
      dataIndex: "Estado",
      key: "Estado",
      render : (estado)=> estado?.nombre||"",
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
      onFilter: (value, record) => value === "all" || record.Estado?.nombre === value,
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Link to={`/detalles_cotizaciones/${record["Cotización"]}`}>
          <Button type="primary" className="detalles-button">
            Detalles
          </Button>
        </Link>
      ),
    },
  ], []);

  return columnsCotizaciones;
};
