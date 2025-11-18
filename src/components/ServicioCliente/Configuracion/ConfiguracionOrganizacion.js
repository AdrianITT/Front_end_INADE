import React, { useCallback,useState, useEffect, useMemo } from "react";
import { Tabs, Form, Input, Select, Button, Modal,Upload,Card, message, Result, Alert, Col,Row, Spin} from "antd";

import "./configuracion.css"
import {  UploadOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import { getAllOrganizacion, updateOrganizacion, getMarcaDeAgua } from "../../../apis/ApisServicioCliente/organizacionapi";
import { getAllRegimenFiscal } from "../../../apis/ApisServicioCliente/Regimenfiscla";
import { updateInfoOrdenTrabajo,getInfoOrdenTrabajoById, crearInfoOrdenTrabajo } from "../../../apis/ApisServicioCliente/infoordentrabajoApi";
import { getInfoCotizacionById, updateInfoCotizacion, crearInfoCotizacion } from "../../../apis/ApisServicioCliente/InfoCotizacionApi";
import { updateMarcaAgua,createMarcaAgua } from "../../../apis/ApisServicioCliente/MarcaDeAguaApi";
import {ObtenerOrganizacion} from "../obtenerOrganizacion/ObtenerOrganizacion";
import { updateInfoSistema,getInfoSistemaById } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import { getAllTipoMoneda } from "../../../apis/ApisServicioCliente/Moneda";
import { getAllIva } from "../../../apis/ApisServicioCliente/ivaApi";
import { Api_Host } from "../../../apis/api";
import {getIdCotizacionBy } from "../../../apis/ApisServicioCliente/CotizacionApi";
import DOMPurify from "dompurify";
import html2pdf from "html2pdf.js";
import { generarPlantillaHTML } from "./platillaPreVisualizacionCotizacion/platillaPreVisualizacionCotizacion";
DOMPurify.setConfig({
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "p", "br", "center", "ul", "ol", "li", "u", "h1", "h2", "h3", "h4", "h5"
  ],
  ALLOWED_ATTR: ["style"], // opcional si necesitas centrado o fuente personalizada
  KEEP_CONTENT: true // evita eliminar contenido interno al limpiar etiquetas no permitidas
});

const { TextArea } = Input;

const ConfiguraciónOrganizacion=()=>{  
  const [fromOrdenTrabajo] = Form.useForm();
  const [formCotizacion]= Form.useForm();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [organizaciones, setOrganizaciones] = useState(null);
  const [regimenfiscal, setRegimenFiscal]=useState([]); 
  const [loading, setLoading] = useState(false); // Para el loading de la actualización
  const [, setinfOrdenTrabajo]=useState([]);
  const [infoCotizacion, setInfCotizacion] = useState(null);
  const [formConfiguracion] = Form.useForm(); // Formulario de configuración del sistema
  const [infConfiguracion, setInfConfiguracion] = useState(null);
  const [tipoMoneda, setTipoMoneda] = useState([]);
  const [iva, setIva] = useState([]);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab,setActiveTab]=useState("1");
  const [loadings, setLoadings] = useState(false);
  const [marcaAgua, setMarcaAgua] = useState(null)

  // Obtener el id de la organización del usuario autenticado
  const userOrganizationId = ObtenerOrganizacion("organizacion_id" );// O la forma en la que almacenas el ID de la organización

  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  const fetchOrganizacion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllOrganizacion();
      const org = response.data.find(item => item.id === userOrganizationId);
      setOrganizaciones(org);
      form.setFieldsValue({
        ...org,
        regimenFiscal: org.RegimenFiscal,
      });
  
      if (org?.infoOrdenTrabajo) {
        await fetchInfOrdenTrabajo(org.infoOrdenTrabajo);
      }
      if (org?.infoCotizacion) {
        await fetchInfoCotizacion(org.infoCotizacion);
      }
      if (org?.infoSistema) {
        await fetchInfoConfiguracionSistema(org.infoSistema);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las organizaciones", error);
      message.error("Error al obtener la organización.");
    }
  }, [userOrganizationId, form]);
  

const fetchRegimenFiscal = useCallback(async () => {
    try {
        const response = await getAllRegimenFiscal();
        setRegimenFiscal(response.data);
    } catch (error) {
        console.error("Error al cargar los regímenes fiscales", error);
    }
}, []);

const fetchInfOrdenTrabajo = useCallback(async (id) => {
    try {
        const response = await getInfoOrdenTrabajoById(id);
        const ordenTrabajo = response.data;

        if (ordenTrabajo) {
            setinfOrdenTrabajo(response.data);
            fromOrdenTrabajo.setFieldsValue(response.data);
        }
    } catch (error) {
        console.error("Error al obtener la información de órdenes de trabajo", error);
        message.error("Error al obtener la información.");
    }
}, [fromOrdenTrabajo]);

