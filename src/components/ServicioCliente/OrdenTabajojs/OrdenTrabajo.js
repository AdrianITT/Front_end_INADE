
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin, Menu } from "antd";
import { Link } from "react-router-dom";
import "./cssOrdenTrabajo/Generarorden.css";
import { getAllOrdenesTrabajoData } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";

const Generarorden = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setIsLoading(true);
        const response = await getAllOrdenesTrabajoData(organizationId);
        setOrdenes(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdenes();
  }, [organizationId]);

  const handleSearch = useCallback((value) => {
    setSearchText(value);
    const filtered = ordenes.filter((item) =>
      Object.values(item).some(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [ordenes]);

  const columns = useMemo(() => [
    {
      title: "ID",
      dataIndex: "orden",
      key: "orden",
      sorter: (a, b) => a.orden - b.orden,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Código OT",
      dataIndex: "codigo",
      key: "codigo",
      sorter: (a, b) => a.codigo.localeCompare(b.codigo),
      sortDirections: ["ascend", "descend"],
      filters: ordenes.map((item) => ({
        text: item.codigo,
        value: item.codigo,
      })),
      filterSearch: true, // Habilita el buscador en el filtro
      onFilter: (value, record) => record.codigo === value,
    },
    
    {
      title: "Cliente",
      dataIndex: "contacto",
      key: "contacto",
      sorter: (a, b) => a.contacto.localeCompare(b.contacto),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Recibe",
      dataIndex: "receptor",
      key: "receptor",
      sorter: (a, b) => a.receptor.localeCompare(b.receptor),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      filters: [
        { text: "Pendiente", value: "Pendiente" },
        { text: "En proceso", value: "En proceso" },
        { text: "Completado", value: "Completado" },
      ],
      onFilter: (value, record) => record.estado?.nombre === value,
      sorter: (a, b) => a.estado?.nombre.localeCompare(b.estado?.nombre),
      sortDirections: ["ascend", "descend"],
      render: (_, record) => record.estado?.nombre || "N/A",
    },
    {
      title: "Vigencia",
      dataIndex: "expiracion",
      key: "vigencia",
      sorter: (a, b) => new Date(a.expiracion) - new Date(b.expiracion),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Opciones",
      key: "opciones",
      render: (_, record) => (
        <Link to={`/DetalleOrdenTrabajo/${record.orden}`}>
          <Button className="detalles-button">Detalles</Button>
        </Link>
      ),
    },
  ], [searchText]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => a.orden - b.orden);
  }, [filteredData]);
  
  

  return (
    <div className="generarorden-container">
      <h1 className="generarorden-title">Órdenes de Trabajo</h1>
      <center>
        <Input.Search
          className="generarorden-search"
          placeholder="Buscar órdenes de trabajo..."
          enterButton="Buscar"
          value={searchText}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </center>
      <div className="generarorden-buttons">
        <Link to="/proyectos">
          <Button className="nueva-orden-button">Nueva Orden de Trabajo</Button>
        </Link>
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Cargando órdenes de trabajo..." />
        </div>
      ) : (
        <>
          <Table
            rowKey="id"
            className="generarorden-table"
            dataSource={sortedData}
            columns={columns}
            bordered
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
            }}
          />
          <div className="generarorden-summary">
            <div className="summary-container">
              Número de órdenes de trabajo: {filteredData.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Generarorden);