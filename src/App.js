import React, { useEffect, useState, useMemo } from "react";
import "./App.css";
import { Card, Col, Row, Badge, Space, Progress, Spin } from "antd";
import { getAllCotizacion } from "./apis/ApisServicioCliente/CotizacionApi";
import { getAllCliente } from "./apis/ApisServicioCliente/ClienteApi";
import { getAllEmpresas } from "./apis/ApisServicioCliente/EmpresaApi";

import {
  ReconciliationOutlined,
  SettingOutlined,
  UserAddOutlined,
  AuditOutlined,
  ClearOutlined,
  ShopFilled,
  UsergroupAddOutlined,
  EditOutlined,
  ThunderboltTwoTone,
  DollarTwoTone,
  UserSwitchOutlined,
  FundTwoTone
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const App = () => {
  const [countCotizaciones, setCountCotizaciones] = useState(0);
  const [totalCotizaciones, setTotalCotizaciones] = useState(0);
  const [cotizacionesAceptadas, setCotizacionesAceptadas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

        // MEJORA 1: Hacer las 3 llamadas en paralelo (ya estaba bien)
        const [cotResponse, clientesResponse, empresasResponse] = await Promise.all([
          getAllCotizacion(),
          getAllCliente(),
          getAllEmpresas(),
        ]);

        const cotizaciones = cotResponse.data || [];
        const clientes = clientesResponse.data || [];
        const empresas = empresasResponse.data || [];

        // MEJORA 2: Crear un Set con IDs para búsquedas O(1) en lugar de O(n)
        const filteredEmpresas = empresas.filter(
          (empresa) => empresa.organizacion === organizationId
        );

        const empresaIds = new Set(filteredEmpresas.map((emp) => emp.id));

        // Filtrar clientes una sola vez
        const filteredClientes = clientes.filter((cliente) =>
          empresaIds.has(cliente.empresa)
        );

        const clienteIds = new Set(filteredClientes.map((cli) => cli.id));

        // Filtrar cotizaciones una sola vez
        const filteredCotizaciones = cotizaciones.filter((cotizacion) =>
          clienteIds.has(cotizacion.cliente)
        );

        // MEJORA 3: Contar estados en una sola pasada
        let estadoUno = 0;
        let aceptadas = 0;

        for (const cot of filteredCotizaciones) {
          if (cot.estado === 1) estadoUno++;
          if (cot.estado >= 2) aceptadas++;
        }

        setCountCotizaciones(estadoUno);
        setTotalCotizaciones(filteredCotizaciones.length);
        setCotizacionesAceptadas(aceptadas);

        // MEJORA 4: ELIMINAR el setTimeout innecesario de 1000ms
        // Esto estaba ralentizando toda la carga sin razón
      } catch (error) {
        console.error("Error al obtener las cotizaciones", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  // MEJORA 5: Usar useMemo para cachear el porcentaje
  // Así si el componente re-renderiza, no recalcula
  const porcentajeFinal = useMemo(() => {
    if (totalCotizaciones === 0) return 0;
    return parseFloat(((cotizacionesAceptadas / totalCotizaciones) * 100).toFixed(2));
  }, [totalCotizaciones, cotizacionesAceptadas]);

  return (
    <div className="App">
      <Spin spinning={loading} tip="Cargando...">
        <div className="justi-card">
          <Card className="custom-card-bar">
            <div className="progress-bar-container">
              <Progress percent={porcentajeFinal} status="active" />
            </div>
            <div className="text-container">
              <p>Total de cotizaciones: {totalCotizaciones}</p>
              <p>Cotizaciones Aceptadas: {cotizacionesAceptadas}</p>
            </div>
          </Card>
        </div>

        <div className="contencenter">
          <br />
          <Space size={0}>
            <Row gutter={[0, 0]} justify="center">
              <Col key="empresa" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/empresa">
                    <Card className="card-custom" title="Empresas" bordered={false}>
                      <div className="icon-container">
                        <ShopFilled />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="cliente" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/cliente">
                    <Card className="card-custom" title="Clientes" bordered={false}>
                      <div className="icon-container">
                        <UserAddOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="servicio" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/servicio">
                    <Card className="card-custom" title="Servicios" bordered={false}>
                      <div className="icon-container">
                        <ClearOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="cotizar" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/cotizar">
                    <Card className="card-custom" title="Cotizaciones" bordered={false}>
                      <div className="badge-container">
                        <Badge count={countCotizaciones} />
                      </div>
                      <div className="icon-container">
                        <EditOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="generar_orden" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/generar_orden">
                    <Card
                      className="card-custom"
                      title="Ordenes de Trabajo"
                      bordered={false}
                    >
                      <div className="icon-container">
                        <ReconciliationOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="usuario" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/usuario">
                    <Card className="card-custom" title="Usuarios" bordered={false}>
                      <div className="icon-container">
                        <UsergroupAddOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="configuracion" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/configuracionorganizacion">
                    <Card
                      className="card-custom"
                      title="Configuración"
                      bordered={false}
                      styles={{
                        header: {
                          whiteSpace: "normal",
                          overflow: "visible",
                          textOverflow: "clip",
                        },
                      }}
                    >
                      <div className="icon-container">
                        <SettingOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="factura" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/factura">
                    <Card className="card-custom" title="Facturas" bordered={false}>
                      <div className="icon-container">
                        <AuditOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="precotizacion" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/preCotizacion">
                    <Card className="card-custom" title="Pre-Cotizaciones" bordered={false}>
                      <div className="icon-container">
                        <ThunderboltTwoTone />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="pagos" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/Pagos">
                    <Card className="card-custom" title="Pagos" bordered={false}>
                      <div className="icon-container">
                        <DollarTwoTone />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="Estadisticas" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/Homeadmin">
                    <Card className="card-custom" title="Estadísticas" bordered={false}>
                      <div className="icon-container">
                        <FundTwoTone />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
              <Col key="Receptores" xs={24} sm={12} md={8} lg={6} xl={4} className="col-style">
                <div>
                  <Link to="/Receptores">
                    <Card className="card-custom" title="Receptores" bordered={false}>
                      <div className="icon-container">
                        <UserSwitchOutlined />
                      </div>
                    </Card>
                  </Link>
                </div>
              </Col>
            </Row>
          </Space>
        </div>
      </Spin>
    </div>
  );
};

export default App;