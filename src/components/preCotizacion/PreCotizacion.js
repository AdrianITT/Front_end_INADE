import React, { useState, useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { Link } from "react-router-dom";
import { FileTwoTone, PlusOutlined } from "@ant-design/icons";
import "./PrecotizacionData.css";
import { getAllPrecotizacion } from "../../apis/precotizacionApi";

const PreCotizacionData = () => { 
  const [preCotizaciones, setPreCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener el ID de la organización del usuario desde el local storage
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllPrecotizacion();
        // Filtrar las pre-cotizaciones según el ID de la organización
        const filteredPreCotizaciones = response.data.filter(
          (item) => item.organizacion === organizationId
        );
        const data = filteredPreCotizaciones.map((item) => ({
          key: item.id,
          id: item.id,
          cliente: `${item.nombreCliente} ${item.apellidoCliente}`,
          empresa: item.nombreEmpresa,
        }));
        setPreCotizaciones(data);
      } catch (error) {
        message.error("Error al obtener los datos de pre-cotizaciones");
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
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
    },
    {
      title: "Empresa",
      dataIndex: "empresa",
      key: "empresa",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Link to={`/preCotizacionDetalles/${record.id}`}>
            <Button type="primary" icon={<FileTwoTone />} />
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
