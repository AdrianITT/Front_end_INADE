import { Form, Alert, Upload,Button} from "antd";
import {  UploadOutlined } from '@ant-design/icons';

const MarcaAguaForm = ({
     form,
     handleFinish,
}) => {
  return (
    <Form 
    form={form}
    onFinish={handleFinish}
    preserve={true}
    layout="vertical">
      <Alert
            message="Advertencia"
            description="Solo Imagenes con la extencion PNG o JPG."
            type="warning"
            showIcon
          />
          <br/>
          <Form.Item
          label="Marca de agua:"
          name="marcaAgua"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
          if (Array.isArray(e)) return e;
          return e?.fileList;
          }}
          rules={[{ required: true, message: "Por favor sube una imagen PNG o JPG." }]}
          >
          <Upload
          listType="picture"
          beforeUpload={() => false} // ❗ Evita subir automáticamente al servidor
          accept=".png,.jpg,.jpeg,.webp"
          >
          <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
          </Upload>
          </Form.Item>
    </Form>
  );
};

export default MarcaAguaForm;
