// src/pages/Cotizar.js
import React, { useState, useMemo } from "react";
import { Table, Input, Spin, Button, Card, Row, Col } from "antd";
import { Link } from "react-router-dom";
import "./cotizar.css";
import { useCotizacionesData } from "../Cotizacionesjs/usoCotizacionesData";
import { useCotizacionesColumns } from "../Cotizacionesjs/CotizacionesColumns";
import { getDetallecotizaciondataById } from "../../../apis/ApisServicioCliente/CotizacionApi";

const Cotizar = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [expandedData, setExpandedData] = useState({});
  const [loadingRows, setLoadingRows] = useState({});

  const tdBaseStyle = {
    border: "1px solid #d9d9d9",
    padding: "10px 16px",
    fontSize: "14px",
    verticalAlign: "middle",
  };

  const formatCurrency = (value) =>
    `$${Number(value).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  const { cotizaciones, isLoading } = useCotizacionesData(organizationId);
  const columnsCotizaciones = useCotizacionesColumns();

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = value
      ? cotizaciones.filter((item) =>
          Object.values(item).some(
            (field) =>
              field !== null &&
              field !== undefined &&
              String(field).toLowerCase().includes(value.toLowerCase())
          )
        )
      : [];
    setFilteredData(filtered);
  };

  const dataSource = useMemo(
    () => (filteredData.length > 0 ? filteredData : cotizaciones),
    [filteredData, cotizaciones]
  );

  const handleExpand = async (expanded, record) => {
    const id = record["Cotización"];
    if (expanded && !expandedData[id]) {
      try {
        setLoadingRows((prev) => ({ ...prev, [id]: true }));
        const detalle = await getDetallecotizaciondataById(id);
        console.log(`Detalle de cotización ${id}:`, detalle);
        setExpandedData((prev) => ({ ...prev, [id]: detalle }));
      } catch (error) {
        console.error(`Error al obtener detalle de cotización ${id}:`, error);
      } finally {
        setLoadingRows((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className="cotizar-container">
      <center>
        <h1 className="cotizar-title">Cotizaciones</h1>
        <Input.Search
          className="cotizar-search"
          placeholder="Buscar cotizaciones..."
          enterButton="Buscar"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </center>

      <div className="cotizar-buttons">
        <Link to="/cliente">
          <Button className="nueva-cotizacion-button" type="primary">
            Nueva Cotización
          </Button>
        </Link>
        <Link to="/proyectos">
          <Button className="ver-proyectos-button">Ver Proyectos</Button>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Cargando cotizaciones..." />
        </div>
      ) : (
        <>
          <Table
            className="cotizar-table"
            dataSource={dataSource}
            columns={columnsCotizaciones}
            rowClassName={(record) =>
              record.incompleto ? "row-incompleto" : ""
            }
            bordered
            rowKey={(record) => record["Cotización"]}
            expandable={{
              onExpand: handleExpand,
              expandedRowRender: (record) => {
                const id = record["Cotización"];
                const detalle = expandedData[id];

                if (loadingRows[id]) {
                  return <p>Cargando detalles...</p>;
                }

                if (!detalle) {
                  return <p>Sin datos adicionales.</p>;
                }

                return (
                  <div style={{ padding: "20px" }}>
                    <Card 
                    size="small"
                    bordered={false}
                    style={{ marginBottom: "1rem" }}>

                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                      marginTop: "8px"
                    }}>
                      <thead>
                        <tr>
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
                      {detalle.data.cotizacionServicio.map((s, index) => (
                        <tr
                          key={s.id}
                          style={{
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f8f8",
                            transition: "background-color 0.3s ease",
                          }}
                        >
                          <td style={{ ...tdBaseStyle }}>{s.servicioNombre || "—"}</td>
                          <td style={{ ...tdBaseStyle }}>{s.descripcion || "—"}</td>
                          <td style={{ ...tdBaseStyle, textAlign: "center" }}>{s.cantidad}</td>
                          <td style={{ ...tdBaseStyle, textAlign: "right" }}>
                            {formatCurrency(s.precio)}
                          </td>
                          <td style={{ ...tdBaseStyle, textAlign: "right" }}>
                            {formatCurrency(s.subtotal)}
                          </td>
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
                        <strong>Moneda:</strong> {detalle.data.tipoMoneda?.codigo}
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <strong>Subtotal:</strong> ${detalle.data.valores?.subtotal}
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <strong>Descuento:</strong> {detalle.data.descuento || "0"}
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <strong>IVA:</strong> {detalle.data.valores?.iva} → ${detalle.data.valores?.ivaValor}
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <strong>Importe total:</strong> ${detalle.data.valores?.importe}
                      </Col>
                    </Row>
                    </Card>
                  </div>
                );
              },
              rowExpandable: () => true,
            }}
            pagination={{ pageSize: 10 }}
          />

          <div className="cotizar-summary">
            <div className="summary-container">
              Número de cotizaciones: {dataSource.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cotizar;
