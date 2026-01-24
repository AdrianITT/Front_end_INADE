import React, { useState, useEffect } from 'react';
import { 
  Card,
  Row,
  Col, 
  Button, 
  Dropdown, 
  Menu, 
  Modal, 
  Input, 
  message, 
  notification,
 } from 'antd';
import { 
  CalendarOutlined, 
  DollarOutlined, 
  FilePdfTwoTone, 
  DeleteOutlined, 
  MailTwoTone 
} from '@ant-design/icons';
import { getAllFacturaPagos } from '../../../apis/ApisServicioCliente/FacturaPagosApi';
import { getAllFacturaPagosFacturama } from '../../../apis/ApisServicioCliente/PagosFacturamaApi';
import { deleteComprobantepago, DeleteComprobantePagoFacturama } from '../../../apis/ApisServicioCliente/PagosApi';
import { Api_Host } from "../../../apis/api";

const PaymentCards = ({ idFactura, correoCliente,refreshPagos }) => {
  const [pagos, setPagos] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  
  // Estados para envío de correo (solo para correos adicionales)
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [pagoForEmail, setPagoForEmail] = useState(null);
  const [extraEmails, setExtraEmails] = useState(""); // se inicia vacío
  const [loading, setLoading] = useState(false);
  // Estado para el modal de confirmación de correo enviado
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

const openNotificationWithIcon = (text) => {
  api.error({
    message: "Error al realizar el pago, si el error no es detectado hable a IT",
    description: text,
    placement: "topRight",
  });
};

  const formatDetails = (details) => {
  if (!details || typeof details !== "object") return "";

  return Object.values(details)
    .flat()
    .join(" • ");
};

  // Función para obtener los pagos desde el backend
  const fetchPagos = async () => {
    try {
      const response = await getAllFacturaPagos(idFactura);
      if (response.data && response.data.pagos) {
        const pagosConFlag = response.data.pagos.map((p) => ({
          ...p,
          isPDFVisible: p.facturama_id !== null,
        }));
        //console.log("Pagos obtenidos:", pagosConFlag);
        setPagos(pagosConFlag);
      }else {
        setPagos([]);
      }
    } catch (error) {
      console.error("Error al obtener los pagos:", error);
    }
  };

  useEffect(() => {
    if (idFactura) {
      fetchPagos();
    }
  }, [idFactura]);

  // Función para realizar el pago
  const handleRealizarPago = async (pagoId) => {
    try {

      const reponse =await getAllFacturaPagosFacturama(pagoId);
      console.log("Respuesta al realizar el pago:", reponse);
      if (reponse.status === 200) {
        setPagos((prevPagos) =>
        prevPagos.map((pago) =>
          pago.id === pagoId ? { ...pago, isPDFVisible: true } : pago
        )
      );
 
      }
    } catch (error) {
      const data = error?.response?.data;

      console.error("Error al realizar el pago:", error);
      console.log("Respuesta del servidor:", data);
      // Mensaje principal
      const mainError = data?.error || "La solicitud no es válida";

      // Detalles (ModelState)
      const detailsText = formatDetails(data?.details);

      // Texto final
      const finalMessage = detailsText
        ? `${mainError}: ${detailsText}`
        : mainError;

      openNotificationWithIcon(finalMessage);
    } 
  };

  // Función para descargar el PDF
  const descargarPDF = async (pago) => {
    try {
      const pdfUrl = `${Api_Host.defaults.baseURL}/complemento-pdf/${pago.id}/`;
      //console.log("📌 URL generada:", pdfUrl);

      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: { "Content-Type": "application/pdf" },
      });

      if (!response.ok) {
        throw new Error("No se pudo descargar el PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Comprobante_${pago.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const descargarXML = async (pago) => {
    try {
      const pdfUrl = `${Api_Host.defaults.baseURL}/comprobante-xml/${pago.id}/`;
      //console.log("📌 URL generada:", pdfUrl);

      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: { "Content-Type": "application/xml" },
      });

      if (!response.ok) {
        throw new Error("No se pudo descargar el XML.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Comprobante_${pago.id}.xml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el XML:", error);
    }
  };
  // Abre el modal de eliminación y guarda el ID del pago
  const openDeleteModal = (pagoId) => {
    setPagoToDelete(pagoId);
    setIsDeleteModalVisible(true);
  };

  // Confirma eliminación del complemento
  const handleConfirmDeleteComplemento = async () => {
    try {
      //console.log("Complemento de pago eliminado exitosamente", pagoToDelete);
      await DeleteComprobantePagoFacturama(pagoToDelete);
      //await deleteComprobantepago(pagoToDelete);
      
      message.success("Complemento de pago eliminado exitosamente");
      setIsDeleteModalVisible(false);
      setPagoToDelete(null);
      await fetchPagos();
      if (typeof refreshPagos === "function") {
        refreshPagos();
      }
    } catch (error) {
      console.error("Error al eliminar el complemento de pago:", error);
      message.error("Hubo un error al eliminar el complemento de pago");
    }
  };

  // Cancela el modal de eliminación
  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setPagoToDelete(null);
  };

  // Abre el modal para enviar correo y guarda el pago correspondiente
  const openEmailModal = (pago) => {
    setPagoForEmail(pago);
    setIsEmailModalVisible(true);
    setExtraEmails(""); // se inicia vacío para ingresar solo correos adicionales
  };

  // Cancela el modal de correo
  const handleCancelEmailModal = () => {
    setIsEmailModalVisible(false);
    setPagoForEmail(null);
    setExtraEmails("");
  };

  // Función para enviar el correo con el complemento de pago
  const handleSendEmail = async () => {
    if (!pagoForEmail) return;
    setLoading(true);
    try {
      // El correo del cliente se enviará siempre de forma automática
      const clientEmail = correoCliente;
      
      // Validación básica para los correos adicionales
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const additionalEmailList = extraEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email);
      const invalidEmails = additionalEmailList.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        message.error("Correo(s) inválido(s): " + invalidEmails.join(", "));
        setLoading(false);
        return;
      }

      // Combinar el correo del cliente con los correos adicionales
      const emailList = clientEmail ? [clientEmail, ...additionalEmailList] : additionalEmailList;
      const emailQuery = emailList.length > 0 
        ? `&emails=${encodeURIComponent(emailList.join(","))}` 
        : "";
      const url = `${Api_Host.defaults.baseURL}/comprobantepago/${pagoForEmail.id}/enviar?${emailQuery}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        // Si se envía correctamente, se muestra el modal de confirmación
        await response.text();
        setIsConfirmationModalVisible(true);
      } else {
        message.error("Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      message.error("Hubo un error al enviar el correo");
    } finally {
      setIsEmailModalVisible(false);
      setPagoForEmail(null);
      setExtraEmails("");
      setLoading(false);
    }
  };

  // Renderiza el botón o menú según el estado del pago
  const renderBotonPago = (pago) => {
    if (pago.isPDFVisible || pago.facturama_id !== null) {
      const menu = (
        <Menu>
          <Menu.Item key="1" icon={<FilePdfTwoTone />} onClick={() => descargarPDF(pago)}>
            Descargar PDF
          </Menu.Item>
          <Menu.Item key="2" icon={<DeleteOutlined style={{ color: 'red' }} />} onClick={() => openDeleteModal(pago.id)}>
            Eliminar Complemento
          </Menu.Item>
          <Menu.Item key="3" icon={<MailTwoTone />} onClick={() => openEmailModal(pago)}>
            Enviar por correo
          </Menu.Item>
          <Menu.Item key="4" icon={<FilePdfTwoTone />} onClick={() => descargarXML(pago)}>
            Descargar XML
          </Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Button type="default" style={{ borderRadius: 8, marginTop: '10px' }}>
            Acciones
          </Button>
        </Dropdown>
      );
    } else {
      return (
        <>
        {contextHolder}
        <Button
          type="primary"
          style={{
            backgroundColor: '#faad14',
            borderColor: '#faad14',
            borderRadius: 8,
            marginTop: '10px',
          }}
          onClick={() => handleRealizarPago(pago.id)}
        >
          Realizar Pago
        </Button>
        <Button icon={<DeleteOutlined style={{ color: 'red' }} />} 
        onClick={() => openDeleteModal(pago.id)}>Eliminar Complemento</Button>
        </>
      );
    }
  };

  return (
    <>
      <Row gutter={[24, 24]} style={{ padding: '20px' }}>
        {pagos.map((pago) => (
          <Col xs={24} sm={12} md={8} key={pago.id}>
            <Card
              hoverable
              title={`Parcialidad: ${pago.parcialidad}`}
              bordered={false}
              style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <p>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Fecha de Pago: {new Date(pago.fechaPago).toLocaleString('es-MX', { timeZone: 'UTC' })}
                </p>
              <p>
                <DollarOutlined style={{ marginRight: '8px' }} />
                Monto Total: ${parseFloat(pago.montototal).toFixed(2)}
              </p>
              <p>
                <DollarOutlined style={{ marginRight: '8px' }} />
                Monto Pagado: ${parseFloat(pago.montopago).toFixed(2)}
              </p>
              <p>
                <DollarOutlined style={{ marginRight: '8px' }} />
                Monto Restante: ${parseFloat(pago.montorestante).toFixed(2)}
              </p>
              {renderBotonPago(pago)}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de confirmación para eliminación */}
      <Modal
        title="Confirmar eliminación"
        visible={isDeleteModalVisible}
        onOk={handleConfirmDeleteComplemento}
        onCancel={handleCancelDelete}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de eliminar este complemento de pago?</p>
      </Modal>

      {/* Modal para enviar por correo */}
      <Modal
        title="Enviar Complemento de Pago por Correo"
        visible={isEmailModalVisible}
        onOk={handleSendEmail}
        onCancel={handleCancelEmailModal}
        okText="Enviar"
        cancelText="Cancelar"
      >
        <p>Correo del Cliente: {correoCliente}</p>
        <p>
          Ingresa los correos adicionales que desees (separados por coma):
        </p>
        <Input
          placeholder="correo@ejemplo.com, otro@ejemplo.com"
          value={extraEmails}
          onChange={(e) => setExtraEmails(e.target.value)}
        />
      </Modal>

      {/* Modal de confirmación para correo enviado */}
      <Modal
        title="Confirmación"
        visible={isConfirmationModalVisible}
        onOk={() => setIsConfirmationModalVisible(false)}
        onCancel={() => setIsConfirmationModalVisible(false)}
        okText="Aceptar"
      >
        <p>El correo se envió exitosamente.</p>
      </Modal>
    </>
  );
};

export default PaymentCards;