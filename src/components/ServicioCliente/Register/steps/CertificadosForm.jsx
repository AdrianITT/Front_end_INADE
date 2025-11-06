import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Alert,
  Typography,
  Modal,
  message,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const CertificadosForm = ({
  form,
  handleSubmit,
  loading,
  csdActual,
  handleDeleteCsd,
}) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Mostrar modal de confirmación ---
  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  // --- Cancelar eliminación ---
  const handleDeleteCancel = () => {
    setIsModalVisible(false);
    setConfirmationText("");
  };

  // --- Confirmar eliminación ---
  const handleDeleteConfirm = async () => {
    if (confirmationText !== "ELIMINAR") {
      message.warning('Debe escribir "ELIMINAR" para confirmar.');
      return;
    }

    try {
      setDeleteLoading(true);
      await handleDeleteCsd(); // llamada prop externa
      message.success("CSD eliminado correctamente.");
    } catch (error) {
      message.error("Error al eliminar el CSD.");
    } finally {
      setDeleteLoading(false);
      setIsModalVisible(false);
      setConfirmationText("");
    }
  };

  return (
    <div className="csd-container" style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <Button
        type="text"
        className="back-button"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/configuracionorganizacion")}
        style={{ marginBottom: 16 }}
      />

      <Title level={3} className="csd-title" style={{ textAlign: "center" }}>
        Cargar Certificado de Sello Digital (CSD)
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="csd-form"
      >
        <Form.Item
          label="RFC:"
          name="rfc"
          rules={[{ required: true, message: "Ingrese su RFC." }]}
        >
          <Input placeholder="Ingrese su RFC" maxLength={13} />
        </Form.Item>

        <Form.Item
          label="Archivo .cer:"
          name="archivocer"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
          rules={[{ required: true, message: "Seleccione el archivo .cer." }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept=".cer">
            <Button icon={<UploadOutlined />}>Elegir archivo .cer</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Archivo .key:"
          name="archivokey"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
          rules={[{ required: true, message: "Seleccione el archivo .key." }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept=".key">
            <Button icon={<UploadOutlined />}>Elegir archivo .key</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Contraseña del CSD:"
          name="password"
          rules={[{ required: true, message: "Ingrese la contraseña del CSD." }]}
        >
          <Input.Password placeholder="Ingrese la contraseña" />
        </Form.Item>

        {/* --- ALERTA DE CSD ACTUAL --- */}
        {csdActual?.rfc && (
          <Alert
            type="success"
            message="✅ Certificado de Sello Digital cargado"
            description={
              <>
                <p>
                  <strong>RFC:</strong> {csdActual.rfc}
                </p>
                <p>Si deseas reemplazarlo, vuelve a subir los archivos y presiona “Cargar CSD”.</p>
              </>
            }
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* --- ALERTA DE CONSIDERACIONES --- */}
        <Alert
          message="Consideraciones"
          description={
            <ul>
              <li>Habilitado para facturar con IVA exento, tasa 0% y 16%.</li>
              <li>Zona Fronteriza Norte: tasas 0%, 8%, 16%.</li>
              <li>Zona Fronteriza Sur: tasas 0%, 8%, 16%.</li>
            </ul>
          }
          type="warning"
          className="csd-alert"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* --- BOTONES --- */}
        <div
          className="csd-buttons"
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          <Button type="primary" htmlType="submit" loading={loading}>
            Cargar CSD
          </Button>

          <Button danger onClick={showDeleteModal}>
            Eliminar CSD actuales
          </Button>
        </div>
      </Form>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      <Modal
        title="Confirmar eliminación"
        open={isModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Eliminar"
        cancelText="Cancelar"
        confirmLoading={deleteLoading}
        okButtonProps={{ disabled: confirmationText !== "ELIMINAR" }}
      >
        <p>
          ¿Está seguro de que desea eliminar el CSD actual?  
          Esta acción eliminará el CSD tanto en Facturama como en la base de datos.
        </p>
        <p>
          <strong>
            Para confirmar, escriba <em>"ELIMINAR"</em> en el campo a continuación:
          </strong>
        </p>
        <Input
          placeholder='Escriba "ELIMINAR" para confirmar'
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default CertificadosForm;
