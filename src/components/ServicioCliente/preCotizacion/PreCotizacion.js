import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Input } from "antd";
import { Link } from "react-router-dom";
import { FileTwoTone, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import "./PrecotizacionData.css";
import { getAllPrecotizacion, getAllPrecotizacionByOrganizacion} from "../../../apis/ApisServicioCliente/PrecotizacionApi";
import {getAllEstado} from "../../../apis/ApisServicioCliente/EstadoApi";
import ContadoPreCotizacion from "./ContadoPreCotizacion";
import { cifrarId } from "../secretKey/SecretKey";

const PreCotizacionData = () => { 
  const [preCotizaciones, setPreCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [estados, setEstados] = useState({});

  // Obtener el ID de la organización del usuario desde el local storage
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🔹 Obtener estados
        const estadosResponse = await getAllEstado();
        const estadosMap = estadosResponse.data.reduce((acc, estado) => {
          acc[estado.id] = estado.nombre;
          return acc;
        }, {});
        setEstados(estadosMap);

        // 🔹 Obtener pre-cotizaciones
        const response = await getAllPrecotizacionByOrganizacion(organizationId);
        
        const filteredPreCotizaciones = response.data;       
        
        const data = filteredPreCotizaciones.map((item) => ({
          key: item.precotizacionId,
          id: item.precotizacionId,
          numero: item.numero,
          cliente: item.nombreCliente,
          empresa: item.nombreEmpresa,
          estado: item.estado.nombre || "Desconocido",
        }));
        setPreCotizaciones(data);
      } catch (error) {
        message.error("Error al obtener los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organizationId]);

  // Definir las columnas de la tabla
  const columns = [
    {
      title: "#",
      dataIndex: "numero",
      key: "numero",
      width: 80,
      sorter:(a, b) => a.id - b.id,
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar cliente"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Limpiar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.cliente.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Empresa",
      dataIndex: "empresa",
      key: "empresa",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar empresa"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Limpiar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.empresa.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      filters: [
        { text: "Validado", value: "Validado" },
        { text: "No validado", value: "No validado" },
        { text: "Chat no validado", value: "Chat no validado" },
        { text: "Chat validado", value: "Chat validado" },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Link to={`/preCotizacionDetalles/${cifrarId(record.id)}`}>
            <Button type="primary"> Detalles</Button>
          </Link>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div className="container">
      <h1 className="title">Pre-Cotizaciones</h1>
      <div className="button-container">
        <Link to="/CrearPreCotizacion">
          <Button type="primary" icon={<PlusOutlined />}>
            Añadir Pre-Cotización
          </Button>
        </Link>
      </div>
      <ContadoPreCotizacion/>
      <Table 
        className="custom-table"
        columns={columns} 
        dataSource={preCotizaciones} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }} 
        bordered
      />
    </div>
  );
};

export default PreCotizacionData;