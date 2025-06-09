// RegistroCotizacion.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, Row, Col, Select, DatePicker, Divider, message, Modal, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import ClienteInfoCard from "./ClienteInfoCard";
import ConceptoCard from "./ConceptoCard";
import CotizacionTotales from "./CotizacionTotales";
import ModalNuevoServicio from "./ModalNuevoServicio";
import ModalMetodo from "./ModalMetodo";
import ModalConfirmacion from "./ModalConfirmacion";
import { calcularTotales, formatDate } from "./helper";
import { getClienteById } from "../../../../apis/ApisServicioCliente/ClienteApi";
import { getEmpresaById } from '../../../../apis/ApisServicioCliente/EmpresaApi';
import { getAllTipoMoneda } from "../../../../apis/ApisServicioCliente/Moneda";
import { getAllIva } from "../../../../apis/ApisServicioCliente/ivaApi";
import { getServicioData } from "../../../../apis/ApisServicioCliente/ServiciosApi";
import { createCotizacion } from "../../../../apis/ApisServicioCliente/CotizacionApi";
import { createCotizacionServicio } from "../../../../apis/ApisServicioCliente/CotizacionServicioApi";
import { getInfoSistema } from "../../../../apis/ApisServicioCliente/InfoSistemaApi";
import { getAllClaveCDFI } from "../../../../apis/ApisServicioCliente/ClavecdfiApi";
import { getAllUnidadCDFI } from "../../../../apis/ApisServicioCliente/unidadcdfiApi";
import {createMetodo, getAllMetodoData} from "../../../../apis/ApisServicioCliente/MetodoApi";
import {createServicio} from "../../../../apis/ApisServicioCliente/ServiciosApi";
import {getUserById}from "../../../../apis/ApisServicioCliente/UserApi";
import { descifrarId, cifrarId } from "../../secretKey/SecretKey";

