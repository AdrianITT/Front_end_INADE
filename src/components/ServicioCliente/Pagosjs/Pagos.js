import React, { useState, useEffect } from "react";
import { Table, Button, Card, Space, Tag } from "antd";
import { Link } from "react-router-dom";
import { getComprobantepagoById } from "../../../apis/ApisServicioCliente/PagosApi";
import { cifrarId } from "../secretKey/SecretKey";

const diccionario = {
  tituloPagina: "Comprobantes de Pagos",
  botonNuevo: "Nuevo Pago",
  columnas: {
    fechaPago: "Fecha de Pago",
    idComprobantePago: "Folio Comprobante Pago",
    montoTotal: "Monto Total",
    montoRestante: "Monto Restante",
    montoPago: "Monto Pago",
    numeroFactura: "Folio Factura",
    acciones: "Acciones",
    verDetalles: "Ver Detalles",
  },
};

const Pagos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  const formatToYDM = (isoDateString) => {
    if (!isoDateString) return "";
    const dateObj = new Date(isoDateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}/${day}/${month}`;
  };

  const formatCurrency = (value) =>
    value == null
      ? "-"
      : `$${Number(value).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const columns = [
    {
      title: diccionario.columnas.idComprobantePago,
      dataIndex: "comprobantepago",
      key: "comprobantepago",
      filters: [...new Set(data.map((item) => item.comprobantepago))].map(
        (val) => ({ text: val, value: val })
      ),
      onFilter: (value, record) => record.comprobantepago === value,
      filterSearch: true,
    },
    {
      title: diccionario.columnas.numeroFactura,
      dataIndex: "numeroFactura",
      key: "numeroFactura",
      filters: [...new Set(data.map((item) => item.numeroFactura))].map(
        (val) => ({ text: val, value: val })
      ),
      onFilter: (value, record) => record.numeroFactura === value,
      filterSearch: true,
    },
    {
      title: diccionario.columnas.fechaPago,
      dataIndex: "fechaPago",
      key: "fechaPago",
      sorter: (a, b) => a.rawFechaPago - b.rawFechaPago,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: diccionario.columnas.montoTotal,
      dataIndex: "montototal",
      key: "montototal",
      align: "right",
      render: (val) => formatCurrency(val),
    },
    {
      title: diccionario.columnas.montoRestante,
      dataIndex: "montorestante",
      key: "montorestante",
      align: "right",
      render: (val) => {
        const esCero = Number(val) === 0;
        return (
          <Tag color={esCero ? "green" : "volcano"}>
            {formatCurrency(val)}
          </Tag>
        );
      },
    },
    {
      title: diccionario.columnas.montoPago,
      dataIndex: "montopago",
      key: "montopago",
      align: "right",
      render: (val) => formatCurrency(val),
    },
    {
      title: diccionario.columnas.acciones,
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Link to={`/detallesfactura/${cifrarId(record.factura)}`}>
          {diccionario.columnas.verDetalles}
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const pagosResponse = await getComprobantepagoById(organizationId);
        const pagos = pagosResponse.data;

        const detalles = pagos.map((pago) => ({
          key: `${pago.folioComprobantePago}-${pago.folioFactura}`,
          comprobantepago: pago.numeroComprobantePago,
          numeroFactura: pago.numeroFactura,
          factura: pago.folioFactura,
          montototal: pago.montototal,
          montopago: pago.montopago,
          montorestante: pago.montorestante,
          fechaPago: formatToYDM(pago.fechaPago),
          rawFechaPago: new Date(pago.fechaPago).getTime(),
        }))
        .sort((a, b) => b.comprobantepago - a.comprobantepago);

        setData(detalles);
      } catch (error) {
        console.error("Error al cargar comprobantes de pago:", error);
        setError(error.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) fetchData();
  }, [organizationId]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 1200,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space
          style={{
            width: "100%",
            marginBottom: 16,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0 }}>{diccionario.tituloPagina}</h1>

          <Link to="/CrearPagos">
            <Button type="primary">{diccionario.botonNuevo}</Button>
          </Link>
        </Space>

        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          bordered
          size="middle"
          // rowClassName={(_, index) =>
          //   index % 2 === 0 ? "fila-par" : "fila-impar"
          // }
        />
      </Card>
    </div>
  );
};

export default Pagos;
