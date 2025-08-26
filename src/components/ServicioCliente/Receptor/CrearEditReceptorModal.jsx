import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

export default function CreateEditReceptorModal({ open, onCancel, onSubmit, initialValues, organizacionId, loading }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
          // console.log("Initial Values:", initialValues);
        form.setFieldsValue({
        nombrePila: initialValues.nombrePila ?? "",
        apPaterno: initialValues.apPaterno ?? "",
        apMaterno: initialValues.apMaterno ?? "",
        correo: initialValues.correo ?? "",
        celular: initialValues.celular ?? "",
        user: initialValues.user?.id ?? null, // guardamos el id
          });
      } else {
        form.setFieldsValue({ nombrePila: "", apPaterno: "", apMaterno: "", correo: "", celular: "" , user:null});
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
     //  console.log("Form Values:", values.user.id);
      let userId = values.user;
     if (userId === "" || userId === undefined) userId = null;
     if (typeof userId === "string" && userId.trim() !== "") {
          const n = Number(userId);
          userId = Number.isNaN(n) ? null : n;
     }

     const payload = {
          nombrePila: values.nombrePila,
          apPaterno: values.apPaterno,
          apMaterno: values.apMaterno,
          correo: values.correo || null,
          celular: values.celular || null,   // ✅ usar 'celular'
          organizacion: organizacionId,      // ✅ no 'organizacion_id'
          user: userId,                      // id o null
     };
      onSubmit(payload);
    } catch (_) {}
  };

  return (
    <Modal
      title={initialValues ? "Editar receptor" : "Crear receptor"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="nombrePila" label="Nombre(s)" rules={[{ required: true, message: "Ingresa el nombre" }]}>
          <Input maxLength={255} placeholder="Nombre(s)" />
        </Form.Item>
        <Form.Item name="apPaterno" label="Apellido paterno" rules={[{ required: true, message: "Ingresa el apellido paterno" }]}>
          <Input maxLength={255} placeholder="Apellido paterno" />
        </Form.Item>
        <Form.Item name="apMaterno" label="Apellido materno" rules={[{ required: true, message: "Ingresa el apellido materno" }]}>
          <Input maxLength={255} placeholder="Apellido materno" />
        </Form.Item>
        <Form.Item name="correo" label="Correo" >
          <Input maxLength={255} placeholder="correo@ejemplo.com" />
        </Form.Item>
        <Form.Item name="celular" label="Telefono">
          <Input/>
        </Form.Item>
          <Form.Item name="user" label="user" hidden>
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  );
}

