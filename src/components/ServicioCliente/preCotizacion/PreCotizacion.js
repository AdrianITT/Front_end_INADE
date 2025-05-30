import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Input } from "antd";
import { Link } from "react-router-dom";
import { FileTwoTone, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import "./PrecotizacionData.css";
import { getAllPrecotizacion, getAllPrecotizacionByOrganizacion} from "../../../apis/ApisServicioCliente/PrecotizacionApi";
import {getAllEstado} from "../../../apis/ApisServicioCliente/EstadoApi";
import ContadoPreCotizacion from "./ContadoPreCotizacion";

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
          acc[estado.id] = estado.nombre; // Mapea { 1: "Pendiente", 2: "Aprobado", etc. }
          return acc;
        }, {});

        setEstados(estadosMap);

        // 🔹 Obtener pre-cotizaciones
        const response = await getAllPrecotizacionByOrganizacion(organizationId);
        //console.log("Pre-Cotizaciones:", response.data);
        // 🔸 Filtrar si necesitas excluir los estados 7 y 8:
        const filteredPreCotizaciones = response.data;       
        //console.log("Filtered Pre-Cotizaciones:", filteredPreCotizaciones);
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar cliente"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()} // Filtrar al presionar Enter
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
           <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: "100%" }}
          >
            Buscar
          </Button>
        </div>
          ),
          onFilter: (value, record) =>
            record.cliente.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Empresa",
      dataIndex: "empresa",
      key: "empresa",
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
      ], // 🔹 Filtro basado en los nombres de los estados
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Link to={`/preCotizacionDetalles/${record.id}`}>
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