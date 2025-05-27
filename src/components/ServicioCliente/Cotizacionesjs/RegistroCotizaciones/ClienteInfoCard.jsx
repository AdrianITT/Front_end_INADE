import React from "react";
import { Card, Descriptions } from "antd";
import { IdcardOutlined, UserOutlined, MailOutlined, PhoneOutlined, MobileOutlined } from "@ant-design/icons";

const ClienteInfoCard = ({ clienteData, empresaData }) => {
  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
      bodyStyle={{ background: "#fff", padding: "24px" }}
      headStyle={{
        background: "#e6f7ff",
        borderRadius: "8px 8px 0 0",
        fontSize: 16,
        fontWeight: 600,
      }}
      title="Información del Cliente"
    >
      <Descriptions bordered layout="vertical" size="small" column={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
        <Descriptions.Item label={<><IdcardOutlined /> RFC</>}>
          {empresaData.rfc}
        </Descriptions.Item>
        <Descriptions.Item label={<><UserOutlined /> Representante</>} span={2}>
          {`${clienteData.nombrePila} ${clienteData.apPaterno} ${clienteData.apMaterno}`}
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined /> Correo</>}>
          {clienteData?.correo || "No disponible"}
        </Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined /> Teléfono</>}>
          {clienteData?.telefono || "No disponible"}
        </Descriptions.Item>
        <Descriptions.Item label={<><MobileOutlined /> Celular</>}>
          {clienteData?.celular || "No disponible"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ClienteInfoCard;
