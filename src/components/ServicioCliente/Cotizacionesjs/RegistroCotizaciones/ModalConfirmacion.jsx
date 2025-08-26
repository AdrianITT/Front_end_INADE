import React, {useState} from "react";
import { Modal, message } from "antd";

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
    const [confirming, setConfirming] = useState(false);

  const handleOk = async () => {
    if (confirming) return;     // evita doble clic
    setConfirming(true);
    try {
      await onConfirm?.();      // el padre cierra el modal si todo sale bien
    } catch (e) {
      message.error("No se pudo crear la cotización.");
    } finally {
      setConfirming(false);     // si el padre no cerró, re-habilita el botón
    }
  };
  const moneda = tipoMonedaSeleccionada === 2 ? "USD" : "MXN";
  const ivaPorcentaje = ivasData.find((iva) => iva.id === ivaSeleccionado)?.porcentaje || 16;

  return (
    <Modal
      title="Confirmar creación de cotización"
      open={visible}
      onOk={handleOk}
      onCancel={confirming ? undefined : onCancel}
      okText="Crear"
      cancelText="Cancelar"
      confirmLoading={confirming}     // <-- spinner en botón OK
      maskClosable={!confirming}      // evita cerrar con click en el fondo
      keyboard={!confirming}          // evita cerrar con Esc durante confirmación
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
