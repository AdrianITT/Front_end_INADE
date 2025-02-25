// src/components/ClienteTable.js
import React from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";

// Recibe 'clientes' y 'showAlertModal' como props
const ClienteTable = ({ clientes, showAlertModal }) => {
  const columns = [
    { title: "#", dataIndex: "key", key: "key" },
    { title: "Cliente", dataIndex: "Cliente", key: "Cliente" },
    { title: "Empresa", dataIndex: "Empresa", key: "Empresa" },
    { title: "Correo", dataIndex: "Correo", key: "Correo" },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Link to={`/crear_cotizacion/${record.key}`}>
            <Button className="action-button-cotizar">Cotizar</Button>
          </Link>
          <Link to={`/EditarCliente/${record.key}`}>
            <Button className="action-button-edit">
              <EditOutlined />
            </Button>
          </Link>
          <Button
            className="action-button-delete"
            onClick={() => showAlertModal(record.key)}
          >
            <CloseOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={clientes}
      rowClassName={(record) => (record.incompleto ? "row-incompleto" : "")}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default ClienteTable;
