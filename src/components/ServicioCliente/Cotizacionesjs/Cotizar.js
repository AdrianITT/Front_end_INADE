// src/pages/Cotizar.js
import React, { useState, useMemo } from "react";
import { Table, Input, Spin, Button } from "antd";
import { Link } from "react-router-dom";
import "./cotizar.css";
import { useCotizacionesData } from "../Cotizacionesjs/usoCotizacionesData";
import { useCotizacionesColumns } from "../Cotizacionesjs/CotizacionesColumns";

const Cotizar = () => {
  // Estado para el texto de búsqueda y datos filtrados
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Obtener el ID de la organización desde localStorage (se usa useMemo para leerlo solo una vez)
  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  // Usamos el custom hook para cargar cotizaciones
  const { cotizaciones, isLoading } = useCotizacionesData(organizationId);

  // Obtenemos las columnas definidas en el hook de columnas
  const columnsCotizaciones = useCotizacionesColumns();

  // Función para actualizar la búsqueda
  const handleSearch = (value) => {
    setSearchText(value);
    // Filtramos las cotizaciones buscando coincidencias en cualquiera de sus campos
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

  // Si hay resultados filtrados, usamos esos; de lo contrario, mostramos todas las cotizaciones
  const dataSource = useMemo(
    () => (filteredData.length > 0 ? filteredData : cotizaciones),
    [filteredData, cotizaciones]
  );

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
            rowClassName={(record) => (record.incompleto ? "row-incompleto" : "")}
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
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
