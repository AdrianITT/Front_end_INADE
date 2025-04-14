// src/components/modals/ErrorModal.js
import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const ErrorModal = ({ visible, onClose, message }) => {
  return (
    <Modal
      title={<span><ExclamationCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} /> Error</span>}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" danger onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ErrorModal;
