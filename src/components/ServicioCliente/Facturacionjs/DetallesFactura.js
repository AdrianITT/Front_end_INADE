import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Button, Table, Tabs, Dropdown, Menu, Modal, Select, Input, Form, 
  DatePicker, Flex, Alert, Checkbox,message,Descriptions, Result, Spin, Space  } from "antd";
import { useParams, Link ,useNavigate } from "react-router-dom";
import { Text} from '@react-pdf/renderer';
import{FileTextTwoTone,MailTwoTone,FilePdfTwoTone,CloseCircleTwoTone, FileAddTwoTone, FileTwoTone} from "@ant-design/icons";
import { createPDFfactura, deleteFactura, getAllDataFactura, getAllDataPreFactura, getAllFacturaByOrganozacion, deleteFacturRenplasar  } from "../../../apis/ApisServicioCliente/FacturaApi";
import { getEmpresaById } from "../../../apis/ApisServicioCliente/EmpresaApi";
import { Api_Host } from "../../../apis/api";
import PaymentCards from "../Facturacionjs/FacturaPagos"
import { getAllFacturaPagos } from "../../../apis/ApisServicioCliente/FacturaPagosApi";
import {updatepachFactura, getFacturRespaldo, getFacturaNotaCredito, getRelationTypes} from "../../../apis/ApisServicioCliente/FacturaApi";
import {getOrganizacionById} from '../../../apis/ApisServicioCliente/organizacionapi';
//import axios from "axios";
import {  getAllfacturafacturama} from "../../../apis/ApisServicioCliente/FacturaFacturamaApi";
import { updateInfoSistemapatch } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import { confirmTipoCambioBanxicoSelects } from "./confirmarCambioBanxico/confirmarCambioBanxico";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import PDFpreFactura from "./Plantilla/PDFpreFactura";
import { PDFDownloadLink} from '@react-pdf/renderer';
import ComprobantePago from "./ModalComprobantePago";
import PopInputEditar from "./PopInputEditarFactura";
import "./estiloDetalleFactura.css";
import {NumerosALetras} from "numero-a-letras";
import { cifrarId, descifrarId } from "../secretKey/SecretKey";
import { validarAccesoPorOrganizacion } from "../validacionAccesoPorOrganizacion";
import AddendaModal from "./AddendaModal";
// import { modalGlobalConfig } from "antd/es/modal/confirm";
//import MenuItem from "antd/es/menu/MenuItem";


const { Option } = Select;

