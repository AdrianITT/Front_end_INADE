import React, { useState, useEffect } from "react";
import { getAllFactura } from "../../apis/FacturaApi";
import { getCotizacionById } from "../../apis/CotizacionApi";
import { getClienteById } from "../../apis/ClienteApi";
import { getEmpresaById } from "../../apis/EmpresaApi";
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi"; 
import { Table, Input, Button, message, Tag, theme, Space } from "antd";
import { Link } from "react-router-dom";

const Factura = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  // ID de la organización actual
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        // 1. Obtener TODAS las facturas
        const response = await getAllFactura();
        const allFacturas = response.data || [];

        // Aquí guardaremos objetos con { factura, ordenData, cotiData, clienteData, empresaData }
        const facturasFiltradas = [];

        // 2. Para cada factura, buscar la cadena de relaciones
        for (const factura of allFacturas) {
          if (!factura.ordenTrabajo) continue; // Si no tiene orden, no podemos relacionarla con empresa

          try {
            // a) Orden de Trabajo
            const ordenRes = await getOrdenTrabajoById(factura.ordenTrabajo);
            const ordenData = ordenRes.data;

            if (!ordenData.cotizacion) continue;

            // b) Cotización
            const cotiRes = await getCotizacionById(ordenData.cotizacion);
            const cotiData = cotiRes.data;

            if (!cotiData.cliente) continue;

            // c) Cliente
            const clienteRes = await getClienteById(cotiData.cliente);
            const clienteData = clienteRes.data;

            if (!clienteData.empresa) continue;

            // d) Empresa
            const empresaRes = await getEmpresaById(clienteData.empresa);
            const empresaData = empresaRes.data;

            // e) Filtrar por organización
            if (empresaData.organizacion === organizationId) {
              facturasFiltradas.push({
                factura,
                ordenData,
                cotiData,
                clienteData,
                empresaData,
              });
            }

          } catch (err) {
            console.error("Error en la cadena de relaciones", err);
          }
        }

        // 3. Construir la data final para la tabla
        const facturasFinal = facturasFiltradas.map((item, index) => {
          const { factura, ordenData, clienteData, empresaData } = item;

          return {
            key: index.toString(),
            id: factura.id,
            // Fecha de expedición
            fechaExpedicion: factura.fechaExpedicion
              ? new Date(factura.fechaExpedicion).toLocaleString()
              : "Desconocida",
            // Código de la orden
            codigoOrdenTrabajo: ordenData.codigo || "N/A",
            // Nombre del cliente (ajusta según tus campos reales)
            nombreCliente: `${clienteData.nombrePila || ""} ${clienteData.apPaterno || ""}`.trim(),
            // Nombre de la empresa
            nombreEmpresa: empresaData.nombre || "N/A",
          };
        });

        setData(facturasFinal);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        message.error("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [organizationId]);

  // Búsqueda por código de ordenTrabajo
  const handleSearch = () => {
    const filteredData = data.filter((item) =>
      item.codigoOrdenTrabajo
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setData(filteredData);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "Código Orden de Trabajo",
      dataIndex: "codigoOrdenTrabajo",
      key: "codigoOrdenTrabajo",
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: "Cliente",
      dataIndex: "nombreCliente",
      key: "nombreCliente",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Empresa",
      dataIndex: "nombreEmpresa",
      key: "nombreEmpresa",
      filters: [...new Set(data.map((item) => item.nombreEmpresa))].map((empresa) => ({
        text: empresa,
        value: empresa,
      })),
      onFilter: (value, record) => record.nombreEmpresa === value,
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: "Fecha de Expedición",
      dataIndex: "fechaExpedicion",
      key: "fechaExpedicion",
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },    
    {
      title: "Opciones",
      key: "opciones",
      render: (_, record) => (
        <Link to={`/detallesfactura/${record.id}`}>
          <Button type="primary" size="small">
            Detalles
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <center><h1>Facturas</h1></center>
      <div style={{
        marginBottom: "16px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center"
      }}>
         <Space style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Input.Search
          placeholder="Buscar por código de orden de trabajo..."
          style={{ width: "300px" }}
          onSearch={handleSearch}
          allowClear
        />
      </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        bordered
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </div>
  );
};

export default Factura;