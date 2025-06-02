// src/components/ClienteTable.js
import React from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";

import {cifrarId}  from "../secretKey/SecretKey";

// Recibe 'clientes' y 'showAlertModal' como props
const ClienteTable = ({ clientes, showAlertModal }) => {

  const clienteFilters=Array.from(new Set(clientes.map(item=>item.Cliente)))
  .map(value=>({text: value, value}));

  const empresaFilters=Array.from(new Set(clientes.map(item=>item.Empresa)))
  .map(value=>({text:value, value}));

  
  const columns = [
    { title: "#", dataIndex: "numero", key: "numero",
      sorter:(a,b)=>a.key -b.key,
      sortDireccions: ['ascend', 'descend'],
     },
    { title: "Cliente", dataIndex: "Cliente", key: "Cliente",
      filters:clienteFilters,
      onFilter:(value, record)=>record.Cliente===value,
      filterSearch: true,
     },
    {title: "Division", dataIndex: "division", key: "division",
      sorter:(a,b)=>{ const divisionA = a.division || ""; // para evitar errores con null
        const divisionB = b.division || "";
        return divisionA.localeCompare(divisionB);},
      sortDireccions: ['ascend', 'descend'],
      render: (division) => division ? division : "Sin división asignada",
    },
    { title: "Empresa", dataIndex: "Empresa", key: "Empresa",
      filters:empresaFilters,
      onFilter:(value,record)=>record.Empresa===value,
      filterSearch:true,
     },
    { title: "Correo", dataIndex: "Correo", key: "Correo" },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Link to={`/RegistroCotizacion/${cifrarId(record.key)}`}>
            <Button className="action-button-cotizar">Cotizar</Button>
          </Link>
          <Link to={`/EditarCliente/${cifrarId(record.key)}`}>
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
