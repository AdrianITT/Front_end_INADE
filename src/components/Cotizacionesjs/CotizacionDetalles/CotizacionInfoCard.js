// src/components/CotizacionInfoCard.js
import React from "react";
import { Card, Row, Col, Typography, Button, Dropdown, Menu } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

const CotizacionInfoCard = ({
  cotizacionInfo,
  factorConversion,
  esUSD,
  menu,
}) => {
  // Calcular totales
  const Csubtotal = cotizacionInfo?.precio || 0; // Ejemplo: usa cotizacionInfo.precio para subtotal
  const Cdescuento = Csubtotal * ((cotizacionInfo?.descuento || 0) / 100);
  const Csubtotaldescuento = Csubtotal - Cdescuento;
  const Civa = Csubtotaldescuento * (cotizacionInfo?.tasaIVA || 0);
  const Ctotal = Csubtotaldescuento + Civa;

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Card title="Información de la Cotización" bordered>
          <p>
            <Text strong>Atención:</Text>{" "}
            {cotizacionInfo?.clienteNombre || "N/A"}
          </p>
          <p>
            <Text strong>Empresa:</Text>{" "}
            {cotizacionInfo?.empresaNombre || "N/A"}
          </p>
          <p>
            <Text strong>Dirección:</Text>{" "}
            {cotizacionInfo?.direccion || "N/A"}
          </p>
          <p>
            <Text strong>Fecha solicitada:</Text>{" "}
            {cotizacionInfo?.fechaSolicitud || "N/A"}
          </p>
          <p>
            <Text strong>Fecha de caducidad:</Text>{" "}
            {cotizacionInfo?.fechaCaducidad || "N/A"}
          </p>
          <p>
            <Text strong>Denominación:</Text>{" "}
            {cotizacionInfo?.denominacion || "N/A"}
          </p>
          <p>
            <Text strong>Tasa IVA:</Text>{" "}
            {(cotizacionInfo?.tasaIVA * 100) || 0}%
          </p>
        </Card>
      </Col>
      <Col span={8}>
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
          <p>
            <Text strong>Subtotal:</Text>{" "}
            {(Csubtotal / factorConversion).toFixed(2)}{" "}
            {esUSD ? "USD" : "MXN"}
          </p>
          <p>
            <Text strong>Descuento:</Text>{" "}
            {(Cdescuento / factorConversion).toFixed(2)}{" "}
            {esUSD ? "USD" : "MXN"}
          </p>
          <p>
            <Text strong>Subtotal con descuento:</Text>{" "}
            {(Csubtotaldescuento / factorConversion).toFixed(2)}{" "}
            {esUSD ? "USD" : "MXN"}
          </p>
          <p>
            <Text strong>IVA ({(cotizacionInfo?.tasaIVA * 100) || 0}%):</Text>{" "}
            {(Civa / factorConversion).toFixed(2)}{" "}
            {esUSD ? "USD" : "MXN"}
          </p>
          <p>
            <Text strong>Importe:</Text>{" "}
            {(Ctotal / factorConversion).toFixed(2)}{" "}
            {esUSD ? "USD" : "MXN"}
          </p>
          {cotizacionInfo?.estado > 1 ? (
            <div>
              <Text strong>Estado: Aprobado</Text>
              <p>Detalles para cotizaciones aprobadas.</p>
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
  );
};

export default CotizacionInfoCard;
