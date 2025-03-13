import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, Input, Button, Spin, Menu } from "antd";
import { Link } from "react-router-dom";
import "./cssOrdenTrabajo/Generarorden.css";
import { getAllOrdenesTrabajo } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { getCotizacionById } from "../../../apis/ApisServicioCliente/CotizacionApi";
import { getClienteById } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getEstadoById } from "../../../apis/ApisServicioCliente/EstadoApi";
import { getReceptorById } from "../../../apis/ApisServicioCliente/ResectorApi";
import { getAllEmpresas } from "../../../apis/ApisServicioCliente/EmpresaApi";

const Generarorden = () => {
  const [ordentrabajo, setOrdenTrabajo] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchOrdenTrabajo = async () => {
      try {
        setIsLoading(true);
        
        // Obtener todas las empresas y filtrar por organización
        const empresasResponse = await getAllEmpresas();
        const empresasFiltradas = empresasResponse.data.filter(
          (empresa) => empresa.organizacion === organizationId
        );

        const response = await getAllOrdenesTrabajo();
        const ordenes = response.data;

        const ordenesConCotizacion = await Promise.all(
          ordenes.map(async (orden) => {
            const [cotizacionResponse, receptorResponse, estadoResponse] = await Promise.all([
              getCotizacionById(orden.cotizacion),
              getReceptorById(orden.receptor),
              getEstadoById(orden.estado),
            ]);

            const clienteResponse = await getClienteById(cotizacionResponse.data.cliente);

            return {
              ...orden,
              cotizacionData: { ...cotizacionResponse.data, clienteData: clienteResponse.data },
              receptorData: receptorResponse.data,
              estadoData: estadoResponse.data,
            };
          })
        );

        // Filtrar órdenes de trabajo basadas en la organización
        const ordenesFiltradas = ordenesConCotizacion.filter((orden) =>
          empresasFiltradas.some(
            (empresa) => empresa.id === orden.cotizacionData.clienteData.empresa
          )
        );

        setOrdenTrabajo(ordenesFiltradas);
        setFilteredData(ordenesFiltradas);
      } catch (error) {
        console.error("Error al cargar las órdenes de trabajo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdenTrabajo();
  }, [organizationId]);

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      const filtered = ordentrabajo.filter((item) =>
        Object.values(item).some(
          (field) =>
            field !== null &&
            field !== undefined &&
            String(field).toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredData(filtered);
    },
    [ordentrabajo]
  );

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id" },
      {
        title: "Cotización",
        key: "cotizacion",
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar cotización"
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: "block" }}
            />
            <Button
              onClick={() => confirm()}
              type="primary"
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => clearFilters && clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Resetear
            </Button>
          </div>
        ),
        onFilter: (value, record) => {
          const cotizacionValor =
            record.codigo ||
            (record.cotizacionData ? record.cotizacionData.id.toString() : "");
          return cotizacionValor
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        },
        render: (_, record) => (
          <span className="cotizacion-text">
            {record.codigo || (record.cotizacionData ? record.cotizacionData.id : "")}
          </span>
        ),
      },
      {
        title: "Cliente",
        key: "cliente",
        render: (_, record) => {
          if (record.cotizacionData && record.cotizacionData.clienteData) {
            const { nombrePila, apPaterno, apMaterno } = record.cotizacionData.clienteData;
            return `${nombrePila} ${apPaterno} ${apMaterno}`;
          }
          return "";
        },
      },
      {
        title: "Recibe",
        key: "receptor",
        render: (_, record) => {
          if (record.receptorData) {
            const { nombrePila, apPaterno, apMaterno } = record.receptorData;
            return `${nombrePila} ${apPaterno} ${apMaterno}`;
          }
          return "";
        },
      },
      {
        title: "Estado",
        key: "estado",
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Menu
              onClick={({ key }) => {
                setSelectedKeys(key === "all" ? [] : [key]);
                confirm();
              }}
              selectedKeys={selectedKeys}
            >
              <Menu.Item key="all">Todos</Menu.Item>
              <Menu.Item key="Pendiente">Pendiente</Menu.Item>
              <Menu.Item key="En proceso">En proceso</Menu.Item>
              <Menu.Item key="Completado">Completado</Menu.Item>
            </Menu>
          </div>
        ),
        onFilter: (value, record) =>
          value === "all" || (record.estadoData && record.estadoData.nombre === value),
        render: (_, record) => (record.estadoData ? record.estadoData.nombre : ""),
      },
      {
        title: "Vigencia",
        key: "vigencia",
        // Eliminamos el filtro por rango de fechas en la columna Vigencia
        render: (_, record) =>
          record.cotizacionData ? record.cotizacionData.fechaCaducidad : "",
      },
      {
        title: "Opciones",
        key: "opciones",
        render: (_, record) => (
          <Link to={`/DetalleOrdenTrabajo/${record.id}`}>
            <Button className="detalles-button">Detalles</Button>
          </Link>
        ),
      },
    ],
    []
  );

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
            dataSource={filteredData}
            columns={columns}
            bordered
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
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
