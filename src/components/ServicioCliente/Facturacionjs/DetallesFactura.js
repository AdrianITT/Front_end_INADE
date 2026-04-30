import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tabs,
  Dropdown,
  Menu,
  Modal,
  Select,
  Input,
  Form,
  DatePicker,
  Flex,
  Alert,
  Checkbox,
  message,
  Descriptions,
  Result,
  Spin,
  Space,
  Popover,
} from "antd";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Text, PDFDownloadLink } from "@react-pdf/renderer";
import {
  FileTextTwoTone,
  MailTwoTone,
  FilePdfTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

import {
  createPDFfactura,
  deleteFactura,
  getAllDataFactura,
  getAllDataPreFactura,
  getAllFacturaByOrganozacion,
  deleteFacturRenplasar,
  updatepachFactura,
  getFacturRespaldo,
  getFacturaRelacionX,
  getRelationTypes,
} from "../../../apis/ApisServicioCliente/FacturaApi";

import { Api_Host } from "../../../apis/api";
import PaymentCards from "../Facturacionjs/FacturaPagos";
import { getAllFacturaPagos } from "../../../apis/ApisServicioCliente/FacturaPagosApi";
import { getOrganizacionById } from "../../../apis/ApisServicioCliente/organizacionapi";
import { getAllfacturafacturama } from "../../../apis/ApisServicioCliente/FacturaFacturamaApi";
import { updateInfoSistemapatch, getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import { confirmTipoCambioBanxicoSelects } from "./confirmarCambioBanxico/confirmarCambioBanxico";
import PDFpreFactura from "./Plantilla/PDFpreFactura";
import ComprobantePago from "./ModalComprobantePago";
import PopInputEditar from "./PopInputEditarFactura";
import "./estiloDetalleFactura.css";
import { NumerosALetras } from "numero-a-letras";
import { cifrarId, descifrarId } from "../secretKey/SecretKey";
import { validarAccesoPorOrganizacion } from "../validacionAccesoPorOrganizacion";
import AddendaModal from "./AddendaModal";

const { Option } = Select;

const CANCEL_INFO = (
  <div>
    <p>Solo disponible para facturas con relación.</p>
    <p>La cancelación puede tardar hasta 3 días en reflejarse en el SAT.</p>
  </div>
);

const RAZONES_DELETE = [
  { id: "01", descripcion: "Comprobantes emitidos con errores con relación." },
  { id: "02", descripcion: "Comprobantes emitidos con errores sin relación." },
  { id: "03", descripcion: "No se llevó a cabo la operación." },
  { id: "04", descripcion: "Operación nominativa relacionada en una factura global." },
];

const getMonedaInfo = (monedaCodigo = "") => ({
  codigo: String(monedaCodigo).toUpperCase().includes("USD") ? "USD" : "MXN",
  descripcion: monedaCodigo || "MXN",
});

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const DetallesFactura = () => {
  const { ids } = useParams();
  const id = useMemo(() => descifrarId(ids), [ids]);
  const facturaId = id;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  const [factura, setFactura] = useState({});
  const [loading, setLoading] = useState(false);

  const [visibleCancelModal, setVisibleCancelModal] = useState(false);
  const [visiblePaymentModal, setVisiblePaymentModal] = useState(false);
  const [isModalVisibleCorreo, setIsModalVisibleCorreo] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [modalAddenda, setModalAddenda] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultStatus, setResultStatus] = useState("success");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const [extraEmails, setExtraEmails] = useState("");
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [facturaExiste, setFacturaExiste] = useState(null);

  const [dataFactura, setDataFactura] = useState(null);
  const [dataLogo, setDataLogo] = useState(null);

  const [facturaPagos, setFacturaPagos] = useState(null);

  const [facturas, setFacturas] = useState([]);
  const [facturaReemplazoId, setFacturaReemplazoId] = useState(null);
  const [isRespaldoModalVisible, setIsRespaldoModalVisible] = useState(false);
  const [notaCredito, setNotaCredito] = useState(false);
  const [reemplazoActivo, setReemplazoActivo] = useState(false);
  const [razonDeleteId, setRazonDeleteId] = useState(null);

  const [relationtype, setRelationType] = useState([]);
  const [relationtypeId, setRelationTypeId] = useState(null);
  const [showErrores, setShowErrors] = useState(false);

  const moneda = useMemo(() => getMonedaInfo(factura?.monedaCodigo), [factura?.monedaCodigo]);
  const esUSD = moneda.codigo === "USD";

  const cliente = useMemo(
    () => ({
      nombreCompleto: factura?.contacto || "",
      correo: factura?.correo || "",
    }),
    [factura?.contacto, factura?.correo]
  );

  const empresa = useMemo(
    () => ({
      nombre: factura?.empresa || "",
      rfc: factura?.rfcEmpresa || "",
    }),
    [factura?.empresa, factura?.rfcEmpresa]
  );

  const servicios = useMemo(
    () =>
      (factura?.servicios ?? []).map((serv) => ({
        key: serv.servicioId,
        servicio: serv.servicio?.nombre || "",
        cantidad: serv.cantidad,
        precioUnitario: Number(serv.precioUnitario || 0),
        total: Number(serv.subtotal || 0),
      })),
    [factura?.servicios]
  );

  const valores = useMemo(() => factura?.valores ?? {}, [factura?.valores]);

  const importeTotal = useMemo(
    () => Number(valores.importe ?? valores.totalFinal ?? 0),
    [valores]
  );

  const hasPagos = useMemo(() => !!facturaPagos, [facturaPagos]);

  const montoRestante = useMemo(() => {
    if (!facturaPagos) return 0;
    return Number(facturaPagos.montototal || 0) - Number(facturaPagos.montopago || 0);
  }, [facturaPagos]);

  const puedoCancelar = useMemo(
    () => factura?.estado !== "Cancelado",
    [factura?.estado]
  );

  const preFacturaTexto = useMemo(() => {
    if (!dataFactura?.valores?.totalFinal) {
      return {
        centavos: "00/100",
        centavostext: "",
      };
    }

    const total = Number(dataFactura.valores.totalFinal || 0);
    const parteEntera = Math.floor(total);
    const centavosNum = Math.round((total - parteEntera) * 100);

    const letras = NumerosALetras(parteEntera)
      .replace("M.N.", "")
      .replace(/00\/100/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      centavos: `${centavosNum.toString().padStart(2, "0")}/100`,
      centavostext: `${letras.toUpperCase()} `,
    };
  }, [dataFactura]);

  const facturaOptions = useMemo(
    () =>
      facturas.map((f) => ({
        label: `Factura #${f.folio} - ${f.empresa || "Empresa desconocida"}`,
        value: f.id,
      })),
    [facturas]
  );

  const razonDeleteOptions = useMemo(
    () =>
      RAZONES_DELETE.map((r) => ({
        label: `${r.id} - ${r.descripcion}`,
        value: r.id,
      })),
    []
  );

  const relationTypeOptions = useMemo(
    () =>
      relationtype.map((item) => ({
        label: `${item.codigo} - ${item.descripcion || "Descripción desconocida"}`,
        value: item.codigo,
      })),
    [relationtype]
  );

  const columnsConceptos = useMemo(
    () => [
      {
        title: "Servicio",
        dataIndex: "servicio",
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
        render: (valor) => `$${Number(valor || 0).toFixed(2)} ${esUSD ? "USD" : "MXN"}`,
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (valor) => `$${Number(valor || 0).toFixed(2)} ${esUSD ? "USD" : "MXN"}`,
      },
    ],
    [esUSD]
  );

  const refreshPagos = useCallback(async () => {
    try {
      const response = await getAllFacturaPagos(id);
      const pagos = response?.data?.pagos ?? [];
      setFacturaPagos(pagos.length ? pagos[pagos.length - 1] : null);
    } catch (error) {
      console.error("Error al refrescar los pagos:", error);
      setFacturaPagos(null);
    }
  }, [id]);

  const loadMainData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        facturaResp,
        preFacturaResp,
        organizacionResp,
        infoSistemaResp,
        pagosResp,
        facturamaResp,
      ] = await Promise.all([
        getAllDataFactura(id),
        getAllDataPreFactura(id),
        getOrganizacionById(organizationId),
        getInfoSistema(),
        getAllFacturaPagos(id),
        getAllfacturafacturama(),
      ]);

      const facturaData = facturaResp?.data ?? {};
      setFactura(facturaData);

      setDataFactura(preFacturaResp?.data ?? null);
      setDataLogo(organizacionResp?.data ?? null);

      const tipoCambio = Number(infoSistemaResp?.data?.[0]?.tipoCambioDolar || 1);
      setTipoCambioDolar(tipoCambio);

      const pagos = pagosResp?.data?.pagos ?? [];
      setFacturaPagos(pagos.length ? pagos[pagos.length - 1] : null);

      const existeEnFacturama = (facturamaResp?.data ?? []).some(
        (item) => Number(item.factura) === Number(id)
      );
      setFacturaExiste(existeEnFacturama);
    } catch (error) {
      console.error("Error al cargar la información de la factura:", error);
      message.error("No se pudo cargar la información de la factura.");
    } finally {
      setLoading(false);
    }
  }, [id, organizationId]);

  const loadFacturasRelacionadas = useCallback(async () => {
    if (!organizationId) return;

    try {
      const [typesResp, facturasResp] = await Promise.all([
        getRelationTypes(),
        getAllFacturaByOrganozacion(organizationId),
      ]);

      const filtrados = (typesResp?.data ?? []).filter(
        (item) => !["02", "05", "06", "08", "09"].includes(item.codigo)
      );
      setRelationType(filtrados);

      const facturasFiltradas = (facturasResp?.data ?? []).filter(
        (item) => Number(item.id) !== Number(id)
      );
      setFacturas(facturasFiltradas);
    } catch (error) {
      console.error("Error cargando facturas relacionadas:", error);
    }
  }, [organizationId, id]);

  const downloadFromUrl = useCallback(async (url, contentType, filename) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": contentType,
      },
    });

    if (!response.ok) {
      throw new Error(`No se pudo descargar ${filename}`);
    }

    const blob = await response.blob();
    triggerDownload(blob, filename);
  }, []);

  const base64ToPdf = useCallback((base64, filename = "acuse_cancelacion.pdf") => {
    if (!base64) {
      message.error("No se recibió el PDF para descargar.");
      return false;
    }

    try {
      const blob = base64ToBlob(base64, "application/pdf");
      triggerDownload(blob, filename);
      return true;
    } catch (error) {
      console.error("Error al decodificar PDF:", error);
      message.error("Error al preparar el archivo PDF.");
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!organizationId || !id) return;

      const acceso = await validarAccesoPorOrganizacion({
        fetchFunction: getAllFacturaByOrganozacion,
        organizationId,
        id,
        campoId: "id",
        navigate,
        mensajeError: "Acceso denegado a esta precotización.",
      });

      if (!acceso || cancelled) return;
      await loadMainData();
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [organizationId, id, navigate, loadMainData]);

  useEffect(() => {
    const shouldLoad = isRespaldoModalVisible || reemplazoActivo || notaCredito;
    if (!shouldLoad) return;
    loadFacturasRelacionadas();
  }, [isRespaldoModalVisible, reemplazoActivo, notaCredito, loadFacturasRelacionadas]);

  useEffect(() => {
    let timer;
    if (isSuccessModalVisible) {
      timer = setTimeout(() => {
        setIsSuccessModalVisible(false);
        navigate("/factura");
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [isSuccessModalVisible, navigate]);

  const handleActualizar = useCallback(
    async (data) => {
      try {
        setLoading(true);
        await updatepachFactura(id, data);
        const refreshed = await getAllDataFactura(id);
        setFactura(refreshed?.data ?? {});
        message.success("Dato actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar factura:", error);
        message.error("Error al actualizar");
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const showModalCorreo = useCallback(() => {
    setIsModalVisibleCorreo(true);
  }, []);

  const handleOkPayment = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        setVisiblePaymentModal(false);
      })
      .catch((error) => {
        console.error("Error en el formulario:", error);
      });
  }, [form]);

  const handleCrearFactura = useCallback(async () => {
    let shouldShowResult = true;

    try {
      setLoading(true);

      if (esUSD) {
        const rate = await confirmTipoCambioBanxicoSelects({
          token: "3487379dee962285e81cbbad6bea7ef19936271d8ec7fff95170cae223bdc144",
          serie: "SF43718",
          daysBack: 60,
        });

        if (rate == null) {
          shouldShowResult = false;
          return;
        }

        await updateInfoSistemapatch(1, { tipoCambioDolar: Number(rate).toFixed(2) });
        setTipoCambioDolar(Number(rate));
      }

      const response = await createPDFfactura(id);

      if (response && response.success) {
        setFacturaExiste(true);
        setResultMessage("Factura creada con éxito.");
        setResultStatus("success");
      } else {
        throw new Error("Error en la creación de factura: Respuesta no válida.");
      }
    } catch (error) {
      console.error("Error al crear la factura:", error);

      const apiMessage = error?.response?.data?.response?.Message;
      const modelState = error?.response?.data?.response?.ModelState;
      const detailedMessage = modelState ? Object.values(modelState)[0]?.[0] : null;

      const errorMessage =
        detailedMessage || apiMessage || error.message || "Error desconocido";

      const cleanMessage = String(errorMessage).split("Ver más")[0].trim();
      setResultMessage(`Hubo un error: ${cleanMessage}`);
      setResultStatus("error");
    } finally {
      setLoading(false);
      if (shouldShowResult) {
        setIsResultModalVisible(true);
      }
    }
  }, [esUSD, id]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      setLoading(true);
      await downloadFromUrl(
        `${Api_Host.defaults.baseURL}/factura-pdf/${id}/`,
        "application/pdf",
        `Factura_${factura.numerofactura || "sin_folio"}.pdf`
      );
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("No se pudo descargar el PDF.");
    } finally {
      setLoading(false);
    }
  }, [downloadFromUrl, id, factura.numerofactura]);

  const handleDownloadXML = useCallback(async () => {
    try {
      setLoading(true);
      await downloadFromUrl(
        `${Api_Host.defaults.baseURL}/factura-xml/${id}/`,
        "application/xml",
        `Factura_${factura.numerofactura || "sin_folio"}.xml`
      );
    } catch (error) {
      console.error("Error al descargar el XML:", error);
      message.error("No se pudo descargar el XML.");
    } finally {
      setLoading(false);
    }
  }, [downloadFromUrl, id, factura.numerofactura]);

  const handleDownloadAcuse = useCallback(async () => {
    try {
      setLoading(true);
      await downloadFromUrl(
        `${Api_Host.defaults.baseURL}/DescargarAcusePDF/${id}/`,
        "application/pdf",
        "Acuse_Factura.pdf"
      );
    } catch (error) {
      console.error("Error al descargar el acuse:", error);
      message.error("No se pudo descargar el PDF.");
    } finally {
      setLoading(false);
    }
  }, [downloadFromUrl, id]);

  const handleSendEmail = useCallback(async () => {
    try {
      setLoading(true);

      const emailList = extraEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter((email) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        setResultStatus("error");
        setResultMessage(`Correos inválidos: ${invalidEmails.join(", ")}`);
        setIsResultModalVisible(true);
        return;
      }

      const emailQuery =
        emailList.length > 0
          ? `emails=${encodeURIComponent(emailList.join(","))}`
          : "";

      const url = `${Api_Host.defaults.baseURL}/factura-pdf/${id}/enviar${
        emailQuery ? `?${emailQuery}` : ""
      }`;

      const response = await fetch(url, {
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
  }, [extraEmails, id]);

  const handleCancelFactura = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${Api_Host.defaults.baseURL}/factura-delete/${id}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        const pdfBase64 = result?.acuse_pdf_base64;

        if (pdfBase64) {
          base64ToPdf(pdfBase64, "acuse_cancelacion.pdf");
        }

        message.success("Factura cancelada exitosamente.");
        setVisibleCancelModal(false);
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
  }, [id, base64ToPdf]);

  const handDuoModal = useCallback(() => {
    setIsModalVisibleCorreo(false);
    setIsResultModalVisible(false);
  }, []);

  const handleDeleteFactura = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const confirmDeleteFactura = useCallback(async () => {
    try {
      await deleteFactura(id);
      message.success("Factura eliminada correctamente.");
      setIsDeleteModalVisible(false);
      navigate("/factura");
    } catch (error) {
      console.error("Error al eliminar la factura:", error);
      message.error("No se pudo eliminar la factura.");
    }
  }, [id, navigate]);

  const confirmRelacionFactura = useCallback(
    async (idA, idB) => {
      try {
        setLoading(true);
        await getFacturRespaldo(idB, idA);
        message.success("Proceso finalizado correctamente.");
        setIsRespaldoModalVisible(false);
        navigate(`/detallesfactura/${cifrarId(idB)}`);
      } catch (error) {
        console.error("Error al crear factura relacionada:", error);
        message.error("No se pudo completar el proceso.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const confirmNotaCredito = useCallback(
    async (idA, idB, related) => {
      if (!idB || !related) {
        setShowErrors(true);
        return;
      }

      try {
        setLoading(true);
        await getFacturaRelacionX(idB, idA, related);
        message.success("Proceso finalizado correctamente.");
        setNotaCredito(false);

        if (related === "04") {
          navigate(`/detallesfactura/${cifrarId(idB)}`);
        }
      } catch (error) {
        console.error("Error al crear factura con relación:", error);
        message.error("No se pudo completar el proceso.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const EliminarFacturaRemplazo = useCallback(
    async (idA, idB, razonId) => {
      if (!idB || !razonId) {
        message.warning("Selecciona la factura de reemplazo y la razón.");
        return;
      }

      try {
        setLoading(true);
        const data = await deleteFacturRenplasar(idA, idB, razonId);
        base64ToPdf(data?.data?.acuse_pdf_base64, "acuse_cancelacion.pdf");
        message.success("Factura eliminada y reemplazada correctamente.");
        setVisibleCancelModal(false);
        navigate(`/detallesfactura/${cifrarId(idB)}`);
      } catch (error) {
        console.error("Error al eliminar/reemplazar la factura:", error);
        message.error("No se pudo completar el proceso.");
      } finally {
        setLoading(false);
      }
    },
    [base64ToPdf, navigate]
  );

  const handleOpenConfirmModal = useCallback(() => {
    setIsConfirmModalVisible(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setIsConfirmModalVisible(false);
  }, []);

  const handleConfirmCrearFactura = useCallback(() => {
    setIsConfirmModalVisible(false);
    handleCrearFactura();
  }, [handleCrearFactura]);

  const abrirModal = useCallback(() => setModalAddenda(true), []);
  const cerrarModal = useCallback(() => setModalAddenda(false), []);

  const menu = useMemo(
    () => (
      <Menu>
        <Menu.Item key="1" onClick={showModalCorreo} icon={<MailTwoTone />}>
          Enviar por correo
        </Menu.Item>
        <Menu.Item key="3" onClick={handleDownloadPDF} icon={<FilePdfTwoTone />}>
          Descargar PDF
        </Menu.Item>
        <Menu.Item key="4" onClick={handleDownloadXML} icon={<FileTextTwoTone />}>
          Descargar XML
        </Menu.Item>
        <Menu.Item
          key="6"
          disabled={!puedoCancelar}
          onClick={() => setVisibleCancelModal(true)}
          icon={<CloseCircleTwoTone />}
        >
          Cancelar factura
        </Menu.Item>
        <Menu.Item
          key="7"
          onClick={handleDownloadAcuse}
          icon={<FileTextTwoTone />}
        >
          <Popover placement="right" content={CANCEL_INFO} arrow>
            <span>Descargar Acuse</span>
          </Popover>
        </Menu.Item>
        <Menu.Item key="8" onClick={abrirModal} icon={<FileTextTwoTone />}>
          Crear o editar Addenda
        </Menu.Item>
      </Menu>
    ),
    [
      showModalCorreo,
      handleDownloadPDF,
      handleDownloadXML,
      puedoCancelar,
      handleDownloadAcuse,
      abrirModal,
    ]
  );

  return (
    <Spin spinning={loading}>
      <div style={{ padding: "20px" }}>
        <h2>
          <center>
            Factura {factura.numerofactura} - Cotización {factura.numerocotizacion}
          </center>
        </h2>

        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Información" key="1">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Informacion" bordered>
                  <Row>
                    <Col span={12}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Folio">
                          {factura.numerofactura}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tipo de cfdi">
                          {factura.tipocfdi}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha">
                          {factura.fecha
                            ? new Date(factura.fecha).toLocaleString("es-MX", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Forma de Pago">
                          {factura.formaPago}
                        </Descriptions.Item>
                        <Descriptions.Item label="Método de Pago">
                          {factura.metodoPago}
                        </Descriptions.Item>
                        <Descriptions.Item label="Moneda">
                          {moneda.descripcion}
                        </Descriptions.Item>
                        <Descriptions.Item label="Orden de Compra">
                          {factura.ordenCompra || "No registrada"}
                          <PopInputEditar
                            onActualizar={handleActualizar}
                            label="ordenCompra"
                            fieldName="ordenCompra"
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Notas">
                          {factura.notas || "No registrada"}
                          <PopInputEditar
                            onActualizar={handleActualizar}
                            label="notas"
                            fieldName="notas"
                          />
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={12}>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Empresa">
                          {empresa.nombre}
                        </Descriptions.Item>
                        <Descriptions.Item label="RFC">
                          {empresa.rfc}
                        </Descriptions.Item>
                        <Descriptions.Item label="Contacto">
                          {cliente.nombreCompleto || "No registrado"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Correo">
                          {cliente.correo || "No registrado"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Porcentaje">
                          {factura.porcentajeFactura}% 
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={8}>
                {facturaExiste === false ? (
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
                              centavo={preFacturaTexto.centavos}
                              centavotext={preFacturaTexto.centavostext}
                            />
                          ) : (
                            <Text>Cargando...</Text>
                          )
                        }
                        fileName={`Pre_factura_${factura.numerofactura || "sin_folio"}.pdf`}
                      >
                        {({ loading: pdfLoading }) => (
                          <button
                            style={{
                              backgroundColor: "#007bff",
                              color: "#fff",
                              border: "none",
                              padding: "10px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {pdfLoading ? "Generando..." : "Pre-Factura PDF"}
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
                        loading={loading}
                        onClick={() => setNotaCredito(true)}
                        style={{ backgroundColor: "#ffc400ff" }}
                      >
                        Crear Factura con Relacion
                      </Button>
                    </div>
                  </Flex>
                ) : (
                  <div>
                    <Dropdown overlay={menu} trigger={["click"]}>
                      <Button type="primary" style={{ marginTop: "5px" }}>
                        Acciones para factura
                      </Button>
                    </Dropdown>
                    <ComprobantePago
                      isOpen={modalOpen}
                      onClose={() => setModalOpen(false)}
                      Total={importeTotal}
                    />
                  </div>
                )}

                <Card title="Cuenta" bordered style={{ marginTop: "20px", padding: "40px" }}>
                  <p>
                    <strong>Subtotal: </strong>
                    {valores.subtotal} {esUSD ? "USD" : "MXN"}
                  </p>
                  <p>
                    <strong>Descuento:</strong> {valores.descuentoCotizacion}%
                  </p>
                  <p>
                    <strong>Subtotal - Descuento:</strong> {valores.valorDescuento}{" "}
                    {esUSD ? "USD" : "MXN"}
                  </p>
                  <p>
                    <strong>IVA ({valores.ivaPct}%):</strong> {valores.ivaValor}{" "}
                    {esUSD ? "USD" : "MXN"}
                  </p>
                  <p>
                    <strong>Importe:</strong> {valores.totalFinal} {esUSD ? "USD" : "MXN"}
                  </p>
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

            {(!hasPagos || (hasPagos && montoRestante > 0)) &&
              factura.tipocfdi !== "Egreso" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "10px",
                  }}
                >
                  <Link to={`/CrearPagos/${cifrarId(id)}`}>
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                        borderRadius: 8,
                      }}
                    >
                      Crear pagos
                    </Button>
                  </Link>
                </div>
              )}

            <PaymentCards
              idFactura={id}
              correoCliente={cliente?.correo}
              refreshPagos={refreshPagos}
            />
          </Tabs.TabPane>
        </Tabs>

        <Modal
          title="Cancelando Factura"
          visible={visibleCancelModal}
          onCancel={() => !loading && setVisibleCancelModal(false)}
          footer={
            loading
              ? null
              : [
                  <Button key="cerrar" onClick={() => setVisibleCancelModal(false)}>
                    Cerrar
                  </Button>,
                  reemplazoActivo ? (
                    <Button
                      key="reemplazar"
                      type="primary"
                      danger
                      disabled={!facturaReemplazoId || !razonDeleteId}
                      loading={loading}
                      onClick={() =>
                        EliminarFacturaRemplazo(id, facturaReemplazoId, razonDeleteId)
                      }
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
                  ),
                ]
          }
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100px",
              }}
            >
              <Spin tip="Cancelando factura..." size="large" />
            </div>
          ) : (
            <>
              <p>
                ¿Estás seguro de que deseas cancelar esta factura? Esta acción no se
                puede deshacer.
              </p>

              <Checkbox
                checked={reemplazoActivo}
                onChange={(e) => setReemplazoActivo(e.target.checked)}
              >
                Quiero reemplazar esta factura por otra
              </Checkbox>

              {reemplazoActivo && (
                <>
                  <p style={{ marginTop: 16 }}>
                    Selecciona la factura con la que deseas reemplazar:
                  </p>

                  <Select
                    style={{ width: "100%", marginBottom: 12 }}
                    placeholder="Selecciona una factura para reemplazar"
                    value={facturaReemplazoId}
                    onChange={setFacturaReemplazoId}
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={facturaOptions}
                  />

                  <Select
                    style={{ width: "100%" }}
                    placeholder="Selecciona una razón"
                    value={razonDeleteId}
                    onChange={setRazonDeleteId}
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={razonDeleteOptions}
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
              rules={[
                {
                  required: true,
                  message: "Por favor selecciona la fecha de pago",
                },
              ]}
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
              rules={[
                {
                  required: true,
                  message: "Por favor selecciona un método de pago",
                },
              ]}
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
              rules={[
                { required: true, message: "Por favor ingresa la referencia" },
              ]}
            >
              <Input placeholder="Ingresa la referencia" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Enviar Factura por Correo"
          visible={isModalVisibleCorreo}
          onCancel={() => setIsModalVisibleCorreo(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisibleCorreo(false)}>
              Cerrar
            </Button>,
            <Button key="send" type="primary" onClick={handleSendEmail}>
              Enviar
            </Button>,
          ]}
        >
          <h4>Selecciona los correos a los que deseas enviar la factura:</h4>
          <Form layout="vertical">
            <Checkbox checked disabled>
              {cliente?.correo || "N/A"}
            </Checkbox>

            <Form.Item label="Correos adicionales (separados por coma):">
              <Input
                placeholder="ejemplo@correo.com, otro@correo.com"
                value={extraEmails}
                onChange={(e) => setExtraEmails(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={resultStatus === "success" ? "Éxito" : "Error"}
          visible={isResultModalVisible}
          onCancel={handDuoModal}
          footer={[
            <Button key="close" onClick={handDuoModal}>
              Cerrar
            </Button>,
          ]}
        >
          <Result
            title={
              <p style={{ color: resultStatus === "success" ? "green" : "red" }}>
                {resultMessage}
              </p>
            }
          />
        </Modal>

        <Modal
          title="Factura cancelada exitosamente"
          visible={isSuccessModalVisible}
          footer={null}
          maskClosable={false}
          closable={false}
        >
          <p>
            La factura ha sido cancelada. Serás redirigido al listado de facturas
            en 2 segundos...
          </p>
        </Modal>

        <Modal
          title="¿Estás seguro de eliminar esta factura?"
          visible={isDeleteModalVisible}
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

        <Modal
          title="¿Estás seguro de Remplasar esta factura?"
          visible={isRespaldoModalVisible}
          onCancel={() => setIsRespaldoModalVisible(false)}
          footer={[
            <Button key="cancelar" onClick={() => setIsRespaldoModalVisible(false)}>
              Cancelar
            </Button>,
            <Button
              key="crear"
              type="primary"
              disabled={!facturaReemplazoId}
              loading={loading}
              onClick={() => confirmRelacionFactura(id, facturaReemplazoId)}
            >
              Crear Factura
            </Button>,
          ]}
        >
          <p>Esta acción no se puede deshacer.</p>
          <p>
            Esta acción reemplazará la factura actual con otra seleccionada. No se
            puede deshacer.
          </p>
          <p>Por default 04-Situacion de los CFDI previos.</p>

          <Select
            style={{ width: "100%" }}
            placeholder="Selecciona una factura para reemplazar"
            value={facturaReemplazoId}
            onChange={setFacturaReemplazoId}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={facturaOptions}
          />
        </Modal>

        <Modal
          title="¿Estás seguro de Crear Factura con Relación?"
          visible={notaCredito}
          onCancel={() => {
            setNotaCredito(false);
            setFacturaReemplazoId(null);
            setRelationTypeId(null);
            setShowErrors(false);
          }}
          footer={[
            <Button
              key="cancelar"
              onClick={() => {
                setNotaCredito(false);
                setFacturaReemplazoId(null);
                setRelationTypeId(null);
                setShowErrors(false);
              }}
            >
              Cancelar
            </Button>,
            <Button
              key="crear"
              type="primary"
              disabled={!facturaReemplazoId || !relationtypeId}
              loading={loading}
              onClick={() => {
                setShowErrors(true);
                confirmNotaCredito(id, facturaReemplazoId, relationtypeId);
              }}
            >
              Crear Factura
            </Button>,
          ]}
        >
          <p>Esta acción no se puede deshacer.</p>
          <p>Selecciona la factura. No se puede deshacer.</p>

          <Alert
            message="Advertencia"
            description="Por favor de llenar todos los campos que se muestran a continuación"
            type="warning"
            showIcon
          />

          <Form layout="vertical">
            <Form.Item
              label="Factura a reemplazar"
              required
              validateStatus={showErrores && !facturaReemplazoId ? "error" : ""}
              help={
                showErrores && !facturaReemplazoId
                  ? "Selecciona una factura"
                  : ""
              }
            >
              <Select
                style={{ width: "100%" }}
                placeholder="Selecciona una factura para reemplazar"
                value={facturaReemplazoId}
                onChange={setFacturaReemplazoId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={facturaOptions}
              />
            </Form.Item>

            <Form.Item
              label="Tipo de relación"
              required
              validateStatus={showErrores && !relationtypeId ? "error" : ""}
              help={
                showErrores && !relationtypeId
                  ? "Selecciona el tipo de relación"
                  : ""
              }
            >
              <Select
                style={{ width: "100%" }}
                placeholder="Tipo de Relación"
                value={relationtypeId}
                onChange={setRelationTypeId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={relationTypeOptions}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="¿Estás seguro?"
          visible={isConfirmModalVisible}
          onOk={handleConfirmCrearFactura}
          onCancel={handleCancelConfirm}
          okText="Sí, crear"
          cancelText="Cancelar"
          centered
        >
          <p>¿Deseas crear la factura? Esta acción no se puede deshacer.</p>
        </Modal>

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