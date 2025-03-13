// src/components/ServiciosTable.js
import React from "react";
import { Table } from "antd";

const columnsServicios = [
  { title: "Servicio", dataIndex: "nombreServicio", key: "nombreServicio" },
  { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
  { title: "Precio Unitario", dataIndex: "precio", key: "precio" },
  { title: "Subtotal", dataIndex: "subtotal", key: "subtotal" },
];

const ServiciosTable = ({ servicios, factorConversion }) => {
  // Aplica la conversión a los precios
  const data = servicios.map((servicio) => ({
    ...servicio,
    precio: (servicio.precio / factorConversion).toFixed(2),
    subtotal: (servicio.subtotal / factorConversion).toFixed(2),
  }));
  return (
    <Table
      dataSource={data}
      columns={columnsServicios}
      bordered
      pagination={false}
      style={{ marginTop: 16 }}
    />
  );
};

export default ServiciosTable;
