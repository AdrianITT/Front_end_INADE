import React, { useState, useEffect } from "react";
import { getAllFacturaByOrganozacion, getAllDataFactura } from "../../../apis/ApisServicioCliente/FacturaApi";
import { getAllfacturafacturama } from "../../../apis/ApisServicioCliente/FacturaFacturamaApi";
import { Table, Input, Button, message, Tag, theme, Space, Card, Col, Row } from "antd";
import { Link } from "react-router-dom";
import "./crearfactura.css"
import { cifrarId } from "../secretKey/SecretKey";

//Contains local storage logic
  const LOCAL_STORAGE_KEY = "factura_state";
  const TIEMPO_EXPIRACION_CT = 1 * 60 * 1000; // 1 minutos
  
// Leer y verificar expiración
  const obtenerEstadoConExpiracion = () => {
    const savedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedItem) return null;

    try {
      const { valor, timestamp } = JSON.parse(savedItem);
      const ahora = Date.now();

      if (ahora - timestamp < TIEMPO_EXPIRACION_CT) {
        return valor; // todavía válido
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY); // expirado
        return null;
      }
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }
  };

  // Guardar con timestamp
  const guardarEstadoEnLocalStorage = (data) => {
      const payload = {
        valor: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  };

const Factura = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedData, setExpandedData]=useState({});
  const [loadingExpanded,setLoadingExpanded]=useState({});
  const estadoGuardado = obtenerEstadoConExpiracion() || {searchText:""};
  const [searchTerm, setSearchTerm] = useState(estadoGuardado.searchText ?? "");
  //const { token } = theme.useToken();

  // ID de la organización actual
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const response = await getAllFacturaByOrganozacion(organizationId);
        //console.log("Facturas response:", response);
        const rawFacturas = response.data || [];

        const responseFacturama = await getAllfacturafacturama();
        const facturamaList = responseFacturama.data || [];
        const facturamaIds = new Set(facturamaList.map(item => item.factura));
  
        const currentDate = new Date();
  
        const facturasProcesadas = rawFacturas.map((factura, index) => {
          const expedicionDate = factura.fechaExpedicion ? new Date(factura.fechaExpedicion) : null;
          const formattedFechaExpedicion = expedicionDate
            ? expedicionDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "Desconocida";
            // 🔴 ¿Está faltante en Facturama?
            const isMissing = !facturamaIds.has(factura.id);
  
          let recent = false;
          if (expedicionDate) {
            const diffDays = (currentDate - expedicionDate) / (1000 * 60 * 60 * 24);
            recent = diffDays < 4;
          }
  
          return {
            key: index.toString(),
            IdFactura: factura.id,
            id: factura.folio,
            numeroCotizacion: factura.numeroCotizacion,
            nombreCliente: factura.cliente,
            nombreEmpresa: factura.empresa,
            fechaExpedicion: formattedFechaExpedicion,
            expedicionDate,
            recent,
            missing: isMissing // Ya no lo necesitas si no estás comparando con Facturama
          };
        });
        const hasRecentMissing = facturasProcesadas.some(item => item.missing && item.recent);

        if (hasRecentMissing) {
          facturasProcesadas.sort((a, b) => {
            const getPriority = (item) => {
              if (item.missing) return item.recent ? 0 : 1;
              return 2;
            };
            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            return priorityA - priorityB || (a.expedicionDate - b.expedicionDate);
          });
        }
  
        setData(facturasProcesadas);
        setFilteredData(facturasProcesadas);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        message.error("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };
  
    if (organizationId) {
      fetchFacturas();
    }
  }, [organizationId]);
  
  const handleExpand = async (expanded, record) => {
  const facturaId = record.IdFactura;

  if (expanded && !expandedData[facturaId]) {
    try {
      setLoadingExpanded((prev) => ({ ...prev, [facturaId]: true }));
      const response = await getAllDataFactura(facturaId);
      setExpandedData((prev) => ({ ...prev, [facturaId]: response.data }));
    } catch (error) {
      console.error("❌ Error al cargar detalle de factura:", error);
      message.error("No se pudo cargar el detalle de la factura.");
    } finally {
      setLoadingExpanded((prev) => ({ ...prev, [facturaId]: false }));
    }
  }
};


