// CreateEmpresaModal.jsx
import React from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import './Empresa.css';


const CreateEmpresaModal = ({ visible, onCancel, onCreate, regimenFiscal }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values, form); 
    } catch (error) {
      console.log("Error en validación:", error);
    }
  };

  return (
    <Modal
      title="Registro de Empresa"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Crear Empresa"
      cancelText="Cancelar"
      width={800}
    >
      <Form
        form={form}
        name="createEmpresa"
        labelCol={{ flex: '150px' }}
        labelAlign="left"
        labelWrap
        wrapperCol={{ flex: 1 }}
        colon={false}
        style={{ maxWidth: '100%' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre de Empresa"
              name="nombre"
              rules={[{ required: true, message: 'Nombre requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="RFC"
              name="rfc"
              rules={[{ required: true, message: 'RFC requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Regimen fiscal:" name="regimenFiscal"
            rules={[{ required: true, message: 'Régimen requerido' }]}>
              <Select>
                {regimenFiscal.map((regimen) => (
                  <Select.Option key={regimen.id} value={regimen.id}>
                    {regimen.codigo} - {regimen.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Condiciones de pago:"
              name="condicionPago"
              rules={[{ required: true, message: 'Condición requerida' }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Calle:"
              name="calle"
              rules={[{ required: true, message: 'Calle requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Numero:"
              name="numero"
              rules={[{ required: true, message: 'Número requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Colonia:"
              name="colonia"
              rules={[{ required: true, message: 'Colonia requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Ciudad:"
              name="ciudad"
              rules={[{ required: true, message: 'Ciudad requerida' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Codigo Postal:"
              name="codigoPostal"
              rules={[{ required: true, message: 'Código postal requerido' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Estado:"
              name="estado"
              rules={[{ required: true, message: 'Estado requerido' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateEmpresaModal;
