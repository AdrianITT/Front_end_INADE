import React, { useState, useEffect } from "react";
import { getAllFactura } from "../../apis/FacturaApi";
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi"; // Asegúrate de que esta API obtiene el servicio relacionado
import { Table, Input, Button, message } from "antd";
import { Link } from "react-router-dom";

const Factura = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]); // Ahora inicia vacío
  const [loading, setLoading] = useState(false);

  // ** Cargar facturas desde la API al montar el componente**
  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const response = await getAllFactura();
        console.log("Facturas obtenidas:", response.data);

        // ** Obtener detalles de ordenTrabajo para cada factura**
        const facturasConOrdenTrabajo = await Promise.all(
          response.data.map(async (factura) => {
            if (factura.ordenTrabajo) {
              try {
                const ordenTrabajoResponse = await getOrdenTrabajoById(factura.ordenTrabajo);
                return {
                  ...factura,
                  codigoOrdenTrabajo: ordenTrabajoResponse.data.codigo || "Sin código",
                  servicio: ordenTrabajoResponse.data.servicio || "Sin servicio",
                };
              } catch (error) {
                console.error(`Error obteniendo ordenTrabajo para factura ${factura.id}`, error);
                return { ...factura, codigoOrdenTrabajo: "Error", servicio: "Error" };
              }
            }
            return { ...factura, codigoOrdenTrabajo: "N/A", servicio: "N/A" };
          })
        );

        // Formatear los datos para la tabla
        const formattedData = facturasConOrdenTrabajo.map((factura, index) => ({
          key: index.toString(),
          fechaExpedicion: factura.fechaExpedicion ? new Date(factura.fechaExpedicion).toLocaleString() : "Desconocida",
          codigoOrdenTrabajo: factura.codigoOrdenTrabajo,
          notas: factura.notas || "Sin notas",
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error al obtener facturas:", error);
        message.error("Error al cargar las facturas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, []);

  // ** Filtrar facturas por código de ordenTrabajo**
  const handleSearch = () => {
    const filteredData = data.filter((item) =>
      item.codigoOrdenTrabajo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setData(filteredData);
  };

  // ** Columnas de la tabla**
  const columns = [
    {
      title: "Fecha de Expedición",
      dataIndex: "fechaExpedicion",
      key: "fechaExpedicion",
    },
    {
      title: "Código Orden de Trabajo",
      dataIndex: "codigoOrdenTrabajo",
      key: "codigoOrdenTrabajo",
    },
    {
      title: "Notas",
      dataIndex: "notas",
      key: "notas",
    },
    {
      title: "Opciones",
      key: "opciones",
      render: (_, record) => (
        <Link to={`/detallesfactura/${record.key}`}>
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
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
        <Input
          placeholder="Buscar por código de orden de trabajo..."
          style={{ maxWidth: "300px" }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="primary" onClick={handleSearch}>
          Buscar
        </Button>
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
