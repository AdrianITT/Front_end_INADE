// CreateEmpresaModal.jsx
import React,{useRef, useState} from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import './Empresa.css';


const CreateEmpresaModal = ({ open, onCancel, onCreate, regimenFiscal,usosCfdi }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    if (submitting) return; // <- anti spam
    setSubmitting(true);

    try {
      const values = await form.validateFields();

      // IMPORTANTE: esperar a que el padre termine (tu handleCreateEmpresa es async ✅)
      await onCreate(values, form);

    } catch (error) {
      // si falla validateFields también cae aquí (normal)
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Registro de Empresa"
      open={open}
      onOk={handleOk}
      onCancel={submitting ? undefined : onCancel}
      okText="Crear Empresa"
      cancelText="Cancelar"
      width={800}
      confirmLoading={submitting}                 // <- loading + deshabilita OK
      okButtonProps={{ disabled: submitting }}    // <- extra seguro
      cancelButtonProps={{ disabled: submitting }}
      maskClosable={!submitting}                  // opcional: no cerrar clic fuera mientras envía
      keyboard={!submitting}  
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
              rules={[{ required: true, message: 'RFC requerido' },
                { min: 11, message: 'Debe tener 11 caracteres' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
            label="Régimen fiscal:" 
            name="regimenFiscal"
            rules={[{ required: true, message: 'Régimen requerido' }]}>
              <Select
                  showSearch
                  placeholder="Selecciona un Régimen fiscal"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "").toLowerCase().localeCompare(
                      (optionB?.label ?? "").toLowerCase()
                    )
                  }
                  >
                {regimenFiscal.map((regimen) => (
                  <Select.Option 
                    key={regimen.id} 
                    value={regimen.id}
                    label={`${regimen.codigo} - ${regimen.nombre}`}
                  >
                    {regimen.codigo} - {regimen.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item 
            label="Uso CFDI:" 
            name="UsoCfdi"
            rules={[{ required: true, message: 'Uso CFDI' }]}>
            <Select
                showSearch
                placeholder="Selecciona un Uso CFDI"
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "").toLowerCase().localeCompare(
                    (optionB?.label ?? "").toLowerCase()
                  )
                }
              >
              {usosCfdi.map((uso) => (
                <Select.Option 
                  key={uso.id} 
                  value={uso.id}
                  label={`${uso.codigo} - ${uso.descripcion}`}
                >
                  {uso.codigo} - {uso.descripcion}
                </Select.Option>
              ))}
            </Select>
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
              label="Número externo/Interior:"
              name="numeroExterior"
              rules={[{ required: true, message: 'Número requerido' }
              ]}
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
              rules={[{ required: true, message: 'Código postal requerido' },
                { len: 5, message: 'Debe tener 5 caracteres' },
                { pattern: /^\d+$/, message: 'Sólo numeros' },
              ]}
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