const fetchInfoCotizacion = useCallback(async (id) => {
    try {
        const response = await getInfoCotizacionById(id);
        const cotizacion = response.data;
        if (cotizacion) {
            setInfCotizacion(cotizacion);
            formCotizacion.setFieldsValue(cotizacion);
        }
    } catch (error) {
        console.error("Error al obtener la cotización", error);
        message.error("Error al obtener la cotización.");
    }
}, [formCotizacion]);

const fetchInfoConfiguracionSistema = useCallback(async (id) => {
    try {
        const response = await getInfoSistemaById(id);
        const configuracion = response.data;
        if (configuracion) {
            //console.log("Configuración obtenida:", configuracion);
            setInfConfiguracion(configuracion);
            formConfiguracion.setFieldsValue({
                tipoMoneda: configuracion.tipoMoneda || undefined,
                iva: configuracion.iva || undefined,
                tipoCambioDolar: configuracion.tipoCambioDolar || undefined
            });
        }
    } catch (error) {
        console.error("Error al obtener la configuración del sistema", error);
        message.error("Error al obtener la configuración.");
    }
}, [formConfiguracion]);

const fetchTipoMoneda = useCallback(async () => {
    try {
        const response = await getAllTipoMoneda();
        //console.log("Monedas obtenidas:", response.data);
        setTipoMoneda(response.data);
    } catch (error) {
        console.error("Error al obtener tipos de moneda", error);
        message.error("Error al obtener tipos de moneda.");
    }
}, []);

const fetchIva = useCallback(async () => {
    try {
        const response = await getAllIva();
        //console.log("IVA obtenido:", response.data);
        setIva(response.data);
    } catch (error) {
        console.error("Error al obtener tasas de IVA", error);
        message.error("Error al obtener tasas de IVA.");
    }
}, []);

const fetchMarcaDeAgua = useCallback(async (idMarcaAgua) => {
  try {
    const res = await getMarcaDeAgua(idMarcaAgua); // este debe ser un endpoint tipo: /api/imagenmarcaagua/:id
    if (res.data && res.data.imagen) {
      setMarcaAgua(res.data.imagen);
    }
  } catch (err) {
    console.error("Error al obtener la marca de agua:", err);
  }
}, []);


useEffect(() => {
  setLoadings(true);
  fetchTipoMoneda();
  fetchIva();
  fetchRegimenFiscal();
  fetchOrganizacion();
  setIsModalVisible(true);
  setLoadings(false);
}, [fetchTipoMoneda, fetchIva, fetchRegimenFiscal, fetchOrganizacion]);



useEffect(() => {
  if (activeTab === "1") {
    setLoading(true);
    fetchOrganizacion();
    fetchRegimenFiscal();
    setLoading(false);
  }
}, [activeTab, fetchOrganizacion, fetchRegimenFiscal]);

useEffect(() => {
  if (activeTab === "2") {
    setLoading(true);
    fetchTipoMoneda();
    fetchIva();
    setLoading(false);
    if (organizaciones?.infoCotizacion) {
      fetchInfoCotizacion(organizaciones.infoCotizacion);
    }
  }
}, [activeTab, organizaciones, fetchInfoCotizacion, fetchTipoMoneda, fetchIva]);

useEffect(() => {
  if (activeTab === "3" && organizaciones?.infoOrdenTrabajo) {
    setLoading(true);
    fetchInfOrdenTrabajo(organizaciones.infoOrdenTrabajo);
    setLoading(false);
  }
}, [activeTab, organizaciones, fetchInfOrdenTrabajo]);


useEffect(() => {
  if (activeTab === "4" && organizaciones?.infoSistema) {
    setLoading(true);
    fetchInfoConfiguracionSistema(organizaciones.infoSistema);
    setLoading(false);
  }
}, [activeTab, organizaciones, fetchInfoConfiguracionSistema]);

