import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin } from "antd";
import { Link } from "react-router-dom";
import "./cssOrdenTrabajo/Generarorden.css";
import { getAllOrdenesTrabajoData } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";

const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";
const TIEMPO_EXPIRACION_MS = 1 * 60 * 1000; // 1 minutos

// Guardar con timestamp
const guardarEstadoEnLocalStorage = (data) => {
  const payload = {
    valor: data,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
};

// Leer y verificar expiración
const obtenerEstadoConExpiracion = () => {
  const savedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedItem) return null;

  try {
    const { valor, timestamp } = JSON.parse(savedItem);
    const ahora = Date.now();

    if (ahora - timestamp < TIEMPO_EXPIRACION_MS) {
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


const Generarorden = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const savedState = obtenerEstadoConExpiracion();
    if (savedState) {
      setSearchText(savedState.searchText || "");
      setCurrentPage(savedState.currentPage || 1);
      setPageSize(savedState.pageSize || 5);
    }
  }, []);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setIsLoading(true);
        const response = await getAllOrdenesTrabajoData(organizationId);
        console.log("Órdenes de trabajo response:", response);
        setOrdenes(response.data);

        const filtered = filterData(response.data, searchText);
        setFilteredData(filtered);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdenes();
  }, [organizationId, searchText]);

  const filterData = (data, text) => {
    return data.filter((item) =>
      Object.values(item).some(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      setCurrentPage(1);

      const filtered = filterData(ordenes, value);
      setFilteredData(filtered);

      guardarEstadoEnLocalStorage({
        searchText: value,
        currentPage: 1,
        pageSize,
      }); 
      localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS);     
    },
    [ordenes, pageSize]
  );

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    guardarEstadoEnLocalStorage({
      searchText,
      currentPage: page,
      pageSize: size,
    });   
    localStorage.setItem("expiraEn", Date.now() + TIEMPO_EXPIRACION_MS); 
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "numero",
        key: "numero",
        sorter: (a, b) => a.orden - b.orden,
      },
      {
        title: "Código OT",
        dataIndex: "codigo",
        key: "codigo",
        sorter: (a, b) => a.codigo.localeCompare(b.codigo),
        filters: ordenes.map((item) => ({
          text: item.codigo,
          value: item.codigo,
        })),
        filterSearch: true,
        onFilter: (value, record) => record.codigo === value,
      },
      {
        title: "Cliente",
        dataIndex: "contacto",
        key: "contacto",
        sorter: (a, b) => a.contacto.localeCompare(b.contacto),
      },
      {
        title: "Recibe",
        dataIndex: "receptor",
        key: "receptor",
        sorter: (a, b) => a.receptor.localeCompare(b.receptor),
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
        render: (_, record) => record.estado?.nombre || "N/A",
      },
      {
        title: "Vigencia",
        dataIndex: "expiracion",
        key: "vigencia",
        sorter: (a, b) => new Date(a.expiracion) - new Date(b.expiracion),
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
    ],
    [searchText, ordenes]
  );

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
              current: currentPage,
              pageSize,
              onChange: handlePageChange,
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
