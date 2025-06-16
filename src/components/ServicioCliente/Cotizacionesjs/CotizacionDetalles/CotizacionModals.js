// src/components/CotizacionModals.js
import React, { useState } from "react";
import { Modal, Form, Input, Checkbox, Button, Result, Select,Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { Text } = Typography;

export const ConfirmDuplicarModal = ({ visible, onCancel, onConfirm, cotizacionesCliente = [] }) => {
  const [selectedOption, setSelectedOption] = useState(null);


  const handleOk = () => {
    onConfirm(selectedOption); // enviamos el valor al componente padre
  };

  return (
    <Modal
      title="¿Confirmar duplicación?"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Sí, duplicar"
      cancelText="Cancelar"
    >
      <p>¿Estás seguro de que deseas duplicar esta cotización? Se creará una nueva con los mismos datos.</p>

      <Select
        showSearch
        placeholder="Selecciona una cotización del cliente"
        style={{ width: "100%", marginTop: "1rem" }}
        onChange={setSelectedOption}
        optionFilterProp="label"
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        options={cotizacionesCliente.map(cot => ({
          value: cot.id,
          label: `#${cot.nombreCompleto} - ${cot.empresa.nombre|| "Sin código"}`
        }))}
      />
    </Modal>
  );
};

export const SuccessDuplicarModal = ({ visible }) => (
  <Modal
    title="¡Cotización Duplicada!"
    open={visible}
    closable={false}
    footer={null}
  >
    <Text>La cotización fue duplicada exitosamente. Redirigiendo...</Text>
  </Modal>
);


export const SendEmailModal = ({
  visible,
  cotizacionInfo,
  handleCancel,
  extraEmails,
  setExtraEmails,
  handleSendEmail,
  loading,
}) => (
  <Modal
    title="Enviar Cotización"
    visible={visible}
    onCancel={handleCancel}
    footer={[
      <Button key="cancel" onClick={handleCancel}
       
       >
        Cerrar
      </Button>,
      <Button key="send" type="primary" onClick={handleSendEmail}
      loading={loading}>
        Enviar
      </Button>,
    ]}
  >
    <h4>Selecciona los correos a los que deseas enviar la cotización:</h4>
    <Form layout="vertical">
      <Checkbox defaultChecked>{cotizacionInfo?.correo || "N/A"}</Checkbox>
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

export const DeleteCotizacionModal=({
  visible,
  onCancel,
  onConfirm,
  loading=false,
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const handleOk = () => {
    if (confirmationText === "COTIZACION") {
      onConfirm();
    } else {
      alert("Por favor, escribe 'COTIZACION' para confirmar.");
    }
  }
  return (
    <Modal
      title="Confirmar eliminación"
      open={visible}               // coincide con los otros modales que usan `open`
      onOk={handleOk}
      onCancel={() => {
        setConfirmationText("");
        onCancel();
      }}
      okText="Eliminar"
      cancelText="Cancelar"
      confirmLoading={loading}
      okButtonProps={{ disabled: confirmationText !== "COTIZACION" }}
    >
      <p>
        ¿Está seguro de que desea eliminar esta cotización? Esta acción no se puede
        deshacer.
      </p>
      <p>
        <strong>Para confirmar, escriba <em>"COTIZACION"</em></strong>
      </p>
      <Input
        placeholder='Escribe "COTIZACION" para confirmar'
        value={confirmationText}
        onChange={(e) => setConfirmationText(e.target.value)}
      />
    </Modal>
  );
};
