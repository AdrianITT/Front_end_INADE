import React, { useState, useEffect } from "react";
import "./Crearcotizacion.css";
import { Form, Input, Button, Row, Col, Select, Checkbox, Divider, message, DatePicker, Card, Modal,Result } from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { getClienteById } from "../../apis/ClienteApi";
import { getEmpresaById } from '../../apis/EmpresaApi';
import { getAllTipoMoneda } from "../../apis/Moneda";
import { getAllIva } from "../../apis/ivaApi";
import { getAllServicio } from "../../apis/ServiciosApi";
import { createCotizacion } from "../../apis/CotizacionApi";
import { createCotizacionServicio } from "../../apis/CotizacionServicioApi";
import { getInfoSistema } from "../../apis/InfoSistemaApi";

const { TextArea } = Input;

const RegistroCotizacion = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const { clienteId } = useParams();
  const [clienteData, setClienteData] = useState(null);
  const [fechaSolicitada, setFechaSolicitada] = useState(null);
  const [empresas, setEmpresaData] = useState([]);
  const [tiposMonedaData, setTiposMonedaData] = useState([]); // Datos completos de tipos de moneda
  const [tipoMonedaSeleccionada, setTipoMonedaSeleccionada] = useState(null); // Valor seleccionado
  const [ivasData, setIvasData] = useState([]); // Datos completos de IVA
  const [ivaSeleccionado, setIvaSeleccionado] = useState(null); // Valor seleccionado
  const [fechaCaducidad, setFechaCaducidad] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [descuento, setDescuento] = useState(0);
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [form] = Form.useForm();

  // Obtener el tipo de cambio del dólar
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
    fetchTipoCambio();
  }, []);

  const handleFechaSolicitadaChange = (date) => {
    setFechaSolicitada(date);
    if (date) {
      setFechaCaducidad(dayjs(date).add(1, "month"));
    } else {
      setFechaCaducidad(null);
    }
  };

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await getClienteById(clienteId);
        setClienteData(response.data);
        if (response.data && response.data.empresa) {
          const empresaId = response.data.empresa;
          const empresaResponse = await getEmpresaById(empresaId);
          setEmpresaData(empresaResponse.data);
        }
      } catch (error) {
        console.error("Error al obtener los datos del cliente", error);
        message.error("Error al cargar los datos del cliente");
      }
    };
    fetchCliente();
  }, [clienteId]);

  useEffect(() => {
    const fetchTipoMoneda = async () => {
      try {
        const response = await getAllTipoMoneda();
        setTiposMonedaData(response.data); // Almacena los datos completos
      } catch (error) {
        console.error('Error al cargar los tipos de moneda', error);
      }
    };
    const fetchIva = async () => {
      try {
        const response = await getAllIva();
        setIvasData(response.data); // Almacena los datos completos
      } catch (error) {
        console.error('Error al cargar los IVA', error);
      }
    };
    const fetchServicios = async () => {
      try {
        const response = await getAllServicio();
        setServicios(response.data);
      } catch (error) {
        console.error("Error al cargar los servicios", error);
      }
    };
    fetchIva();
    fetchTipoMoneda();
    fetchServicios();
  }, [clienteId]);

  const [conceptos, setConceptos] = useState([
    { id: 1, servicio: "", cantidad: 1, precio: 0,precioFinal: 0, descripcion: "" },
  ]);

  if (!clienteData || !empresas) {
    return <div>Loading...</div>;
  }

  const handleAddConcepto = () => {
    setConceptos([...conceptos, { id: conceptos.length + 1, servicio: "", cantidad: 1, precio: 0, descripcion: "" }]);
  };

  const handleRemoveConcepto = (id) => {
    if (conceptos.length > 1) {
      setConceptos(conceptos.filter((concepto) => concepto.id !== id));
    } else {
      message.warning("Debe haber al menos un concepto.");
    }
  };

  const handleInputChange = (id, field, value) => {
    const updatedConceptos = conceptos.map((concepto) =>
      concepto.id === id ? { ...concepto, [field]: value } : concepto
    );
    setConceptos(updatedConceptos);
  };

  const handleServicioChange = (conceptoId, servicioId) => {
    const servicioSeleccionado = servicios.find(servicio => servicio.id === servicioId);
    if (servicioSeleccionado) {
      const updatedConceptos = conceptos.map((concepto) =>
        concepto.id === conceptoId ? {
          ...concepto,
          servicio: servicioSeleccionado.id,
          precio: servicioSeleccionado.precio || 0,
          precioFinal: concepto.precioFinal || servicioSeleccionado.precio || 0, // ✅ Si no hay un precio final, usa el sugerido
        } : concepto
      );
      setConceptos(updatedConceptos);
    }
  };

    // Obtener los servicios que no han sido seleccionados
    const obtenerServiciosDisponibles = (conceptoId) => {
      const serviciosSeleccionados = conceptos
        .filter((c) => c.id !== conceptoId) // Excluye el concepto actual para permitir cambiarlo
        .map((c) => c.servicio); // Obtiene los servicios ya seleccionados
    
      return servicios.filter((servicio) => !serviciosSeleccionados.includes(servicio.id));
    };

  const calcularTotales = () => {
    const subtotal = conceptos.reduce((acc, curr) => acc + curr.cantidad * curr.precioFinal, 0);
    const descuentoValor = subtotal * (descuento / 100);
    const subtotalConDescuento = subtotal - descuentoValor;
    const ivaPorcentaje = (ivasData.find(iva => iva.id === ivaSeleccionado)?.porcentaje || 16);
    const iva = subtotalConDescuento * (ivaPorcentaje);
    const total = subtotalConDescuento + iva;

    // Aplicar el tipo de cambio si la moneda es USD (id = 2)
    const esUSD = tipoMonedaSeleccionada === 2;
    const factorConversion = esUSD ? tipoCambioDolar : 1;

    return {
      subtotal: subtotal / factorConversion,
      descuentoValor: descuentoValor / factorConversion,
      subtotalConDescuento: subtotalConDescuento / factorConversion,
      iva: iva / factorConversion,
      total: total / factorConversion,
    };
  };

  const { subtotal, descuentoValor, subtotalConDescuento, iva, total } = calcularTotales();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const cotizacionData = {
        fechaSolicitud: dayjs(fechaSolicitada).format("YYYY-MM-DD"),
        fechaCaducidad: dayjs(fechaCaducidad).format("YYYY-MM-DD"),
        denominacion: `Cotización en ${tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}`,
        iva: ivaSeleccionado,
        cliente: clienteData.id,
        estado: 1,
        descuento: descuento,
        tipoMoneda: tipoMonedaSeleccionada,
      };

      const cotizacionResponse = await createCotizacion(cotizacionData);
      setIsModalVisible(true);

      const cotizacionId = cotizacionResponse.data.id;
      const conceptosPromises = conceptos.map((concepto) => {
        const conceptoData = {
          descripcion: concepto.descripcion,
          precio: concepto.precioFinal,
          cantidad: concepto.cantidad,
          cotizacion: cotizacionId,
          servicio: concepto.servicio,
        };
        return createCotizacionServicio(conceptoData);
      });
      await Promise.all(conceptosPromises);
    } catch (error) {
      console.error("Error al crear la cotización", error);
      message.error("Error al crear la cotización");
    }
  };

  return (
    <div className="cotizacion-container">
      <h1 className="cotizacion-title">Registro de Cotización</h1>
      <Form 
      form={form}
      layout="vertical"
      >
        <div className="cotizacion-info-message">
          <strong>Por favor, complete todos los campos requeridos con la información correcta.</strong>
        </div>
        <div className="cotizacion-info-card">
          <p><strong>RFC:</strong> {empresas.rfc}</p>
          <p><strong>Representante:</strong> {clienteData.nombrePila} {clienteData.apPaterno} {clienteData.apMaterno}</p>
          <p><strong>Contacto:</strong> {clienteData.correo} - {clienteData.telefono} | {clienteData.celular}</p>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Fecha Solicitada" rules={[{ required: true, message: 'Por favor ingresa la fecha.' }]}>
              <DatePicker
                value={fechaSolicitada}
                onChange={handleFechaSolicitadaChange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Fecha Caducidad" rules={[{ required: true, message: 'Por favor ingresa la fecha.' }]}>
              <DatePicker
                value={fechaCaducidad}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Calculada automáticamente"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tipo de Moneda" rules={[{ required: true, message: 'Por favor selecciona el tipo de moneda.' }]}>
              <Select
                value={tipoMonedaSeleccionada}
                onChange={(value) => setTipoMonedaSeleccionada(value)}
              >
                {tiposMonedaData.map((moneda) => (
                  <Select.Option key={moneda.id} value={moneda.id}>
                    {moneda.codigo} - {moneda.descripcion}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tasa del IVA actual" rules={[{ required: true, message: 'Por favor selecciona el IVA.' }]}>
              <Select
                value={ivaSeleccionado}
                onChange={(value) => setIvaSeleccionado(value)}
              >
                {ivasData.map((ivas) => (
                  <Select.Option key={ivas.id} value={ivas.id}>
                    {ivas.porcentaje}%
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Descuento (%)" rules={[{ required: true, message: 'Por favor ingresa el descuento.' }]}>
          <Input
            type="number"
            min="0"
            max="100"
            defaultValue={0}
            value={descuento}
            onChange={(e) => setDescuento(parseFloat(e.target.value))}
          />
        </Form.Item>

        <Divider>Agregar Conceptos</Divider>
        {conceptos.map((concepto, index) => (
        <div key={concepto.id}>
          <Card>
            <h3>Concepto {concepto.id}</h3>
            <Row justify="end">
              <div>
                <Checkbox onChange={() => handleRemoveConcepto(concepto.id)}>
                  Eliminar
                </Checkbox>
              </div>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Servicio"
                  name={['conceptos', index, 'servicio']}
                  rules={[{ required: true, message: 'Por favor selecciona el servicio.' }]}
                >
                  <Select
                    placeholder="Selecciona un servicio"
                    value={concepto.servicio || undefined}
                    onChange={(value) => handleServicioChange(concepto.id, value)}
                  >
                    {obtenerServiciosDisponibles(concepto.id).map((servicio) => (
                      <Select.Option key={servicio.id} value={servicio.id}>
                        {servicio.nombreServicio}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Cantidad de servicios"
                  rules={[{ required: true, message: 'Por favor ingresa la cantidad.' }]}
                >
                  <Input
                    type="number"
                    min="1"
                    value={concepto.cantidad}
                    onChange={(e) => handleInputChange(concepto.id, "cantidad", parseInt(e.target.value))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Precio sugerido"
                  rules={[{ required: true, message: 'Por favor ingresa el precio.' }]}
                >
                  <Input
                    disabled={true}
                    type="number"
                    min="0"
                    value={concepto.precio}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Notas"
                  name={['conceptos', index, 'descripcion']}
                  rules={[{ required: true, message: 'Por favor ingresa la descripcion.' }]}
                >
                  <TextArea
                    rows={2}
                    value={concepto.descripcion}
                    onChange={(e) => handleInputChange(concepto.id, "descripcion", e.target.value)}
                    placeholder="Notas que aparecerán al final de la cotización (Opcional)"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Precio final"

                  rules={[{ required: true, message: 'Por favor ingresa el precio.' }]}
                >
                  <Input
                    type="number"
                    min="0"
                    value={concepto.precioFinal}
                    onChange={(e) => handleInputChange(concepto.id, "precioFinal", parseFloat(e.target.value))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>
          ))}
        <Button type="primary" onClick={handleAddConcepto} style={{ marginBottom: "16px" }}>
          Añadir Concepto
        </Button>

        <div className="cotizacion-totals-buttons">
          <div className="cotizacion-totals">
            <p>Subtotal: {subtotal.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
            <p>Descuento ({descuento}%): {descuentoValor.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
            <p>Subtotal con descuento: {subtotalConDescuento.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
            <p>IVA ({ivasData.find(iva => iva.id === ivaSeleccionado)?.porcentaje || 16}%): {iva.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
            <p>Total: {total.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
          </div>
          <div className="cotizacion-action-buttons">
            <div className="margin-button"><Button type="default" danger>Cancelar</Button></div>
            <div className="margin-button">
              <Button type="primary" onClick={handleSubmit}>Crear</Button>
            </div>
          </div>
        </div>
      </Form>

      <Modal
        title="Información"
        open={isModalVisible}
        onOk={() => {
          setIsModalVisible(false);
          navigate("/cotizar");
        }}
        onCancel={() => { setIsModalVisible(false); navigate("/cotizar"); }}
        okText="Cerrar"
      >
        <Result status="success"
        title="¡Se creó exitosamente!"></Result>
      </Modal>

    </div>
  );
};

export default RegistroCotizacion;