//Evalue si hay searchTerm para filtrar los datos que se buscarin hace 1 minuto
  useEffect(() => {
  if (!loading && searchTerm) {
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  } else if (!loading && !searchTerm) {
    console.log("No search term, showing all data");
    setFilteredData(data);
  }
}, [data, searchTerm, loading]);
  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
    guardarEstadoEnLocalStorage({ searchText: value })
  };

  // Columnas de la tabla con filtros
  const columns = [
    {
      title: "Folio",
      dataIndex: "id",
      key: "id",
      filters: [...new Set(data.map((item) => item.id))].map((Id) => ({
        text: Id,
        value: Id,
      })),
      onFilter: (value, record) => String(record.id|| "").includes(value),
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: "Cotización",
      dataIndex: "numeroCotizacion",
      key: "numeroCotizacion",
      filters: [...new Set(data.map((item) => item.numeroCotizacion))].map((codigo) => ({
        text: codigo,
        value: codigo,
      })),
      onFilter: (value, record) => String(record.numeroCotizacion|| "").includes(value),
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: "Cliente",
      dataIndex: "nombreCliente",
      key: "nombreCliente",
      filters: [...new Set(data.map((item) => item.nombreCliente))].map((cliente) => ({
        text: cliente,
        value: cliente,
      })),
      onFilter: (value, record) => record.nombreCliente.includes(value),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Empresa",
      dataIndex: "nombreEmpresa",
      key: "nombreEmpresa",
      filters: [...new Set(data.map((item) => item.nombreEmpresa))].map((empresa) => ({
        text: empresa,
        value: empresa,
      })),
      onFilter: (value, record) => record.nombreEmpresa === value,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Fecha de Expedición",
      dataIndex: "fechaExpedicion",
      key: "fechaExpedicion",
      sorter: (a, b) => a.expedicionDate - b.expedicionDate,
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "Opciones",
      key: "opciones",
      render: (_, record) => (
        <Link to={`/detallesfactura/${cifrarId(record.IdFactura)}`}>
          <Button type="primary" size="small">
            Detalles
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <center><h1>Facturas</h1></center>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Space style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Input.Search
            placeholder="Buscar por código de orden de trabajo..."
            style={{ width: "300px" }}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            allowClear
            value={searchTerm}
          />
        </Space>
      </div>
      <div style={{ display: "flex",justifyContent: "center",marginBottom: "20px"  }}>
        <Link to="/cotizar">
        <Button type="primary">
          Crear Factura
        </Button>
        </Link>
      </div>
      
      {/* Se usa rowClassName para resaltar las filas missing */}
      <Table
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
        loading={loading}
        rowClassName={(record) => (record.missing && record.recent) ? "highlighted-row" : ""}
        expandable={{
          onExpand: handleExpand,
          expandedRowRender: (record) => {
            const facturaId = record.IdFactura;
            const detalle = expandedData[facturaId];
            // console.log("Detalle de factura:", detalle);
            if (loadingExpanded[facturaId]) {
              return <p style={{ paddingLeft: 20 }}>Cargando detalle...</p>;
            }

            if (!detalle) {
              return <p style={{ paddingLeft: 20 }}>Sin datos disponibles.</p>;
            }

            return (
              <div style={{ padding: 20 }}>
                <Card 
                size="small"
                bordered={false}
                style={{ marginBottom: "1rem" }}>
                  <Row justify="center" align="middle" >
                  <Col>
                      <strong>Division:</strong> {detalle.division || "Pendiente"}
                  </Col>
                  </Row>
                </Card>
                <Card 
                size="small"
                bordered={false}
                style={{ marginBottom: "1rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#fafafa" }}>
                      <th style={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        textAlign: "left",
                        border: "1px solid #d9d9d9",
                        padding: "8px 12px"
                      }}>Servicio</th>
                      <th style={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        textAlign: "left",
                        border: "1px solid #d9d9d9",
                        padding: "8px 12px"
                      }}>Descripción</th>
                      <th style={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        textAlign: "center",
                        border: "1px solid #d9d9d9",
                        padding: "8px 12px"
                      }}>Cantidad</th>
                      <th style={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        textAlign: "right",
                        border: "1px solid #d9d9d9",
                        padding: "8px 12px"
                      }}>Precio</th>
                      <th style={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        textAlign: "right",
                        border: "1px solid #d9d9d9",
                        padding: "8px 12px"
                      }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.servicios.map((servicio) => (
                      <tr key={servicio.id}>
                        <td style={{ border: "1px solid #d9d9d9", padding: "8px" }}>{servicio.servicio.nombre}</td>
                        <td style={{ border: "1px solid #d9d9d9", padding: "8px" }}>{servicio.descripcion}</td>
                        <td style={{ border: "1px solid #d9d9d9", padding: "8px", textAlign: "center" }}>{servicio.cantidad}</td>
                        <td style={{ border: "1px solid #d9d9d9", padding: "8px", textAlign: "right" }}>${parseFloat(servicio.precioUnitario).toFixed(2)}</td>
                        <td style={{ border: "1px solid #d9d9d9", padding: "8px", textAlign: "right" }}>${parseFloat(servicio.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </Card>
                
                <Card
                  size="small"
                  bordered={false}>
                  <Row>
                    <Col xs={24} sm={12} md={8}>
                      <strong>Moneda:</strong> {detalle.monedaCodigo}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <strong>Subtotal:</strong> ${detalle.valores.subtotal}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <strong>Descuento:</strong> {detalle.valores.descuentoCotizacion  || "0"}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <strong>IVA:</strong> {detalle.valores.ivaPct} → ${detalle.valores.ivaValor}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <strong>Importe total:</strong> ${detalle.valores.totalFinal}
                    </Col>
                  </Row>
                  </Card>
              </div>
            );
          },
          rowExpandable: () => true,
        }}
      />
    </div>
  );
};

export default Factura;

