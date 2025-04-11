import React, { useState, useEffect} from "react";
import { Table, Button} from "antd";
import { Link } from "react-router-dom";
import { getAllComprobantepago, getComprobantepagoById } from "../../../apis/ApisServicioCliente/PagosApi";
import { getAllComprobantepagoFactura } from "../../../apis/ApisServicioCliente/ComprobantePagoFacturaApi";

// Diccionario de textos (plantillas) para facilitar cambios y traducciones
const diccionario = {
  tituloPagina: "Comprobantes de Pagos",
  botonNuevo: "Nuevo Pago",
  columnas: {
    fechaPago: "Fecha de Pago",
    idComprobantePago: "Folio Comprobante Pago",
    montoTotal: "Monto Total",
    montoRestante: "Monto Restante",
    montoPago: "Monto Pago",
    idFactura: "Folio Factura",
    acciones: "Acciones",
    verDetalles: "Ver Detalles",
  },
};

const Pagos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);
  // Función para formatear la fecha a "año/día/mes"
  const formatToYDM = (isoDateString) => {
    if (!isoDateString) return "";
    const dateObj = new Date(isoDateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}/${day}/${month}`; // Formato: año/día/mes
  };

  

  // Definición de columnas de la tabla usando el diccionario
  const columns = [
    {
      title: diccionario.columnas.idComprobantePago,
      dataIndex: "comprobantepago",
      key: "comprobantepago",
      // 1) Generar la lista de valores únicos como { text, value }
      filters: [...new Set(data.map(item => item.comprobantepago))].map(val => ({
        text: val,
        value: val,
      })),
      // 2) Lógica de filtrado
      onFilter: (value, record) => record.comprobantepago === value,
      // 3) Activa la barra de búsqueda dentro del menú
      filterSearch: true,
    },
    {
      title: diccionario.columnas.idFactura,
      dataIndex: "factura",
      key: "factura",
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
    },
    {
      title: diccionario.columnas.montoRestante,
      dataIndex: "montorestante",
      key: "montorestante",
    },
    
    {
      title: diccionario.columnas.montoPago,
      dataIndex: "montopago",
      key: "montopago",
    },
    {
      title: diccionario.columnas.acciones,
      key: "acciones",
      render: (text, record) => (
        <Link to={`/detallesfactura/${record.factura}`}>
          {diccionario.columnas.verDetalles}
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const respFacturas = await getAllComprobantepagoFactura();
        const facturas = respFacturas.data;
  
        // Usar Set para no repetir llamada a getComprobantepagoById
        const facturaIdsUnicos = [
          ...new Set(facturas.map((f) => f.factura)),
        ];
  
        const allDetalles = await Promise.all(
          facturaIdsUnicos.map(async (facturaId) => {
            const pagosPorFactura = await getComprobantepagoById(organizationId);
            return pagosPorFactura.data.map((pago) => ({
              key: `${pago.folioComprobantePago}-${pago.folioFactura}`,
              comprobantepago: pago.folioComprobantePago,
              factura: pago.folioFactura,
              montototal: pago.montototal,
              montopago: pago.montopago,
              montorestante: pago.montorestante,
              fechaPago: formatToYDM(pago.fechaPago),
              rawFechaPago: new Date(pago.fechaPago).getTime(),
            }));
          })
        );
        console.log("Detalles de pagos:", allDetalles);
        setData(allDetalles.flat());
      } catch (error) {
        console.error("Error al cargar comprobantes de pago:", error);
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
      <h1 style={{ textAlign: "center" }}>{diccionario.tituloPagina}</h1>
      <Link to="/CrearPagos">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          {diccionario.botonNuevo}
        </Button>
      </Link>
      <div style={{ width: "80%" }}>
        <Table
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default Pagos;
