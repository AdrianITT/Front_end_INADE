import React, { useState } from "react";
import { Modal, Form, Input, Typography, Button, Popconfirm } from "antd";
import "./css/create-rf-modal.css";

const { Text } = Typography;

const CreateRFModal = ({
  openRF,
  onClose,
  onCreate,
  confirmLoading = false,
}) => {
  const [form] = Form.useForm();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleFinish = (values) => {
    const payload = {
      codigo: values.codigo.trim(),
      nombre: values.nombre.trim(),
    };

    onCreate?.(payload);
    setOpenConfirm(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setOpenConfirm(false);
    form.resetFields();
    onClose?.();
  };

  const handleOpenConfirm = async () => {
    try {
      await form.validateFields();
      setOpenConfirm(true);
    } catch (error) {
      setOpenConfirm(false);
    }
  };

  const handleConfirmCreate = () => {
    form.submit();
  };

  return (
    <Modal
      open={openRF}
      title="Crear régimen fiscal"
      onCancel={handleCancel}
      destroyOnHidden
      centered
      width={560}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,

        <Popconfirm
          key="confirm-create"
          title="Crear régimen fiscal"
          description="¿Deseas guardar este régimen fiscal?"
          open={openConfirm}
          onConfirm={handleConfirmCreate}
          onCancel={() => setOpenConfirm(false)}
          okText="Sí, guardar"
          cancelText="No"
        >
          <Button
            type="primary"
            loading={confirmLoading}
            onClick={handleOpenConfirm}
          >
            Guardar
          </Button>
        </Popconfirm>,
      ]}
    >
      <div className="rf-modal">
        <Text className="rf-modal__help">
          Captura el código y el nombre del régimen fiscal.
        </Text>

        <Form
          form={form}
          layout="vertical"
          preserve={false}
          onFinish={handleFinish}
          className="rf-modal__form"
        >
          <Form.Item
            label="Código"
            name="codigo"
            rules={[
              { required: true, message: "Por favor ingresa el código." },
              {
                pattern: /^\d+$/,
                message: "El código solo debe contener números.",
              },
              {
                len: 3,
                message: "El código debe tener exactamente 3 dígitos.",
              },
            ]}
          >
            <Input
              placeholder="Ej. 601"
              maxLength={3}
              allowClear
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[
              { required: true, message: "Por favor ingresa el nombre." },
              {
                min: 5,
                message: "El nombre debe tener al menos 5 caracteres.",
              },
              {
                max: 150,
                message: "El nombre no debe exceder 150 caracteres.",
              },
            ]}
          >
            <Input
              placeholder="Ej. Régimen General de Ley Personas Morales"
              allowClear
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateRFModal;