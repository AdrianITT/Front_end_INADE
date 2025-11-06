import React from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Upload,
  Alert,
  Card,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { TextArea } = Input;

const InfoSistemaForm = ({
  formCotizacion,
  fromOrdenTrabajo,
  formConfiguracion,
  CotizacionPureva,
  tipoMoneda = [],
  iva = [],
  marcaAgua,
  infConfiguracion,
  loading,
}) => {
  // --- SECCIÓN 1: CONFIGURACIÓN DEL SISTEMA ---
  const renderConfiguracionSistema = () => (
    <div style={{ marginBottom: 50 }}>
      <Alert message="Los datos se podran editar mas adelante en el apartado de 'configuración', medida: 416 × 617." type="info" showIcon />
      {/* <br></br><h2>Configuración del Sistema</h2> */}
      <Form
        layout="vertical"
        form={formConfiguracion}
        initialValues={{
          ...infConfiguracion,
          tipoCambioDolar: infConfiguracion?.tipoCambioDolar ?? 18, // valor por defecto si no existe
        }}
        preserve={true}
      >
        <Form.Item
          name="tipoCambioDolar"
          hidden={true}
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </div>
  );

  // --- SECCIÓN 2: CONFIGURACIÓN DE COTIZACIONES ---
  const renderCotizaciones = () => (
    <div style={{ marginBottom: 50 }}>
      <h2>Formato de Cotización</h2>

      <div className="html-guide">
        <h3>Guía rápida de etiquetas HTML</h3>
        <p>
          Puedes aplicar formato al texto con etiquetas HTML:
        </p>
        <ul>
          <li>
            <strong>&lt;strong&gt;</strong>: <strong>negritas</strong>.
          </li>
          <li>
            <em>&lt;em&gt;</em>: <em>cursivas</em>.
          </li>
          <li>
            <code>&lt;code&gt;</code>: para código en línea.
          </li>
          <li>&lt;p&gt;: Párrafo independiente.</li>
          <li>&lt;ul&gt; y &lt;li&gt;: Listas con viñetas.</li>
        </ul>

        <p>Ejemplo:</p>
        <Card>
          <code>
            &lt;p&gt;Texto con &lt;strong&gt;negritas&lt;/strong&gt;,
            &lt;em&gt;cursivas&lt;/em&gt; y &lt;code&gt;código&lt;/code&gt;.&lt;/p&gt;
            <br />
            &lt;ul&gt;
            <br /> &lt;li&gt;Primer ítem&lt;/li&gt;
            <br /> &lt;li&gt;Segundo ítem&lt;/li&gt;
            <br /> &lt;/ul&gt;
          </code>
        </Card>
      </div>

      <Form
        layout="vertical"
        form={formCotizacion}
        initialValues={infConfiguracion || {}}
        preserve={true}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Nombre formato:"
              name="nombreFormato"
              normalize={(value) => (value === "" ? null : value)}
              rules={[{ message: "Ingrese el nombre del formato." }]}
            >
              <Input placeholder="Ingrese el nombre del formato." />
            </Form.Item>

            <Form.Item
              label="Versión de formato:"
              name="version"
              normalize={(value) => (value === "" ? null : value)}
              rules={[{ message: "Ingrese la versión del formato." }]}
            >
              <Input placeholder="Ejemplo: 3.2 o 1" />
            </Form.Item>

            <Form.Item
              label="Fecha de Emisión:"
              name="fechaEmision"
              normalize={(value) => (value === "" ? null : value)}
              rules={[{ message: "Ingrese la fecha de emisión." }]}
            >
              <Input placeholder="Ejemplo: 2025-08-09 AAAA-MM-DD." />
            </Form.Item>

            <Form.Item
              label="Título del documento:"
              name="tituloDocumento"
              rules={[{ required: true, message: "Ingrese el título del documento." }]}
            >
              <Input placeholder="Ingrese el título del documento." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Mensaje propuesta:"
              name="mensajePropuesta"
              rules={[{ required: true, message: "Ingrese el mensaje propuesto." }]}
            >
              <TextArea rows={4} placeholder="Ingrese el mensaje propuesto." />
            </Form.Item>

            <Form.Item
              label="Términos:"
              name="termino"
              rules={[{ required: true, message: "Ingrese los términos del documento." }]}
            >
              <TextArea rows={4} placeholder="Ingrese los términos." />
            </Form.Item>

            <Form.Item
              label="Avisos:"
              name="avisos"
              rules={[{ required: true, message: "Ingrese los avisos necesarios." }]}
            >
              <TextArea rows={4} placeholder="Ingrese los avisos." />
            </Form.Item>
          </Col>
        </Row>


        {/* <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Cotización
          </Button>
          <Button onClick={CotizacionPureva}>
            Generar Cotización de Prueba Formato Actual
          </Button>
        </div> */}
      </Form>
    </div>
  );

  // --- SECCIÓN 3: ORDENES DE TRABAJO ---
  const renderOrdenesTrabajo = () => (
    <div>
      <h2>Formato de Orden de Trabajo</h2>
      <Form
        layout="vertical"
        form={fromOrdenTrabajo}
        preserve={true}
      >
        <Form.Item
          label="Nombre del formato:"
          name="nombreFormato"
          normalize={(value) => (value === "" ? null : value)}
          rules={[{ message: "Ingrese el nombre del formato de OT." }]}
        >
          <Input placeholder="Ingrese el nombre del formato de OT." />
        </Form.Item>

        <Form.Item
          label="Versión del formato:"
          name="version"
          normalize={(value) => (value === "" ? null : value)}
          rules={[{ message: "Ingrese la versión del formato." }]}
        >
          <Input placeholder="Ejemplo: 3.2" />
        </Form.Item>

        <Form.Item
          label="Fecha de Emisión:"
          name="fechaEmision"
          normalize={(value) => (value === "" ? null : value)}
          rules={[{ message: "Ingrese la fecha de emisión." }]}
        >
          <Input placeholder="2025-09-08 AAAA-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Título del documento:"
          name="tituloDocumento"
          rules={[{ required: true, message: "Ingrese el título del documento." }]}
        >
          <Input placeholder="Ingrese el título del documento." />
        </Form.Item>

        <Alert
          message="Prefijo de OT"
          description="Este prefijo se mostrará al inicio de la OT. Ejemplo: 'A'230301-01"
          type="info"
          showIcon
        />
        <Form.Item label="Prefijo de OT" name="prefijo">
          <Input placeholder="Ejemplo: A" />
        </Form.Item>



        {/* <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Guardar Orden
        </Button> */}
      </Form>
    </div>
  );

  // --- RENDER GLOBAL ---
  return (
    <div style={{ padding: 20 }}>
      {renderConfiguracionSistema()}
      {renderCotizaciones()}
      {renderOrdenesTrabajo()}
    </div>
  );
};

export default InfoSistemaForm;
