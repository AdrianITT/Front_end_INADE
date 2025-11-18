import { useState } from "react";
import { Steps, Button, message, Form } from "antd";
import { registrarEmpresaYUsuario } from "../../../apis/ApisServicioCliente/RegistroWizard/registroWizardApi";
import MarcaAguaForm from "./steps/MarcaAguaForm";
import InfoSistemaForm from "./steps/InfoSistemaForm";
import OrganizacionForm from "./steps/OrganizacionForm";
import CertificadosForm from "./steps/CertificadosForm";
import UsuarioForm from "./steps/UsuarioForm";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
DOMPurify.setConfig({
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "p", "br", "center", "ul", "ol", "li", "u", "h1", "h2", "h3", "h4", "h5"
  ],
  ALLOWED_ATTR: ["style"], // opcional si necesitas centrado o fuente personalizada
  KEEP_CONTENT: true // evita eliminar contenido interno al limpiar etiquetas no permitidas
});

const { Step } = Steps;

const RegistroWizard = () => {
  const [current, setCurrent] = useState(0);

  // 🔹 Formularios por cada paso
  const [formMarcaAgua] = Form.useForm();
  const [formInfoConfig] = Form.useForm();
  const [formCotizacion] = Form.useForm();
  const [formOrden] = Form.useForm();
  const [formOrganizacion] = Form.useForm();
  const [formUsuario] = Form.useForm();

  const [wizardData, setWizardData] = useState({
  marcaAgua: {},
  infoSistema: {},
  organizacion: {},
  usuario: {}
})

//Navigate
const navigate = useNavigate();

  const steps = [
    {
      title: "Marca de Agua",
      content: <MarcaAguaForm form={formMarcaAgua} />,
    },
    {
      title: "Info Sistema",
      content: <InfoSistemaForm           
          formConfiguracion={formInfoConfig}
          formCotizacion={formCotizacion}
          fromOrdenTrabajo={formOrden} 
          />,
    },
    {
      title: "Organización",
      content: <OrganizacionForm form={formOrganizacion} />,
    },
    {
      title: "Usuario",
      content: <UsuarioForm form={formUsuario} />,
    },
  ];

  const next = async () => {
    try {
      let values = {};
      let key = "";

      if (current === 1) {

        await Promise.all([
          formInfoConfig.validateFields(),
          formCotizacion.validateFields(),
          formOrden.validateFields(),
        ]);
        values = {
          configuracion: formInfoConfig.getFieldsValue(),
          cotizacion: formCotizacion.getFieldsValue(),
          orden: formOrden.getFieldsValue(),
        };
        message.success("🚀 Todo perfecto");
        key = "infoSistema";
      } else if (current === 2) {
        
        values = formOrganizacion.getFieldsValue();
        key = "organizacion";
      } else if (current === 3) {
        values = formUsuario.getFieldsValue();
        key = "usuario";
      }

      // Guarda los datos del paso actual
      setWizardData((prev) => ({ ...prev, [key]: values }));

      setCurrent(current + 1);
    } catch (error) {
      //console.error("❌ Error de validación en el paso", current, error);
      message.warning("Por favor completa todos los campos requeridos antes de continuar.");
    }
  };


  const prev = () => {
    setCurrent(current - 1);
  };

// 🧼 Limpieza profunda con detección de contenido malicioso
  const sanitizeData = (data) => {
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

    const cleanedData = {
      ...data,
      organizacion: clean(data.organizacion || {}),
      usuario: clean(data.usuario || {}),
      infoSistema: {
        configuracion: clean(data.infoSistema.configuracion || {}),
        cotizacion: clean(data.infoSistema.cotizacion || {}),
        orden: clean(data.infoSistema.orden || {}),
      },
    };

    return { cleanedData, isMalicious };
  };



  const finish = async () => {
    try {
      // 🔍 1️⃣ Verificar si hay imagen de marca de agua
      // const marcaAguaData = formMarcaAgua.getFieldValue("marcaAgua");

      // if (!marcaAguaData || marcaAguaData.length === 0) {
      //   message.warning("Por favor sube una imagen de marca de agua antes de continuar.");
      //   return; // ❌ Detiene el envío al backend
      // }

      // 🔹 2️⃣ Validar también el formulario de usuario antes de enviar
      await formUsuario.validateFields();

      // 🔹 3️⃣ Obtener todos los valores finales
      const finalValues = formUsuario.getFieldsValue();
      const allData = {
        ...wizardData,
        usuario: finalValues,
      };

      // 🧼 Sanitizar y verificar si hay intento de código malicioso
      const { cleanedData, isMalicious } = sanitizeData(allData);

      if (isMalicious) {
        message.error(
          "Se detectó contenido inseguro (HTML o script) en algunos campos. Por favor, revisa tu información."
        );
        console.warn("🚫 Registro bloqueado por contenido potencialmente peligroso.");
        return; // ❌ Detiene el envío al backend
      }

      // console.log("🧾 Enviando datos al backend:", cleanedData);

      // 🔹 4️⃣ Enviar al backend
      const response = await registrarEmpresaYUsuario(cleanedData);

      // 🔹 5️⃣ Mostrar éxito
      message.success(response.mensaje || "Registro completado correctamente 🎉");

      return navigate("/");
    } catch (error) {
      // 🔹 6️⃣ Manejo de errores conocidos
      if (error?.error === "ORGANIZACION_EXISTE") {
        message.warning("Ya existe una organización con ese nombre o RFC.");
      } else if (error?.error === "USUARIO_EXISTE") {
        message.warning("Ya existe un usuario con ese nombre de usuario.");
      } else {
        // console.error("❌ Error general en finish:", error);
        message.error("Error al registrar. Verifique los datos e intente de nuevo.");
      }
    }
  };




  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <Steps current={current} style={{ marginBottom: 40 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div style={{ minHeight: 400 }}>{steps[current].content}</div>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        {current > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Atrás
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Siguiente
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={finish}>
            Finalizar
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegistroWizard;
