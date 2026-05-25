import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Table,
  Tag,
  Typography,
  Spin,
  Alert,
  Space,
  Card,
  Button,
  message,
  Input,
  DatePicker,
  Row,
  Col,
  Tooltip,
  Statistic,
  Empty,
  Segmented,
  Badge,
} from "antd";

import {
  CopyOutlined,
  LinkOutlined,
  SearchOutlined,
  ClearOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { getEncuestas, link, exportPdfMasivo } from "../../../apis/ApiSurvey/Api_Survey";
import { ModalLinkEvaluacion } from "./ModalLinkEvaluacion";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const EvaluacionesTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all"); // all, responded, pending
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfType, setPdfType] = useState("tokens");
    const [pdfDateRange, setPdfDateRange] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10"],
  });

  const [filters, setFilters] = useState({
    ot: "",
    cliente: "",
    fechaRange: null,
  });

  const userOrgId = parseInt(localStorage.getItem("organizacion_id"));

  // Estadísticas
//   const getStatistics = () => {
//     const total = data.length;
//     const responded = data.filter(item => item.respondido).length;
//     const pending = total - responded;
//     return { total, responded, pending };
//   };

//   const stats = getStatistics();

  // =========================
  // Obtener datos
  // =========================
    const fetchEvaluaciones = async (
    page = 1,
    pageSize = 20,
    currentFilters = filters
    ) => {
    try {
        setLoading(true);
        setError(null);

        const params = {
        page,
        page_size: pageSize,
        };

        if (currentFilters.ot) {
        params.ot = currentFilters.ot;
        }

        if (currentFilters.cliente) {
        params.cliente = currentFilters.cliente;
        }

        if (
        currentFilters.fechaRange &&
        currentFilters.fechaRange.length === 2
        ) {
        params.fecha_desde =
            currentFilters.fechaRange[0].format(
            "YYYY-MM-DD"
            );

        params.fecha_hasta =
            currentFilters.fechaRange[1].format(
            "YYYY-MM-DD"
            );
        }

        if (activeFilter !== "all") {
        params.respondido =
            activeFilter === "responded";
        }

        const response = await getEncuestas(
        userOrgId,
        params
        );

        setData(response.data.results);

        setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: response.data.total,
        }));
    } catch (err) {
        console.error(err);

        setError("Error al obtener las evaluaciones");

        message.error(
        "No se pudieron cargar las evaluaciones"
        );
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    fetchEvaluaciones(1, pagination.pageSize);
  }, [activeFilter]);

  // =========================
  // Cambio de tabla (paginación)
  // =========================
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchEvaluaciones(newPagination.current, newPagination.pageSize);
  };

  // =========================
  // Copiar Link con feedback mejorado
  // =========================
  const copyLink = async (url, record) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success({
        content: `Link copiado para OT: ${record.orden_trabajo__codigo}`,
        duration: 2,
      });
    } catch (error) {
      console.error(error);
      message.error("No se pudo copiar el link");
    }
  };

  // =========================
  // Limpiar filtros
  // =========================
  const handleClearFilters = () => {
    const resetFilters = {
      ot: "",
      cliente: "",
      fechaRange: null,
    };
    setFilters(resetFilters);
    fetchEvaluaciones(1, pagination.pageSize, resetFilters);
    message.info("Filtros limpiados");
  };

  // =========================
  // Columnas mejoradas
  // =========================
  const columns = [
    {
      title: "OT",
      dataIndex: "orden_trabajo__codigo",
      key: "ot",
      width: 120,
      fixed: "left",
      render: (text) => (
        <Text strong copyable>
          {text}
        </Text>
      ),
    },
    {
      title: "Cliente",
      dataIndex: "nombre_cliente",
      key: "cliente",
      width: 200,
      ellipsis: true,
    //   sorter: (a, b) => a.nombre_cliente?.localeCompare(b.nombre_cliente),
    },
    {
      title: "Estado",
      dataIndex: "respondido",
      key: "respondido",
      width: 120,
      align: "center",
      render: (respondido) => (
        <Badge
          status={respondido ? "success" : "default"}
          text={
            respondido ? (
              <span style={{ color: "#52c41a" }}>Respondido</span>
            ) : (
              <span style={{ color: "#ff4d4f" }}>Pendiente</span>
            )
          }
        />
      ),
    //   filters: [
    //     { text: "Respondido", value: true },
    //     { text: "Pendiente", value: false },
    //   ],
    //   onFilter: (value, record) => record.respondido === value,
    },
    {
      title: "Fecha Respuesta",
      dataIndex: "fecha_respuesta",
      key: "fecha_respuesta",
      width: 180,
    //   sorter: (a, b) => {
    //     if (!a.fecha_respuesta) return 1;
    //     if (!b.fecha_respuesta) return -1;
    //     return new Date(a.fecha_respuesta) - new Date(b.fecha_respuesta);
    //   },
      render: (fecha) => {
        if (!fecha) return <Text type="secondary">Sin respuesta</Text>;
        return (
          <Tooltip title={new Date(fecha).toLocaleString()}>
            <Text>{dayjs(fecha).format("DD/MM/YYYY HH:mm")}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 180,
      fixed: "right",
      render: (_, record) => {
        const surveyLink = `http://localhost:3000/evaluacion/${record.token}`;
        
        return (
          <Space>
            <Tooltip title="Abrir evaluación">
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                onClick={() => window.open(surveyLink, "_blank")}
              >
                Abrir
              </Button>
            </Tooltip>
            
            <Tooltip title="Copiar enlace">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyLink(surveyLink, record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,

    onChange: (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    },
    };


// HANDLE GENERATE PDF

const handleGeneratePdf = async () => {

  try {

    setPdfLoading(true);

    const payload = {};

    // =========================
    // TOKENS
    // =========================
    if (pdfType === "tokens") {

      const selectedTokens = data
        .filter(item =>
          selectedRowKeys.includes(
            item.token
          )
        )
        .map(item => item.token);

      payload.tokens = selectedTokens;

    }

    // =========================
    // FECHAS
    // =========================
    if (
      pdfType === "dates" &&
      pdfDateRange
    ) {

      payload.fecha_desde =
        pdfDateRange[0].format(
          "YYYY-MM-DD"
        );

      payload.fecha_hasta =
        pdfDateRange[1].format(
          "YYYY-MM-DD"
        );

    }

    // =========================
    // REQUEST
    // =========================
    console.log("Payload para PDF masivo:", payload);
    const response =
      await exportPdfMasivo(payload);

    // =========================
    // DESCARGAR ZIP
    // =========================
    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "evaluaciones.zip"
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    message.success(
      "ZIP generado correctamente"
    );

    setPdfModalOpen(false);

  } catch (error) {

    console.error(error);

    message.error(
      "Error al generar PDFs"
    );

  } finally {

    setPdfLoading(false);

  }

};

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header con estadísticas */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined /> Evaluaciones de Servicio
            </Title>

            <Button
            icon={<ReloadOutlined/>}
            onClick={()=> setPdfModalOpen(true) }
            loading={loading}
            >
                Exportar PDF
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchEvaluaciones(1, pagination.pageSize)}
              loading={loading}
            >
              Actualizar
            </Button>
          </div>

          {/* Tarjetas de estadísticas */}
          {/* <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                <Statistic
                  title="Total"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                <Statistic
                  title="Respondidas"
                  value={stats.responded}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ background: "#fff2f0", borderColor: "#ffccc7" }}>
                <Statistic
                  title="Pendientes"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row> */}

          {/* Filtro rápido por estado */}
          <Segmented
            value={activeFilter}
            onChange={setActiveFilter}
            options={[
              { label: "Todos", value: "all" },
              { label: "Respondidos", value: "responded" },
              { label: "Pendientes", value: "pending" },
            ]}
            block
          />

          {error && (
            <Alert
              type="error"
              message="Error"
              description={error}
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Filtros avanzados */}
          <Card size="small" style={{ background: "#fafafa" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Input
                  placeholder="Buscar por OT"
                  value={filters.ot}
                  onChange={(e) =>
                    setFilters({ ...filters, ot: e.target.value })
                  }
                  onPressEnter={() => fetchEvaluaciones(1, pagination.pageSize)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>

              <Col xs={24} md={8}>
                <Input
                  placeholder="Buscar por Cliente"
                  value={filters.cliente}
                  onChange={(e) =>
                    setFilters({ ...filters, cliente: e.target.value })
                  }
                  onPressEnter={() => fetchEvaluaciones(1, pagination.pageSize)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>

              <Col xs={24} md={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  placeholder={["Fecha desde", "Fecha hasta"]}
                  value={filters.fechaRange}
                  onChange={(dates) =>
                    setFilters({ ...filters, fechaRange: dates })
                  }
                  format="DD/MM/YYYY"
                />
              </Col>

              <Col xs={24}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => fetchEvaluaciones(1, pagination.pageSize)}
                  >
                    Buscar
                  </Button>

                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                  >
                    Limpiar filtros
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tabla */}
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "80px 0",
              }}
            >
              <Spin size="large" tip="Cargando evaluaciones..." />
            </div>
          ) : data.length === 0 ? (
            <Empty
              description="No se encontraron evaluaciones"
              style={{ margin: "60px 0" }}
            />
          ) : (
              <>
            <Table
              rowKey={(record) => record.token}
              columns={columns}
              dataSource={data}
              pagination={pagination}
              onChange={handleTableChange}
              bordered
              scroll={{ x: 1000 }}
              size="middle"
              rowClassName={(record) =>
                !record.respondido ? "ant-table-row-pending" : ""
              }
              rowSelection={rowSelection}
            />
            <ModalLinkEvaluacion
              pdfModalOpen={pdfModalOpen}
              setPdfModalOpen={setPdfModalOpen}
              handleGeneratePdf={handleGeneratePdf}
              pdfLoading={pdfLoading}
              pdfType={pdfType}
              setPdfType={setPdfType}
              selectedRowKeys={selectedRowKeys}
              pdfDateRange={pdfDateRange}
              setPdfDateRange={setPdfDateRange}
            />
        </>
          )}
        </Space>
      </Card>

      {/* Estilos adicionales */}
      <style jsx>{`
        :global(.ant-table-row-pending) {
          background-color: #fffbe6;
        }
        :global(.ant-table-row-pending:hover) {
          background-color: #fff1b8 !important;
        }
      `}</style>
    </div>
  );
};

export default EvaluacionesTable;