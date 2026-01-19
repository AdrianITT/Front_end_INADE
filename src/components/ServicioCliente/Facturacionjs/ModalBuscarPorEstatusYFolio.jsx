import React, { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { searchFacturaStatusFolio } from "../../../apis/ApisServicioCliente/FacturaApi";

const { Option } = Select;

export default function ModalBuscarPorEstatusYFolio({ open, onClose }) {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ status: "all", folio: "" });
      setResult(null);
    }
  }, [open, form]);

  const status = Form.useWatch("status", form);
  const folio = Form.useWatch("folio", form);
  const isReady = Boolean(status) && String(folio || "").trim().length > 0;

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      const status = String(values.status);
      const folio = String(values.folio).trim(); // 👈 mejor string

      const res = await searchFacturaStatusFolio(status, folio);

      setResult(res.data); // 👈 guardas el JSON tal cual
      message.success("Consulta realizada");
    } catch (err) {
      if (err?.errorFields) return;
      console.error(err);
      message.error("Error al consultar el backend");
    }
  };

  return (
    <Modal
      title="Buscar por estatus y folio"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={900}
    >
      <Form form={form} layout="vertical" initialValues={{ status: "all", folio: "" }}>
        <Form.Item label="Estatus" name="status" rules={[{ required: true }]}>
          <Select>
            <Option value="all">all</Option>
            <Option value="active">active</Option>
            <Option value="pending">pending</Option>
            <Option value="canceled">canceled</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Folio" name="folio" rules={[{ required: true }]}>
          <Input placeholder="Ej: 23 o FAC-000123" />
        </Form.Item>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cerrar</Button>
          <Button type="primary" onClick={handleSearch} disabled={!isReady}>
            Consultar
          </Button>
        </div>
      </Form>

      {/* ✅ Mostrar JSON tal cual */}
      {result && (
        <pre
          style={{
            marginTop: 16,
            background: "#fafafa",
            padding: 12,
            borderRadius: 8,
            maxHeight: 420,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </Modal>
  );
}
