import { createCSD } from "../../apis/csdApi";
import React, { useState, useMemo } from "react";
import { Button, Input, Upload, Form, Typography, Alert, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./CargarCSD.css";
import { Link } from "react-router-dom";
import { Api_Host } from "../../apis/api";
import axios from "axios";

const { Title } = Typography;

const CargarCSD = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // Obtener el ID de la organización una sola vez
    const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // ✅ Manejo del envío del formulario
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
  
      // 📌 Crear FormData para enviar archivos
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
  
      // 📌 Verificar qué datos se están enviando
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }
  
      // 📌 Enviar los datos a la API
      const response = await createCSD(formData);
      //console.log(response.data.id);
      //const id=response.data.id;
  
      if (response.status === 201 || response.status === 200) {
        message.success("✅ Certificado de Sello Digital (CSD) guardado correctamente.");
        form.resetFields(); // Limpiar formulario después de guardar
        //console.log(id);
        const responseCSD = await axios.get(`${Api_Host.defaults.baseURL}/carga-csd/${organizationId}/`);

        console.log("📌 Datos del CSD recién creado:", responseCSD.data);
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
  

  return (
    <div className="csd-container">
      <Link to="/">
        <Button type="text" className="back-button">←</Button>
      </Link>

      <Title level={3} className="csd-title">
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
                <li>Habilitado para facturar (IVA exento, tasa 0%, 8% y 16%) Zona Fronteriza Norte.</li>
                <li>Habilitado para facturar (IVA exento, tasa 0%, 8% y 16%) Zona Fronteriza Sur.</li>
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
          <Button type="danger" disabled>
            Eliminar CSD actuales
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CargarCSD;
