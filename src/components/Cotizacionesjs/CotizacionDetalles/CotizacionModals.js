// src/components/CotizacionModals.js
import React from "react";
import { Modal, Form, Input, Checkbox, Button, Result, Select } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export const SendEmailModal = ({
  visible,
  handleCancel,
  extraEmails,
  setExtraEmails,
  handleSendEmail,
}) => (
  <Modal
    title="Enviar Cotización"
    visible={visible}
    onCancel={handleCancel}
    footer={[
      <Button key="cancel" onClick={handleCancel}>
        Cerrar
      </Button>,
      <Button key="send" type="primary" onClick={handleSendEmail}>
        Enviar
      </Button>,
    ]}
  >
    <h4>Selecciona los correos a los que deseas enviar la cotización:</h4>
    <Form layout="vertical">
      <Checkbox defaultChecked>Correo predeterminado</Checkbox>
      <Form.Item label="Correos adicionales (separados por coma):">
        <Input
          placeholder="ejemplo@correo.com, otro@correo.com"
          value={extraEmails}
          onChange={(e) => setExtraEmails(e.target.value)}
        />
      </Form.Item>
    </Form>
  </Modal>
);

export const EditCotizacionModal = ({
  visible,
  handleEditOk,
  handleEditCancel,
  form,
  ivaOptions,
  tipoMonedaOptions,
}) => (
  <Modal
    title="Editar Cotización"
    visible={visible}
    onOk={handleEditOk}
    onCancel={handleEditCancel}
    okText="Guardar"
    cancelText="Cancelar"
  >
    <Form form={form} layout="vertical">
      <Form.Item
        label="Fecha de Solicitud"
        name="fechaSolicitud"
        rules={[{ required: true, message: "Por favor ingrese la fecha de solicitud" }]}
      >
        <Input type="date" />
      </Form.Item>
      <Form.Item
        label="Fecha de Caducidad"
        name="fechaCaducidad"
        rules={[{ required: true, message: "Por favor ingrese la fecha de caducidad" }]}
      >
        <Input type="date" />
      </Form.Item>
      <Form.Item
        label="Descuento"
        name="descuento"
        rules={[{ required: true, message: "Por favor ingrese el descuento" }]}
      >
        <Input type="number" min={0} max={100} />
      </Form.Item>
      <Form.Item
        label="IVA"
        name="iva"
        rules={[{ required: true, message: "Por favor seleccione el IVA" }]}
      >
        <Select>
          {ivaOptions.map((iva) => (
            <Select.Option key={iva.id} value={iva.id}>
              {(iva.porcentaje * 100)}%
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Tipo de Moneda"
        name="tipoMoneda"
        rules={[{ required: true, message: "Por favor seleccione el tipo de moneda" }]}
      >
        <Select>
          {tipoMonedaOptions.map((moneda) => (
            <Select.Option key={moneda.id} value={moneda.id}>
              {moneda.codigo} - {moneda.descripcion}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  </Modal>
);

export const ResultModal = ({
  visible,
  resultStatus,
  resultMessage,
  handDuoModal,
}) => (
  <Modal
    title={resultStatus === "success" ? "Éxito" : "Error"}
    visible={visible}
    onCancel={handDuoModal}
    footer={[
      <Button key="close" onClick={handDuoModal}>
        Cerrar
      </Button>,
    ]}
  >
    <Result title={<p style={{ color: resultStatus === "success" ? "green" : "red" }}>{resultMessage}</p>} />
  </Modal>
);
