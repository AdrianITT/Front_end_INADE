import React, { useState, useEffect,useMemo} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MailTwoTone, CheckCircleTwoTone, FilePdfTwoTone, FormOutlined, DeleteOutlined,EditTwoTone  } from "@ant-design/icons";
import { Card, Table, Row, Col, Typography, Spin, message, Menu,Dropdown,Button, Form, Checkbox, Input, Modal, Result, Popconfirm } from "antd";
import { getAllPrecotizacionCreate,updatePrecotizacion, deletePrecotizar} from "../../../apis/ApisServicioCliente/precotizacionApi";
import { Api_Host } from "../../../apis/api";
import {getAllDataPrecotizacion} from "../../../apis/ApisServicioCliente/precotizacionApi";

const { Title, Text } = Typography;

const PreCotizacionDetalles = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const [loading, setLoading] = useState(true);
  const [cotizacionInfo, setCotizacionInfo] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(null);
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  //const [serviciosPreCotizacion, setServiciosPreCotizacion] = useState([]);
  const esUSD = cotizacionInfo?.tipoMoneda?.id === 2; // Suponiendo que el ID 2 corresponde a USD
  const factorConversion = esUSD ? tipoCambioDolar : 1;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success"); // "success" o "error"
  const [estadoNombre, setEstadoNombre] = useState("Cargando...");
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [numeros,setaNumeros]=useState([]);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllDataPrecotizacion(id);
        const data = response.data;
        console.log("Pre-Cotización Detalles:", data);   
        setaNumeros(data.numero);
        setCotizacionInfo(data); // contiene empresa, cliente, moneda, iva, etc.
        setServicios(data.precotizacionservicios); // contiene los servicios listos
        setIvaPorcentaje(parseFloat(data.iva.porcentaje) || 0); // Ej. "0.00" -> 0
  
      } catch (error) {
        console.error("Error al obtener datos de la pre-cotización:", error);
        message.error("Error al cargar los datos completos.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

  

  const subtotal = servicios.reduce((acc, servicio) => acc + servicio.precio * servicio.cantidad, 0);
  const descuento = subtotal * (cotizacionInfo?.descuento / 100 || 0);
  const subtotalConDescuento = subtotal - descuento;
  const iva = subtotalConDescuento * (ivaPorcentaje || 0);
  const total = subtotalConDescuento + iva;
  
  // Aplicar conversión a la moneda seleccionada
  const subtotalConvertido = subtotal / factorConversion;
  const descuentoConvertido = descuento / factorConversion;
  const subtotalConDescuentoConvertido = subtotalConDescuento / factorConversion;
  const ivaConvertido = iva / factorConversion;
  const totalConvertido = total / factorConversion;

  const columnsServicios = [
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    { title: "Precio", dataIndex: "precio", key: "precio" },
    {
      title: "Subtotal",
      render: (_, record) => `${(record.precio * record.cantidad).toFixed(2)}`
    },
  ];
  
  
  // Obtener el ID de la organización una sola vez
     const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  //DESCARGA DEL PDF
    const handleDownloadPDF = async () => {
      setLoading(true); // Activar el estado de carga
    
      try {
        // Obtener el user_id desde el localStorage
        const user_id = localStorage.getItem("user_id");

        
    
        // Abrir el PDF en una nueva pestaña, incluyendo el user_id como parámetro
        window.open(`${Api_Host.defaults.baseURL}/precotizacion/${id}/pdf/?user_id=${user_id}&organizacion_id=${organizationId}`);
    
        // Si la respuesta es exitosa, puedes procesarla
        message.success("PDF descargado correctamente");
      } catch (error) {
        console.error("Error al descargar el PDF:", error);
        message.error("Hubo un error al descargar el PDF");
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    };

    const actualizarEstado = async () => {
      if (!cotizacionInfo) {
        getAllPrecotizacionCreate(id);
        return;
      }
      
      setIsConfirmModalVisible(true); // 👉 Mostrar modal
    };
    
    const handleConfirmChange = async () => {
      try {
        console.log("Actualizando solo el estado...");
        getAllPrecotizacionCreate(id);
        const response = await updatePrecotizacion(id, {
          estado: 7, // Solo se envía el campo necesario

        });
    
        setCotizacionInfo((prev) => ({
          ...prev,
          estado: 7,

        }));
    
        setIsConfirmModalVisible(false);
        setIsSuccessModalVisible(true);
        setTimeout(() => {
          setIsSuccessModalVisible(false);
          navigate("/cotizar");
        }, 1000);
        message.success("Estado actualizado correctamente.");
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        message.error("No se pudo actualizar el estado.");
      }
    };
    

   const showEmailModal = () => {
     setIsModalVisible(true);
   };

   const handleCancel = () => {
     setIsModalVisible(false);
   };
     const [extraEmails, setExtraEmails] = useState("");
     const handleSendEmail = async () => {
      setLoading(true);
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          setResultStatus("error");
          setResultMessage("No se encontró el ID del usuario.");
          setIsResultModalVisible(true);
          setLoading(false);
          return;
        }
    
        // Validar que los correos ingresados sean correctos
        const emailList = extraEmails.split(",").map(email => email.trim()).filter(email => email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
        if (invalidEmails.length > 0) {
          setResultStatus("error");
          setResultMessage(`Correos inválidos: ${invalidEmails.join(", ")}`);
          setIsResultModalVisible(true);
          setLoading(false);
          return;
        }
    
        const emailQuery = emailList.length > 0 ? `&emails=${encodeURIComponent(emailList.join(","))}` : "";
    
        // Cambia la URL para usar la nueva ruta de precotización
        const response = await fetch(`${Api_Host.defaults.baseURL}/precotizacion/${id}/pdf/enviar?user_id=${user_id}&organizacion_id=${organizationId}${emailQuery}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
    
        if (response.ok) {
          const result = await response.text();
          setResultStatus("success");
          setResultMessage(result || "Correo enviado exitosamente.");
        } else {
          setResultStatus("error");
          setResultMessage("Error al enviar el correo.");
        }
      } catch (error) {
        console.error("Error al enviar el correo:", error);
        setResultStatus("error");
        setResultMessage("Hubo un error al enviar el correo.");
      } finally {
        setIsResultModalVisible(true);
        setLoading(false);
      }
    };

    const confirm = async(e) => {
      try{
        await deletePrecotizar(id);
        navigate("/preCotizacion");
      }catch(error){
        console.error("Error al Eliminar precotizacion:", error);
      }
      //console.log(e);
      message.success('Click on Yes');
    };

    const cancel = (e) => {
      //console.log(e);
      message.error('Click on No');
    };


     const handDuoModal=()=>{    
          setIsModalVisible(false);
          setIsResultModalVisible(false)
        }
        //Opciones del menu de pre-cotizacion
    const menu = (
      <Menu>
        <Menu.Item key="1" icon={<MailTwoTone />} onClick={showEmailModal}>
          Enviar por correo
        </Menu.Item>
    
        {/* ✅ Solo se muestra si el estado es 8 */}
        {cotizacionInfo?.estado?.id === 8 ? (
          <>
          <Menu.Item key="4" icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} onClick={actualizarEstado}>
            Actualizar estado
          </Menu.Item>
          <Menu.Item key="8" icon={<EditTwoTone /> }>
          <Link to={`/editarPreCotizacion/${id}`}>
          Editar Pre-cotización</Link>
          </Menu.Item>
          </>
        ):(<Menu.Item key="4" icon={<FormOutlined  twoToneColor="#52c41a" />} >
          <Link to="/cotizar">Ir a Cotizacion</Link>
        </Menu.Item>)}
    
        <Menu.Item key="5" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF} loading={loading} >
          Ver PDF
        </Menu.Item>
        <Menu.Item key="6" icon={<DeleteOutlined style={{ color: 'red' }}/>}  >
          
        
        <Popconfirm title="Eliminar PreCotizacion" description="¿Estas seguro de eliminar la pre-cotizacion?"
          onConfirm={confirm} onCancel={cancel}
          okText="Si" cancelText="No"
        >
          Eliminar PreCotizacion
        </Popconfirm>
        </Menu.Item>
      </Menu>
    );
        

  return (
    <Spin spinning={loading}>
      <div className="cotizacion-detalles-container">
        <Title level={2}>Detalles de la Pre-Cotización #{numeros}</Title>
        {cotizacionInfo && (
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Información de la Pre-Cotización">
                <p><Text strong>Empresa:</Text> {cotizacionInfo.empresa?.nombre}</p>
                <p><Text strong>Cliente:</Text> {cotizacionInfo.cliente?.nombreCompleto}</p>
                <p><Text strong>Correo:</Text> {cotizacionInfo.cliente?.correo}</p>
                <p><Text strong>Denominación:</Text> {cotizacionInfo.tipoMoneda?.descripcion}-{cotizacionInfo.empresa?.denominacion}</p>
                <p><Text strong>Fecha de Solicitud:</Text> {cotizacionInfo.fechaSolicitud}</p>
                <p><Text strong>IVA:</Text> {cotizacionInfo.iva?.porcentaje || "0"}%</p>
                <p><Text strong>Estado:</Text> {cotizacionInfo.estado.nombre}</p>
              </Card>
            </Col>
            {/* ✅ Nueva Card: Resumen Financiero */}
            <Col span={12}>
            <Card
                  title="Resumen Financiero"
                  bordered
                  extra={
                    <Dropdown overlay={menu}>
                      <Button type="primary" style={{ marginBottom: "16px" }}>
                        Acciones para cotización
                      </Button>
                    </Dropdown>
                  }
                >               
               
               <p><Text strong>Subtotal:</Text> {cotizacionInfo.valores.subtotal} {esUSD ? "USD" : "MXN"}</p>
               <p><Text strong>Descuento ({cotizacionInfo.valores.descuento || 0}%):</Text> {descuentoConvertido.toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
               <p><Text strong>Subtotal con Descuento:</Text> {cotizacionInfo.valores.subtotalDescuento} {esUSD ? "USD" : "MXN"}</p>
               <p><Text strong>IVA ({cotizacionInfo.valores.iva}%):</Text> {cotizacionInfo.valores.ivaValor} {esUSD ? "USD" : "MXN"}</p>
               <p><Text strong>Total:</Text> {cotizacionInfo.valores.importe} {esUSD ? "USD" : "MXN"}</p>
               </Card>
               </Col>
          </Row>
        )}

        <Title level={3} style={{ marginTop: 20 }}>Servicios Relacionados</Title>
        <Table
          dataSource={servicios}
          columns={columnsServicios}
          rowKey="precotizacionservicioId"
          bordered
          pagination={false}
        />
      </div>
      <Modal
          title="Enviar Cotización"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>Cerrar</Button>,
            <Button key="send" type="primary" onClick={handleSendEmail}>Enviar</Button>,
          ]}
        >
          <h4>Selecciona los correos a los que deseas enviar la cotización:</h4>
          <Form layout="vertical">
            <Checkbox defaultChecked>{cotizacionInfo?.correo || "N/A"}</Checkbox>
            <Form.Item label="Correos adicionales (separados por coma):">
              <Input 
                placeholder="ejemplo@correo.com, otro@correo.com"
                value={extraEmails}
                onChange={(e) => setExtraEmails(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para mostrar el resultado del envío*/}
        <Modal
        title={resultStatus === "success" ? "Éxito" : "Error"}
        open={isResultModalVisible}
        onCancel={handDuoModal}
        footer={[
            <Button key="close" onClick={handDuoModal}>
                Cerrar
            </Button>
                ]}
                  >
            <Result
            title={<p style={{ color: resultStatus === "success" ? "green" : "red" }}>{resultMessage}</p>}
            />           
      </Modal>

      {/* Modal de confirmación para actualizar el estado */}
      <Modal
        title="Confirmar actualización"
        open={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsConfirmModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmChange}>
            Sí, actualizar estado
          </Button>,
        ]}
      >
        <p>¿Estás seguro de que deseas actualizar el estado de la cotización?</p>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        title="Estado Actualizado"
        open={isSuccessModalVisible}
        footer={null}
        closable={false} // Evita que lo cierren antes de la redirección
      >
        <Result
          status="success"
          title="¡Estado actualizado con éxito!"
          subTitle="Serás redirigido a la página de cotizaciones en breve..."
        />
      </Modal>
    </Spin>
  );
};

export default PreCotizacionDetalles;
