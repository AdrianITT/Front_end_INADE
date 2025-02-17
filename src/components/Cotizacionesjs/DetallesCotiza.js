import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Input, Tabs, Card, Table, Row, Col, Typography, Button, Menu, Dropdown, Checkbox, Form, Alert, Modal, message, Spin, Select,Result } from "antd";
import { MailTwoTone, CopyTwoTone, EditTwoTone, CheckCircleTwoTone, FilePdfTwoTone } from "@ant-design/icons";
import { getAllCotizacion, updateCotizacion } from "../../apis/CotizacionApi";
import { getAllCliente } from "../../apis/ClienteApi";
import { getAllTipoMoneda } from "../../apis/Moneda";
import { getAllEmpresas } from "../../apis/EmpresaApi";
import { getAllServicio } from "../../apis/ServiciosApi";
import { getAllIva } from "../../apis/ivaApi";
import { getAllCotizacionServicio } from "../../apis/CotizacionServicioApi";
import { Api_Host } from "../../apis/api";
import { getInfoSistema } from "../../apis/InfoSistemaApi";

const { Title, Text } = Typography;

const columnsServicios = [
  { title: "Servicio", dataIndex: "nombreServicio", key: "nombreServicio" },
  { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
  { title: "Precio Unitario", dataIndex: "precio", key: "precio" },
  { title: "Subtotal", dataIndex: "subtotal", key: "subtotal" },
];

const CotizacionDetalles = () => {
  const { id } = useParams(); // Obtener el id desde la URL
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cotizacionInfo, setCotizacionInfo] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoMoneda, setTipoMoneda] = useState({});
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [iva, setIva] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tipoMonedaOptions, setTipoMonedaOptions] = useState([]);
  const [ivaOptions, setIvaOptions] = useState([]);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success"); // "success" o "error"

  useEffect(() => {
    const fetchTipoMoneda = async () => {
      try {
        const response = await getAllTipoMoneda();
        setTipoMonedaOptions(response.data);
      } catch (error) {
        console.error("Error al obtener los tipos de moneda", error);
      }
    };
    fetchTipoMoneda();
  }, []);

  useEffect(() => {
    const fetchTipoCambio = async () => {
      try {
        const response = await getInfoSistema();
        const tipoCambio = parseFloat(response.data[0].tipoCambioDolar);
        setTipoCambioDolar(tipoCambio);
      } catch (error) {
        console.error("Error al obtener el tipo de cambio del dólar", error);
      }
    };
    fetchTipoCambio();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Activar el estado de carga
      try {
        const [cotizacionesData, clientesData, monedasData, empresasData, ivaData, serviciosData, cotizacionServicioData] = await Promise.all([
          getAllCotizacion(),
          getAllCliente(),
          getAllTipoMoneda(),
          getAllEmpresas(),
          getAllIva(),
          getAllServicio(),
          getAllCotizacionServicio(),
        ]);

        const cotizacionData = cotizacionesData.data.find(cot => cot.id === parseInt(id));
        if (cotizacionData) {
          const cliente = clientesData.data.find(cliente => cliente.id === cotizacionData.cliente);
          const empresa = empresasData.data.find(empresa => empresa.id === cliente?.empresa);
          const moneda = monedasData.data.find(moneda => moneda.id === cotizacionData.tipoMoneda);
          const ivaR = ivaData.data.find(ivaItem => ivaItem.id === cotizacionData.iva);

          const cotizacionConDetalles = {
            ...cotizacionData,
            clienteNombre: `${cliente?.nombrePila} ${cliente?.apPaterno} ${cliente?.apMaterno}`,
            empresaNombre: empresa?.nombre,
            monedaNombre: moneda?.codigo,
            direccion: `${empresa?.calle} ${empresa?.numero} ${empresa?.colonia} ${empresa?.ciudad} ${empresa?.estado} ${empresa?.codigoPostal}`,
            tasaIVA: ivaR?.porcentaje,
            fechaSolicitud: cotizacionData?.fechaSolicitud,
            fechaCaducidad: cotizacionData?.fechaCaducidad,
            precio: cotizacionData.precio,
            correo: cliente.correo,
          };

          setCotizacionInfo(cotizacionConDetalles);
          setTipoMoneda(moneda);
          setIva(ivaR);
          setIvaOptions(ivaData.data);


          if (cotizacionData && cotizacionData.servicios && Array.isArray(cotizacionData.servicios)) {
            const serviciosRelacionados = cotizacionData.servicios;
            const serviciosFiltrados = serviciosData.data.filter(servicio =>
              serviciosRelacionados.includes(servicio.id)
            );

            const serviciosConCantidad = serviciosFiltrados.map(servicio => {
              const cotizacionServicio = cotizacionServicioData.data.find(cotServ => cotServ.servicio === servicio.id && cotServ.cotizacion === cotizacionData.id);
              return {
                ...servicio,
                cantidad: cotizacionServicio ? cotizacionServicio.cantidad : 0,
                precio: cotizacionServicio ? cotizacionServicio.precio : 0,  // ✅ Ahora el precio se extrae correctamente
                subtotal: cotizacionServicio ? cotizacionServicio.cantidad * cotizacionServicio.precio : 0,
                descripcion: cotizacionServicio ? cotizacionServicio.descripcion : "Sin descripción",
              };
            });

            setServicios(serviciosConCantidad);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos", error);
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    };
  
    fetchData();
  }, [id]);

  //DESCARGA DEL PDF
  const handleDownloadPDF = async () => {
    setLoading(true); // Activar el estado de carga
  
    try {
      // Obtener el user_id desde el localStorage
      const user_id = localStorage.getItem("user_id");
  
      // Abrir el PDF en una nueva pestaña, incluyendo el user_id como parámetro
      window.open(`${Api_Host.defaults.baseURL}/cotizacion/${id}/pdf?user_id=${user_id}`);
  
      // Si la respuesta es exitosa, puedes procesarla
      message.success("PDF descargado correctamente");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("Hubo un error al descargar el PDF");
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  const showEditModal = () => {
    form.setFieldsValue({
      fechaSolicitud: cotizacionInfo?.fechaSolicitud,
      fechaCaducidad: cotizacionInfo?.fechaCaducidad,
      iva: cotizacionInfo?.iva,
      tipoMoneda: cotizacionInfo?.tipoMoneda,
    });
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedCotizacion = {
        ...cotizacionInfo,
        fechaSolicitud: values.fechaSolicitud,
        fechaCaducidad: values.fechaCaducidad,
        descuento: values.descuento,
        iva: values.iva,
        tipoMoneda: values.tipoMoneda,
      };
  
      const response = await updateCotizacion(cotizacionInfo.id, updatedCotizacion);
      setCotizacionInfo(response.data);
      message.success("Cotización actualizada con éxito");
      setIsEditModalVisible(false);
  
      // Recargar la página
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar la cotización", error);
      message.error("Error al actualizar la cotización");
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };


  const mostrarCard = () => {
    setIsVisible(false); // Cambia el estado para hacerlo visible
  };

  const showEmailModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handDuoModal=()=>{    
    setIsModalVisible(false);
    setIsResultModalVisible(false)
  }

  const [extraEmails, setExtraEmails] = useState("");


  //ENVIAR CORREO
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
  
          const response = await fetch(`${Api_Host.defaults.baseURL}/cotizacion/${id}/pdf/enviar?user_id=${user_id}${emailQuery}`, {
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
  


  const updateEstadoCotizacion=async (nuevoEstado)=>{
    try{
      const cotizacionData = {
        ...cotizacionInfo,  // Mantén el resto de los datos intactos
        estado: nuevoEstado,  // Actualiza solo el estado
      };
      const response = await updateCotizacion(cotizacionInfo.id, cotizacionData); // Enviar la actualización al backend
      setCotizacionInfo(response.data);  // Actualiza el estado en el frontend

    }catch(error){
      console.error("Error al actualizar el estado de la cotización", error);
      message.error("Error al actualizar el estado de la cotización");
    }
  }

  

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<MailTwoTone />} onClick={showEmailModal}>
        Enviar por correo
      </Menu.Item>
      <Menu.Item key="2" icon={<CopyTwoTone />}>
        Duplicar
      </Menu.Item>
      <Menu.Item key="3" icon={<EditTwoTone />} onClick={showEditModal}>
        Editar
      </Menu.Item>
      <Menu.Item key="4" icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} onClick={() => updateEstadoCotizacion(2)}>
        Actualizar estado
      </Menu.Item>
      <Menu.Item key="5" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF} loading={loading}>
        Ver PDF
      </Menu.Item>
    </Menu>
  );
  
  const Csubtotal = servicios.reduce((acc, servicio) => acc + (servicio.subtotal || 0), 0);
  const Cdescuento = Csubtotal * (cotizacionInfo?.descuento / 100 || 0);
  const Csubtotaldescuento = Csubtotal - Cdescuento;
  const Civa = Csubtotaldescuento * (cotizacionInfo?.tasaIVA || 0);
  const Ctotal = Csubtotaldescuento + Civa;

  const esUSD = tipoMoneda?.id === 2;
  const factorConversion = esUSD ? tipoCambioDolar : 1;

  return (
    <Spin spinning={loading}>
      <div className="cotizacion-detalles-container">
        <div>
          <h1>Detalles de la Cotización {id} Proyecto</h1>
        </div>
        
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Detalles" key="1">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Información de la Cotización" bordered>
                  <p><Text strong>Atención:</Text> {cotizacionInfo?.clienteNombre || "N/A"}</p>
                  <p><Text strong>Empresa:</Text> {cotizacionInfo?.empresaNombre || "N/A"}</p>
                  <p><Text strong>Dirección:</Text> {cotizacionInfo?.direccion || "N/A"}</p>
                  <p><Text strong>Fecha solicitada:</Text> {cotizacionInfo?.fechaSolicitud || "N/A"}</p>
                  <p><Text strong>Fecha de caducidad:</Text> {cotizacionInfo?.fechaCaducidad || "N/A"}</p>
                  <p><Text strong>Denominación:</Text> {cotizacionInfo?.denominacion || "N/A"}</p>
                  <p><Text strong>Tasa IVA:</Text> {cotizacionInfo?.tasaIVA * 100 || 0}%</p>
                </Card>
              </Col>
              <Col span={8}>
                {isVisible && (
                  <Card
                    title="Ordenes"
                    bordered
                    extra={
                      <Button
                        type="primary"
                        onClick={mostrarCard}
                        style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
                      >
                        Crear Orden de Trabajo
                      </Button>
                    }
                  >
                  </Card>
                )}

                {cotizacionInfo?.estado > 1 &&(
                  <Card
                    title="Ordenes"
                    bordered
                    extra={
                      <Link to={`/GenerarOrdenTrabajo/${cotizacionInfo.id}`}><Button
                        type="primary"
                        onClick={mostrarCard}
                        style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
                      >
                        Nueva Orden de Trabajo
                      </Button></Link>
                    }
                  >
                  </Card>
                )}

                <Card
                  title="Cuenta"
                  bordered
                  extra={
                    <Dropdown overlay={menu}>
                      <Button type="primary" style={{ marginBottom: "16px" }}>
                        Acciones para cotización
                      </Button>
                    </Dropdown>
                  }
                >
                  <p><Text strong>Subtotal:</Text> {(Csubtotal / factorConversion).toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
                  <p><Text strong>Descuento:</Text> {(Cdescuento / factorConversion).toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
                  <p><Text strong>Subtotal con descuento:</Text> {(Csubtotaldescuento / factorConversion).toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
                  <p><Text strong>IVA ({cotizacionInfo?.tasaIVA * 100 || 0}%):</Text> {(Civa / factorConversion).toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
                  <p><Text strong>Importe:</Text> {(Ctotal / factorConversion).toFixed(2)} {esUSD ? "USD" : "MXN"}</p>
                  {cotizacionInfo?.estado > 1 ? (
                    <div>
                      <Text strong>Estado: Aprobado</Text>
                      <p>Este estado muestra detalles específicos para cotizaciones aprobadas.</p>
                    </div>
                  ) : (
                    <div>
                      <Text strong>Estado: Pendiente</Text>
                      <p>Esta cotización está en espera de aprobación.</p>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            <Table
              dataSource={servicios.map(servicio => ({
                ...servicio,
                precio: (servicio.precio / factorConversion).toFixed(2),
                subtotal: (servicio.subtotal / factorConversion).toFixed(2),
              }))}
              columns={columnsServicios}
              bordered
              pagination={false}
              style={{ marginTop: "16px" }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Documentos" key="2">
            <Title level={4}>Documentos relacionados</Title>
            <Text>No hay documentos disponibles.</Text>
          </Tabs.TabPane>
        </Tabs>
        {/* Modal para enviar cotización por correo */}
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

        <Modal
        title="Editar Cotización"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Fecha de Solicitud" name="fechaSolicitud" rules={[{ required: true, message: "Por favor ingrese la fecha de solicitud" }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Fecha de Caducidad" name="fechaCaducidad" rules={[{ required: true, message: "Por favor ingrese la fecha de caducidad" }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Descuento" name="descuento" rules={[{ required: true, message: "Por favor ingrese el descuento" }]}>
            <Input type="number" min={0} max={100} />
          </Form.Item>
          <Form.Item label="IVA" name="iva" rules={[{ required: true, message: "Por favor seleccione el IVA" }]}>
            <Select>
              {ivaOptions.map(iva => (
                <Select.Option key={iva.id} value={iva.id}>
                  {iva.porcentaje * 100}% {/* Muestra el porcentaje como un número entero */}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Tipo de Moneda" name="tipoMoneda" rules={[{ required: true, message: "Por favor seleccione el tipo de moneda" }]}>
            <Select>
              {tipoMonedaOptions.map(moneda => (
                <Select.Option key={moneda.id} value={moneda.id}>
                  {moneda.codigo} - {moneda.descripcion}
                </Select.Option>
              ))}
            </Select>
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
      </div>
    </Spin>
  );
};

export default CotizacionDetalles;