const RegistroCotizacion = () => {
  const navigate = useNavigate();
  const { clienteIds } = useParams();
  const [form] = Form.useForm();
  const [conceptos, setConceptos] = useState([{ id: 1, servicio: "", cantidad: 1, precio: 0, precioFinal: 0, descripcion: "", orden: 1 }]);
  const [clienteData, setClienteData] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [unidad, setUnidad] = useState([]);
  const [clavecdfi, setClavecdfi] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [tiposMoneda, setTiposMoneda] = useState([]);
  const [ivas, setIvas] = useState([]);
  const [fechaSolicitada, setFechaSolicitada] = useState(null);
  const [fechaCaducidad, setFechaCaducidad] = useState(null);
  const [tipoMonedaSeleccionada, setTipoMonedaSeleccionada] = useState(null);
  const [ivaSeleccionado, setIvaSeleccionado] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [modales, setModales] = useState({ servicio: false, metodo: false, confirmacion: false });
  const [cotizacionPreview, setCotizacionPreview] = useState(null);
  const [idCotizacionCreada, setIdCotizacionCreada] = useState(null);
  const [loadings, setLoadings] = useState(false);
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  const clienteId = descifrarId(clienteIds);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [monedas, ivasResp, serviciosResp, claves, unidades, metodosResp] = await Promise.all([
          getAllTipoMoneda(),
          getAllIva(),
          getServicioData(organizationId),
          getAllClaveCDFI(),
          getAllUnidadCDFI(),
          getAllMetodoData(organizationId),
        ]);
        setTiposMoneda(monedas.data);
        setIvas(ivasResp.data);
        setServicios(serviciosResp.data);
        setClavecdfi(claves.data);
        setUnidad(unidades.data);
        setMetodos(metodosResp.data);
      } catch (error) {
        message.error("Error al cargar datos iniciales");
      }
    };
    fetchDatos();
  }, [organizationId]);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const cliente = await getClienteById(clienteId);
        setClienteData(cliente.data);
        const empresa = await getEmpresaById(cliente.data.empresa);
        setEmpresaData(empresa.data);
      } catch (error) {
        message.error("Error al cargar cliente y empresa");
      }
    };
    fetchCliente();
  }, [clienteId]);

  useEffect(() => {
    getInfoSistema().then((res) => {
      setTipoCambioDolar(parseFloat(res.data[0]?.tipoCambioDolar || 1));
    });
  }, []);

  const handleFechaSolicitadaChange = (date) => {
    setFechaSolicitada(date);
    setFechaCaducidad(date ? date.add(1, "month") : null);
  };

  const handleInputChange = (id, field, value) => {
    setConceptos(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleServicioChange = (id, servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (servicio) {
      setConceptos(prev => prev.map(c => c.id === id ? {
        ...c,
        servicio: servicio.id,
        metodoCodigo: servicio.metodos,
        precio: servicio.precio,
        precioFinal: servicio.precio
      } : c));
    }
  };

  const handleAddConcepto = () => {
    const nuevo = [...conceptos, { id: conceptos.length + 1, servicio: "", cantidad: 1, precio: 0, descripcion: "" }];
    setConceptos(nuevo.map((c, i) => ({ ...c, orden: i + 1 })));
  };

  const handleRemoveConcepto = (id) => {
    if (conceptos.length > 1) {
      setConceptos(conceptos.filter(c => c.id !== id));
    } else {
      message.warning("Debe haber al menos un concepto");
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const userId = localStorage.getItem("user_id");
      const userResp = await getUserById(userId);
      const nombreusuario = `${userResp.data.first_name} ${userResp.data.last_name}`;

      const payload = {
        fechaSolicitud: formatDate(fechaSolicitada),
        fechaCaducidad: formatDate(fechaCaducidad),
        denominacion: `Cotización en ${tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}`,
        iva: ivaSeleccionado,
        cliente: clienteData.id,
        estado: 1,
        descuento,
        tipoMoneda: tipoMonedaSeleccionada,
        nombreusuario,
      };
      setCotizacionPreview(payload);
      setModales(prev => ({ ...prev, confirmacion: true }));
    } catch {
      message.error("Completa todos los campos requeridos");
    }
  };

  const handleConfirmCreate = async () => {
    setLoadings(true);
    try {
      const cotizacionResp = await createCotizacion(cotizacionPreview);
      const cotizacionId = cotizacionResp.data.id;
      setIdCotizacionCreada(cotizacionId);

      for (const concepto of conceptos) {
        await createCotizacionServicio({
          descripcion: concepto.descripcion,
          precio: concepto.precioFinal,
          cantidad: concepto.cantidad,
          cotizacion: cotizacionId,
          servicio: concepto.servicio,
        });
      }

      message.success("Cotización creada correctamente");
      navigate(`/detalles_cotizaciones/${cifrarId(cotizacionId)}`);
    } catch {
      message.error("Error al crear la cotización");
    } finally {
      setLoadings(false);
    }
  };

  const { subtotal, descuentoValor, subtotalConDescuento, iva, total } = calcularTotales({
    conceptos,
    descuento,
    tipoCambioDolar,
    tipoMoneda: tipoMonedaSeleccionada,
    ivaPct: ivas.find(i => i.id === ivaSeleccionado)?.porcentaje,
  });

  if (!clienteData || !empresaData) return <Spin spinning={true} tip="Cargando..." />;

  return (
    <div className="cotizacion-container">
      <h1 className="cotizacion-title">Registro de Cotización</h1>

      <Form form={form} layout="vertical">
        <ClienteInfoCard clienteData={clienteData} empresaData={empresaData} />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Fecha Solicitada" name="fechaSolicitada" rules={[{ required: true }]}> 
              <DatePicker value={fechaSolicitada} onChange={handleFechaSolicitadaChange} style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Fecha Caducidad" rules={[{ required: true }]}> 
              <DatePicker value={fechaCaducidad} style={{ width: "100%" }} format="DD/MM/YYYY" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tipo de Moneda" name="tipoMonedaSeleccionada" rules={[{ required: true }]}> 
              <Select value={tipoMonedaSeleccionada} onChange={setTipoMonedaSeleccionada}>
                {tiposMoneda.map(moneda => (
                  <Select.Option key={moneda.id} value={moneda.id}>{moneda.codigo} - {moneda.descripcion}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="IVA" name="ivaSeleccionado" rules={[{ required: true }]}> 
              <Select value={ivaSeleccionado} onChange={setIvaSeleccionado}>
                {ivas.map(iva => (
                  <Select.Option key={iva.id} value={iva.id}>{iva.porcentaje}%</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Descuento (%)" rules={[{ required: true }]}> 
          <Input type="number" min={0} max={100} value={descuento} onChange={e => setDescuento(parseFloat(e.target.value))} />
        </Form.Item>

        <Divider>Agregar Conceptos</Divider>
        {conceptos.map((c, i) => (
          <ConceptoCard
            key={c.id}
            concepto={c}
            index={i}
            servicios={servicios}
            onChange={handleInputChange}
            onServicioChange={handleServicioChange}
            onRemove={handleRemoveConcepto}
          />
        ))}

        <Button onClick={handleAddConcepto}>Añadir Concepto</Button>
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col>
          <CotizacionTotales
               {...{
               subtotal,
               descuentoValor,
               subtotalConDescuento,
               iva,
               total,
               tipoMonedaSeleccionada,
               descuento,
               ivaSeleccionado,
               ivasData: ivas,
               }}
          />
          </Col>
          </Row>



        <div style={{ marginTop: 24 }}>
          <Button type="default" danger onClick={() => navigate("/cliente")}>Cancelar</Button>
          <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 12 }}>Crear</Button>
        </div>
      </Form>

      <ModalNuevoServicio
        visible={modales.servicio}
        onClose={() => setModales(prev => ({ ...prev, servicio: false }))}
        onCreate={(nuevo) => setServicios(prev => [...prev, nuevo])}
        unidad={unidad}
        clavecdfi={clavecdfi}
        metodos={metodos}
        organizationId={organizationId}
        createServicioFn={createServicio}
      />

      <ModalMetodo
        visible={modales.metodo}
        onClose={() => setModales(prev => ({ ...prev, metodo: false }))}
        onCreate={(nuevo) => setMetodos(prev => [...prev, nuevo])}
        organizationId={organizationId}
        createMetodoFn={createMetodo}
      />

      <ModalConfirmacion
        visible={modales.confirmacion}
        onConfirm={handleConfirmCreate}
        onCancel={() => setModales(prev => ({ ...prev, confirmacion: false }))}
        data={cotizacionPreview}
        clienteData={clienteData}
        tipoMonedaSeleccionada={tipoMonedaSeleccionada}
        ivaSeleccionado={ivaSeleccionado}
        ivasData={ivas}
      />
    </div>
  );
};

export default RegistroCotizacion;
