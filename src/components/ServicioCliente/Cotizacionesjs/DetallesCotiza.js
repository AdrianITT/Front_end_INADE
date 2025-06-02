// src/pages/CotizacionDetalles.js
import React, { useState, useMemo, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Typography, Spin, Menu, message, Modal } from "antd";
import { MailTwoTone,
  EditTwoTone, 
  CheckCircleTwoTone, 
  FilePdfTwoTone,
  CopyTwoTone,
  CloseCircleTwoTone }
   from "@ant-design/icons";
import { Api_Host } from "../../../apis/api";
import { useCotizacionDetails } from "../Cotizacionesjs/CotizacionDetalles/useCotizacionDetails";
import ServiciosTable from "../Cotizacionesjs/CotizacionDetalles/ServiciosTable";
import CotizacionInfoCard from "../Cotizacionesjs/CotizacionDetalles/CotizacionInfoCard";
import { SendEmailModal, EditCotizacionModal, ResultModal,SuccessDuplicarModal,ConfirmDuplicarModal,DeleteCotizacionModal } from "../Cotizacionesjs/CotizacionDetalles/CotizacionModals";
import { updateCotizacion, getDuplicarCotizacion, deleteCotizacion} from "../../../apis/ApisServicioCliente/CotizacionApi";
import {getUserById}from "../../../apis/ApisServicioCliente/UserApi";
import "./cotizar.css";
import { descifrarId, cifrarId } from "../secretKey/SecretKey";
import { validarAccesoPorOrganizacion } from "../validacionAccesoPorOrganizacion";
import { getAllcotizacionesdata } from "../../../apis/ApisServicioCliente/CotizacionApi";

const { Title, Text } = Typography;

