import React, { useState } from "react";
import { Modal,Input, Button, Form, Popconfirm } from "antd"
const CreateReceptor =({
     open, 
     onClose, 
     onCreate,
     confirmLoading = false
}) =>{
     const [form] = Form.useForm();
     const [openConfirm, setOpenConfirm] = useState(false);

       const handleFinish = (values) => {
          // const payload = {
          //      codigo: values.codigo.trim(),
          //      nombre: values.nombre.trim(),
          // };
          console.log("data:", values);
          onCreate?.(values);
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
     return(
     <Modal
        title="Agregar Receptor"
        open={open}
        onOk={onCreate}
        onCancel={handleCancel}
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
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
                name="nombrePila"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
            <Form.Item
            name="apPaterno"
            label="Apellido Paterno"
            rules={[{ required: true, message: 'Por favor ingrese el apellido paterno' }]}
          >
            <Input placeholder="Apellido Paterno" />
          </Form.Item>
          <Form.Item
              name="apMaterno"
              label="Apellido Materno"
              rules={[{ required: true, message: 'Por favor ingrese el apellido materno' }]}
            >
              <Input placeholder="Apellido Materno" />
            </Form.Item>
            <Form.Item
              name="correo"
              label="Correo Electrónico"
            >
              <Input placeholder="Correo electrónico" />
            </Form.Item>
          <Form.Item
            label="Celular:"
            name="celular"
          >
            <Input placeholder="Celular" />
          </Form.Item>
        </Form>
      </Modal>
     )
}
export default CreateReceptor;