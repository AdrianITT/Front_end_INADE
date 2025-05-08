import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Table, Tabs, Dropdown, Menu, Modal, Select, Input, Form, DatePicker, Flex, Alert, Checkbox,message,Descriptions, Result, Spin  } from "antd";
import { useParams, Link ,useNavigate } from "react-router-dom";
import{FileTextTwoTone,MailTwoTone,FilePdfTwoTone,CloseCircleTwoTone, FileAddTwoTone} from "@ant-design/icons";
import { createPDFfactura, deleteFactura, getAllDataFactura } from "../../../apis/ApisServicioCliente/FacturaApi";
import { getEmpresaById } from "../../../apis/ApisServicioCliente/EmpresaApi";
import { Api_Host } from "../../../apis/api";
import PaymentCards from "../Facturacionjs/FacturaPagos"
import { getAllFacturaPagos } from "../../../apis/ApisServicioCliente/FacturaPagosApi";
//import axios from "axios";
import {  getAllfacturafacturama } from "../../../apis/ApisServicioCliente/FacturaFacturamaApi";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import ComprobantePago from "./ModalComprobantePago";
import "./estiloDetalleFactura.css";
//import MenuItem from "antd/es/menu/MenuItem";


const { Option } = Select;

const DetallesFactura = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [factura, setFactura] = useState([]);
  const [visibleCancelModal, setVisibleCancelModal] = useState(false);
  const [visiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isModalVisibleCorreo, setIsModalVisibleCorreo] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [moneda, setMoneda] = useState({ codigo: "", descripcion: "" });
  const [form] = Form.useForm();
  const [cliente, setCliente] = useState({});
  const [empresa, setEmpresa] = useState({}); // Estado para almacenar los datos de la empresa
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [porcentajeIVA, setPorcentajeIVA] = useState(0);
  const [importeTotal, setImporteTotal] = useState(0);
  const [facturaExiste, setFacturaExiste] = useState(null);
  const [extraEmails, setExtraEmails] = useState("");
  const [tipoCambioDolar, setTipoCambioDolar] = useState(0);
  const [ordenCodigo, setOrdenCodigo] = useState("");
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success"); // Puede ser "success" o "error"
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaPagos, setFacturaPagos] = useState([]);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // Texto dinámico que aparece dentro del Modal de éxito
  const [modalText, setModalText] = useState(
    "La factura ha sido cancelada. Serás redirigido al listado de facturas."
  );
  

  const esUSD = moneda.codigo === "USD";
  const factorConversion = esUSD ? tipoCambioDolar : 1;

  const columnsConceptos = [
    {
      title: "Servicio",
      dataIndex: "servicio",  // Debe coincidir con la clave del objeto en `setServicios`
      key: "servicio",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Precio Unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      render: (valorEnMXN) => {
        // Convertimos al vuelo si es USD
        const convertido = (valorEnMXN).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (valorEnMXN) => {
        // Convertimos al vuelo si es USD
        const convertido = (valorEnMXN).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
  ];

  const refreshPagos = async () => {
    try {
      const response = await getAllFacturaPagos(id);
      if (response.data && response.data.pagos && response.data.pagos.length > 0) {
        const ultimoPago = response.data.pagos[response.data.pagos.length - 1];
        setFacturaPagos(ultimoPago);
        //console.log("Último pago actualizado:", ultimoPago);
      } else {
        setFacturaPagos(null); // O lo que corresponda si no hay pagos
        //console.log("No hay pagos registrados.");
      }
    } catch (error) {
      console.error("Error al refrescar los pagos:", error);
    }
  };
  
  useEffect(() => {
    refreshPagos();
  }, [id]);
  const hasPagos = facturaPagos !== null;
  

  

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


    

    const verificarFacturaFacturama = async () => {
      try {
        const response = await getAllfacturafacturama();

    //console.log("📄 Datos recibidos:", response.data);
    //console.log("🔍 ID a buscar:", id);

    if (!id) {
      console.warn("⚠ El ID es inválido.");
      return;
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("⚠ No hay datos en la respuesta.");
      return;
    }

    const facturasFiltradas = response.data.filter(factura => factura.factura === parseInt(id, 10));

    //console.log("📝 Facturas filtradas:", facturasFiltradas);

    setFacturaExiste(facturasFiltradas.length > 0);
      } catch (error) {
        setFacturaExiste(false); // Si hay error, asumir que no existe
        console.warn("⚠ La factura no existe en FacturaFacturama.");
      }
    };


    const fetchEmpresaInfo = async (empresaId) => {
      try {
        const response = await getEmpresaById(empresaId); // Obtener los datos de la empresa
        if (response.data) {
          setEmpresa(response.data); // Guardar los datos de la empresa en el estado
          //console.log("Empresa",response.data);
        }
      } catch (error) {
        console.error("Error al obtener la información de la empresa:", error);
      }
    }

    // Obtener los servicios relacionados con la orden de trabajo
    
    
    verificarFacturaFacturama()

    fetchTipoCambio();
  }, [id]);

  useEffect(() => {
    const fetchFacturaCompleta = async () => {
      try {
        setLoading(true);
        const response = await getAllDataFactura(id);
        const data = response.data;
        //console.log("Datos de la factura completa:", data);
        // Seteamos directamente los datos
        setFactura(data); // puedes eliminar este estado si solo usas los campos individuales
        setMoneda({ codigo: data.monedaCodigo.includes("USD") ? "USD" : "MXN", descripcion: data.monedaCodigo});
        setCliente({
          nombrePila: data.contacto.split(" ")[0],
          correo: data.correo
        });
        setEmpresa({ nombre: data.empresa, rfc: data.rfcEmpresa });
        setServicios(
          data.servicios.map(serv => ({
            key: serv.servicioId,
            servicio: serv.servicio.nombre,
            cantidad: serv.cantidad,
            precioUnitario: parseFloat(serv.precioUnitario),
            total: parseFloat(serv.subtotal) ,
          }))
        );
  
        setSubtotal(data.valores);
        setDescuento(parseFloat(data.valores.descuento));
        setPorcentajeIVA(parseFloat(data.valores.iva));
        setImporteTotal(parseFloat(data.valores.importe));
      } catch (error) {
        console.error("Error al obtener la factura completa:", error);
        message.error("No se pudo cargar la información de la factura.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchFacturaCompleta();
  }, [id]);
  


  



  const showModalCorreo = () => {
    setIsModalVisibleCorreo(true);
  };


  const handleOkPayment = () => {
    form.validateFields()
      .then((values) => {
        //console.log("Valores del comprobante de pago:", values);
        setVisiblePaymentModal(false);
      })
      .catch((error) => {
        console.error("Error en el formulario:", error);
      });
  };



  const handleCrearFactura = async () => {
    setLoading(true);
    try {
      //console.log(id);
      const response = await createPDFfactura(id);
      //console.log("📄 Respuesta de la API:", response);
  
      // Verificar si la respuesta tiene la propiedad `success`
      if (response && response.success) {
        setFacturaExiste(true);
        //console.log("✅ Factura creada exitosamente en FacturaFacturama.", response);
        setResultMessage("Factura creada con éxito.");
        setResultStatus("success");
      } else {
        throw new Error("Error en la creación de factura: Respuesta no válida.");
      }
    } catch (error) {
      console.error("❌ Error al crear la factura:", error);
      setResultMessage("Hubo un error al crear la factura. Inténtalo nuevamente.");
      setResultStatus("error");
    } finally {
      setLoading(false);
      setIsResultModalVisible(true); // Mostrar el modal con el resultado
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const pdfUrl = `${Api_Host.defaults.baseURL}/factura-pdf/${id}/`;
      //console.log("📌 URL generada:", pdfUrl);
      //window.open(pdfUrl);
  
      // Realizar la solicitud para obtener el archivo PDF
      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudo descargar el PDF.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Factura_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("No se pudo descargar el PDF.");
    }
  };
  
  const handleDownloadXML = async (id) => {
    try {
      const xmlUrl = `${Api_Host.defaults.baseURL}/factura-xml/${id}/`;
      //console.log("📌 URL generada para XML:", xmlUrl);
  
      // Realizar la solicitud para obtener el archivo XML
      const response = await fetch(xmlUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/xml",
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudo descargar el XML.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Factura_${id}.xml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el XML:", error);
      message.error("No se pudo descargar el XML.");
    }
  };

  //ENVIAR CORREO
  const handleSendEmail = async () => {
    setLoading(true);
    try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
            message.error("No se encontró el ID del usuario.");
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

        // 📌 Nueva URL para facturación
        const response = await fetch(`${Api_Host.defaults.baseURL}/factura-pdf/${id}/enviar?${emailQuery}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.text();
          setResultStatus("success");
          setResultMessage(result || "Factura enviada exitosamente.");
        } else {
          setResultStatus("error");
          setResultMessage("Error al enviar la factura.");
        }
    } catch (error) {
      console.error("Error al enviar la factura:", error);
      setResultStatus("error");
      setResultMessage("Hubo un error al enviar la factura.");
  } finally {
      setIsResultModalVisible(true);
      setLoading(false);
  }
};
  

const handleCancelFactura = async () => {
  setLoading(true);
  try {
      const response = await fetch(`${Api_Host.defaults.baseURL}/factura-delete/${id}/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
          message.success("Factura cancelada exitosamente.");
          setVisibleCancelModal(false); // Cierra el modal tras la cancelación
          // Muestra el modal de éxito
          setIsSuccessModalVisible(true);
      } else {
          const result = await response.json();
          message.error(`Error al cancelar la factura: ${result.message || "Desconocido"}`);
      }
  } catch (error) {
      console.error("Error al cancelar la factura:", error);
      message.error("Hubo un error al cancelar la factura.");
  } finally {
      setLoading(false);
  }
};

const handDuoModal=()=>{    
  setIsModalVisibleCorreo(false);
  setIsResultModalVisible(false)
}

const handleDeleteFactura = () => {
  setIsDeleteModalVisible(true);
};
const confirmDeleteFactura = async () => {
  try {
    await deleteFactura(id);
    message.success("Factura eliminada correctamente.");
    setIsDeleteModalVisible(false);
    navigate("/factura");
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    message.error("No se pudo eliminar la factura.");
  }
};




  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => showModalCorreo(true)} icon={<MailTwoTone />}>Enviar por correo</Menu.Item>
      <Menu.Item key="2" onClick={() => setVisibleCancelModal(true)} icon={<CloseCircleTwoTone />}>Cancelar factura</Menu.Item>
      <Menu.Item key="4" onClick={() => handleDownloadPDF(id)} icon={<FilePdfTwoTone />}>Descargar PDF</Menu.Item>
      <Menu.Item key="5" onClick={() => handleDownloadXML(id)}icon={<FileTextTwoTone />}>Descargar XML</Menu.Item>
      <Menu.Item key="6" onClick={() => setModalOpen(true)} icon={<FileAddTwoTone />}>
        Generar Comprobante de Pago
      </Menu.Item>
    </Menu>
  );



const montoRestante =hasPagos 
? facturaPagos.montototal - facturaPagos.montopago 
: 0;

  useEffect(() => {
    let timer;
    if (isSuccessModalVisible) {
      // Inicia un temporizador para cerrar el modal y navegar
      timer = setTimeout(() => {
        setIsSuccessModalVisible(false);
        navigate("/factura");
      }, 2000);
    }
    // Limpia el temporizador al desmontar o cuando el modal cambia a false
    return () => clearTimeout(timer);
  }, [isSuccessModalVisible, navigate]);

  return (
    <Spin spinning={loading}>
    <div style={{ padding: "20px" }}>
      <h2><center>Factura {factura.numerofactura} - {factura.numerocotizacion} </center></h2>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Información" key="1">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Informacion" bordered>
                <Row>
                  <Col span={12}>
                    <>
                    <Descriptions column={1}>
                      <Descriptions label="Folio">{id}</Descriptions>
                      <Descriptions.Item label="Fecha">
                        {factura.fecha ? new Date(factura.fecha).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "N/A"}
                      </Descriptions.Item>
                    <Descriptions.Item label="Forma de Pago">{factura.formaPago}</Descriptions.Item>
                    <Descriptions.Item label="Método de Pago">{factura.metodoPago}</Descriptions.Item>
                    <Descriptions.Item label="Moneda">
                      {moneda.descripcion}
                    </Descriptions.Item>
                    <Descriptions.Item label="Orden de Compra">
                      {factura.ordenCompra ? factura.ordenCompra : "No registrada"}
                    </Descriptions.Item>
                  </Descriptions>
                    </>
                  </Col>
                  <Col span={12}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Empresa">{empresa.nombre}</Descriptions.Item>
                    <Descriptions.Item label="RFC">{empresa.rfc}</Descriptions.Item>
                    <Descriptions.Item label="Contacto">{cliente.nombrePila} {cliente.apPaterno} {cliente.apMaterno}</Descriptions.Item>
                    <Descriptions.Item label="Contacto">{cliente.correo} </Descriptions.Item>
                    <Descriptions.Item label="Porcentaje">{factura.porcentajeFactura}% </Descriptions.Item>
                  </Descriptions>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              {facturaExiste   === false   ? (
                <Flex gap="small" wrap>
                  <Alert
                    message="Informational Notes"
                    description="Tiene un plazo de 72 hora para crear la Factura."
                    type="info"
                    showIcon
                  />
                <div className="container-botones">
                      <Button
                        onClick={handleCrearFactura}
                        className="btn-crear-factura"
                      >
                        Crear Factura
                      </Button>
                      <Button
                        onClick={handleDeleteFactura}
                        className="btn-eliminar-factura"
                      >
                        Eliminar Factura
                      </Button>
                </div>
                  </Flex>
              ) : (
                <div >
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <Button type="primary" style={{ marginTop: "5px"}}>
                      Acciones para factura
                    </Button>
                  </Dropdown>
                  <ComprobantePago isOpen={modalOpen} onClose={() => setModalOpen(false)} Total={importeTotal}/>
                </div>
              )}
              <Card title="Cuenta" bordered style={{ marginTop: "20px" , padding:"40px"}}>
                <p><strong>Subtotal: </strong>{" "}
                { subtotal.subtotal }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Descuento:</strong> {subtotal.descuentoCotizacion}%</p>
                <p><strong>Subtotal - Descuento:</strong>{" "}
                { subtotal.valorDescuento}
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>IVA :</strong>{" "}
                { subtotal.ivaPct }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Importe:</strong>{" "}
                { subtotal.totalFinal  }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
              </Card>
            </Col>
          </Row>
          <h3 style={{ marginTop: "20px" }}>Conceptos</h3>
          <Table
            dataSource={servicios}
            columns={columnsConceptos}
            pagination={false}
            bordered
            rowKey={(record) => record.key}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pago" key="2">
          <p>Historial de la factura</p> 
          {(!hasPagos || (hasPagos && montoRestante > 0)) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
              <Link to={`/CrearPagos/${id}`}>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: 8,
                  }}
                >
                  Crear pagos
                </Button>
              </Link>
            </div>
          )}
          <PaymentCards idFactura={id} correoCliente={cliente?.correo} refreshPagos={refreshPagos}/>
        </Tabs.TabPane>

      </Tabs>

      <Modal
    title="Cancelando Factura"
    visible={visibleCancelModal}
    onCancel={() => setVisibleCancelModal(false)}
    footer={[
        <Button key="cerrar" onClick={() => setVisibleCancelModal(false)}>
            Cerrar
        </Button>,
        <Button key="cancelar" type="primary" danger onClick={handleCancelFactura}>
            Cancelar Factura
        </Button>,
          ]}
      >
          <p>¿Estás seguro de que deseas cancelar esta factura? Esta acción no se puede deshacer.</p>
      </Modal>

      <Modal
        title="Comprobante de pago"
        visible={visiblePaymentModal}
        onCancel={() => setVisiblePaymentModal(false)}
        footer={[
          <Button key="cancelar" onClick={() => setVisiblePaymentModal(false)}>
            Cerrar
          </Button>,
          <Button key="ok" type="primary" onClick={handleOkPayment}>
            Generar Comprobante
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Fecha de Pago:"
            name="fechaPago"
            rules={[{ required: true, message: "Por favor selecciona la fecha de pago" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Método de pago:"
            name="metodoPago"
            rules={[{ required: true, message: "Por favor selecciona un método de pago" }]}
          >
            <Select placeholder="Selecciona un método">
              <Option value="01">01 - Efectivo</Option>
              <Option value="02">02 - Cheque nominativo</Option>
              <Option value="03">03 - Transferencia electrónica de fondos</Option>
              <Option value="99">99 - Por definir</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Monto:"
            name="monto"
            rules={[{ required: true, message: "Por favor ingresa el monto" }]}
          >
            <Input type="number" placeholder="Ingresa el monto" />
          </Form.Item>

          <Form.Item
            label="Referencia:"
            name="referencia"
            rules={[{ required: true, message: "Por favor ingresa la referencia" }]}
          >
            <Input placeholder="Ingresa la referencia" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para enviar cotización por correo 
      // Modal para enviar factura por correo*/}
        <Modal
            title="Enviar Factura por Correo"
            visible={isModalVisibleCorreo}
            onCancel={() => setIsModalVisibleCorreo(false)}
            footer={[
                <Button key="cancel" onClick={() => setIsModalVisibleCorreo(false)}>Cerrar</Button>,
                <Button key="send" type="primary" onClick={handleSendEmail}>Enviar</Button>,
            ]}
        >
            <h4>Selecciona los correos a los que deseas enviar la factura:</h4>
            <Form layout="vertical">
                <Checkbox defaultChecked>{cliente?.correo || "N/A"}</Checkbox>
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
        <Modal
        title="Factura cancelada exitosamente"
        visible={isSuccessModalVisible}
        // Si no quieres ningún botón, puedes ocultarlos con estos props
        footer={null}
        // Evita que se cierre al hacer click fuera, si lo prefieres
        maskClosable={false}
        closable={false}
      >
        <p>La factura ha sido cancelada. Serás redirigido al listado de facturas en 2 segundos...</p>
      </Modal>
      <Modal
        title="¿Estás seguro de eliminar esta factura?"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancelar" onClick={() => setIsDeleteModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="eliminar" type="primary" danger onClick={confirmDeleteFactura}>
            Sí, eliminar
          </Button>,
        ]}
      >
        <p>Esta acción no se puede deshacer.</p>
      </Modal>

            {/* 
        <Modal
          title={resultStatus === "success" ? "Éxito" : "Error"}
          visible={isResultModalVisible}
          onCancel={() => setIsResultModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsResultModalVisible(false)}>
              Cerrar
            </Button>
          ]}
        >
          <Result
            status={resultStatus}
            title={resultMessage}
          />
        </Modal>*/}
    </div>
    </Spin>
  );
};

export default DetallesFactura;