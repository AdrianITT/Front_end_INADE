// DeleteConfirmModal.jsx
import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from "@ant-design/icons";
import './Empresa.css';


const DeleteConfirmModal = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <ExclamationCircleOutlined style={{ fontSize: "42px", color: "#faad14" }} />
          <p style={{ marginTop: "8px" }}>¿Estás seguro?</p>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ backgroundColor: "#f5222d", color: "#fff" }}>
          No, cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={onConfirm}>
          Sí, eliminar
        </Button>,
      ]}
      centered
    >
      <p style={{ textAlign: "center", marginBottom: 0 }}>
        ¡No podrás revertir esto!
      </p>
    </Modal>
  );
};

export default DeleteConfirmModal;
