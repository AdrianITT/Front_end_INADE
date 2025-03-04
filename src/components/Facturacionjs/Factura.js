import React, { useState, useEffect } from "react";
import { getAllFactura } from "../../apis/FacturaApi";
import { getCotizacionById } from "../../apis/CotizacionApi";
import { getClienteById } from "../../apis/ClienteApi";
import { getEmpresaById } from "../../apis/EmpresaApi";
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi"; 
import { getAllfacturafacturama } from "../../apis/FacturaFacturamaApi";
import { Table, Input, Button, message, Tag, theme, Space } from "antd";
import { Link } from "react-router-dom";
import "./crearfactura.css"

const Factura = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
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

        // 2. Obtener los registros de Facturama
        const responseFacturama = await getAllfacturafacturama();
        const facturamaList = responseFacturama.data || [];
        // Creamos un Set con los id de factura ya presentes en Facturama
        const facturamaIds = new Set(facturamaList.map(item => item.factura));

        // Aquí guardaremos objetos con { factura, ordenData, cotiData, clienteData, empresaData }
        const facturasFiltradas = [];

        // 3. Recorrer cada factura para formar la cadena de relaciones
        for (const factura of allFacturas) {
          if (!factura.ordenTrabajo) continue; // Si no tiene orden, no la procesamos

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

        // Fecha actual para la comparación
        const currentDate = new Date();

        // 4. Construir la data final para la tabla y marcar las facturas missing.
        let facturasFinal = facturasFiltradas.map((item, index) => {
          const { factura, ordenData, clienteData, empresaData } = item;
          // Verificar si el id de la factura NO está en el set de Facturama
          const missing = !facturamaIds.has(factura.id);
          
          // Convertir la fecha de expedición y formatearla
          const expedicionDate = factura.fechaExpedicion ? new Date(factura.fechaExpedicion) : null;
          const formattedFechaExpedicion = expedicionDate
            ? expedicionDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "Desconocida";
          
          // Calcular si es reciente (<= 4 días)
          let recent = false;
          if (expedicionDate) {
            const diffDays = (currentDate - expedicionDate) / (1000 * 60 * 60 * 24);
            recent = diffDays < 4;
          }

          return {
            key: index.toString(),
            id: factura.id,
            fechaExpedicion: formattedFechaExpedicion,
            expedicionDate, // para comparar en el sort
            codigoOrdenTrabajo: ordenData.codigo || "N/A",
            nombreCliente: `${clienteData.nombrePila || ""} ${clienteData.apPaterno || ""}`.trim(),
            nombreEmpresa: empresaData.nombre || "N/A",
            missing,
            recent, // true si es missing y reciente (<= 3 días)
          };
        });

        // 5. Revisar si existe alguna factura missing que sea reciente.
        const hasRecentMissing = facturasFinal.some(item => item.missing && item.recent);

        // Si existe al menos una factura missing y reciente, aplicar ordenamiento especial.
        if (hasRecentMissing) {
          facturasFinal.sort((a, b) => {
            // Prioridad:
            // 0 => missing && recent
            // 1 => missing && !recent
            // 2 => no missing
            const getPriority = (item) => {
              if (item.missing) {
                return item.recent ? 0 : 1;
              }
              return 2;
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);
            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }
            // Si tienen la misma prioridad, opcionalmente se pueden ordenar por fecha
            if (a.expedicionDate && b.expedicionDate) {
              return a.expedicionDate - b.expedicionDate;
            }
            return 0;
          });
        }
        // En caso de no existir ninguna factura missing reciente, se deja el orden obtenido (orden "normal").

        setData(facturasFinal);
        setFilteredData(facturasFinal);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        message.error("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [organizationId]);

  // Función para manejar la búsqueda en tiempo real
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // Columnas de la tabla con filtros
  const columns = [
    {
      title: "Código Orden de Trabajo",
      dataIndex: "codigoOrdenTrabajo",
      key: "codigoOrdenTrabajo",
      filters: [...new Set(data.map((item) => item.codigoOrdenTrabajo))].map((codigo) => ({
        text: codigo,
        value: codigo,
      })),
      onFilter: (value, record) => record.codigoOrdenTrabajo.includes(value),
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: "Cliente",
      dataIndex: "nombreCliente",
      key: "nombreCliente",
      filters: [...new Set(data.map((item) => item.nombreCliente))].map((cliente) => ({
        text: cliente,
        value: cliente,
      })),
      onFilter: (value, record) => record.nombreCliente.includes(value),
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
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Fecha de Expedición",
      dataIndex: "fechaExpedicion",
      key: "fechaExpedicion",
      sorter: (a, b) => a.expedicionDate - b.expedicionDate,
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
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Space style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Input.Search
            placeholder="Buscar por código de orden de trabajo..."
            style={{ width: "300px" }}
            onSearch={handleSearch}
            allowClear
          />
        </Space>
      </div>
      {/* Se usa rowClassName para resaltar las filas missing */}
      <Table
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 5 }}
        loading={loading}
        rowClassName={(record) => (record.missing && record.recent) ? "highlighted-row" : ""}
      />
    </div>
  );
};

export default Factura;

