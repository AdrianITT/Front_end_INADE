import React, { useEffect, useState } from "react";
import { Modal, Form, Select, message } from "antd";
import { ReceptoresAPI, getUsuariosAsignables } from "../../../apis/ApisServicioCliente/ReceptorApi"; // ajusta la ruta si usas alias

export default function RelateUserModal({ open, onCancel, onSubmit, organizacionId, loading, idReceptor }) {
  const [form] = Form.useForm();
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

// en tu modal
useEffect(() => {
  const load = async () => {
    if (!open) return;
    try {
      setLoadingUsers(true);
      const list = await getUsuariosAsignables(organizacionId);
      setUsuarios(list.data || []);
    } catch (e) {
      console.error("Error al cargar usuarios asignables:", e);
      message.error(e.message || "Error al cargar usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };
  load();
}, [open, organizacionId]);


  const handleOk = async () => {
    try {
      const { user_id } = await form.validateFields();
      
      onSubmit(user_id);
    } catch (_) {}
  };

  return (
    <Modal
      title="Relacionar usuario"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="user_id" label="Usuario" rules={[{ required: true, message: "Selecciona un usuario" }]}>
          <Select
            loading={loadingUsers}
            showSearch
            placeholder="Busca por nombre de usuario o email"
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={(usuarios || []).map(u => ({ value: u.id, label: `${u.username} — ${u.email}` }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}