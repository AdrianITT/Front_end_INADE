import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";
import { getAllComprobantepago } from "../../apis/PagosApi";
import { getAllComprobantepagoFactura } from "../../apis/ComprobantePagoFacturaApi";

const Pagos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para formatear la fecha a "año/día/mes"
  const formatToYDM = (isoDateString) => {
    if (!isoDateString) return "";
    const dateObj = new Date(isoDateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}/${day}/${month}`; // Formato: año/día/mes
  };

  // Definición de columnas de la tabla
  const columns = [
    {
      title: "Fecha de Pago",
      dataIndex: "fechaPago",
      key: "fechaPago",
      sorter: (a, b) => a.rawFechaPago - b.rawFechaPago,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "ID Comprobante Pago",
      dataIndex: "comprobantepago",
      key: "comprobantepago",
    },
    {
      title: "Monto Total",
      dataIndex: "montototal",
      key: "montototal",
    },
    {
      title: "Monto Restante",
      dataIndex: "montorestante",
      key: "montorestante",
    },
    {
      title: "Monto Pago",
      dataIndex: "montopago",
      key: "montopago",
    },
    {
      title: "ID Factura",
      dataIndex: "factura",
      key: "factura",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <Link to={`/detallesfactura/${record.factura}`}>
          Ver Detalles
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Llamadas en paralelo a ambas APIs
        const [respPago, respPagoFactura] = await Promise.all([
          getAllComprobantepago(),
          getAllComprobantepagoFactura(),
        ]);

        const comprobantesPago = respPago.data; // Array de ComprobantePago
        const comprobantesPagoFactura = respPagoFactura.data; // Array de ComprobantePagoFactura

        // Combinar la información de ambas respuestas
        const combinedData = comprobantesPagoFactura.map((cpf) => {
          // Buscar el comprobante de pago relacionado
          const comprobanteRelacionado = comprobantesPago.find(
            (cp) => cp.id === cpf.comprobantepago
          );
          // Obtener la fecha en timestamp para ordenamiento
          const rawFechaPago = comprobanteRelacionado
            ? new Date(comprobanteRelacionado.fechaPago).getTime()
            : 0;
          return {
            key: cpf.id,
            montototal: cpf.montototal,
            montorestante: cpf.montorestante,
            montopago: cpf.montopago,
            factura: cpf.factura,
            comprobantepago: cpf.comprobantepago,
            // Fecha formateada
            fechaPago: comprobanteRelacionado
              ? formatToYDM(comprobanteRelacionado.fechaPago)
              : "",
            // Propiedad auxiliar para ordenar
            rawFechaPago: rawFechaPago,
          };
        });

        setData(combinedData);
      } catch (error) {
        console.error("Error al obtener o combinar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Comprobantes de Pagos</h1>
      <Link to="/CrearPagos">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Nuevo Pago
        </Button>
      </Link>
      <div style={{ width: "80%" }}>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default Pagos;
