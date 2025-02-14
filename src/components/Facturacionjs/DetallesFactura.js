import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Table, Tabs, Dropdown, Menu, Modal, Select, Input, Form, DatePicker, Flex, Alert, Checkbox,message,Descriptions, Result, Spin  } from "antd";
import { useParams } from "react-router-dom";
import{FileTextTwoTone,MailTwoTone,FilePdfTwoTone,CloseCircleTwoTone} from "@ant-design/icons";
import { getFacturaById, createPDFfactura } from "../../apis/FacturaApi";
import { getAllFormaPago } from "../../apis/FormaPagoApi";
import { getAllMetodopago } from "../../apis/MetodoPagoApi";
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi"; // Asegúrate de tener esta función
import { getCotizacionById } from "../../apis/CotizacionApi"; // Asegúrate de tener esta función
import { getTipoMonedaById } from "../../apis/Moneda";
import { getClienteById } from "../../apis/ClienteApi";
import { getEmpresaById } from "../../apis/EmpresaApi";
import { Api_Host } from "../../apis/api";
//import axios from "axios";
import { getAllOrdenesTrabajoServicio } from "../../apis/OrdenTabajoServiciosApi";
import {getServicioById} from "../../apis/ServiciosApi";
import {  getAllfacturafacturama } from "../../apis/FacturaFacturamaApi";
import { getIvaById } from "../../apis/ivaApi";
import { getInfoSistema } from "../../apis/InfoSistemaApi";


const { Option } = Select;