const CotizacionDetalles = () => {
  const { ids } = useParams();
  const id=descifrarId(ids);
  const navigate = useNavigate();
  
  // Estados para modales y resultados
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [extraEmails, setExtraEmails] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success");
  const [, setCotizacionInfo] = useState([]);
  const [loadingtwo, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [isDuplicarModalVisible, setIsDuplicarModalVisible] = useState(false);
  const [isDuplicarSuccessModalVisible, setIsDuplicarSuccessModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loadings, setLoadings] = useState(false);
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  
  
  // Obtenemos datos de la cotización mediante nuestro custom hook
  const { cotizacionesCliente, cotizacionInfo, servicios, tipoMoneda, tipoCambioDolar, loading,refetch } = useCotizacionDetails(id);
  
  // Calcular si es USD y el factor de conversión
  const esUSD = tipoMoneda?.id === 2;
  const factorConversion = esUSD ? tipoCambioDolar : 1;

  useEffect(() => {
    const verificar = async () => {
      console.log(id);
      const acceso = await validarAccesoPorOrganizacion({
        fetchFunction: getAllcotizacionesdata,
        organizationId,
        id,
        campoId: "Cotización",
        navigate,
        mensajeError: "Acceso denegado a esta precotización.",
      });
      console.log(acceso);
      if (!acceso) return;
    };

    verificar();
  }, [organizationId, id]);

  const handleDownloadPDF = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      window.open(`${Api_Host.defaults.baseURL}/cotizacion/${id}/pdf`);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const updateEstadoCotizacion = async (nuevoEstado) => {
    try {
      setLoadings(true);
      const response = await updateCotizacion(id, { estado: nuevoEstado });
      setCotizacionInfo(response.data);
      refetch();
      message.success("Estado actualizado correctamente");
      setLoadings(false);
    } catch (error) {
      console.error("Error al actualizar el estado de la cotización", error);
      message.error("Error al actualizar el estado de la cotización");
    }
  };
  

  //ENVIAR CORREO
  const handleSendEmail = async () => {
      setEmailLoading(true);
      try {
          const user_id = localStorage.getItem("user_id");
          if (!user_id) {
              setResultStatus("error");
              setResultMessage("No se encontró el ID del usuario.");
              setIsResultModalVisible(true);
              setLoading(false);
              return;
          }
  
          // Validar que los correos ingresados sean correctos
          const emailList = extraEmails.split(",").map(email => email.trim()).filter(email => email);
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const invalidEmails = emailList.filter(email => !emailRegex.test(email));
  
          if (invalidEmails.length > 0) {
              setResultStatus("error");
              setResultMessage(`Correos inválidos: ${invalidEmails.join(", ")}`);
              setIsResultModalVisible(true);
              setLoading(false);
              return;
          }
          const emailQuery = emailList.length > 0 ? `&emails=${encodeURIComponent(emailList.join(","))}` : "";
  
          const response = await fetch(`${Api_Host.defaults.baseURL}/cotizacion/${id}/pdf/enviar?user_id=${user_id}${emailQuery}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
          });
  
          if (response.ok) {
              const result = await response.text();
              setResultStatus("success");
              setResultMessage(result || "Correo enviado exitosamente.");
          } else {
              setResultStatus("error");
              setResultMessage("Error al enviar el correo.");
          }
      } catch (error) {
        console.error("Error al enviar el correo:", error);
        setResultStatus("error");
        setResultMessage("Hubo un error al enviar el correo.");
    } finally {
        setIsResultModalVisible(true);
        setEmailLoading(false);
    }
  };
  
  const handleDuplicarCotizacion = async (clienteIdSeleccionado) => {
    setLoading(true);
    try {
      const idLocalUser = localStorage.getItem("user_id")
      const userResponse = await getUserById(idLocalUser);
      const nombreusuario=`${userResponse.data.first_name} ${userResponse.data.last_name}`;
      console.log("Nombre de usuario:", nombreusuario); 
      //console.log("Duplicando con opción:", clienteIdSeleccionado);
      const idCliente=clienteIdSeleccionado; // úsala aquí si lo necesitas
      const response = await getDuplicarCotizacion(id,idCliente,nombreusuario );
      const duplicatedId = response.data.nueva_cotizacion_id;
  
      setIsDuplicarSuccessModalVisible(true);
      setTimeout(() => {
        setIsDuplicarSuccessModalVisible(false);
        navigate(`/detalles_cotizaciones/${cifrarId(duplicatedId)}`);
      }, 3000);
    } catch (error) {
      console.error("Error al duplicar la cotización", error);
      message.error("Error al duplicar la cotización");
    } finally {
      setLoading(false);
    }
  };  
  const showDeleteModal = (id) => {
    setSelectedId(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setSelectedId(null);
    navigate("/cotizar");
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteCotizacion(selectedId);
      message.success("Cotización eliminada");
      handleDeleteCancel();
    } catch (err) {
      message.error("Error al eliminar");
    } finally {
      setDeleteLoading(false);
    }
  };

  
  // Definición del menú de acciones (enviar correo, editar, actualizar estado, ver PDF)
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<MailTwoTone />} onClick={() => setIsModalVisible(true)}>
        Enviar por correo
      </Menu.Item>
      <Menu.Item key="3" icon={<EditTwoTone />} onClick={() => navigate(`/EditarCotizacion/${cifrarId(id)}`)}>
        Editar
      </Menu.Item>
      <Menu.Item key="4" icon={<CheckCircleTwoTone />} onClick={() => { updateEstadoCotizacion(2) }}>
        Actualizar estado
      </Menu.Item>
      <Menu.Item key="5" icon={<FilePdfTwoTone />} onClick={handleDownloadPDF}>
        Ver PDF
      </Menu.Item>
      <Menu.Item key="6" icon={<CopyTwoTone />} onClick={() => setIsDuplicarModalVisible(true)}>
        Duplicar
      </Menu.Item>
      <Menu.Item key="7" icon={<CloseCircleTwoTone twoToneColor="#eb2f96"/> } onClick={() => showDeleteModal(id)}>
        Eliminar Cotización 
      </Menu.Item>
    </Menu>
  );
  

  
  return (
    <Spin spinning={loading|| emailLoading}>
      <div className="cotizacion-detalles-container">
        <div>
          <h1>Detalles de la Cotización {cotizacionInfo.numero} Proyecto</h1>
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
        </Tabs>
        
        <SendEmailModal 
          visible={isModalVisible} 
          cotizacionInfo={cotizacionInfo}
          handleCancel={() => setIsModalVisible(false)} 
          extraEmails={extraEmails} 
          setExtraEmails={setExtraEmails} 
          handleSendEmail={handleSendEmail}
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
        <ConfirmDuplicarModal
          visible={isDuplicarModalVisible}
          cotizacionesCliente={cotizacionesCliente}
          onCancel={() => setIsDuplicarModalVisible(false)}
          onConfirm={async (selectedOption) => {
            setIsDuplicarModalVisible(false);
            await handleDuplicarCotizacion(selectedOption);
          }}
        />
              
        <DeleteCotizacionModal
        visible={deleteModalVisible}
        loading={deleteLoading}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        />

        <SuccessDuplicarModal visible={isDuplicarSuccessModalVisible} />


      </div>
    </Spin>
  );
};

export default CotizacionDetalles;