const DetallesFactura = () => {
  const { ids } = useParams();
  const id=descifrarId(ids);
  const facturaId=id;
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [factura, setFactura] = useState([]);
  const [visibleCancelModal, setVisibleCancelModal] = useState(false);
  const [visiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isModalVisibleCorreo, setIsModalVisibleCorreo] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [modalAddenda, setModalAddenda] = useState(false);
  const [moneda, setMoneda] = useState({ codigo: "", descripcion: "" });
  const [form] = Form.useForm();
  const [cliente, setCliente] = useState({});
  const [empresa, setEmpresa] = useState({}); // Estado para almacenar los datos de la empresa
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [porcentajeIVA, setPorcentajeIVA] = useState(0);
  const [importeTotal, setImporteTotal] = useState(0);
  const [facturaExiste, setFacturaExiste] = useState(null);
  const [extraEmails, setExtraEmails] = useState("");
  const [tipoCambioDolar, setTipoCambioDolar] = useState(0);
  const [ordenCodigo, setOrdenCodigo] = useState("");
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success"); // Puede ser "success" o "error"
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaPagos, setFacturaPagos] = useState([]);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [dataFactura, setDataFactura] = useState(null);
  const [dataLogo, setDataLogo] = useState(null);
  const [centavos, setCentavos] = useState("");
  const [centavostext, setCentavosText] = useState("");
  const [facturas, setFacturas] = useState([]);
  const [facturaReemplazoId, setFacturaReemplazoId] = useState(null);
  const [isRespaldoModalVisible, setIsRespaldoModalVisible] = useState(false);
  const [notaCredito, setNotaCredito] = useState(false);
  const [deleteFacturaReemplazo, setDeleteFacturaReemplazo] = useState(false);
  const [reemplazoActivo, setReemplazoActivo] = useState(false);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [relationtype,setRelationType]= useState([]);
  const [relationtypeId,setRelationTypeId]= useState(null);
  // Texto dinámico que aparece dentro del Modal de éxito
  const [modalText, setModalText] = useState(
    "La factura ha sido cancelada. Serás redirigido al listado de facturas."
  );
  
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  const esUSD = moneda.codigo === "USD";
  const factorConversion = esUSD ? tipoCambioDolar : 1;

  useEffect(() => {
    const verificar = async () => {
      // console.log(id);
      const acceso = await validarAccesoPorOrganizacion({
        fetchFunction: getAllFacturaByOrganozacion,
        organizationId,
        id,
        campoId: "id",
        navigate,
        mensajeError: "Acceso denegado a esta precotización.",
      });
      // console.log(acceso);
      if (!acceso) return;
    };

    verificar();
  }, [organizationId, id]);


  const typeVales=async()=>{
      try{
        const data=await getRelationTypes();
        const filtrados =(data.data ?? []).filter(item=> !["02","04","05","06","08","09"].includes(item.codigo));
        // console.log("data RelatiosTypes: ",filtrados);
        setRelationType(filtrados);
      }catch(error){ console.error("Error cargando RelationType:", error)}
    }


  useEffect(() => {
  if (isRespaldoModalVisible|| deleteFacturaReemplazo || setReemplazoActivo) {
    const orgId = parseInt(localStorage.getItem("organizacion_id"), 10);
    typeVales();
    if (orgId) {
      getAllFacturaByOrganozacion(orgId)
        .then(response => {
          const facturasFiltradas = response.data.filter(factura => factura.id !== parseInt(id,10));
          setFacturas(facturasFiltradas);  // ajusta según cómo devuelva los datos
          // console.log("id: ",id)
          // console.log("response factura:",facturasFiltradas);
        })
        .catch(err => console.error("Error cargando facturas:", err));
    }
  }
}, [isRespaldoModalVisible, id, deleteFacturaReemplazo, setReemplazoActivo]);

  
  const columnsConceptos = [
    {
      title: "Servicio",
      dataIndex: "servicio",  // Debe coincidir con la clave del objeto en `setServicios`
      key: "servicio",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Precio Unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      render: (valorEnMXN) => {
        // Convertimos al vuelo si es USD
        const convertido = (valorEnMXN).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (valorEnMXN) => {
        // Convertimos al vuelo si es USD
        const convertido = (valorEnMXN).toFixed(2);
        return `$${convertido} ${esUSD ? "USD" : "MXN"}`;
      },
    },
  ];

  const refreshPagos = async () => {
    try {
      const response = await getAllFacturaPagos(id);
      if (response.data && response.data.pagos && response.data.pagos.length > 0) {
        const ultimoPago = response.data.pagos[response.data.pagos.length - 1];
        setFacturaPagos(ultimoPago);
        //console.log("Último pago actualizado:", ultimoPago);
      } else {
        setFacturaPagos(null); // O lo que corresponda si no hay pagos
        //console.log("No hay pagos registrados.");
      }
    } catch (error) {
      console.error("Error al refrescar los pagos:", error);
    }
  };

  const fetchValue=async()=>{
      // console.log("organizationId",organizationId);
      const FacturasInicial = await getAllFacturaByOrganozacion(organizationId);  // 👈 trae todos los clientes
      
      // console.log("FacturasInicial",FacturasInicial);
      
      const idsPermitidos = FacturasInicial.data.map((c) => String(c.id));  // 👈 importante: convertir a string para comparación con URL
      // console.log("idsPermitidos",idsPermitidos);
  
      if (idsPermitidos.length > 0 && !idsPermitidos.includes(id)) {
        message.error("No tienes autorización para editar este cliente.");
        navigate("/no-autorizado");
        return;
      }
        
    }

  
  
  useEffect(() => {
    fetchValue();
    refreshPagos();
    // typeVales();
  }, [id]);
  const hasPagos = facturaPagos !== null;
  

  
    const verificarFacturaFacturama = async () => {
      try {
        const response = await getAllfacturafacturama();

    //console.log("📄 Datos recibidos:", response.data);
    //console.log("🔍 ID a buscar:", id);

    if (!id) {
      console.warn("⚠ El ID es inválido.");
      return;
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("⚠ No hay datos en la respuesta.");
      return;
    }

    const facturasFiltradas = response.data.filter(factura => factura.factura === parseInt(id, 10));

    //console.log("📝 Facturas filtradas:", facturasFiltradas);

    setFacturaExiste(facturasFiltradas.length > 0);
      } catch (error) {
        setFacturaExiste(false); // Si hay error, asumir que no existe
        console.warn("⚠ La factura no existe en FacturaFacturama.");
      }
    };
  useEffect(() => {
    const fetchTipoCambio = async () => {
      try {
        const response = await getInfoSistema();
        const tipoCambio = parseFloat(response.data[0].tipoCambioDolar);
        setTipoCambioDolar(tipoCambio);
      } catch (error) {
        console.error("Error al obtener el tipo de cambio del dólar", error);
      }
    };


    const fetchEmpresaInfo = async (empresaId) => {
      try {
        const response = await getEmpresaById(empresaId); // Obtener los datos de la empresa
        if (response.data) {
          setEmpresa(response.data); // Guardar los datos de la empresa en el estado
          //console.log("Empresa",response.data);
        }
      } catch (error) {
        console.error("Error al obtener la información de la empresa:", error);
      }
    }

    // Obtener los servicios relacionados con la orden de trabajo
    
    
    verificarFacturaFacturama()

    fetchTipoCambio();
  }, [id]);

  useEffect(() => {
    const fetchFacturaCompleta = async () => {
      try {
        setLoading(true);
        const response = await getAllDataFactura(id);
        const data = response.data;
        // console.log("Datos de la factura completa:", data);
        // Seteamos directamente los datos
        setFactura(data); // puedes eliminar este estado si solo usas los campos individuales
        setMoneda({ codigo: data.monedaCodigo.includes("USD") ? "USD" : "MXN", descripcion: data.monedaCodigo});
        setCliente({
          nombrePila: data.contacto.split(" ")[0],
          correo: data.correo
        });
        setEmpresa({ nombre: data.empresa, rfc: data.rfcEmpresa });
        setServicios(
          data.servicios.map(serv => ({
            key: serv.servicioId,
            servicio: serv.servicio.nombre,
            cantidad: serv.cantidad,
            precioUnitario: parseFloat(serv.precioUnitario),
            total: parseFloat(serv.subtotal) ,
          }))
        );
  
        setSubtotal(data.valores);
        setDescuento(parseFloat(data.valores.descuento));
        setPorcentajeIVA(parseFloat(data.valores.iva));
        setImporteTotal(parseFloat(data.valores.importe));
      } catch (error) {
        console.error("Error al obtener la factura completa:", error);
        message.error("No se pudo cargar la información de la factura.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchFacturaCompleta();
  }, [id]);
  

  useEffect(() => {
    const fetchData = async () => {
      const factura = await getAllDataPreFactura(id);
      const organizacion = await getOrganizacionById(organizationId);
      //console.log("Datos de la organización:", NumerosALetras(51));
      //console.log("Datos de la organización:", organizacion.data);
      // console.log("Datos de la factura:", factura.data);
      setDataFactura(factura.data);
      setDataLogo(organizacion.data);
      const total = parseFloat(factura.data.valores.totalFinal);
      const parteEntera = Math.floor(total);
      const centavos = Math.round((total - parteEntera) * 100);

      const letras = NumerosALetras(parteEntera)
        .replace('M.N.', '') // Elimina "M.N." si lo incluye
        .replace(/00\/100/g, '') // Elimina centavos si lo incluye
        .replace(/\s+/g, ' ') // Limpia espacios extra
        .trim();

      setCentavos(`${centavos.toString().padStart(2, '0')}/100`);
      setCentavosText(`${letras.toUpperCase()} `);
    };
    fetchData();
  }, []);
  

  const handleActualizar = async (data) => {
    setLoading(true);
    //console.log("Enviando al backend:", data);
    try {
      await updatepachFactura(id, data);
      //console.log("response: ",response);

      const refreshed = await getAllDataFactura(id);
      const det = refreshed.data;
      setFactura(det);
      setMoneda({ 
        codigo: det.monedaCodigo.includes("USD") ? "USD" : "MXN",
        descripcion: det.monedaCodigo 
      });
      message.success("Dato actualizado correctamente");
    } catch (error) {
      message.error("Error al actualizar");
    }finally{
      setLoading(false);
    }
  };

  const showModalCorreo = () => {
    setIsModalVisibleCorreo(true);
  };


  const handleOkPayment = () => {
    form.validateFields()
      .then((values) => {
        //console.log("Valores del comprobante de pago:", values);
        setVisiblePaymentModal(false);
      })
      .catch((error) => {
        console.error("Error en el formulario:", error);
      });
  };

  const base64ToPdf = (base64, filename = "acuse_cancelacion.pdf") => {
    if(!base64){
      message.error("No se recibió el PDF para descargar.");
      return false;
    }
    try{
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true; // ✅ Indica que la descarga fue lanzada
    }catch(error){
      console.error("Error al decodificar PDF:", error);
      message.error("Error al preparar el archivo PDF.");
      return false;
    }
};



  const handleCrearFactura = async () => {
    setLoading(true);
    try {
          if (String(moneda.descripcion).toUpperCase() === "USD") {
        // A) Llamada directa a Banxico (expone token y puede fallar por CORS)
        const rate = await confirmTipoCambioBanxicoSelects({
          token: "3487379dee962285e81cbbad6bea7ef19936271d8ec7fff95170cae223bdc144",
          serie: "SF43718",       // FIX
          daysBack: 60,
          // backendUrl: "/api/banxico/fix-range" // ← B) Mejor: tu backend proxy
        });
        let tipoCambio = rate ?? 1.0; // Si cancelan, usar 1.0 (no es ideal, pero evita bloquear)
        
        if (rate == null) return; // cancelado
        tipoCambio = rate;

        console.log("💱 Tipo de cambio obtenido:", tipoCambio);
        await updateInfoSistemapatch(1, { tipoCambioDolar: tipoCambio.toFixed(2) });
      }
      //console.log(id);
      const response = await createPDFfactura(id);
      // console.log("📄 Respuesta de la API:", response);
      
      // Verificar si la respuesta tiene la propiedad `success`
      if (response && response.success) {
        setFacturaExiste(true);
        //console.log("✅ Factura creada exitosamente en FacturaFacturama.", response);
        setResultMessage("Factura creada con éxito.");
        setResultStatus("success");
      } else {
        throw new Error("Error en la creación de factura: Respuesta no válida.");
      }
    } catch (error) {
      console.error("❌ Error al crear la factura:", error);
        // Si el error tiene respuesta del backend (por ejemplo con Axios)
    const apiMessage =
      error?.response?.data?.response?.Message;

    const modelState = error?.response?.data?.response?.ModelState;
    const detailedMessage = modelState
      ? Object.values(modelState)[0][0]   // primer mensaje de ModelState
      : null;

    const errorMessage =
      detailedMessage || apiMessage || error.message || "Error desconocido";

     // const errorMessages =error?.response?.data?.response?.ModelState.cfdiToCreate?.items?.[0]?.Taxes?.[0];
      //console.error("Error al crear la factura:", errorMessage);

      const cleanMessage = errorMessage.split("Ver más")[0].trim();
      setResultMessage(`Hubo un error: ${cleanMessage}`);

      //setResultMessage("Hubo un error al crear la factura. Inténtalo nuevamente.");
      setResultStatus("error");
    } finally {
      setLoading(false);
      setIsResultModalVisible(true); // Mostrar el modal con el resultado
    }
  };

  const handleDownloadPDF = async (id) => {
    setLoading(true);
    try {
      await delay(1500)
      const pdfUrl = `${Api_Host.defaults.baseURL}/factura-pdf/${id}/`;
      //console.log("📌 URL generada:", pdfUrl);
      //window.open(pdfUrl);
  
      // Realizar la solicitud para obtener el archivo PDF
      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudo descargar el PDF.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Factura_${factura.numerofactura}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("No se pudo descargar el PDF.");
    }finally{
      setLoading(false);
    }
  };
  
  const handleDownloadXML = async (id) => {
    setLoading(true);
    try {
      await delay(1500)
      const xmlUrl = `${Api_Host.defaults.baseURL}/factura-xml/${id}/`;
      //console.log("📌 URL generada para XML:", xmlUrl);
  
      // Realizar la solicitud para obtener el archivo XML
      const response = await fetch(xmlUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/xml",
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudo descargar el XML.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Factura_${factura.numerofactura}.xml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el XML:", error);
      message.error("No se pudo descargar el XML.");
    }finally{
      setLoading(false);
    }
  };

  //ENVIAR CORREO
  const handleSendEmail = async () => {
    setLoading(true);
    try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
            message.error("No se encontró el ID del usuario.");
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

        // 📌 Nueva URL para facturación
        const response = await fetch(`${Api_Host.defaults.baseURL}/factura-pdf/${id}/enviar?${emailQuery}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.text();
          setResultStatus("success");
          setResultMessage(result || "Factura enviada exitosamente.");
        } else {
          setResultStatus("error");
          setResultMessage("Error al enviar la factura.");
        }
    } catch (error) {
      console.error("Error al enviar la factura:", error);
      setResultStatus("error");
      setResultMessage("Hubo un error al enviar la factura.");
  } finally {
      setIsResultModalVisible(true);
      setLoading(false);
  }
};

  const handleDownloadAcuse = async (id) => {
    setLoading(true);
    try {
      await delay(1500);
      const pdfUrl = `${Api_Host.defaults.baseURL}/DescargarAcusePDF/${id}/`;
      //console.log("📌 URL generada:", pdfUrl);
      //window.open(pdfUrl);
  
      // Realizar la solicitud para obtener el archivo PDF
      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudo descargar el PDF.");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Crear enlace para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Acuse_Factura_${factura.numerofactura}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("No se pudo descargar el PDF.");
    }finally{
      setLoading(false);
    }
  };
  

const handleCancelFactura = async () => {
  setLoading(true);
  try {
    await delay(1500);
      const response = await fetch(`${Api_Host.defaults.baseURL}/factura-delete/${id}/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });
      // console.log("response:",response);
      if (response.ok) {
        const result = await response.json(); // 👈 Agrega esta línea SIEMPRE
        // console.log("asda: ",result);
        const pdfBase64 = result.acuse_pdf_base64;
        if (pdfBase64) {
          base64ToPdf(pdfBase64, `acuse_cancelacion.pdf`);
        }
        // console.log("Respuesta completa:", result);
          message.success("Factura cancelada exitosamente.");
          setVisibleCancelModal(false); // Cierra el modal tras la cancelación
          // Muestra el modal de éxito
          setIsSuccessModalVisible(true);
      } else {
          const result = await response.json();
          message.error(`Error al cancelar la factura: ${result.message || "Desconocido"}`);
      }
  } catch (error) {
      console.error("Error al cancelar la factura:", error);
      message.error("Hubo un error al cancelar la factura.");
  } finally {
      setLoading(false);
  }
};

const handDuoModal=()=>{    
  setIsModalVisibleCorreo(false);
  setIsResultModalVisible(false)
}

const handleDeleteFactura = () => {
  setIsDeleteModalVisible(true);
};
const confirmDeleteFactura = async () => {
  try {
    const data =await deleteFactura(id);
    // console.log("hola dat :",data);
    message.success("Factura eliminada correctamente.");
    setIsDeleteModalVisible(false);
    navigate("/factura");
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    message.error("No se pudo eliminar la factura.");
  }
};

const confirmRelacionFactura = async (idA,idB) => {
  // console.log(idA);
  // console.log(idB);
  try {
    
    const data =await getFacturRespaldo(idB,idA);

    message.success("Factura eliminada correctamente.");
    setIsDeleteModalVisible(false);
    // navigate("/factura");
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    message.error("No se pudo eliminar la factura.");
  }finally {
      verificarFacturaFacturama();
      setLoading(false);
      message.success("Proceso Finalizado");
      setIsRespaldoModalVisible(false);
      //cifrarId
      navigate(`/detallesfactura/${cifrarId(idB)}`);
  }
};

const confirmNotaCredito = async (idA,idB,related) => {
  // console.log(idA);
  // console.log(idB);
  try {

    const data =await getFacturaNotaCredito(idB,idA, related);
    // console.log("hola dat :",related);
    // const paylod={
    //   facturaidA: idA,
    //   facturaidR: idB,
    //   relationTypes:"01"
    // }
    // const datas =await createNotaCredito(paylod);
    // console.log(datas);
    message.success("Factura eliminada correctamente.");
    setNotaCredito(false);
    // navigate("/factura");
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    message.error("No se pudo eliminar la factura.");
  }finally {
      verificarFacturaFacturama();
      setLoading(false);
      message.success("Proceso Finalizado");
      setNotaCredito(false);
      //cifrarId
      // navigate(`/detallesfactura/${cifrarId(idB)}`);
  }
};

const EliminarFacturaRemplazo = async (idA,idB) => {
  setLoading(true);
  try {
    const data2= await deleteFacturRenplasar(idA,idB);
    // console.log("PDF base64:", data2?.data.acuse_pdf_base64?.slice(0, 30));
    // console.log("data2: ",data2);

    base64ToPdf(data2?.data.acuse_pdf_base64, "acuse_cancelacion.pdf");

    await delay(2000);
    message.success("Factura eliminada correctamente.");
    // setIsDeleteModalVisible(false);
    // navigate("/factura");
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    message.error("No se pudo eliminar la factura.");
  }finally {
      verificarFacturaFacturama();
      setLoading(false);
      message.success("Proceso Finalizado");
      setVisibleCancelModal(false);
      navigate(`/detallesfactura/${cifrarId(idB)}`);
  }
};

const downloadXML = (base64String, filename = "acuse.xml") => {
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  const blob = new Blob(byteArrays, { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const handleOpenConfirmModal = () => {
  setIsConfirmModalVisible(true);
};

const handleCancelConfirm = () => {
  setIsConfirmModalVisible(false);
};

const handleConfirmCrearFactura = () => {
  setIsConfirmModalVisible(false);
  handleCrearFactura();
};

  const abrirModal = () => setModalAddenda(true);
  const cerrarModal = () => setModalAddenda(false);


  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => showModalCorreo(true)} icon={<MailTwoTone />}>Enviar por correo</Menu.Item>
      <Menu.Item key="3" onClick={() => handleDownloadPDF(id)} icon={<FilePdfTwoTone />}>Descargar PDF</Menu.Item>
      <Menu.Item key="4" onClick={() => handleDownloadXML(id)}icon={<FileTextTwoTone />}>Descargar XML</Menu.Item>
      <Menu.Item key="5" onClick={() => setModalOpen(true)} icon={<FileAddTwoTone />}>
        Generar Comprobante de Pago
      </Menu.Item>
      <Menu.Item key="6" onClick={() => setVisibleCancelModal(true)} icon={<CloseCircleTwoTone />}>Cancelar factura</Menu.Item>
      <Menu.Item key="7" onClick={() => handleDownloadAcuse(id)}icon={<FileTextTwoTone />}>Descargar Acuse</Menu.Item>
      <Menu.Item key="8" onClick={abrirModal}icon={<FileTextTwoTone />}>Crear o editar Addenda</Menu.Item>
      {/* getdescargaAcuse */}
    </Menu>
  );



const montoRestante =hasPagos 
? facturaPagos.montototal - facturaPagos.montopago 
: 0;

  useEffect(() => {
    let timer;
    if (isSuccessModalVisible) {
      // Inicia un temporizador para cerrar el modal y navegar
      timer = setTimeout(() => {
        setIsSuccessModalVisible(false);
        navigate("/factura");
      }, 2000);
    }
    // Limpia el temporizador al desmontar o cuando el modal cambia a false
    return () => clearTimeout(timer);
  }, [isSuccessModalVisible, navigate]);

  return (
    <Spin spinning={loading}>
    <div style={{ padding: "20px" }}>
      <h2><center>Factura {factura.numerofactura} - Cotización {factura.numerocotizacion} </center></h2>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Información" key="1">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Informacion" bordered>
                <Row>
                  <Col span={12}>
                    <>
                    <Descriptions column={1}>
                      <Descriptions label="Folio">{factura.numerofactura}</Descriptions>
                      <Descriptions label="Tipo de cfdi">{factura.tipocfdi}</Descriptions>
                      <Descriptions.Item label="Fecha">
                        {factura.fecha ? new Date(factura.fecha).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "N/A"}
                      </Descriptions.Item>
                    <Descriptions.Item label="Forma de Pago">{factura.formaPago}</Descriptions.Item>
                    <Descriptions.Item label="Método de Pago">{factura.metodoPago}</Descriptions.Item>
                    <Descriptions.Item label="Moneda">
                      {moneda.descripcion}
                    </Descriptions.Item>
                    <Descriptions.Item label="Orden de Compra">
                      {factura.ordenCompra ? factura.ordenCompra : "No registrada"}
                      <PopInputEditar
                      onActualizar={handleActualizar}
                      label="ordenCompra"
                      fieldName="ordenCompra"
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Notas">
                      {factura.notas ? factura.notas : "No registrada"}
                      <PopInputEditar
                      onActualizar={handleActualizar}
                      label="notas"
                      fieldName="notas"
                      />
                    </Descriptions.Item>
                  </Descriptions>
                    </>
                  </Col>
                  <Col span={12}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Empresa">{empresa.nombre}</Descriptions.Item>
                    <Descriptions.Item label="RFC">{empresa.rfc}</Descriptions.Item>
                    <Descriptions.Item label="Contacto">{cliente.nombrePila} {cliente.apPaterno} {cliente.apMaterno}</Descriptions.Item>
                    <Descriptions.Item label="Contacto">{cliente.correo} </Descriptions.Item>
                    <Descriptions.Item label="Porcentaje">{factura.porcentajeFactura}% </Descriptions.Item>
                  </Descriptions>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              {facturaExiste   === false   ? (
                <Flex vertical gap="small">
                  <Alert
                    message="Informational Notes"
                    description="Tiene un plazo de 72 hora para crear la Factura."
                    type="info"
                    showIcon
                  />
                <div className="container-botones">
                  <Space wrap size="middle">
                  <Button
                    onClick={handleOpenConfirmModal}
                    className="btn-crear-factura"
                    loading={loading}
                    type="primary"
                  >
                    Crear Factura
                  </Button>
                  </Space>
                      <PDFDownloadLink
                        document={
                          dataFactura && dataLogo ? (
                            <PDFpreFactura
                              dataFactura={dataFactura}
                              dataLogo={dataLogo}
                              centavo={centavos}
                              centavotext={centavostext}
                            />
                          ) : (
                            <Text>Cargando...</Text>
                          )
                        }
                        fileName={`Pre_factura_${factura.numerofactura}.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            style={{
                              backgroundColor: '#007bff',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            {loading ? 'Generando...' : 'Pre-Factura PDF'}
                          </button>
                        )}
                      </PDFDownloadLink>

                      <Button
                        onClick={handleDeleteFactura}
                        className="btn-eliminar-factura"
                      >
                        Eliminar Factura
                      </Button>
                      <Button
                        onClick={()=> setIsRespaldoModalVisible(true)}
                      >
                        Sustitución de una factura
                      </Button>
                      {/* <Button
                      loading={loading}
                      onClick={()=>setNotaCredito(true)}>
                        Crear Factura con Relacion
                      </Button> */}
                </div>
                  </Flex>
              ) : (
                <div >
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <Button type="primary" style={{ marginTop: "5px"}}>
                      Acciones para factura
                    </Button>
                  </Dropdown>
                  <ComprobantePago isOpen={modalOpen} onClose={() => setModalOpen(false)} Total={importeTotal}/>
                </div>
              )}
              <Card title="Cuenta" bordered style={{ marginTop: "20px" , padding:"40px"}}>
                <p><strong>Subtotal: </strong>{" "}
                { subtotal.subtotal }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Descuento:</strong> {subtotal.descuentoCotizacion}%</p>
                <p><strong>Subtotal - Descuento:</strong>{" "}
                { subtotal.valorDescuento}
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>IVA ({ subtotal.ivaPct }%):</strong>{" "}
                { subtotal.ivaValor }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
                <p><strong>Importe:</strong>{" "}
                { subtotal.totalFinal  }
                {" "}
                { esUSD ? "USD" : "MXN" }</p>
              </Card>
            </Col>
          </Row>
          <h3 style={{ marginTop: "20px" }}>Conceptos</h3>
          <Table
            dataSource={servicios}
            columns={columnsConceptos}
            pagination={false}
            bordered
            rowKey={(record) => record.key}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Pago" key="2">
          <p>Historial de la factura</p> 
          {(!hasPagos || (hasPagos && montoRestante > 0))&& factura.tipocfdi!=="Egreso" && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
              <Link to={`/CrearPagos/${cifrarId(id)}`}>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: 8,
                  }}
                >
                  Crear pagos
                </Button>
              </Link>
            </div>
          )}
          <PaymentCards idFactura={id} correoCliente={cliente?.correo} refreshPagos={refreshPagos} />
        </Tabs.TabPane>

      </Tabs>

      <Modal
        title="Cancelando Factura"
        visible={visibleCancelModal}
        onCancel={() => !loading && setVisibleCancelModal(false)} // ⛔ evitar cerrar mientras carga
        footer={
          loading
            ? null // ❌ Oculta los botones mientras se carga
            : (
              <>
                <Button key="cerrar" onClick={() => setVisibleCancelModal(false)}>
                  Cerrar
                </Button>          
                {reemplazoActivo ? (
                <Button
                  key="reemplazar"
                  type="primary"
                  danger
                  disabled={!facturaReemplazoId}
                  loading={loading}
                  onClick={() => EliminarFacturaRemplazo(id, facturaReemplazoId)}
                >
                  Eliminar y Reemplazar Factura
                </Button>
              ) : (
                <Button
                  key="cancelarFactura"
                  type="primary"
                  danger
                  onClick={handleCancelFactura}
                >
                  Cancelar Factura
                </Button>
              )}
              </>
            )
        }
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px" }}>
            <Spin tip="Cancelando factura..." size="large" />
          </div>
        ) : (
          <>
          <p>¿Estás seguro de que deseas cancelar esta factura? Esta acción no se puede deshacer.</p>
          <Checkbox checked={reemplazoActivo} onChange={e => setReemplazoActivo(e.target.checked)}>
        Quiero reemplazar esta factura por otra
      </Checkbox>

      {reemplazoActivo && (
        <>
          <p style={{ marginTop: 16 }}>Selecciona la factura con la que deseas reemplazar:</p>
          <Select
            style={{ width: "100%" }}
            placeholder="Selecciona una factura para reemplazar"
            value={facturaReemplazoId}
            onChange={setFacturaReemplazoId}
            disabled={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={facturas.map(f => ({
              label: `Factura #${f.folio} - ${f.empresa || 'Empresa desconocida'}`,
              value: f.id,
            }))}
          />
        </>
      )}
          </>
        )}
      </Modal>

      <Modal
        title="Comprobante de pago"
        visible={visiblePaymentModal}
        onCancel={() => setVisiblePaymentModal(false)}
        footer={[
          <Button key="cancelar" onClick={() => setVisiblePaymentModal(false)}>
            Cerrar
          </Button>,
          <Button key="ok" type="primary" onClick={handleOkPayment}>
            Generar Comprobante
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Fecha de Pago:"
            name="fechaPago"
            rules={[{ required: true, message: "Por favor selecciona la fecha de pago" }]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Método de pago:"
            name="metodoPago"
            rules={[{ required: true, message: "Por favor selecciona un método de pago" }]}
          >
            <Select placeholder="Selecciona un método">
              <Option value="01">01 - Efectivo</Option>
              <Option value="02">02 - Cheque nominativo</Option>
              <Option value="03">03 - Transferencia electrónica de fondos</Option>
              <Option value="99">99 - Por definir</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Monto:"
            name="monto"
            rules={[{ required: true, message: "Por favor ingresa el monto" }]}
          >
            <Input type="number" placeholder="Ingresa el monto" />
          </Form.Item>

          <Form.Item
            label="Referencia:"
            name="referencia"
            rules={[{ required: true, message: "Por favor ingresa la referencia" }]}
          >
            <Input placeholder="Ingresa la referencia" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para enviar cotización por correo 
      // Modal para enviar factura por correo*/}
        <Modal
            title="Enviar Factura por Correo"
            visible={isModalVisibleCorreo}
            onCancel={() => setIsModalVisibleCorreo(false)}
            footer={[
                <Button key="cancel" onClick={() => setIsModalVisibleCorreo(false)}>Cerrar</Button>,
                <Button key="send" type="primary" onClick={handleSendEmail}>Enviar</Button>,
            ]}
        >
            <h4>Selecciona los correos a los que deseas enviar la factura:</h4>
            <Form layout="vertical">
                <Checkbox defaultChecked>{cliente?.correo || "N/A"}</Checkbox>
                <Form.Item label="Correos adicionales (separados por coma):">
                    <Input 
                        placeholder="ejemplo@correo.com, otro@correo.com"
                        value={extraEmails}
                        onChange={(e) => setExtraEmails(e.target.value)}
                    />
                </Form.Item>
            </Form>
        </Modal>

        {/* Modal para mostrar el resultado del envío*/}
        <Modal
            title={resultStatus === "success" ? "Éxito" : "Error"}
            open={isResultModalVisible}
            onCancel={handDuoModal}
            footer={[
                <Button key="close" onClick={handDuoModal}>
                    Cerrar
                </Button>
            ]}
        >
          <Result
            title={<p style={{ color: resultStatus === "success" ? "green" : "red" }}>{resultMessage}</p>}
            />
        </Modal>

        <Modal
        title="Factura cancelada exitosamente"
        visible={isSuccessModalVisible}
        // Si no quieres ningún botón, puedes ocultarlos con estos props
        footer={null}
        // Evita que se cierre al hacer click fuera, si lo prefieres
        maskClosable={false}
        closable={false}
      >
        <p>La factura ha sido cancelada. Serás redirigido al listado de facturas en 2 segundos...</p>
      </Modal>
      
      <Modal
        title="¿Estás seguro de eliminar esta factura?"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancelar" onClick={() => setIsDeleteModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="eliminar" type="primary" danger onClick={confirmDeleteFactura}>
            Sí, eliminar
          </Button>,
        ]}
      >
        <p>Esta acción no se puede deshacer.</p>
      </Modal>

        {/*RESPALDO */}
        <Modal
        title="¿Estás seguro de Remplasar esta factura?"
        open={isRespaldoModalVisible}
        onCancel={() => setIsRespaldoModalVisible(false)}
        footer={[
          <Button key="cancelar" onClick={() => setIsRespaldoModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="eliminar" type="primary" 
          disabled={!facturaReemplazoId} 
          loading={loading}
          onClick={()=>confirmRelacionFactura(id,facturaReemplazoId)}>
             Crear Factura
          </Button>,
        ]}
      >
        <p>Esta acción no se puede deshacer.</p>
        <p>Esta acción reemplazará la factura actual con otra seleccionada. No se puede desacer.</p>
        <p>Por default 04-Situacion de los CFDI previos.</p>

        <Select
          style={{ width: "100%" }}
          placeholder="Selecciona una factura para reemplazar"
          value={facturaReemplazoId}
          onChange={setFacturaReemplazoId}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option)=>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={facturas.map(f => ({
            label: `Factura #${f.folio} - ${f.empresa || 'Empresa desconocida'}`,
            value: f.id,
          }))}
        />
      </Modal>

          {/*Nota de Credito */}
      <Modal
        title="¿Estás seguro de Crear Nota de Credito?"
        open={notaCredito}
        onCancel={() => {
          setNotaCredito(false);
          setFacturaReemplazoId(undefined);
          setRelationTypeId(undefined);
        }}
        footer={[
          <Button key="cancelar" onClick={() => setNotaCredito(false)}>
            Cancelar
          </Button>,
          <Button key="eliminar" type="primary" 
          disabled={!facturaReemplazoId} 
          loading={loading}
          onClick={()=>confirmNotaCredito(id,facturaReemplazoId, relationtypeId)}>
             Crear Factura
          </Button>,
        ]}
      >
        <p>Esta acción no se puede deshacer.</p>
        <p> Selecciona la factura. No se puede desacer.</p>

        <Select
          style={{ width: "100%" }}
          placeholder="Selecciona una factura para reemplazar"
          value={facturaReemplazoId}
          onChange={setFacturaReemplazoId}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option)=>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={facturas.map(f => ({
            label: `Factura #${f.folio} - ${f.empresa || 'Empresa desconocida'}`,
            value: f.id,
          }))}
        />
        <Select
          style={{ width: "100%" }}
          placeholder="Tipo de Relación"
          value={relationtypeId}
          onChange={setRelationTypeId}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option)=>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={relationtype.map(f => ({
            label: `${f.codigo} - ${f.descripcion || 'Descripcion desconocida'}`,
            value: f.codigo,
          }))}
        />
      </Modal>
            {/* elimnar factura para el reemplazarlo */}
        {/* <Modal
        title="¿Estás seguro de Eliminar esta factura?"
        open={deleteFacturaReemplazo}
        onCancel={() => setDeleteFacturaReemplazo(false)}
        footer={[
          <Button key="cancelar" onClick={() => setDeleteFacturaReemplazo(false)}>
            Cancelar
          </Button>,
          <Button key="eliminar" denger type="primary" 
          disabled={!facturaReemplazoId}
          loading={loading}
          onClick={()=>EliminarFacturaRemplazo(id,facturaReemplazoId)}>
             Elimnar Factura
          </Button>
        ]}
      >
        <p>Esta acción no se puede deshacer.</p>
        <p>Esta acción reemplazará la factura actual con otra seleccionada. No se puede deshacer.</p>

        <Select
          style={{ width: "100%" }}
          placeholder="Selecciona una factura para reemplazar"
          value={facturaReemplazoId}
          onChange={setFacturaReemplazoId}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option)=>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={facturas.map(f => ({
            label: `Factura #${f.folio} - ${f.empresa || 'Empresa desconocida'}`,
            value: f.id,
          }))}
        />
      </Modal> */}


      {/* Modal de confirmación */}
      <Modal
        title="¿Estás seguro?"
        open={isConfirmModalVisible}
        onOk={handleConfirmCrearFactura}
        onCancel={handleCancelConfirm}
        okText="Sí, crear"
        cancelText="Cancelar"
        centered
      >
        <p>¿Deseas crear la factura? Esta acción no se puede deshacer.</p>
      </Modal>

      

            {/* 
        <Modal
          title={resultStatus === "success" ? "Éxito" : "Error"}
          visible={isResultModalVisible}
          onCancel={() => setIsResultModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsResultModalVisible(false)}>
              Cerrar
            </Button>
          ]}
        >
          <Result
            status={resultStatus}
            title={resultMessage}
          />
        </Modal>*/}

        {/* Addenda */}
              <AddendaModal
        visible={modalAddenda}
        onCancel={cerrarModal}
        facturaId={facturaId}
      />
    </div>
    </Spin>
  );
};

export default DetallesFactura;