useEffect(() => {
  if (infoCotizacion && infoCotizacion.imagenMarcaAgua) {
    fetchMarcaDeAgua(infoCotizacion.imagenMarcaAgua);
  }
}, [infoCotizacion]); // Este efecto depende de que infoCotizacion ya esté disponible



  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    //console.log("Datos enviados:", values);
    
    setLoading(true);
    try {
      //console.log("Datos enviados:", values);
      //console.log("🚀 Enviando actualización de organización ID:", userOrganizationId);
  
      const datosAEnviar = {
        ...organizaciones, // Mantener los datos actuales
        nombre: values.nombre,
        slogan: values.slogan,
        RegimenFiscal: values.regimenFiscal,
        telefono: values.telefono,
        pagina: values.pagina,
        calle: values.calle,
        numero: values.numero,
        colonia: values.colonia,
        ciudad: values.ciudad,
        codigoPostal: values.codigoPostal,
        estado: values.estado,
        infoCotizacion: organizaciones?.infoCotizacion || null,
        infoOrdenTrabajo: organizaciones?.infoOrdenTrabajo || null,
        infoSistema: organizaciones?.infoSistema || null,
      };
  
      let formData = null;
  
      // 🛑 Si el usuario seleccionó un nuevo logo, creamos un FormData
      if (values.logo && values.logo.file) {
        //console.log("📂 Nuevo logo seleccionado:", values.logo.file.originFileObj);
  
        formData = new FormData();
        formData.append("logo", values.logo.file.originFileObj);
        
        // Agregar otros datos en FormData si es necesario
        Object.entries(datosAEnviar).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
      } else {
        delete datosAEnviar.logo;
      }
  
      //console.log("📤 Enviando datos a la API:", formData || datosAEnviar);
      
      // 📌 Enviar como FormData si hay un archivo, de lo contrario JSON
      if (formData) {
        await updateOrganizacion(userOrganizationId, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setIsSuccessModalVisible(true);
      } else {
        await updateOrganizacion(userOrganizationId, datosAEnviar);
        setIsSuccessModalVisible(true);
      }
  

      setLoading(false);
      
      message.success("Datos de organización actualizados correctamente");
      fetchOrganizacion();
    } catch (error) {
      setLoading(false);
      showErrorModal(error.message || "Error al actualizar la organización.");
      message.error("Error al actualizar los datos");
    }
  };

  const handleGuardarOrdenTrabajo = async (values) => {
    try {
      setLoading(true);
      // console.log("Valores recibidos para la orden de trabajo:", values);
      let marcaDeAguaId = null;
  
      // Obtener la orden de trabajo actual si existe
      if (organizaciones?.infoOrdenTrabajo) {
        const responseOrdenTrabajo = await getInfoOrdenTrabajoById(organizaciones.infoOrdenTrabajo);
        marcaDeAguaId = responseOrdenTrabajo.data.imagenMarcaAgua || null;
      }
  
      // Si el usuario subió una nueva imagen de marca de agua
      if (values.marcaDeAgua && values.marcaDeAgua.length > 0) {
        const fileObj = values.marcaDeAgua[0].originFileObj || values.marcaDeAgua[0];
  
        if (fileObj instanceof File) {
          const formData = new FormData();
          formData.append("imagen", fileObj);
  
          if (marcaDeAguaId) {
            // Si ya hay una imagen, actualizarla
            await updateMarcaAgua(marcaDeAguaId, formData);
          } else {
            // Si no hay imagen, crear una nueva
            const response = await createMarcaAgua(formData);
            marcaDeAguaId = response.data.id;
          }
        }
      }
  
      // Construir el payload con la imagen de marca de agua
      const payload = {
        nombreFormato: values.nombreFormato||null,
        version: values.version||null,
        fechaEmision: values.fechaEmision||null,
        tituloDocumento: values.tituloDocumento,
        imagenMarcaAgua: marcaDeAguaId,
        prefijo: values.prefijo,
      };
  
      if (!organizaciones?.infoOrdenTrabajo) {
        // Crear nueva orden de trabajo
        const nuevaOrdenTrabajo = await crearInfoOrdenTrabajo(payload);
        await updateOrganizacion(organizaciones.id, {
          ...organizaciones,
          infoOrdenTrabajo: nuevaOrdenTrabajo.id,
        });
  
        setOrganizaciones({
          ...organizaciones,
          infoOrdenTrabajo: nuevaOrdenTrabajo.id,
        });
        setIsSuccessModalVisible(true);
  
        message.success("Orden de trabajo creada correctamente");
      } else {
        // Actualizar orden de trabajo existente
        await updateInfoOrdenTrabajo(organizaciones.infoOrdenTrabajo, payload);
        setIsSuccessModalVisible(true);
        message.success("Orden de trabajo actualizada correctamente");
      }
  
      // Recargar la información actualizada
      const responseOrdenTrabajo = await getInfoOrdenTrabajoById(organizaciones.infoOrdenTrabajo);
      setinfOrdenTrabajo(responseOrdenTrabajo.data);
      fromOrdenTrabajo.setFieldsValue(responseOrdenTrabajo.data);
    } catch (error) {
      console.error("Error al actualizar la orden de trabajo", error);
      message.error("Error al actualizar la orden de trabajo.");
      showErrorModal(error.message || "Error al actualizar la organización.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCotizacion = async (values) => {
    try {
      // console.log("Valores recibidos para la cotización:", values);
        setLoading(true);

        // 🧼 1️⃣ Sanitizar y validar datos antes de cualquier acción
        let isMalicious = false;

        const clean = (obj) =>
          Object.fromEntries(
            Object.entries(obj).map(([key, value]) => {
              if (typeof value === "string") {
                const sanitized = DOMPurify.sanitize(value.trim());

                // Detectar solo si hay <script> o atributos "on*"
                const lower = value.toLowerCase();
                const containsDangerous =
                  lower.includes("<script") ||
                  lower.includes("onerror=") ||
                  lower.includes("onload=") ||
                  lower.includes("javascript:");

                if (containsDangerous) {
                  console.warn(`🚫 Contenido bloqueado por seguridad: ${key}`);
                  isMalicious = true;
                }

                return [key, sanitized];
              }
              return [key, value];
            })
          );


        const cleanValues = clean(values);

        if (isMalicious) {
          message.error(
            "Se detectó contenido inseguro (HTML o scripts) en algunos campos. Revise la información antes de guardar."
          );
          setLoading(false);
          return; // 🚫 Detiene completamente el guardado
        }

        let marcaDeAguaId = null; 

        // Obtener cotización actual si existe
        if (organizaciones?.infoCotizacion) {
            const responseCotizacion = await getInfoCotizacionById(organizaciones.infoCotizacion);
            marcaDeAguaId = responseCotizacion.data.imagenMarcaAgua || null;
        }


        // 📌 **Extraer la imagen correctamente**
        if (cleanValues.marcaDeAgua && cleanValues.marcaDeAgua.length > 0) {
            const fileObj = cleanValues.marcaDeAgua[0].originFileObj || cleanValues.marcaDeAgua[0];

            if (fileObj instanceof File) {
                const formData = new FormData();
                formData.append("imagen", fileObj);


                if (marcaDeAguaId) {
                    // 🔄 Si ya hay imagen, actualizarla
                    await updateMarcaAgua(marcaDeAguaId, formData);
                } else {
                    // 🆕 Si no hay imagen, crear una nueva
                    const response = await createMarcaAgua(formData);
                    marcaDeAguaId = response.data.id;
                }
            }
        }

        // Construir payload con `imagenMarcaAgua`
        const payload = {
            nombreFormato: cleanValues.nombreFormato||null,
            version: cleanValues.version||null,
            fechaEmision: cleanValues.fechaEmision||null,
            tituloDocumento: cleanValues.tituloDocumento,
            mensajePropuesta: cleanValues.mensajePropuesta,
            termino: cleanValues.termino,
            avisos: cleanValues.avisos,
            imagenMarcaAgua: marcaDeAguaId,
        };
        console.log("Payload para cotización:", payload); 

        if (!organizaciones?.infoCotizacion) {
            // Crear nueva cotización
            const nuevaCotizacion = await crearInfoCotizacion(payload);
            await updateOrganizacion(organizaciones.id, {
                ...organizaciones,
                infoCotizacion: nuevaCotizacion.id,
            });

            setOrganizaciones({
                ...organizaciones,
                infoCotizacion: nuevaCotizacion.id,
            });

            message.success("Cotización creada correctamente");
            setIsSuccessModalVisible(true);
        } else {
            // Actualizar cotización existente
            await updateInfoCotizacion(organizaciones.infoCotizacion, payload);
            setIsSuccessModalVisible(true);
            message.success("Cotización actualizada correctamente");
        }

        // Recargar la información actualizada
        const responseCotizacion = await getInfoCotizacionById(organizaciones.infoCotizacion);
        setInfCotizacion(responseCotizacion.data);
        formCotizacion.setFieldsValue(responseCotizacion.data);
    } catch (error) {
        console.error("Error al actualizar la cotización", error);
        message.error("Error al actualizar la cotización.");
        showErrorModal(error.message || "Error al actualizar la organización.");
    } finally {
        setLoading(false);
    }
};


const handleGuardarConfiguracionSistema = async (values) => {
  try {
    setLoading(true);
    let nuevaConfiguracion;
    console.log("Valores recibidos para la configuración del sistema:", values);
    // Si la organización no tiene una infoConfiguracionSistema, la creamos
    if (!organizaciones?.infoSistema) {
      nuevaConfiguracion = await updateInfoSistema(values);

      // Asociamos la nueva configuración a la organización
      await updateOrganizacion(organizaciones.id, {
        ...organizaciones,
        infoConfiguracionSistema: nuevaConfiguracion.id,
      });

      // Actualizamos el estado de la organización con la nueva configuración
      setOrganizaciones((prev)=>({
        ...prev,
        infoConfiguracionSistema: nuevaConfiguracion.id,
      }));

      message.success("Configuración del sistema creada y asociada correctamente");
    } else {
      // Si ya existe una infoConfiguracionSistema, la actualizamos
      await updateInfoSistema(organizaciones.infoSistema, values);
      message.success("Configuración del sistema actualizada correctamente");
    }
    

    // Recargamos la información actualizada
    const responseConfiguracion = await getInfoSistemaById(organizaciones.infoSistema);
    setInfConfiguracion(responseConfiguracion.data);
    formConfiguracion.setFieldsValue(responseConfiguracion.data);
    setIsSuccessModalVisible(true);
  } catch (error) {
    console.error("Error al actualizar la configuración del sistema", error);
    message.error("Error al actualizar la configuración del sistema.");
    showErrorModal(error.message || "Error al actualizar la organización.");
  } finally {
    setLoading(false);
  }
};

  // Función para cerrar el modal y redirigir
  const handleSuccessOk = () => {
    setIsSuccessModalVisible(false);
  };

  // Función para cerrar el modal de error
  const handleErrorOk = () => {
    setIsErrorModalVisible(false);
  };
  
// ✅ Función para manejar errores específicos
const showErrorModal = (error) => {
  let formattedMessage = "Ocurrió un error inesperado.";

  if (typeof error === "object" && error !== null) {
    formattedMessage = Object.entries(error)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join("\n");
  } else if (typeof error === "string") {
    formattedMessage = error;
  }

  // 🔥 CORREGIDO: Se cambia el estado para que el modal se muestre
  setErrorMessage(formattedMessage);
  setIsErrorModalVisible(true);
};


const CotizacionPureva= async ()=>{
  try{
    // const idCoti=await getIdCotizacionBy(organizationId);
    // const user_id = localStorage.getItem("user_id");
    // window.open(`${Api_Host.defaults.baseURL}/cotizacion/${idCoti.data.id}/pdf/?user_id=${user_id}`);

    //Tomar datos del formulario actual
    const valores = formCotizacion.getFieldsValue();

    const data={
      org:organizaciones.nombre,
      logo_url: organizaciones.logo,
      marca: marcaAgua,
      tituloDocumento: valores.tituloDocumento,
      formato: {
        nombreFormato: valores.nombreFormato,
        version: valores.version,
        fechaEmision: valores.fechaEmision,
      },
      cotizacion: {
        subtotal: "3000.00",
        iva: "480.00",
        total: "3480.00",
      },
      terminos: valores.termino,
      avisos: valores.avisos,
      usuario: "Administrador",
    };
    const html = generarPlantillaHTML(data);

    // Crear un contenedor temporal
    const element = document.createElement("div");
    element.innerHTML = html;
    document.body.appendChild(element);

    // Configuración del PDF
    const options = {
      margin: 0.5,
      filename: `${data.tituloDocumento || "Cotizacion"}_Prueba.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2, // mejora la resolución
        useCORS: true, // permite usar imágenes externas
        logging: false,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generar y descargar el PDF
    await html2pdf().set(options).from(element).save();

    // Eliminar el elemento temporal
    document.body.removeChild(element);
  } catch (error) {
    console.error("Error al generar la cotización de prueba", error);
  }
}

  

  const renderOrganizacion = () => (
    <Spin spinning={loading} tip="Cargando datos...">
     <Form layout="vertical"
     form={form}
      className="form-container"
      onFinish={onFinish}
      initialValues={organizaciones|| {}}>
       <div>
         <Form.Item label="Nombre:" name="nombre" 
         rules={[{ required: true, message: 'Por favor ingresa el nombre de la organización.' }]}>
           <Input placeholder="Ingrese el nombre de la organización." />
         </Form.Item>
         <div className="note">
            <p>El nombre del emisor ahora se debe registrar en mayusculas y sin el régimen societario.</p>
            <p>Debe registrarse tal y como se encuentra en la Cédula de Identificación Fiscal y Constancia de Situación Fiscal, respetando números, espacios y signos de puntuación.</p>
            <p>
                  Ejemplo: <br></br>
                  <code>
                  Nombre o Razón Social: Empresa Importante S.A. DE C.V <br></br>
                  Debe colocarse: EMPRESA IMPORTANTE <br></br>
                  Estos datos los puedes obtener en la CIF <br></br>
                  Nota: Esto aplica tanto para personas físicas como morales</code>
            </p><p>
            Clave del Registro Federal de Contribuyentes del Emisor (recuerda que debes tener los CSD del RFC cargados) </p>
         </div>
         <Form.Item label="Slogan:" name="slogan"
         rules={[{ required: true, message: 'Por favor ingresa el slogan de la organización.' }]}>
           <Input placeholder="Ingrese el slogan de la organización." />
         </Form.Item>
         <Form.Item label="Régimen Fiscal:" name="regimenFiscal" required rules={[{ required: true, message: "Ingrese su Regimen Fiscal." }]}>
           <Select placeholder="Seleccione el régimen fiscal de la organización.">
             {regimenfiscal.map((regimen)=>(
                <Select.Option key={regimen.id}
                value={regimen.id}>
                  {regimen.codigo}-{regimen.nombre}
                </Select.Option>
              ))}
           </Select>
         </Form.Item>
         <Form.Item label="Teléfono:" name="telefono"
         rules={[{ required: true, message: 'Por favor ingresa el teléfono.' }]}>
           <Input placeholder="Ingrese el teléfono de contacto de la organización." />
         </Form.Item>
         <Form.Item label="Página web:" name="pagina"
         rules={[{ required: true, message: 'Por favor ingresa la página web.' }]}>
           <Input placeholder="Ingrese la URL de la página web de la organización." />
         </Form.Item>
       </div>
   
       <div>
        <div className="button-container">
          <Link to="/CargaCSD">
         <Button type="primary">Cargar Certificado de Sellos Dijitales</Button>
       </Link>
       </div>
         <Form.Item label="Calle:" name="calle" 
         rules={[{ required: true, message: 'Ingrese la calle.' }]}>
           <Input placeholder="Ingrese la calle de la dirección de la organización." />
         </Form.Item>
         <Form.Item label="Número:" name="numero" 
         rules={[{ required: true, message: 'Ingrese le número.' }]}>
           <Input placeholder="Ingrese el número de la dirección de la organización." />
         </Form.Item>
         <Form.Item label="Colonia:" name="colonia" 
         rules={[{ required: true, message: 'Ingrese la colonia.' }]}>
           <Input placeholder="Ingrese la colonia de la dirección de la organización." />
         </Form.Item>
         <Form.Item label="Ciudad:" name="ciudad" 
         rules={[{ required: true, message: 'Ingrese la ciudad.' }]}>
           <Input placeholder="Ingrese la ciudad de la dirección de la organización." />
         </Form.Item>
         <Form.Item label="Código Postal:" name="codigoPostal" 
         rules={[{ required: true, message: 'Ingrese el código postal.' }]}>
           <Input placeholder="Ingrese el código postal de la organización." />
         </Form.Item>
         <Form.Item label="Estado:" name="estado" 
         rules={[{ required: true, message: 'Ingrese el estado.' }]}>
         <Input placeholder="Ingrese el estado." />
         </Form.Item>
       <div className="button-container">
         <Button type="primary" htmlType="submit" loading={loading}>Guardar configuración</Button>
       </div>
       </div>
       <Alert message="Nuca dejar sin imagen marca de agua" type="info" showIcon />
       <Alert
      message="Advertencia"
      description="Solo Imagenes con la extencion PNG."
      type="warning"
      showIcon
    /><br/>
   
       <div className="left-column">
       <Form.Item label="Logo Actual:" name="logo">
        <Upload>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
      </Form.Item>
      <Form.Item>
      {organizaciones?.logo ? (
          <div style={{ marginBottom: 16 }}>
            <p>Imagen cargada actualmente:</p>
            <img
              src={organizaciones.logo}
              alt="Logo de la organización"
              style={{ width: 150, height: 'auto', border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>
        ) : (
          <p>No hay imagen cargada actualmente.</p>
        )}
      </Form.Item>
       </div>
   
     </Form></Spin>
   );
   

   const renderCotizaciones = () => (
     <div>
       <div>
         <h3>Guía rápida de etiquetas HTML</h3>
         <div className="html-guide">
           <p>
             En HTML, puedes aplicar varios tipos de formato a tu texto usando
             etiquetas especiales. Aquí te mostramos las más comunes:
           </p>
           <ul>
             <li>
               <strong>&lt;strong&gt;</strong>: Se utiliza para poner el texto en{" "}
               <strong>negritas</strong>.
             </li>
             <li>
               <em>&lt;em&gt;</em>: Se usa para poner el texto en <em>cursiva</em>.
             </li>
             <li>
               <code>&lt;code&gt;</code>: Para marcar el <code>código</code> dentro
               del texto.
             </li>
             <li>
               <p>&lt;p&gt;: Para crear un párrafo separado dentro de tu
               documento.</p>
             </li>
             <li>
               <ul>
                 <li>
                   &lt;ul&gt; y &lt;li&gt;: Para crear listas con viñetas.
                 </li>
               </ul>
             </li>
           </ul>
           <p>Aquí tienes un ejemplo práctico:</p>
           <Card>
           <code>
              &lt;p&gt;Este es un texto normal con &lt;strong&gt;negritas&lt;/strong&gt;, &lt;em&gt;cursivas&lt;/em&gt; y &lt;code&gt;código&lt;/code&gt; en línea.&lt;/p&gt;</code><br></br>
              <code>
              &lt;ul&gt;<br></br>
              &lt;li&gt;Primer ítem&lt;/li&gt;<br></br>
              &lt;li&gt;Segundo ítem&lt;/li&gt;<br></br>
              &lt;li&gt;Tercer ítem&lt;/li&gt;<br></br>
              &lt;/ul&gt;           
          </code>
          </Card>
           <p>Este código se renderiza de la siguiente forma:</p>
           <ul>
             <li>Primer ítem</li>
             <li>Segundo ítem</li>
             <li>Tercer ítem</li>
           </ul>
         </div>
       </div>
   
       <div>
         <Form layout="vertical" 
         form={formCotizacion} 
         onFinish={handleGuardarCotizacion}
         initialValues={infConfiguracion || {}}>
          <Row gutter={24}><Col xs={24} md ={12}>
            <Form.Item label="Nombre formato:" name="nombreFormato" 
            rules={[{  message: 'Ingrese el nombredel formato.' }]}>
              <Input placeholder="Ingrese el nombre del formato." />
            </Form.Item>
            <Form.Item label="Versión de formato:" name="version" 
            rules={[{  message: 'Ingrese la versión del formato.' }]}>
              <Input placeholder="Ingrese la versión del formato." />
            </Form.Item>
            <Form.Item label="Fecha de Emisión:" name="fechaEmision" 
            rules={[{ message: 'Ingrese la fecha de emisión.' }]}>
              <Input placeholder="Ingrese la fecha de emisión." />
            </Form.Item>
            <Form.Item label="Título del documento:" name="tituloDocumento"
            rules={[{ required: true, message: 'Ingrese el título del documento.' }]}>
              <Input placeholder="Ingrese el título del documento." />
            </Form.Item>
          </Col>
           <Col xs={24} md={12}>
           <Form.Item label="Mensaje propuesta:" name="mensajePropuesta"
           rules={[{ required: true, message: 'Ingrese el mensaje propuesto para la cotización.' }]}>
             <TextArea
               rows={4}
               placeholder="Ingrese el mensaje propuesto para la cotización."
             />
           </Form.Item>
           <Form.Item label="Términos:" name="termino"
           rules={[{ required: true, message: 'Ingrese los términos del documento.' }]}>
             <TextArea rows={4} placeholder="Ingrese los términos del documento." />
           </Form.Item>
           <Form.Item label="Avisos:" name="avisos" 
           rules={[{ required: true, message: 'Ingrese los avisos necesarios.' }]}>
             <TextArea rows={4} placeholder="Ingrese los avisos necesarios." />
           </Form.Item>
           </Col>
           </Row>
            <Alert message="Aviso importante"
              description="Si la imagen aparece completamente en blanco, no la elimine. Es una marca de agua transparente utilizada en las cotizaciones y órdenes de trabajo."
              type="warning"
              showIcon/>
           <Form.Item>
            {marcaAgua ? (
                <>
                <p> se usara en cotizacio y ordenes de trabajo</p>
                <p>Imagen cargada actualmente:</p>
                <img
                  src={marcaAgua}
                  alt="Marca de Agua"
                  style={{ width: 100, height: 'auto', opacity: 0.4, border: '1px solid #ddd', borderRadius: 4}}
                />
                </>
              ):(
                <>
                <p style={{ color: "red", fontWeight: "bold" }}>
                  No se ha subido ninguna imagen de marca de agua.
                </p>
                <br/>
              </>)}
        </Form.Item>
        <Form.Item
          label="Imagen marca de agua:"
          name="marcaDeAgua"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
          </Upload>
        </Form.Item>
        


           <div className="button-container">
             <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: "8px" }}>
               Guardar Cotización
             </Button>
             
             <Button type="submit" onClick={CotizacionPureva}>Generar Cotización de Prueba Formato Actual</Button>
           </div>
         </Form>
       </div>
     </div>
   );

   const renderOrdenesTrabajo = () => (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Órdenes de Trabajo</h1>
      <Form
        form={fromOrdenTrabajo} // Vincula el formulario con fromOrdenTrabajo
        layout="vertical"
        onFinish={handleGuardarOrdenTrabajo}
      >
        <Form.Item label="Nombre del formato:" name="nombreFormato" 
        rules={[{message: 'Ingrese el nombre del formato de orden de trabajo.' }]}>
          <Input placeholder="Ingrese el nombre del formato de orden de trabajo." />
        </Form.Item>
        <Form.Item label="Versión del formato:" name="version" 
        rules={[{message: 'Ingrese la versión del formato.' }]}>
          <Input placeholder="Ingrese la versión del formato." />
        </Form.Item>
        <Form.Item label="Fecha de Emisión:" name="fechaEmision"
        rules={[{ message: 'Ingrese la fecha de emisión.' }]}>
          <Input placeholder="Ingrese la fecha de emisión." />
        </Form.Item>
        <Form.Item label="Título del documento:" name="tituloDocumento"
        rules={[{ required: true, message: 'Ingrese el título del documento.' }]}>
          <Input placeholder="Ingrese el título del documento." />
        </Form.Item>
          <Alert message="Etes prefijo se mostrara al inicio de la OT ejemplo: 'A'230301-01" type="warning" />
            <Form.Item label="prefijo de OT" name="prefijo">
             <Input />
            </Form.Item>
        <Alert
          message="Advertencia"
          description="Solo Imagenes con la extencion PNG."
          type="warning"
          showIcon
        /><br/>
        <Form.Item
          label="Imagen marca de agua:"
          name="marcaDeAgua"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
        {marcaAgua ? (
            <>
            <p>Imagen cargada actualmente:</p>
            <img
              src={marcaAgua}
              alt="Marca de Agua"
              style={{ width: 100, height: 'auto', opacity: 0.4, border: '2px solid #ddd', borderRadius: 4 }}
            />
            </>
          ):(
            <>
            <p style={{ color: "red", fontWeight: "bold" }}>
              No se ha subido ninguna imagen de marca de agua.
            </p>
            <br/>
          </>)}
        </Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Guardar Orden
        </Button>
      </Form>
    </div>
  );
   

   const renderConfiguracionSistema = () => (
    
     <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1>Configuración del Sistema</h1>
       <Form layout="vertical" 
      form={formConfiguracion} 
      onFinish={handleGuardarConfiguracionSistema}
      initialValues={infConfiguracion}>
         <Form.Item label="Moneda Predeterminada:" name="tipoMoneda" required>
          <Select placeholder="Seleccione la moneda predeterminada." disabled={true}>
            {tipoMoneda.map((moneda) => (
              <Select.Option key={moneda.id} value={moneda.id}>
                {moneda.codigo} {moneda.descripcion}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Tasa de IVA Predeterminada:" name="iva" required>
          <Select placeholder="Seleccione la tasa de IVA predeterminada." >
            {iva.map((tasa) => (
              <Select.Option key={tasa.id} value={tasa.id} >
                {tasa.porcentaje}%
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
         <Form.Item label="Tipo de cambio dólar:" name="tipoCambioDolar"
         rules={[{ required: true, message: "Ingrese el tipo de cambio del dólar." }]}>
           <Input type="number" min="0" placeholder="Ingrese el tipo de cambio del dólar." />
         </Form.Item>
         <Button type="primary" htmlType="submit" loading={loading} style={{ width: "100%" }}>
           Guardar configuración de sistema
         </Button>
       </Form>
     </div>
   );
   
     return(
          <div className="main-container">
          <Tabs activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}>
            <Tabs.TabPane tab="Organización" key="1">
              {activeTab==="1"&&renderOrganizacion()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Cotizaciones" key="2">
              {activeTab==="2"&&renderCotizaciones()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Órdenes de Trabajo" key="3">
              {activeTab==="3"&&renderOrdenesTrabajo()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Configuración del sistema" key="4">
              {activeTab==="4"&&renderConfiguracionSistema()}
            </Tabs.TabPane>
          </Tabs>
    
          {/* Modal de alerta */}
          <Modal
            title="¡Alerta!"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Sí, seguro"
            cancelText="No, cancelar"
          >
            <p>¿Estás seguro? No podrás revertir los cambios.</p>
          </Modal>

          {/* Modal de éxito */}
          <Modal
            open={isSuccessModalVisible}
            onOk={handleSuccessOk}
            cancelButtonProps={{ style: { display: "none" } }} // Ocultar botón de cancelar
            okText="Aceptar"
          >
            <Result
            status="success"
            title="¡Éxito!"
            subTitle="Los cambios se guardaron correctamente."/>
          </Modal>

          {/* Modal de error */}
          <Modal
            title="¡Error!"
            open={isErrorModalVisible} // ✅ Verifica que este estado cambie correctamente
            onOk={handleErrorOk}
            cancelButtonProps={{ style: { display: "none" } }}
            okText="Aceptar"
          >
            <Alert
              message="Se ha producido un error"
              description={
                <pre
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "5px",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                  }}
                >
                  {errorMessage}
                </pre>
              }
              type="error"
              showIcon
            />
          </Modal>
        </div>
      );
};
export default ConfiguraciónOrganizacion;