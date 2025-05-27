import React from "react";
import { Modal } from "antd";

const ModalConfirmacion = ({
  visible,
  onConfirm,
  onCancel,
  data,
  clienteData,
  tipoMonedaSeleccionada,
  ivaSeleccionado,
  ivasData,
}) => {
  const moneda = tipoMonedaSeleccionada === 2 ? "USD" : "MXN";
  const ivaPorcentaje = ivasData.find((iva) => iva.id === ivaSeleccionado)?.porcentaje || 16;

  return (
    <Modal
      title="Confirmar creación de cotización"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Crear"
      cancelText="Cancelar"
    >
      <p>¿Estás seguro de crear esta cotización?</p>
      {data && (
        <>
          <p><strong>Cliente:</strong> {clienteData.nombrePila} {clienteData.apPaterno}</p>
          <p><strong>Fecha Solicitud:</strong> {data.fechaSolicitud}</p>
          <p><strong>Fecha Caducidad:</strong> {data.fechaCaducidad}</p>
          <p><strong>Moneda:</strong> {moneda}</p>
          <p><strong>Descuento:</strong> {data.descuento}%</p>
          <p><strong>IVA:</strong> {ivaPorcentaje}%</p>
        </>
      )}
    </Modal>
  );
};

export default ModalConfirmacion;
