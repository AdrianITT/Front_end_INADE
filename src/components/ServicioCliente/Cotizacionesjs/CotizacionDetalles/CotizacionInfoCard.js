import React from "react";
import { Card, Row, Col, Typography, Button, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { FileAddOutlined, FilePdfOutlined } from "@ant-design/icons";

const { Text } = Typography;

const CotizacionInfoCard = ({
  cotizacionInfo,
  factorConversion,
  esUSD,
  menu,
}) => {
  const valores = cotizacionInfo?.valores || {};
  const moneda = cotizacionInfo?.tipoMoneda?.codigo || (esUSD ? "USD" : "MXN");

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Card title="Información de la Cotización" bordered>
          <p>
            <Text strong>Atención:</Text>{" "}
            {cotizacionInfo?.cliente?.nombreCompleto || "N/A"}
          </p>
          <p>
            <Text strong>Empresa:</Text>{" "}
            {cotizacionInfo?.empresa?.nombre || "N/A"}
          </p>
          <p>
            <Text strong>Dirección Cliente:</Text>{" "}
            {cotizacionInfo?.cliente?.direccion
              ? `${cotizacionInfo.cliente.direccion.calle} ${cotizacionInfo.cliente.direccion.numero}, ${cotizacionInfo.cliente.direccion.colonia}, ${cotizacionInfo.cliente.direccion.ciudad}, ${cotizacionInfo.cliente.direccion.estado}`
              : "N/A"}
          </p>
          <p>
            <Text strong>Dirección Empresa:</Text>{" "}
            {cotizacionInfo?.empresa?.direccion
              ? `${cotizacionInfo.empresa.direccion.calle} ${cotizacionInfo.empresa.direccion.numero}, ${cotizacionInfo.empresa.direccion.colonia}, ${cotizacionInfo.empresa.direccion.ciudad}, ${cotizacionInfo.empresa.direccion.estado}`
              : "N/A"}
          </p>
          <p>
            <Text strong>Fecha solicitada:</Text>{" "}
            {cotizacionInfo?.fechaSolicitada || "N/A"}
          </p>
          <p>
            <Text strong>Fecha de caducidad:</Text>{" "}
            {cotizacionInfo?.fechaCaducidad || "N/A"}
          </p>
          <p>
            <Text strong>Moneda:</Text>{" "}
            {cotizacionInfo?.tipoMoneda?.codigo} - {cotizacionInfo?.tipoMoneda?.descripcion}
          </p>
          <p>
            <Text strong>IVA:</Text>{" "}
            {(parseFloat(cotizacionInfo?.iva?.porcentaje) * 100).toFixed(0)}%
          </p>
        </Card>
      </Col>

      <Col span={8}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {cotizacionInfo?.estado?.id > 1 && (
            <Link to={`/GenerarOrdenTrabajo/${cotizacionInfo.idCotizacion}`}>
              <Button
                type="primary"
                
                size="middle"
                style={{ backgroundColor: '#13c2c2' }}
              >Orden Trabajo</Button>
            </Link>
          )}
          
          {cotizacionInfo?.estado?.id > 1 && (
            <Link to={`/CrearFactura/${cotizacionInfo.idCotizacion}`}>
              <Button
                type="primary"
                
                size="middle"
                style={{ backgroundColor: '#1890ff' }}
              >Facturacion</Button>
            </Link>
          )}
        </div>


        <Card
          title="Cuenta"
          bordered
          extra={
            <Dropdown overlay={menu}>
              <Button type="primary">Acciones para cotización</Button>
            </Dropdown>
          }
        >
          <p>
            <Text strong>Subtotal:</Text>{" "}
            {(valores.subtotal / factorConversion).toFixed(2)} {moneda}
          </p>
          <p>
            <Text strong>Descuento:</Text>{" "}
            {(valores.valorDescuento / factorConversion).toFixed(2)} {moneda}
          </p>
          <p>
            <Text strong>Subtotal con descuento:</Text>{" "}
            {(valores.subtotalDescuento / factorConversion).toFixed(2)} {moneda}
          </p>
          <p>
            <Text strong>IVA ({(parseFloat(valores.iva) * 100).toFixed(0)}%):</Text>{" "}
            {(valores.ivaValor / factorConversion).toFixed(2)} {moneda}
          </p>
          <p>
            <Text strong>Importe total:</Text>{" "}
            {(valores.importe / factorConversion).toFixed(2)} {moneda}
          </p>
          <p>
            <Text strong>Estado:</Text>{" "}
            {cotizacionInfo?.estado?.nombre || "Pendiente"}
          </p>
        </Card>
      </Col>
    </Row>
  );
};

export default CotizacionInfoCard;
