import React from "react";
import { Modal, Form, Input, Select, Row, Col, message } from "antd";

const ModalNuevoServicio = ({
  visible,
  onClose,
  onCreate,
  unidad,
  clavecdfi,
  metodos,
  organizationId,
  createServicioFn,
}) => {
  const [form] = Form.useForm();

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      const dataToSend = {
        ...values,
        estado: 5,
        organizacion: organizationId,
      };

      if (!values.unidadCfdi || !values.claveCfdi) {
        message.error("Por favor, completa todos los campos obligatorios.");
        return;
      }

      const response = await createServicioFn(dataToSend);
      message.success("Servicio creado con éxito");
      onCreate(response.data);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error al crear el servicio", error);
      message.error("Error al crear el servicio");
    }
  };

  return (
    <Modal
      title="Crear Nuevo Servicio"
      open={visible}
      onOk={handleGuardar}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre del Servicio"
              name="nombreServicio"
              rules={[{ required: true, message: "Ingresa el nombre del servicio" }]}
            >
              <Input placeholder="Nombre del servicio" />
            </Form.Item>

            <Form.Item
              label="Precio unitario"
              name="precio"
              rules={[
                { required: true, message: "Ingresa el precio" },
                {
                  validator: (_, value) =>
                    value < 0 ? Promise.reject("El precio no puede ser negativo") : Promise.resolve(),
                },
              ]}
            >
              <Input type="number" min={0} placeholder="Precio sugerido" />
            </Form.Item>

            <Form.Item label="Unidad CFDI" name="unidadCfdi" rules={[{ required: true }]}>
              <Select showSearch placeholder="Unidad CFDI">
                {unidad.map((u) => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.codigo} - {u.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Clave CFDI"
              name="claveCfdi"
              rules={[{ required: true, message: "Selecciona la clave CFDI" }]}
            >
              <Select showSearch placeholder="Clave CFDI">
                {clavecdfi.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.codigo} - {c.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Método"
              name="metodos"
              rules={[{ required: true, message: "Selecciona el método" }]}
            >
              <Select showSearch placeholder="Método">
                {metodos.map((m) => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.codigo}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalNuevoServicio;