const DetallesFactura = () => {
  const { id } = useParams();
  const [metodosPago, setMetodosPago] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [factura, setFactura] = useState([]);
  const [visibleCancelModal, setVisibleCancelModal] = useState(false);
  const [visiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isModalVisibleCorreo, setIsModalVisibleCorreo] = useState(false);
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
        const convertido = (valorEnMXN / factorConversion).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (valorEnMXN) => {
        // Convertimos al vuelo si es USD
        const convertido = (valorEnMXN / factorConversion).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
  ];

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
    const fetchFactura = async () => {
      try {
        const response = await getFacturaById(id);
        //console.log("Respuesta de la API:", response.data);
        if (response.data && typeof response.data === 'object') {
          console.log("📄 Datos recibidos:", response.data);
          setFactura(response.data);
          
          // Llamar a fetchServicios con el ordenTrabajoId
          fetchServicios(response.data.ordenTrabajo);
          
          fetchMonedaInfo(response.data.ordenTrabajo);
        } else {
          console.error("La respuesta de la API no es un objeto:", response.data);
          setFactura(null);
        }
      } catch (error) {
        console.error("Error al obtener la factura:", error);
        setFactura(null);
      }
    };

    const verificarFacturaFacturama = async () => {
      try {
        const response = await getAllfacturafacturama();

    console.log("📄 Datos recibidos:", response.data);
    console.log("🔍 ID a buscar:", id);

    if (!id) {
      console.warn("⚠ El ID es inválido.");
      return;
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("⚠ No hay datos en la respuesta.");
      return;
    }

    const facturasFiltradas = response.data.filter(factura => factura.factura === parseInt(id, 10));

    console.log("📝 Facturas filtradas:", facturasFiltradas);

    setFacturaExiste(facturasFiltradas.length > 0);
      } catch (error) {
        setFacturaExiste(false); // Si hay error, asumir que no existe
        console.warn("⚠ La factura no existe en FacturaFacturama.");
      }
    };

    const fetchMonedaInfo = async (ordenTrabajoId) => {
      try {
        const ordenTrabajo = await getOrdenTrabajoById(ordenTrabajoId);
        const cotizacion = await getCotizacionById(ordenTrabajo.data.cotizacion);
        const tipoMoneda = await getTipoMonedaById(cotizacion.data.tipoMoneda);
        setMoneda({ codigo: tipoMoneda.data.codigo, descripcion: tipoMoneda.data.descripcion });
    
        // Obtener el ID del cliente desde la cotización
        setOrdenCodigo(ordenTrabajo.data.codigo);
        const clienteId = cotizacion.data.cliente;
        if (clienteId) {
          fetchClienteInfo(clienteId); // Llamar a una función para obtener los datos del cliente
        }
      } catch (error) {
        console.error("Error al obtener la información de la moneda:", error);
      }
    };

    const fetchClienteInfo = async (clienteId) => {
      try {
        const response = await getClienteById(clienteId); // Asegúrate de tener esta función en tu API
        if (response.data) {
          setCliente(response.data); // Guardar los datos del cliente en el estado
          //console.log(response.data);

          // Obtener el ID de la empresa desde el cliente
          const empresaId = response.data.empresa;
          if (empresaId) {
            fetchEmpresaInfo(empresaId); // Llamar a una función para obtener los datos de la empresa
          }
        }
      } catch (error) {
        console.error("Error al obtener la información del cliente:", error);
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

    const fetchFormasPago = async () => {
      try {
        const response = await getAllFormaPago();
        setFormasPago(response.data);
      } catch (error) {
        console.error("Error al obtener formas de pago:", error);
      }
    };

    const fetchMetodosPago = async () => {
      try {
        const response = await getAllMetodopago();
        setMetodosPago(response.data);
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
      }
    };

    // Obtener los servicios relacionados con la orden de trabajo
    const fetchServicios = async (ordenTrabajoId) => {
      setLoading(true);
      try {
        if (!ordenTrabajoId) {
          console.error("❌ Error: ordenTrabajoId es undefined o null.");
          return;
        }
    
        // Obtener todos los registros de OrdenTrabajoServicios
        const ordenTrabajoServiciosResponse = await getAllOrdenesTrabajoServicio();
        console.log("📌 Respuesta de la API (Todos los OrdenTrabajoServicios):", ordenTrabajoServiciosResponse);
    
        // Filtrar por ordenTrabajo
        const ordenTrabajoServicios = ordenTrabajoServiciosResponse.data.filter(
          (orden) => orden.ordenTrabajo === ordenTrabajoId
        );
    
        console.log("📌 Servicios filtrados por ordenTrabajo:", ordenTrabajoServicios);
    
        if (ordenTrabajoServicios.length === 0) {
          console.warn("⚠ No hay servicios asociados a esta orden de trabajo.");
          setServicios([]);
          return;
        }
    
        // Obtener los detalles de cada servicio
        const serviciosConDetalles = await Promise.all(
          ordenTrabajoServicios.map(async (ordenServicio) => {
            if (!ordenServicio.servicio) {
              console.warn("⚠ ID de servicio no encontrado en:", ordenServicio);
              return null;
            }
    
            try {
              const servicioResponse = await getServicioById(ordenServicio.servicio);
              const servicioData = servicioResponse.data || {};
              
    
              return {
                key: servicioData.id,
                servicio: servicioData.nombreServicio || "Desconocido",
                cantidad: ordenServicio.cantidad || 1,
                precioUnitario: servicioData.precio || 0,
                total: (servicioData.precio || 0) * (ordenServicio.cantidad || 1),
              };
            } catch (error) {
              console.error(`❌ Error obteniendo servicio con ID ${ordenServicio.servicio}:`, error);
              return null;
            }
          })
        );
    
        console.log("✅ Servicios con detalles:", serviciosConDetalles.filter(Boolean));
        setServicios(serviciosConDetalles.filter(Boolean));
    
      } catch (error) {
        console.error("❌ Error al obtener los servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    
    
    
    verificarFacturaFacturama()
    fetchServicios();
    fetchFactura();
    fetchFormasPago();
    fetchMetodosPago();
    fetchTipoCambio();
  }, [id]);

  useEffect(() => {
    if (factura.ordenTrabajo) {
      fetchCotizacionDetalles(factura.ordenTrabajo);
    }
  }, [factura]);
  
  useEffect(() => {
    calcularTotales();
  }, [subtotal, descuento, porcentajeIVA, servicios]);


  const fetchCotizacionDetalles = async (ordenTrabajoId) => {
    try {
      if (!ordenTrabajoId) return;
  
      // Obtener la orden de trabajo
      const ordenTrabajoResponse = await getOrdenTrabajoById(ordenTrabajoId);
      const cotizacionId = ordenTrabajoResponse.data?.cotizacion;
  
      if (!cotizacionId) {
        console.warn("⚠ No se encontró ID de cotización.");
        return;
      }
  
      // Obtener los detalles de la cotización
      const cotizacionResponse = await getCotizacionById(cotizacionId);
      const descuentoCotizacion = cotizacionResponse.data?.descuento || 0;
      const ivaId = cotizacionResponse.data?.iva;
  
      setDescuento(descuentoCotizacion); // Guardamos el porcentaje de descuento
  
      if (!ivaId) {
        console.warn("⚠ No se encontró ID de IVA en la cotización.");
        return;
      }
  
      // Obtener el porcentaje del IVA
      const ivaResponse = await getIvaById(ivaId);
      console.log("iva: ",ivaResponse);
      const porcentajeIvaCotizacion = ivaResponse.data?.porcentaje || 0;
  
      setPorcentajeIVA(porcentajeIvaCotizacion); // Guardamos el porcentaje de IVA
    } catch (error) {
      console.error("❌ Error al obtener los detalles de la cotización:", error);
    }
  };
  
  const calcularTotales = () => {
    
    const subtotalServicios = servicios.reduce((total, servicio) => total + servicio.total, 0);
    setSubtotal(subtotalServicios);
  
    const subtotalConDescuento = subtotalServicios - (subtotalServicios * descuento / 100);
    const ivaTotal = subtotalConDescuento * (porcentajeIVA );
    setImporteTotal(subtotalConDescuento + ivaTotal);
  };

  const getDescripcionFormaPago = (id) => {
    const formaPago = formasPago.find((fp) => fp.id === id);
    return formaPago ? formaPago.descripcion : "Desconocido";
  };

  const getDescripcionMetodoPago = (id) => {
    const metodoPago = metodosPago.find((mp) => mp.id === id);
    return metodoPago ? metodoPago.descripcion : "Desconocido";
  };

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
      console.log(id);
      const response =await createPDFfactura(id);
      setFacturaExiste(true);
      console.log("✅ Factura creada exitosamente en FacturaFacturama.", response.data);
    } catch (error) {
      console.error("❌ Error al crear la factura:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const pdfUrl = `${Api_Host.defaults.baseURL}/factura-pdf/${id}/`;
      console.log("📌 URL generada:", pdfUrl);
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
      console.log("📌 URL generada para XML:", xmlUrl);
  
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
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
          message.success("Factura cancelada exitosamente.");
          setVisibleCancelModal(false); // Cierra el modal tras la cancelación
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

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => showModalCorreo(true)} icon={<MailTwoTone />}>Enviar por correo</Menu.Item>
      <Menu.Item key="2" onClick={() => setVisibleCancelModal(true)} icon={<CloseCircleTwoTone />}>Cancelar factura</Menu.Item>
      <Menu.Item key="4" onClick={() => handleDownloadPDF(id)} icon={<FilePdfTwoTone />}>Descargar PDF</Menu.Item>
      <Menu.Item key="5" onClick={() => handleDownloadXML(id)}icon={<FileTextTwoTone />}>Descargar XML</Menu.Item>
    </Menu>
  );




  return (
    <Spin spinning={loading}>
    <div style={{ padding: "20px" }}>
      <h2><center>Factura {ordenCodigo}</center></h2>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Información" key="1">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Info" bordered>
                <Row>
                  <Col span={12}>
                    <>
                    <Descriptions column={1}>
                    <Descriptions.Item label="Fecha">{factura.fechaExpedicion}</Descriptions.Item>
                    <Descriptions.Item label="Forma de Pago">Tarjeta</Descriptions.Item>
                    <Descriptions.Item label="Método de Pago">Transferencia</Descriptions.Item>
                    <Descriptions.Item label="Moneda">
                      {moneda.codigo} - {moneda.descripcion}
                    </Descriptions.Item>
                    <Descriptions.Item label="Orden de Compra">{factura.ordenCompra}</Descriptions.Item>
                  </Descriptions>
                    </>
                  </Col>
                  <Col span={12}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Empresa">{empresa.nombre}</Descriptions.Item>
                    <Descriptions.Item label="RFC">{empresa.rfc}</Descriptions.Item>
                    <Descriptions.Item label="Contacto">{cliente.nombrePila} {cliente.apPaterno} {cliente.apMaterno}</Descriptions.Item>
                  </Descriptions>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              {facturaExiste === false ? (
                <Flex gap="small" wrap>
                  <Alert
                    message="Informational Notes"
                    description="Tiene un plazo de 72 hora para crear la Factura."
                    type="info"
                    showIcon
                  />
                  <Button color="danger"onClick={handleCrearFactura} variant="solid"
                    style={{ marginTop: "20px" }}
                  >
                    Crear Factura
                  </Button></Flex>
              ) : (
                <div >
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <Button type="primary" style={{ marginTop: "5px"}}>
                      Acciones para factura
                    </Button>
                  </Dropdown>
                </div>
              )}
              <Card title="Cuenta" bordered style={{ marginTop: "20px" , padding:"40px"}}>
                <p><strong>Subtotal: </strong>{" "}
                { (subtotal / factorConversion).toFixed(2) }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Descuento:</strong> {descuento}%</p>
                <p><strong>Subtotal - Descuento:</strong>{" "}
                { ((subtotal - (subtotal * descuento / 100)) / factorConversion).toFixed(2) }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>IVA ({porcentajeIVA}%):</strong>{" "}
                { ((subtotal - (subtotal * descuento / 100) * (porcentajeIVA)) / factorConversion).toFixed(2) }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Importe:</strong>{" "}
                { (importeTotal / factorConversion).toFixed(2) }
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
    </div>
    </Spin>
  );
};

export default DetallesFactura;