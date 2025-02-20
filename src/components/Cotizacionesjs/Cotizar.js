import React, { useState, useEffect, useMemo } from "react";
import { Table, Input, Button, Spin, Menu } from "antd";
import { Link } from "react-router-dom";
import "./cotizar.css";
import { getAllCotizacion } from "../../apis/CotizacionApi";
import { getAllCliente } from "../../apis/ClienteApi";
import { getAllTipoMoneda } from "../../apis/Moneda";
import { getAllEmpresas } from "../../apis/EmpresaApi";
import { getEstadoById } from "../../apis/EstadoApi";

const columnsCotizaciones = [
  {
    title: "Cotización",
    dataIndex: "id",
    key: "id",
    render: (text) => <span className="cotizacion-text">{text}</span>,
  },
  { title: "Empresa", 
    dataIndex: "empresa", 
    key: "empresa",
    render: (text, record) =>
      record.incompleto ? (
        <Link to={"/empresa"}>
          <span className="empresa-link" style={{ color: "red", fontWeight: "bold" }}>
            {text} (Completar)
          </span>
        </Link>
      ) : (
        <span>{text}</span>
      ),
    },
  { title: "Contacto", 
    dataIndex: "contacto", 
    key: "contacto",
    render: (text, record) =>
    record.incompleto ? (
      <Link to={"/cliente"}>
        <span className="contacto-link" style={{ color: "red", fontWeight: "bold" }}>
          {text} (Completar)
        </span>
      </Link>
    ) : (
      <span>{text}</span>
    ),
  },
  {
    title: "Solicitud",
    dataIndex: "fechaSolicitud",
    key: "fechaSolicitud",
    sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
    sortDirections: ["ascend", "descend"],
  },
  {
    title: "Expiración",
    dataIndex: "fechaCaducidad",
    key: "fechaCaducidad",
    sorter: (a, b) => new Date(a.fechaCaducidad) - new Date(b.fechaCaducidad),
    sortDirections: ["ascend", "descend"],
  },
  { title: "Moneda", dataIndex: "moneda", key: "moneda" },
  {
    title: "Estado",
    dataIndex: "estado",
    key: "estado",
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
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
    onFilter: (value, record) => value === "all" || record.estado === value,
  },
  {
    title: "Acción",
    key: "action",
    render: (_, record) => (
      <Link to={`/detalles_cotizaciones/${record.id}`}>
        <Button type="primary" className="detalles-button">
          Detalles
        </Button>
      </Link>
    ),
  },
];

const Cotizar = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [cotizaciones, setCotizacion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  // Función para crear diccionarios
  const createDictionary = (data, key) =>
    data.reduce((acc, item) => ({ ...acc, [item[key]]: item }), {});

  // Función para obtener y transformar cotizaciones
  const fetchCotizacionesYEstados = async (cotizaciones, clientes, empresas, monedas) => {
    try {
      const estadosMap = {};
      await Promise.all(
        cotizaciones.map(async (cot) => {
          try {
            const estadoResp = await getEstadoById(cot.estado);
            estadosMap[cot.estado] = estadoResp.data.nombre;
          } catch (error) {
            console.error(`Error obteniendo estado ${cot.estado}:`, error);
            estadosMap[cot.estado] = "Desconocido";
          }
        })
      );

      const clientesMap = createDictionary(clientes, "id");
      const empresasMap = createDictionary(empresas, "id");
      const monedasMap = createDictionary(monedas, "id");

      const cotizacionesConDetalles = cotizaciones.map((cot) => {
        const cliente = clientesMap[cot.cliente] || {};
        const empresa = empresasMap[cliente.empresa] || {};
        const moneda = monedasMap[cot.tipoMoneda] || {};

      // 🔹 Verificar si hay datos incompletos en cliente o empresa
      const clienteIncompleto = !cliente.nombrePila || !cliente.apPaterno || !cliente.correo || !cliente.UsoCfdi;
      const empresaIncompleta = !empresa.nombre || !empresa.rfc || !empresa.calle || !empresa.numero || !empresa.colonia;

        return {
          ...cot,
          empresa: empresa.nombre || "Empresa desconocida",
          contacto: `${cliente.nombrePila || "Sin nombre"} ${cliente.apPaterno || ""} ${cliente.apMaterno || ""}`.trim(),
          moneda: moneda.codigo || "",
          estado: estadosMap[cot.estado] || "Desconocido",
          incompleto: clienteIncompleto || empresaIncompleta, // ✅ Flag para resaltar
        };
      });
    // 🔹 Ordenar primero los incompletos
    const sortedCotizaciones = cotizacionesConDetalles.sort((a, b) => b.incompleto - a.incompleto);

    setCotizacion(sortedCotizaciones);
    } catch (error) {
      console.error("Error al obtener cotizaciones y detalles:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [cotizacionesResponse, clientesResponse, monedasResponse, empresasResponse] =
          await Promise.all([
            getAllCotizacion(),
            getAllCliente(),
            getAllTipoMoneda(),
            getAllEmpresas(),
          ]);

        const filteredEmpresas = empresasResponse.data.filter(
          (empresa) => empresa.organizacion === organizationId
        );

        const filteredClientes = clientesResponse.data.filter((cliente) =>
          filteredEmpresas.some((empresa) => empresa.id === cliente.empresa)
        );

        const filteredCotizaciones = cotizacionesResponse.data.filter((cotizacion) =>
          filteredClientes.some((cliente) => cliente.id === cotizacion.cliente)
        );

        await fetchCotizacionesYEstados(filteredCotizaciones, filteredClientes, filteredEmpresas, monedasResponse.data);
      } catch (error) {
        console.error("Error al cargar los datos", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [organizationId]);

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
            rowClassName={(record) => record.incompleto ? "row-incompleto" : ""}
            bordered
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
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