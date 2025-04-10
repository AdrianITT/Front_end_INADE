import React, { useEffect, useState } from 'react';
import { Button, Transfer, Select, Typography, Row, Col, Space, Divider } from 'antd';
import { getAllCliente } from '../../../apis/ApisServicioCliente/ClienteApi';

const FacturaOTMultipes = () => {
  const [mockData, setMockData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const { Title } = Typography;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await getAllCliente();
        const clienteOptions = response.data.map((cliente) => ({
          value: cliente.id,
          label: `${cliente.nombrePila} ${cliente.apPaterno} ${cliente.apMaterno}`,
        }));
        setClientes(clienteOptions);
      } catch (error) {
        console.error("Error al cargar clientes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const getMock = () => {
    const tempTargetKeys = [];
    const tempMockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        chosen: i % 2 === 0,
      };
      if (data.chosen) {
        tempTargetKeys.push(data.key);
      }
      tempMockData.push(data);
    }
    setMockData(tempMockData);
    setTargetKeys(tempTargetKeys);
  };

  useEffect(() => {
    getMock();
  }, []);

  const handleChange = (newTargetKeys) => {
    setTargetKeys(newTargetKeys);
  };

  const renderFooter = (_, info) => {
    const buttonStyle = { display: 'flex', margin: 8 };
    return (
      <Button
        size="small"
        style={info?.direction === 'left' ? { ...buttonStyle, marginInlineEnd: 'auto' } : { ...buttonStyle, marginInlineStart: 'auto' }}
        onClick={getMock}
      >
        {info?.direction === 'left' ? 'Recargar izquierda' : 'Recargar derecha'}
      </Button>
    );
  };

  return (
    <div style={{ padding: '40px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Factura Múltiple</Title>

      <Row justify="center" gutter={[16, 16]} style={{ marginBottom: 30 }}>
        <Col>
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Buscar cliente por nombre"
            optionFilterProp="label"
            value={clienteSeleccionado}
            onChange={setClienteSeleccionado}
            loading={loading}
            filterSort={(optionA, optionB) =>
              optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
            }
            options={clientes}
          />
        </Col>
      </Row>
      <Row justify="center" gutter={[16, 16]} style={{ marginBottom: 30 }}>
        <Col>
          <Button type="primary">Crear Factura</Button>
        </Col>

      </Row>

      <Row justify="center">
        <Col>
          <Transfer
            dataSource={mockData}
            showSearch
            listStyle={{
              width: 250,
              height: 300,
            }}
            operations={['>>', '<<']}
            targetKeys={targetKeys}
            onChange={handleChange}
            render={(item) => `${item.title} - ${item.description}`}
            footer={renderFooter}
          />
        </Col>
      </Row>
    </div>
  );
};

export default FacturaOTMultipes;
