import React from "react";
import { Modal, Form, Input, message } from "antd";

const ModalMetodo = ({
  visible,
  onClose,
  onCreate,
  organizationId,
  createMetodoFn,
}) => {
  const [form] = Form.useForm();

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      const dataToSend = { ...values, organizacion: organizationId };

      const response = await createMetodoFn(dataToSend);
      message.success("Método creado exitosamente");
      onCreate(response);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error al crear el método", error);
      message.error("Error al crear el método");
    }
  };

  return (
    <Modal
      title="Registrar Método"
      open={visible}
      onOk={handleGuardar}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Crear"
      cancelText="Cancelar"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre del Método"
          name="codigo"
          rules={[{ required: true, message: "Ingresa el nombre del método" }]}
        >
          <Input placeholder="Nombre del método" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalMetodo;
