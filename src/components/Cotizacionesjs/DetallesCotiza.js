// src/pages/CotizacionDetalles.js
import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Tabs, Typography, Spin, Dropdown, Menu, Button } from "antd";
import { MailTwoTone, EditTwoTone, CheckCircleTwoTone, FilePdfTwoTone } from "@ant-design/icons";
import { Api_Host } from "../../apis/api";
import { useCotizacionDetails } from "../Cotizacionesjs/CotizacionDetalles/useCotizacionDetails";
import ServiciosTable from "../Cotizacionesjs/CotizacionDetalles/ServiciosTable";
import CotizacionInfoCard from "../Cotizacionesjs/CotizacionDetalles/CotizacionInfoCard";
import { SendEmailModal, EditCotizacionModal, ResultModal } from "../Cotizacionesjs/CotizacionDetalles/CotizacionModals";
import "./cotizar.css";

const { Title, Text } = Typography;

const CotizacionDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para modales y resultados
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [extraEmails, setExtraEmails] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success");
  
  // Obtenemos datos de la cotización mediante nuestro custom hook
  const { cotizacionInfo, servicios, tipoMoneda, tipoCambioDolar, loading } = useCotizacionDetails(id);
  
  // Calcular si es USD y el factor de conversión
  const esUSD = tipoMoneda?.id === 2;
  const factorConversion = esUSD ? tipoCambioDolar : 1;

  const handleDownloadPDF = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      window.open(`${Api_Host.defaults.baseURL}/cotizacion/${id}/pdf?user_id=${user_id}`);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };
  
  // Definición del menú de acciones (enviar correo, editar, actualizar estado, ver PDF)
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<MailTwoTone />} onClick={() => setIsModalVisible(true)}>
        Enviar por correo
      </Menu.Item>
      <Menu.Item key="3" icon={<EditTwoTone />} onClick={() => navigate(`/EditarCotizacion/${cotizacionInfo?.id}`)}>
        Editar
      </Menu.Item>
      <Menu.Item key="4" icon={<CheckCircleTwoTone />} onClick={() => { /* Actualizar estado */ }}>
        Actualizar estado
      </Menu.Item>
      <Menu.Item key="5" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF}>
        Ver PDF
      </Menu.Item>
    </Menu>
  );
  

  
  return (
    <Spin spinning={loading}>
      <div className="cotizacion-detalles-container">
        <div>
          <h1>Detalles de la Cotización {id} Proyecto</h1>
        </div>
        
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Detalles" key="1">
            <CotizacionInfoCard 
              cotizacionInfo={cotizacionInfo} 
              factorConversion={factorConversion} 
              esUSD={esUSD} 
              menu={menu}
            />
            <ServiciosTable 
              servicios={servicios} 
              factorConversion={factorConversion} 
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Documentos" key="2">
            <Title level={4}>Documentos relacionados</Title>
            <Text>No hay documentos disponibles.</Text>
          </Tabs.TabPane>
        </Tabs>
        
        <SendEmailModal 
          visible={isModalVisible} 
          handleCancel={() => setIsModalVisible(false)} 
          extraEmails={extraEmails} 
          setExtraEmails={setExtraEmails} 
          handleSendEmail={() => { /* Lógica para enviar correo */ }} 
        />
        
        <EditCotizacionModal 
          visible={isEditModalVisible} 
          handleEditOk={() => { /* Lógica para guardar edición */ }} 
          handleEditCancel={() => setIsEditModalVisible(false)} 
          form={null} // Si se necesita, pasar el form instance
          ivaOptions={[]} // Pasar opciones de IVA
          tipoMonedaOptions={[]} // Pasar opciones de moneda
        />
        
        <ResultModal 
          visible={isResultModalVisible} 
          resultStatus={resultStatus} 
          resultMessage={resultMessage} 
          handDuoModal={() => {
            setIsResultModalVisible(false);
            setExtraEmails("");
          }}
        />
      </div>
    </Spin>
  );
};

export default CotizacionDetalles;
