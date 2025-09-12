// src/pages/TestCotizar.js
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Input, Spin, Button, Card, Row, Col, Tag, Space, Skeleton, message } from "antd";
import debounce from "lodash/debounce";

import "./cotizar.css";
import { useCotizacionesColumns } from "../Cotizacionesjs/CotizacionesColumns";
import { getDetallecotizaciondataById, getCotizacionesPaged } from "../../../apis/ApisServicioCliente/CotizacionApi";
import { cifrarId } from "../secretKey/SecretKey";

const TestCotizar = () => {
  const navigate = useNavigate();

  // tabla controlada
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorterState, setSorterState] = useState({}); // { field, order }
  const [searchText, setSearchText] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // expandibles
  const [expandedData, setExpandedData] = useState({});
  const [loadingRows, setLoadingRows] = useState({});

  // abort controller
  const controllerRef = useRef(null);

  // org id
  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  // columnas (asegúrate de tener dataIndex y, si quieres ordenar, sorter: true)
  const columnsCotizaciones = useCotizacionesColumns();

  // estilos
  const tdBaseStyle = useMemo(() => ({
    border: "1px solid #d9d9d9",
    padding: "10px 16px",
    fontSize: "14px",
    verticalAlign: "middle",
  }), []);

  const formatCurrency = (value) =>
    `$${Number(value).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // =========================
  // Fetch paginado (usa tu endpoint nuevo)
  // =========================
  const fetchPage = useCallback(async ({ current, pageSize, search, sorter }) => {
    if (!organizationId) return;
    controllerRef.current?.abort?.();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      // IMPORTANTe: el backend Option 2 acepta sort por claves del SORT_MAP de la vista (p. ej. "id", "numero", "Empresa", "Solicitud", "Expiración")
      const sortParam = sorter?.field
        ? `${sorter.order === "descend" ? "-" : ""}${sorter.field}`
        : "";

      const res = await getCotizacionesPaged(
        organizationId,
        {
          page: current,
          pageSize,
          search,
          sort: sortParam,
        },
        controller.signal
      );

      // Soporta {count, results} y (fallback) lista simple
      const results = Array.isArray(res.data?.results)
        ? res.data.results
        : (Array.isArray(res.data) ? res.data : []);
      const count = typeof res.data?.count === "number" ? res.data.count : results.length;

      // marca incompletos (tu lógica)
      const validated = results.map((c) => {
        const clienteIncompleto = !c["Correo"] || !c["CodigoPostal"];
        const empresaIncompleta = !c["CalleEmpresa"] || !c["rfcEmpresa"];
        return { ...c, incompleto: clienteIncompleto || empresaIncompleta };
      });

      setData(validated);
      setPagination((p) => ({ ...p, current, pageSize, total: count }));
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error(err);
      message.error("No se pudo cargar la lista de cotizaciones.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // =========================
  // Debounce de búsqueda
  // =========================
  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        fetchPage({
          current: 1,
          pageSize: pagination.pageSize,
          search: val,
          sorter: sorterState,
        });
      }, 300),
    [pagination.pageSize, sorterState, fetchPage]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // primera carga
  useEffect(() => {
    if (!organizationId) return;
    fetchPage({ current: 1, pageSize: pagination.pageSize, search: "", sorter: sorterState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // tabla: cambios de página/orden
  const handleTableChange = (newPagination, _filters, sorter) => {
    setSorterState(sorter);
    setPagination((p) => ({ ...p, current: newPagination.current, pageSize: newPagination.pageSize }));
    fetchPage({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      search: searchText,
      sorter,
    });
  };

  // expandibles
  const handleExpand = async (expanded, record) => {
    const id = record["Cotización"];
    if (expanded && !expandedData[id]) {
      try {
        setLoadingRows((prev) => ({ ...prev, [id]: true }));
        const detalle = await getDetallecotizaciondataById(id);
        setExpandedData((prev) => ({ ...prev, [id]: detalle }));
      } catch (e) {
        console.error(`Error al obtener detalle ${id}:`, e);
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
          allowClear
          placeholder="Buscar..."
          value={searchText}
          size="middle"
          onChange={(e) => {
            const val = e.target.value || "";
            setSearchText(val);
            debouncedSearch(val);
          }}
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

      {loading && pagination.total === 0 ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Cargando cotizaciones..." />
        </div>
      ) : (
        <>
          <Table
            className="cotizar-table"
            rowKey={(record) => record["Cotización"]}
            dataSource={data}
            columns={columnsCotizaciones}
            loading={loading}
            bordered
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
            rowClassName={(record) => (record.incompleto ? "row-incompleto" : "")}
            expandable={{
              onExpand: handleExpand,
              expandedRowRender: (record) => {
                const id = record["Cotización"];
                const detalle = expandedData[id];
                if (loadingRows[id]) return <Skeleton active paragraph={{ rows: 2 }} />;
                if (!detalle) return <p>Sin datos adicionales.</p>;

                return (
                  <div style={{ padding: "20px" }}>
                    <Card size="small" bordered={false} style={{ marginBottom: "1rem" }}>
                      <Row justify="center" align="middle">
                        <Col>
                          <strong>Division:</strong> {detalle.data.cliente?.direccion?.division}
                        </Col>
                      </Row>
                      <Row justify="center" align="middle">
                        <Col>
                          <strong>Estado de aceptación:</strong> {detalle.data.ordenTrabajo?.mensaje} {" -OT: "}
                          <Space size={[4, 4]} wrap>
                            {detalle?.data?.ordenTrabajo?.items.map(({ id: otId, codigo }) => (
                              <Tag
                                key={otId}
                                onClick={() => navigate(`/DetalleOrdenTrabajo/${cifrarId(otId)}`)}
                                style={{ cursor: "pointer" }}
                              >
                                {codigo || "Pendiente"}
                              </Tag>
                            ))}
                          </Space>
                        </Col>
                      </Row>
                    </Card>

                    <Card size="small" bordered={false} style={{ marginBottom: "1rem" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "14px",
                          marginTop: "8px",
                        }}
                      >
                        <thead>
                          <tr>
                            {["Servicio", "Descripción", "Cantidad", "Precio", "Subtotal"].map((t) => (
                              <th
                                key={t}
                                style={{
                                  backgroundColor: "#fafafa",
                                  fontWeight: 600,
                                  textAlign: t === "Cantidad" ? "center" : t === "Precio" || t === "Subtotal" ? "right" : "left",
                                  border: "1px solid #d9d9d9",
                                  padding: "8px 12px",
                                }}
                              >
                                {t}
                              </th>
                            ))}
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
                              <td style={{ ...tdBaseStyle, textAlign: "right" }}>{formatCurrency(s.precio)}</td>
                              <td style={{ ...tdBaseStyle, textAlign: "right" }}>{formatCurrency(s.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>

                    <Card size="small" bordered={false}>
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
          />

          <div className="cotizar-summary">
            <div className="summary-container">Número de cotizaciones: {pagination.total}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestCotizar;
