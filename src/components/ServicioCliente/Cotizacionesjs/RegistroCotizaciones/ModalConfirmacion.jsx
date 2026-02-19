import React, { useRef, useState, useMemo } from "react";
import { Modal, message } from "antd";

const ModalConfirmacion = ({
  visible,
  onConfirm,
  onCancel,
  data,
  clienteData,
  tipoMonedaSeleccionada,
  ivaSeleccionado,
  ivasData = [],
}) => {
  const [confirming, setConfirming] = useState(false);

  // 🔒 Lock inmediato (evita doble click ultra rápido antes del re-render)
  const lockRef = useRef(false);

  const moneda = useMemo(
    () => (tipoMonedaSeleccionada === 2 ? "USD" : "MXN"),
    [tipoMonedaSeleccionada]
  );

  const ivaPorcentaje = useMemo(() => {
    const found = ivasData.find((iva) => iva.id === ivaSeleccionado);
    return found?.porcentaje ?? 16;
  }, [ivasData, ivaSeleccionado]);

  const handleOk = async () => {
    // bloquea spam (por estado y por lock)
    if (confirming || lockRef.current) return;

    lockRef.current = true;
    setConfirming(true);

    try {
      // ⚠️ IMPORTANTE: onConfirm debe ser async y retornar Promise (con await en el padre)
      await onConfirm?.();
      // el padre normalmente cerrará el modal al terminar OK
    } catch (e) {
      console.error(e);
      message.error("No se pudo crear la cotización.");
    } finally {
      setConfirming(false);
      lockRef.current = false;
    }
  };

  return (
    <Modal
      title="Confirmar creación de cotización"
      open={visible}
      onOk={handleOk}
      onCancel={confirming ? undefined : onCancel}
      okText="Crear"
      cancelText="Cancelar"
      confirmLoading={confirming}
      okButtonProps={{ disabled: confirming }}
      cancelButtonProps={{ disabled: confirming }}
      maskClosable={!confirming}
      keyboard={!confirming}
      destroyOnClose
    >
      <p>¿Estás seguro de crear esta cotización?</p>

      {data && (
        <>
          <p>
            <strong>Cliente:</strong>{" "}
            {clienteData?.nombrePila || ""} {clienteData?.apPaterno || ""}
          </p>
          <p>
            <strong>Fecha Solicitud:</strong> {data?.fechaSolicitud || ""}
          </p>
          <p>
            <strong>Fecha Caducidad:</strong> {data?.fechaCaducidad || ""}
          </p>
          <p>
            <strong>Moneda:</strong> {moneda}
          </p>
          <p>
            <strong>Descuento:</strong> {data?.descuento ?? 0}%
          </p>
          <p>
            <strong>IVA:</strong> {ivaPorcentaje}%
          </p>
        </>
      )}
    </Modal>
  );
};

export default ModalConfirmacion;
