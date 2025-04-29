import React, { useEffect, useState } from "react";
import { Table, Button, Card, Dropdown, Menu, message, Modal } from "antd";
import { RightCircleTwoTone, FileTextTwoTone, FilePdfTwoTone, MailTwoTone, DeleteOutlined, EditTwoTone } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./cssOrdenTrabajo/DetallesOrdenTrabajo.css"; // Asegúrate de importar el archivo CSS
import { getOrdenTrabajoById, deleteOrdenTrabajo, getDetalleOrdenTrabajoDataById } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { Api_Host } from "../../../apis/api";

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
  const [IdCotizacion, setIdCotizacion] = useState([]); // Datos de los servicios (tabla "servicio")


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llamada al nuevo endpoint
        const detailResponse = await getDetalleOrdenTrabajoDataById(orderId);
        const data = detailResponse.data;
        console.log("data: ", data);
        const Ot= await getOrdenTrabajoById(orderId);
        
        setClientData(data.cliente);
        setEmpresa(data.empresa);
        setRecep(data.receptor);
        setEstadoOrden(data.estado);
        
        // Si en la respuesta tienes algo como data.orden con info adicional (código, etc.)
        setOrderHeader(data.orden);
        setIdCotizacion(data.cotizacion);
        // Si la respuesta ya incluye los servicios con todo lo que necesitas:
        //  (cantidad, notas, nombreServicio, etc.)
        // simplemente los asignas a tu tabla
        //console.log("data.servicios:", data.servicios);
        setServicesData(data.servicios);

        // Si necesitas un "método" adicional, tendrías que mapear
        // y hacer llamadas a getMetodoById(...) como hacías antes.
      } catch (error) {
        console.error("Error al obtener el detalle de la orden:", error);
        const status = error.response?.status;
        if (status === 403 || status === 404|| status === 500) {
          return navigate("/no-autorizado", { replace: true });
        }
      }
    };
  
    fetchData();
  }, [orderId]);
  

  const columnasServicios = [
    {
      title: "Nombre del servicio",
      key: "servicio",
      render: (text, record) => record.servicio.nombre,
    },
    {
      title: "Método",
      key: "metodo",
      render: (text, record) => record.servicio.metodo.codigo,
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Notas",
      dataIndex: "descripcion",
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
  /*<Menu.Item key="2" icon={<FileTextTwoTone />}>
        <Link to={`/CrearFactura/${orderId}`}>Detalles de Facturar</Link>
      </Menu.Item> */
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<RightCircleTwoTone />}>
        <Link to={`/detalles_cotizaciones/${IdCotizacion.id}`}>Ir a cotización</Link>
      </Menu.Item>

      
      <Menu.Item key="3" icon={<EditTwoTone />} >
      <Link to={`/editarOrdenTrabajo/${orderId}`}>Editar OT</Link>
      </Menu.Item>

      <Menu.Item key="4" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF}>
        Ver PDF
      </Menu.Item>

      {/* Nueva opción para eliminar la orden de trabajo */}
      <Menu.Item key="5" icon={<DeleteOutlined style={{ color: 'red' }}/>} onClick={showDeleteModal}>
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
            <p><strong>Cliente:</strong> {clientData.nombreCompleto}</p>
            <p><strong>Receptor:</strong> {recep.nombreCompleto}</p>
            <p><strong>Empresa:</strong> {empresa.nombre}</p>

            <p><strong>Dirección del Cliente:</strong></p>
            <ul>
              <li><strong>Calle:</strong> {clientData.direccion?.calle}</li>
              <li><strong>Número:</strong> {clientData.direccion?.numero}</li>
              <li><strong>Colonia:</strong> {clientData.direccion?.colonia}</li>
              <li><strong>Ciudad:</strong> {clientData.direccion?.ciudad}</li>
              <li><strong>Estado:</strong> {clientData.direccion?.estado}</li>
              <li><strong>Código Postal:</strong> {clientData.direccion?.codigoPostal}</li>
            </ul>

            <p><strong>Dirección de la Empresa:</strong></p>
            <ul>
              <li><strong>Calle:</strong> {empresa.direccion?.calle}</li>
              <li><strong>Número:</strong> {empresa.direccion?.numero}</li>
              <li><strong>Colonia:</strong> {empresa.direccion?.colonia}</li>
              <li><strong>Ciudad:</strong> {empresa.direccion?.ciudad}</li>
              <li><strong>Estado:</strong> {empresa.direccion?.estado}</li>
              <li><strong>Código Postal:</strong> {empresa.direccion?.codigoPostal}</li>
            </ul>

            <p><strong>Estado de la Orden:</strong> {estadoOrden.nombre || "Cargando..."}</p>
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
        rowKey={(record) => record.uid}// O si tu record tiene id
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
