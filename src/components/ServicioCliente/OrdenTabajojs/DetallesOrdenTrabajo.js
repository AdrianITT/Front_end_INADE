import React, { useEffect, useState } from "react";
import { Table, Button, Card, Dropdown, Menu, message, Modal } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone, DeleteOutlined } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./cssOrdenTrabajo/DetallesOrdenTrabajo.css"; // Asegúrate de importar el archivo CSS
import { getOrdenTrabajoById, deleteOrdenTrabajo } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { getClienteById } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getEmpresaById } from "../../../apis/ApisServicioCliente/EmpresaApi";
import { getServicioById } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getCotizacionById } from "../../../apis/ApisServicioCliente/CotizacionApi";
import { getReceptorById } from "../../../apis/ApisServicioCliente/ResectorApi";
import { getAllOrdenesTrabajoServicio } from "../../../apis/ApisServicioCliente/OrdenTabajoServiciosApi";
import { getMetodoById } from "../../../apis/ApisServicioCliente/MetodoApi";
import { Api_Host } from "../../../apis/api";
import { getEstadoById } from "../../../apis/ApisServicioCliente/EstadoApi";

const DetalleOrdenTrabajo = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Estados para almacenar cada parte de la información
  const [orderHeader, setOrderHeader] = useState(null); // Datos de la tabla "ordentrabajo"
  //const [receptorData, setReceptorData] = useState(null); // Datos del receptor (tabla "clientes")
  //const [companyData, setCompanyData] = useState(null); // Datos de la empresa (tabla "empresa")
  const [servicesData, setServicesData] = useState([]); // Datos de los servicios (tabla "servicio")
  const [cotizacionData, setCotizacionData] = useState([]); // Datos de la cotización
  const [clientData, setClientData] = useState(null); // Datos del cliente (que contiene el id de la empresa)
  const [recep, setRecep] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [estadoEmpresa, setEstadoEmpresa] = useState(null);
  const [estadoOrden, setEstadoOrden] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Orden de trabajo
        const responseHeader = await getOrdenTrabajoById(orderId);
        const header = responseHeader.data;
        setOrderHeader(header);
  
        // 2. Cotización
        const responseCotizacion = await getCotizacionById(header.cotizacion);
        const cotizacion = responseCotizacion.data;
        setCotizacionData(cotizacion);
  
        // 3. Cliente
        const responseClient = await getClienteById(cotizacion.cliente);
        const client = responseClient.data;
        setClientData(client);
  
        // 4. Empresa
        const responseEmpresa = await getEmpresaById(client.empresa);
        setEmpresa(responseEmpresa.data);
  
        // 5. Receptor
        const responseReceptor = await getReceptorById(header.receptor);
        setRecep(responseReceptor.data);
        
  
        // 6. Obtener la **tabla intermedia** "ordenTrabajoServicio" según el id de la orden:
        //const relationResponse = await getOrdenTrabajoServiciosByOrden(orderId);
        const relationResponseD = await getAllOrdenesTrabajoServicio();

        // 8. Obtener el estado de la orden de trabajo
        if (header?.estado) {
          const responseEstadoOrden = await getEstadoById(header.estado);
          setEstadoOrden(responseEstadoOrden.data.nombre);
        }

        //Verificar si la respuesta contiene datos válidos
        if (!relationResponseD || !Array.isArray(relationResponseD.data)) {
          console.error(" Error: La respuesta de la API no es un array:", relationResponseD);
          return;
        }

        // Filtrar los registros que coincidan con el ID de la orden de trabajo
        const dataRelati = relationResponseD.data.filter(orden => String(orden.ordenTrabajo) === String(orderId));

        // Si no hay coincidencias, mostrar un mensaje de advertencia
        if (dataRelati.length === 0) {
          console.warn("⚠ No se encontraron registros en 'ordenTrabajoServicio' con el ID:", orderId);
        }

        // Asignar a `relationData` y continuar con el procesamiento
        let relationData = dataRelati;
  
        // Asegurarse de que relationData sea un arreglo
        if (!Array.isArray(relationData)) {
          relationData = [relationData]; // Si no es un arreglo, convertirlo a uno
        }
  
        // 7. Para cada elemento en "relationData", obtenemos el servicio y combinamos datos:
        const combinedPromises = relationData.map(async (rel) => {
          // Obtén el servicio (tabla "servicio")
          const servResp = await getServicioById(rel.servicio);
          const servData = servResp.data;

          // (Opcional) Si requieres el método, puedes obtenerlo:
          const metodoResp = await getMetodoById(servData.metodos);
          const metodoData = metodoResp.data;

          // Unificamos la información en un solo objeto
          return {
            idServicio: rel.servicio, // Agregamos el id del servicio proveniente de ordenTrabajoServicio
            nombreServicio: servData.nombreServicio, // Datos de la tabla "servicio"
            precio: servData.precio,                  // Datos de la tabla "servicio"
            cantidad: rel.cantidad,                   // Datos de la tabla "ordenTrabajoServicio"
            notas: rel.descripcion,                   // Datos de la tabla "ordenTrabajoServicio"
            metodo: metodoData.codigo,                // Si deseas mostrar el método
          };
        });
  
        // 8. Ejecutar todas las promesas y asignar a servicesData
        const combinedData = await Promise.all(combinedPromises);
        setServicesData(combinedData);
  
      } catch (error) {
        console.error("Error al obtener la información:", error);
      }
    };
  
    fetchData();
  }, [orderId]);
  

  const columnasServicios = [
    {
      title: "Nombre del servicio",
      dataIndex: "nombreServicio",
      key: "servicio",
    },
    {
      title: "Método",
      dataIndex: "metodo",
      key: "metodo",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Notas",
      dataIndex: "notas",
      key: "notas",
    },

  ];
  const handleDownloadPDF = async () => {
    //setLoading(true); // Activar el estado de carga
  
    try {
      // Obtener el user_id desde el localStorage
      const user_id = localStorage.getItem("user_id");
  
      // Abrir el PDF en una nueva pestaña, incluyendo el user_id como parámetro
      window.open(`${Api_Host.defaults.baseURL}/ordentrabajo/${orderId}/pdf?user_id=${user_id}`);
  
      // Si la respuesta es exitosa, puedes procesarla
      message.success("PDF descargado correctamente");
      //setLoading(false); // Desactivar el estado de carga
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("Hubo un error al descargar el PDF");
      //setLoading(false); // Desactivar el estado de carga
    }
  };

    // Función para mostrar el modal de eliminación
    const showDeleteModal = () => {
      setIsDeleteModalVisible(true);
    };

      // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = async () => {
    try {
      await deleteOrdenTrabajo(orderId);
      message.success("Orden de trabajo eliminada exitosamente");
      setIsDeleteModalVisible(false);
      // Redirige a la lista de órdenes o a la página que desees
      navigate("/generar_orden");
    } catch (error) {
      console.error("Error al eliminar la orden de trabajo:", error);
      message.error("Hubo un error al eliminar la orden de trabajo");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<RightCircleTwoTone />}>
        <Link to={`/detalles_cotizaciones/${cotizacionData.id}`}>Ir a cotización</Link>
      </Menu.Item>

      <Menu.Item key="2" icon={<FileTextTwoTone />}>
        <Link to={`/CrearFactura/${orderId}`}>Detalles de Facturar</Link>
      </Menu.Item>

      <Menu.Item key="3" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF}>
        Ver PDF
      </Menu.Item>

      {/* Nueva opción para eliminar la orden de trabajo */}
      <Menu.Item key="4" icon={<DeleteOutlined style={{ color: 'red' }}/>} onClick={showDeleteModal}>
        Eliminar Orden de Trabajo
      </Menu.Item>
    </Menu>

  );

  return (
    <div className="container">
      <h1 className="page-title">Detalles de la Orden de Trabajo: {orderHeader?.codigo || orderId}</h1>
      <div className="button-container">
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Button type="primary" className="action-button">
            Acciones para orden de trabajo
          </Button>
        </Dropdown>
      </div>

      <Card className="info-card" title="Información del Cliente y Empresa" bordered={false}>
        {orderHeader && clientData && recep && empresa && (
          <>
            <p><strong>Cliente:</strong> {`${clientData.nombrePila} ${clientData.apPaterno} ${clientData.apMaterno}`}</p>
            <p><strong>Receptor:</strong> {`${recep.nombrePila} ${recep.apPaterno} ${recep.apMaterno}`}</p>
            <p><strong>Empresa:</strong> {empresa.nombre}</p>
            <p><strong>Dirección:</strong></p>
            <ul>
              <li><strong>Calle:</strong> {empresa.calle}</li>
              <li><strong>Número:</strong> {empresa.numero}</li>
              <li><strong>Colonia:</strong> {empresa.colonia}</li>
              <li><strong>Ciudad:</strong> {empresa.ciudad}</li>
              <li><strong>Estado:</strong> {empresa.estado}</li>
              <li><strong>Codigo Postal:</strong> {empresa.codigoPostal}</li> 
            </ul>
            <p><strong>Estado de la Orden:</strong> {estadoOrden || "Cargando..."}</p>
          </>
        )}
      </Card>
      <h2 className="concepts-title">Conceptos Asociados</h2>
      <Table
        className="services-table"
        dataSource={servicesData}
        columns={columnasServicios}
        bordered
        pagination={false}
        rowKey={(record) => record.idServicio}// O si tu record tiene id
      />

      {/* Modal de confirmación para eliminación */}
      <Modal
        title="Confirmar eliminación"
        visible={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar esta orden de trabajo?</p>
      </Modal>
    </div>
  );
};

export default DetalleOrdenTrabajo;
