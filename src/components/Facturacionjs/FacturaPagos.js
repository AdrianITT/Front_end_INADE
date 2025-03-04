import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { getAllFacturaPagos } from '../../apis/FacturaPagosApi';
import { getAllFacturaPagosFacturama, getAllFacturaPagosPDF } from '../../apis/PagosFacturamaApi';
import { Api_Host } from "../../apis/api";

const PaymentCards = ({ idFactura }) => {
  const [pagos, setPagos] = useState([]);

  // Función para obtener los pagos desde el backend
  const fetchPagos = async () => {
    try {
      const response = await getAllFacturaPagos(idFactura);
      if (response.data && response.data.pagos) {
        // Al cargar, establecemos isPDFVisible en función de si facturama_id es nulo o no
        const pagosConFlag = response.data.pagos.map((p) => ({
          ...p,
          isPDFVisible: p.facturama_id !== null,
        }));
        setPagos(pagosConFlag);
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

  // Llama a la API para realizar el pago
  const handleRealizarPago = async (pagoId) => {
    try {
      // 1. Llamada a la API que realiza el pago
      await getAllFacturaPagosFacturama(pagoId);
    } catch (error) {
      // Aquí ignoras el error o lo registras, pero NO lanzas de nuevo (throw)
      console.log("Se recibió un error del servidor (500), pero se ignora:", error);
    } finally {
      // 2. Actualizamos el estado local para que el botón cambie
      setPagos((prevPagos) =>
        prevPagos.map((pago) =>
          pago.id === pagoId ? { ...pago, isPDFVisible: true } : pago
        )
      );
      // 3. Recargamos la lista para sincronizar con el servidor
      await fetchPagos();
    }
  };
  

// Función para descargar el PDF
const descargarPDF = async (pago) => {
  try {
    const pdfUrl = `${Api_Host.defaults.baseURL}/complemento-pdf/${pago.id}/`;
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
    link.setAttribute("download", `Comprobante_${pago.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar memoria
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el PDF:", error);
  }
};


  // Decide qué botón mostrar según el flag y/o el facturama_id
  const renderBotonPago = (pago) => {
    // Si ya está marcado como PDF visible (o tiene facturama_id), mostramos "Descargar PDF"
    if (pago.isPDFVisible || pago.facturama_id !== null) {
      return (
        <Button
          type="default"
          style={{ borderRadius: 8, marginTop: '10px' }}
          onClick={() => descargarPDF(pago)}
        >
          Descargar PDF
        </Button>
      );
    } else {
      // En caso contrario, mostramos "Realizar Pago"
      return (
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
      );
    }
  };

  return (
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
              Fecha de Pago: {new Date(pago.fechaPago).toLocaleString()}
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
  );
};

export default PaymentCards;
