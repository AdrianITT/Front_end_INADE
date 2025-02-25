import React from 'react';
import { Card, Row, Col } from 'antd';

const data = [
  {
    key: '1',
    paymentDate: '2025-01-01 10:00',
    method: 'Tarjeta',
    amount: 150.0,
    reference: 'ABC123',
    status: 'Confirmado',
  },
  {
    key: '2',
    paymentDate: '2025-01-05 15:30',
    method: 'Transferencia',
    amount: 200.0,
    reference: 'XYZ789',
    status: 'Pendiente',
  },
];

const PaymentCards = () => (
  <Row gutter={[16, 16]}>
    {data.map((payment) => (
      <Col xs={24} sm={12} md={8} key={payment.key}>
        <Card title={`Pago: ${payment.paymentDate}`} bordered={false}>
          <p><strong>Método:</strong> {payment.method}</p>
          <p><strong>Monto:</strong> ${payment.amount.toFixed(2)}</p>
          <p><strong>Referencia:</strong> {payment.reference}</p>
          <p><strong>Estado:</strong> {payment.status}</p>
        </Card>
      </Col>
    ))}
  </Row>
);

export default PaymentCards;
