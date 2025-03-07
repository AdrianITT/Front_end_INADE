import React, { useState, useMemo } from "react";
import { Button, Input, Upload, Form, Typography, Alert, message, Modal } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Api_Host } from "../../apis/api";
import { createCSD } from "../../apis/csdApi";

import "./CargarCSD.css";

const { Title } = Typography;

const CargarCSD = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener el ID de la organización una sola vez desde localStorage
  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  // Función para enviar el formulario de carga del CSD
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append("rfc", values.rfc);
      formData.append("contrasenia", values.password);
      formData.append("Organizacion", organizationId);

      if (values.archivocer?.length > 0) {
        formData.append("archivocer", values.archivocer[0].originFileObj);
      } else {
        throw new Error("⚠ Debes seleccionar un archivo .cer.");
      }

      if (values.archivokey?.length > 0) {
        formData.append("archivokey", values.archivokey[0].originFileObj);
      } else {
        throw new Error("⚠ Debes seleccionar un archivo .key.");
      }

      // Verificar los datos enviados (opcional)
      /*
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }*/

      // Enviar los datos a la API
      const response = await createCSD(formData);

      if (response.status === 201 || response.status === 200) {
        message.success("✅ Certificado de Sello Digital (CSD) guardado correctamente.");
        form.resetFields();
        // Puedes actualizar el estado o realizar otra acción si es necesario
        const responseCSD = await axios.get(
          `${Api_Host.defaults.baseURL}/carga-csd/${organizationId}/`
        );
        //console.log("📌 Datos del CSD recién creado:", responseCSD.data);
      } else {
        throw new Error("⚠ Error en la carga del CSD.");
      }
    } catch (error) {
      console.error("❌ Error al insertar el CSD:", error);
      message.error(error.message || "Hubo un error al insertar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal de eliminación
  const showDeleteModal = () => {
    setIsModalVisible(true);
  };

  // Función para cancelar la eliminación
  const handleDeleteCancel = () => {
    setIsModalVisible(false);
    setConfirmationText("");
  };

  // Función para confirmar la eliminación
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      // Se asume que la vista borrar_csd está expuesta en la URL: /borrar-csd/<organizacion_id>/
      const response = await axios.get(
        `${Api_Host.defaults.baseURL}/borrar-csd/${organizationId}/`
      );

      if (response.data.message) {
        message.success(response.data.message);
      } else if (response.data.error) {
        message.error(response.data.error);
      }
    } catch (error) {
      console.error("Error al borrar el CSD:", error);
      message.error("❌ Error al borrar el CSD.");
    } finally {
      setDeleteLoading(false);
      setIsModalVisible(false);
      setConfirmationText("");
    }
  };

  return (
    <div className="csd-container">
      <Button type="text" className="back-button" onClick={()=>navigate("/configuracionorganizacion")}><ArrowLeftOutlined /></Button>

      <Title level={3} className="csd-title">
        Cargar Certificado de Sello Digital (CSD)
      </Title>

      <Form form={form} layout="vertical" onFinish={handleSubmit} className="csd-form">
        <Form.Item
          label="RFC:"
          name="rfc"
          rules={[{ required: true, message: "Ingrese su RFC." }]}
        >
          <Input placeholder="Ingrese su RFC" />
        </Form.Item>

        <Form.Item
          label="Archivo .cer:"
          name="archivocer"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
          rules={[{ required: true, message: "Seleccione el archivo .cer." }]}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Elegir archivo</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Archivo .key:"
          name="archivokey"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
          rules={[{ required: true, message: "Seleccione el archivo .key." }]}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Elegir archivo</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Contraseña del CSD:"
          name="password"
          rules={[{ required: true, message: "Ingrese la contraseña del CSD." }]}
        >
          <Input.Password placeholder="Ingrese la contraseña" />
        </Form.Item>

        <Alert
          message="Consideraciones"
          description={
            <>
              <ul>
                <li>Habilitado para facturar (IVA exento, tasa 0% y 16%).</li>
                <li>
                  Habilitado para facturar (IVA exento, tasa 0%, 8% y 16%) Zona Fronteriza Norte.
                </li>
                <li>
                  Habilitado para facturar (IVA exento, tasa 0%, 8% y 16%) Zona Fronteriza Sur.
                </li>
              </ul>
            </>
          }
          type="warning"
          className="csd-alert"
        />

        <div className="csd-buttons">
          <Button type="primary" htmlType="submit" loading={loading}>
            Cargar CSD
          </Button>
          <Button type="danger" onClick={showDeleteModal}>
            Eliminar CSD actuales
          </Button>
        </div>
      </Form>

      {/* Modal de doble confirmación para eliminar el CSD */}
      <Modal
        title="Confirmar eliminación"
        visible={isModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Eliminar"
        cancelText="Cancelar"
        confirmLoading={deleteLoading}
        okButtonProps={{ disabled: confirmationText !== "ELIMINAR" }}
      >
        <p>
          ¿Está seguro de que desea eliminar el CSD actual? Esta acción eliminará el CSD tanto en Facturama
          como en la base de datos.
        </p>
        <p>
          <strong>
            Para confirmar, escriba <em>"ELIMINAR"</em>
          </strong>
        </p>
        <Input
          placeholder='Escribe "ELIMINAR" para confirmar'
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default CargarCSD;
