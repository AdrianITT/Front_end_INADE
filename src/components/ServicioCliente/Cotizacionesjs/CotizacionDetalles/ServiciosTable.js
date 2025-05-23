// src/components/ServiciosTable.js
import React from "react";
import { Table } from "antd";

const columnsServicios = [
  { title: "Servicio", dataIndex: "servicioNombre", key: "servicioNombre" },
  { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
  { title: "Precio Unitario", dataIndex: "precio", key: "precio" },
  { title: "Subtotal", dataIndex: "subtotal", key: "subtotal" },
  { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
];

const ServiciosTable = ({ servicios = [], factorConversion = 1 }) => {
  const data = servicios.map((servicio) => ({
    key: servicio.id,
    ...servicio,
    precio: (parseFloat(servicio.precio) / factorConversion).toFixed(3),
    subtotal: (parseFloat(servicio.subtotal) / factorConversion).toFixed(3),
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
