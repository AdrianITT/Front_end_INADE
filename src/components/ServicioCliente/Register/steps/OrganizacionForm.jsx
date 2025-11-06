import React, { useCallback, useState, useEffect} from "react";
import {
  Form,
  Input,
  Select,
  Spin,
  Upload,
  Button, Alert,
} from "antd";
import { getAllRegimenFiscal } from "../../../../apis/ApisServicioCliente/Regimenfiscla";
import {  UploadOutlined } from '@ant-design/icons';

const OrganizacionForm = ({
     form,
}) => {
     const [regimenfiscal, setRegimenFiscal]=useState([]); 
     const fetchRegimenFiscal = useCallback(async () => {
         try {
             const response = await getAllRegimenFiscal();
             setRegimenFiscal(response.data);
         } catch (error) {
             console.error("Error al cargar los regímenes fiscales", error);
         }
     }, []);
     useEffect(() => {
         fetchRegimenFiscal();
     }, [fetchRegimenFiscal]);

  return (
     <>
     <Alert message="Los datos se podran editar mas adelante en el apartado de 'configuracion'." type="info" showIcon />
     <br></br><h2>Información de la Organización</h2>
      <Form
        layout="vertical"
        className="form-container"
        form={form}
        preserve={true}
      >
        {/* === SECCIÓN 1: INFORMACIÓN GENERAL === */}
        <div>
          <Form.Item
            label="Nombre:"
            name="nombre"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el nombre de la organización.",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre de la organización." />
          </Form.Item>

          <div className="note" style={{ background: "#fafafa", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <p>
              El nombre del emisor ahora se debe registrar en MAYÚSCULAS y sin
              el régimen societario.
            </p>
            <p>
              Debe registrarse tal y como aparece en la Cédula de Identificación
              Fiscal (CIF) o Constancia de Situación Fiscal, respetando números,
              espacios y signos de puntuación.
            </p>
            <p>
              Ejemplo: <br />
              <code>
                Nombre o Razón Social: Empresa Importante S.A. DE C.V <br />
                Debe colocarse: EMPRESA IMPORTANTE <br />
                Nota: Esto aplica tanto para personas físicas como morales.
              </code>
            </p>
            <p>
              Clave del Registro Federal de Contribuyentes del Emisor (RFC).  
              Recuerda que debes tener cargados los certificados de sello digital (CSD).
            </p>
          </div>

          <Form.Item
            label="Slogan:"
            name="slogan"
            rules={[
              {
                required: true,
                message: "Por favor ingresa el slogan de la organización.",
              },
            ]}
          >
            <Input placeholder="Ingrese el slogan de la organización." />
          </Form.Item>

          <Form.Item
            label="Régimen Fiscal:"
            name="regimenFiscal"
            rules={[
              { required: true, message: "Ingrese su Régimen Fiscal." },
            ]}
          >
            <Select placeholder="Seleccione el régimen fiscal de la organización.">
              {regimenfiscal.map((regimen) => (
                <Select.Option key={regimen.id} value={regimen.id}>
                  {regimen.codigo} - {regimen.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Teléfono:"
            name="telefono"
            rules={[{ required: true, message: "Por favor ingresa el teléfono." }]}
          >
            <Input placeholder="Ingrese el teléfono de contacto." />
          </Form.Item>

          <Form.Item
            label="Página web:"
            name="pagina"
            rules={[
              { required: true, message: "Por favor ingresa la página web." },
            ]}
          >
            <Input placeholder="Ingrese la URL de la página web." />
          </Form.Item>
        </div>

        {/* === SECCIÓN 2: DIRECCIÓN Y BOTÓN CSD === */}
        <div style={{ marginTop: 24 }}>

          <Form.Item
            label="Calle:"
            name="calle"
            rules={[{ required: true, message: "Ingrese la calle." }]}
          >
            <Input placeholder="Ingrese la calle de la dirección." />
          </Form.Item>

          <Form.Item
            label="Número:"
            name="numero"
            rules={[{ required: true, message: "Ingrese el número." }]}
          >
            <Input placeholder="Ingrese el número exterior o interior." />
          </Form.Item>

          <Form.Item
            label="Colonia:"
            name="colonia"
            rules={[{ required: true, message: "Ingrese la colonia." }]}
          >
            <Input placeholder="Ingrese la colonia de la organización." />
          </Form.Item>

          <Form.Item
            label="Ciudad:"
            name="ciudad"
            rules={[{ required: true, message: "Ingrese la ciudad." }]}
          >
            <Input placeholder="Ingrese la ciudad." />
          </Form.Item>

          <Form.Item
            label="Código Postal:"
            name="codigoPostal"
            rules={[
              { required: true, message: "Ingrese el código postal." },
            ]}
          >
            <Input placeholder="Ingrese el código postal." />
          </Form.Item>

          <Form.Item
            label="Estado:"
            name="estado"
            rules={[{ required: true, message: "Ingrese el estado." }]}
          >
            <Input placeholder="Ingrese el estado." />
          </Form.Item>
          <Alert
            message="Advertencia"
            description="Solo Imagenes con la extencion PNG.."
            type="warning"
            showIcon
          /><br/>
          <Form.Item
          label="Logo Actual:"
          name="logo"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
          if (Array.isArray(e)) return e;
          return e?.fileList;
          }}
          rules={[{ required: true, message: "Por favor sube una imagen PNG." }]}
          >
          <Upload
          name="logo"
          listType="picture"
          beforeUpload={() => false} // ❗ Evita subir automáticamente al servidor
          accept=".png"
          >
          <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
          </Upload>
          </Form.Item>
        </div>
      </Form>
     </>
  );
};

export default OrganizacionForm;
