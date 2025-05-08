import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, DatePicker, message, Form } from "antd";
import { getAllTipoCDFI } from "../../../apis/ApisServicioCliente/TipoCFDIApi";
import { getAllFormaPago } from "../../../apis/ApisServicioCliente/FormaPagoApi";
import { getAllMetodopago } from "../../../apis/ApisServicioCliente/MetodoPagoApi";

export default function ComprobantePago({ isOpen, onClose, Total }) {
  const [form] = Form.useForm();
  const [usoCfdiList, setUsoCfdiList] = useState([]);
  const [formaPagoList, setFormaPagoList] = useState([]);
  const [metodoPagoList, setMetodoPagoList] = useState([]);

  useEffect(() => {
    obtenerUsoCfdi();
    obtenerFormaPago();
    obtenerMetodoPago();
    // Establece el valor inicial del campo "total" al valor recibido por la prop
    form.setFieldsValue({ total: Total, montoPendiente: Total });
  }, [Total, form]);

  // Obtener Uso CFDI
  const obtenerUsoCfdi = async () => {
    try {
      const response = await getAllTipoCDFI();
      setUsoCfdiList(response.data);
    } catch (error) {
      console.error("Error al obtener Tipo CFDI", error);
      message.error("Error al obtener Tipo CFDI.");
    }
  };

  // Obtener Forma de Pago
  const obtenerFormaPago = async () => {
    try {
      const response = await getAllFormaPago();
      setFormaPagoList(response.data);
    } catch (error) {
      console.error("Error al obtener Forma de Pago", error);
      message.error("Error al obtener Forma de Pago.");
    }
  };

  // Obtener Método de Pago
  const obtenerMetodoPago = async () => {
    try {
      const response = await getAllMetodopago();
      setMetodoPagoList(response.data);
    } catch (error) {
      console.error("Error al obtener Método de Pago", error);
      message.error("Error al obtener Método de Pago.");
    }
  };

  // Manejo del envío del formulario
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      //console.log("Datos enviados:", values);
      message.success("Comprobante generado exitosamente");
      form.resetFields();
      onClose();
    } catch (errorInfo) {
      console.error("Error en formulario:", errorInfo);
    }
  };

  return (
    <Modal
      title="Comprobante de pago"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cerrar
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Generar Comprobante
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ total: Total, montoPagar: 0, montoPendiente: Total }}
        onValuesChange={(changedValues, allValues) => {
          // Si cambia el total o el monto a pagar, se recalcula el monto pendiente
          const total = parseFloat(allValues.total) || 0;
          const montoPagar = parseFloat(allValues.montoPagar) || 0;
          form.setFieldsValue({
            montoPendiente: total - montoPagar,
          });
        }}
      >
        {/* Fecha de Pago */}
        <Form.Item
          label="Fecha de Pago"
          name="paymentDate"
          rules={[{ required: true, message: "Selecciona una fecha de pago" }]}
        >
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        {/* Uso CFDI */}
        <Form.Item
          label="Tipo CFDI"
          name="tipoCfdi"
          rules={[{ required: true, message: "Selecciona el Uso CFDI" }]}
        >
          <Select placeholder="Selecciona uso CFDI">
            {usoCfdiList?.map((uso) => (
              <Select.Option key={uso.id} value={uso.id}>
                {uso.codigo} - {uso.descripcion}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Forma de Pago */}
        <Form.Item
          label="Forma de Pago"
          name="formaPago"
          rules={[{ required: true, message: "Selecciona la Forma de Pago" }]}
        >
          <Select placeholder="Selecciona forma de pago">
            {formaPagoList?.map((pago) => (
              <Select.Option key={pago.id} value={pago.id}>
                {pago.codigo} - {pago.descripcion}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Total (campo de solo lectura) */}
        <Form.Item label="Total" name="total">
          <Input type="number" disabled />
        </Form.Item>

        {/* Monto a pagar */}
        <Form.Item
          label="Monto a pagar"
          name="montoPagar"
          rules={[{ required: true, message: "Ingresa el monto a pagar" }]}
        >
          <Input type="number" placeholder="Ingrese el monto a pagar" />
        </Form.Item>

        {/* Método de Pago */}
        <Form.Item
          label="Método de Pago"
          name="metodoPago"
          rules={[{ required: true, message: "Selecciona el Método de Pago" }]}
        >
          <Select placeholder="Selecciona método de pago">
            {metodoPagoList?.map((metodo) => (
              <Select.Option key={metodo.id} value={metodo.id}>
                {metodo.codigo} - {metodo.descripcion}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Monto pendiente (campo calculado) */}
        <Form.Item label="Monto pendiente" name="montoPendiente">
          <Input type="number" placeholder="Monto pendiente" disabled />
        </Form.Item>

        {/* Referencia */}
        <Form.Item
          label="Referencia"
          name="reference"
          rules={[{ required: true, message: "Ingresa una referencia" }]}
        >
          <Input type="text" placeholder="Ingrese la referencia" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
