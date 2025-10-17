// src/pages/Cotizar.js
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Spin, Button, Card, Row, Col, Tag, Space } from "antd";
import { Link } from "react-router-dom";
import "./cotizar.css";
import { useCotizacionesData } from "../Cotizacionesjs/usoCotizacionesData";
import { useCotizacionesColumns } from "../Cotizacionesjs/CotizacionesColumns";
import { getDetallecotizaciondataById } from "../../../apis/ApisServicioCliente/CotizacionApi";
import { descifrarId, cifrarId } from "../secretKey/SecretKey";
import CotizacionesPorServicioModal from "../Cotizacionesjs/ModalFiltroServicio/CotizacionesPorServicioModal";
import CotizacionDetalleExpand from "./CotizacionDetalleExpand/CotizacionDetalleExpand";

const Cotizar = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [expandedData, setExpandedData] = useState({});
  const [loadingRows, setLoadingRows] = useState({});
  const [openServicioModal, setOpenServicioModal] = useState(false);

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
        // console.log(`Detalle de cotización ${id}:`, detalle);
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

        <Button type="primary" onClick={() => setOpenServicioModal(true)}>
          Ver cotizaciones por servicio
          </Button>
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
                <CotizacionDetalleExpand
                        detalle={detalle}
                        navigate={navigate}
                        cifrarId={cifrarId}
                        formatCurrency={(v) =>
                          `$${Number(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        }
                      />
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
      <CotizacionesPorServicioModal
        open={openServicioModal}
        onClose={() => setOpenServicioModal(false)}
        orgId={organizationId}
        onRowClick={(row) => navigate(`/detalles_cotizaciones/${cifrarId(row.id)}`)}
      />
    </div>
  );
};

export default Cotizar;
