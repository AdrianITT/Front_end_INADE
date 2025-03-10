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
import { getAllClaveCDFI } from "../../apis/ClavecdfiApi";
import { getAllUnidadCDFI } from "../../apis/unidadcdfiApi";
import { getAllMetodo,createMetodo} from "../../apis/MetodoApi";
import {createServicio} from "../../apis/ServiciosApi";

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
  // Nueva variable de estado para el modal de "Nuevo Servicio"
  const [isNuevoServicioModalVisible, setIsNuevoServicioModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isModalOpenMetodos, setIsModalOpenMetodos] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Mensaje dinámico
  const [unidad, setUnidad] = useState([]);
  const [clavecdfi, setClavecdfi] = useState([]);
  const [metodos, setMetodos] = useState([]);

  const [formNuevoServicio] = Form.useForm();
  const [formMetodo] = Form.useForm();


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

  const fetchServicios = async () => {
    try {
      const response = await getAllServicio();
      //console.log("Servicios recibidos:", response.data);
      // Filtra los que no tengan `id`
      const validServices = Array.isArray(response.data)
        ? response.data.filter(s => s && s.id)
        : [];
      setServicios(validServices);
    } catch (error) {
      console.error("Error al cargar los servicios", error);
    }
  };

  useEffect(() => {
    const fetchDatosModal = async () => {
      try {
        const claveResponse = await getAllClaveCDFI();
        setClavecdfi(claveResponse.data);
      } catch (error) {
        console.error("Error al cargar claves CFDI", error);
      }
      try {
        const unidadResponse = await getAllUnidadCDFI();
        setUnidad(unidadResponse.data);
      } catch (error) {
        console.error("Error al cargar unidades CFDI", error);
      }
      try {
        const metodosResponse = await getAllMetodo();
        setMetodos(metodosResponse.data);
      } catch (error) {
        console.error("Error al cargar métodos", error);
      }
    };
    fetchDatosModal();
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
        .filter((c) => c.id !== conceptoId)
        .map((c) => c.servicio);
    
      return servicios.filter((servicio) =>
        !serviciosSeleccionados.includes(servicio.id)
      );
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

  const handleCancelMetodos = () => {
    setIsModalOpenMetodos(false);
  };
    const handleOkMetodos = async () => {
      try {
        // Recoger los datos del formulario (lo que el usuario ha ingresado)
        const values = await formMetodo.validateFields(); // Usando Antd form.validateFields para obtener los valores
    
        // Verificar si todos los datos necesarios están presentes
        if (!values.codigo ) {
          message.error("Por favor, complete todos los campos obligatorios.");
          return;
        }
    
        // Enviar los datos a la API
        const response = await createMetodo(values);  // Llamamos a la función que envía los datos
    
        // Actualizamos la lista de métodos después de la creación
        setMetodos(prevMetodos => [...prevMetodos, response]);
        
        // Cerrar el modal
        setIsModalOpenMetodos(false);
        // 🔹 Mostrar modal de éxito
        setSuccessMessage("¡El servicio ha sido creado exitosamente!");
        setIsSuccessModalVisible(true);
  
        setIsModalOpenMetodos(false); // Cerrar modal de creación
        message.success("Método creado con éxito.");
      } catch (error) {
        message.error("Error al crear el método.");
      }
    };

    const showModalMetodos = () => {
      setIsModalOpenMetodos(true);
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
        <Row>
          <div style={{ padding: '10px' }}>
          <Button size="large" onClick={() => setIsNuevoServicioModalVisible(true)}>
            Crear un Nuevo Servicio
          </Button>
          </div>
          <div style={{ padding: '10px' }}>
          <Button size="large" onClick={showModalMetodos}>
            Crear un Nuevo Metodo
          </Button>
          </div>
        </Row>
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
                  showSearch
                  placeholder="Selecciona un servicio"
                  style={{ width: '100%' }}
                  // La búsqueda la basamos en la prop "label"
                  optionFilterProp="label"
                  // Filtra los resultados mientras el usuario escribe
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  // Ordena alfabéticamente los resultados mostrados
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare(
                      (optionB?.label ?? '').toLowerCase()
                    )
                  }
                  value={concepto.servicio || undefined}
                  onChange={(value) => handleServicioChange(concepto.id, value)}
                  // Aquí transformamos cada servicio en un objeto con { value, label }
                  options={obtenerServiciosDisponibles(concepto.id).map(serv => ({
                    value: serv.id,
                    label: serv.nombreServicio,
                  }))}
                />
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
          <div style={{ padding: '20px' }}>
            <Button type="primary" onClick={handleAddConcepto} style={{ marginBottom: "16px" }}>
              Añadir Concepto
            </Button>
          </div>
        

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

      {/* Modal de Información (ya existente) */}
      <Modal
        title="Crear Nuevo Servicio"
        open={isNuevoServicioModalVisible}
        onOk={async () => {
          try {
            const values = await formNuevoServicio.validateFields();
            // Llamar a la API para crear el servicio
            const response = await createServicio(values);
            message.success("Nuevo servicio creado");
            // Actualizar la lista de servicios (agregando el nuevo)
            setServicios([...servicios, response.data]);
            formNuevoServicio.resetFields();
            setIsNuevoServicioModalVisible(false);
          } catch (error) {
            console.error("Error al crear el servicio", error);
            message.error("Error al crear el servicio");
          }
        }}
        onCancel={() => {
          setIsNuevoServicioModalVisible(false);
          formNuevoServicio.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Result status="success" title="¡Se creó exitosamente!" />
      </Modal>

      {/* Nuevo Modal para crear un servicio */}
      <Modal
      title="Crear Nuevo Servicio"
      open={isNuevoServicioModalVisible}
      onOk={async () => {
        try {
          const values = await formNuevoServicio.validateFields();
          const dataToSend = { ...values, estado: values.estado || 5 };

          if (!values.unidadCfdi || !values.claveCfdi) {
            message.error("Por favor, complete todos los campos obligatorios.");
            return;
          }

          const response = await createServicio(dataToSend);
          message.success("Nuevo servicio creado");

          fetchServicios();
          formNuevoServicio.resetFields();
          setIsNuevoServicioModalVisible(false);
        } catch (error) {
          console.error("Error al crear el servicio", error);
          message.error("Error al crear el servicio");
        }
      }}
      onCancel={() => {
        setIsNuevoServicioModalVisible(false);
        formNuevoServicio.resetFields();
      }}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={formNuevoServicio} className="modal-form" layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre del Servicio"
              name="nombreServicio"
              rules={[{ required: true, message: "Por favor ingrese un nombre" }]}
            >
              <Input placeholder="Nombre del servicio o concepto" />
            </Form.Item>
            <Form.Item
              label="Precio unitario"
              name="precio"
              rules={[
                { required: true, message: "Por favor ingrese un precio" },
                {
                  validator: (_, value) => {
                    if (value < 0) {
                      return Promise.reject("El precio no puede ser negativo");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="number" min={0} placeholder="Precio sugerido" />
            </Form.Item>

            <Form.Item
              label="Unidad CFDI"
              name="unidadCfdi"
              rules={[{ required: true, message: "Por favor seleccione una unidad" }]}
            >
              <Select>
                {unidad.map((u) => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.codigo} - {u.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Clave CFDI"
              name="claveCfdi"
              rules={[{ required: true, message: "Por favor seleccione una clave" }]}
            >
              <Select>
                {clavecdfi.map((clave) => (
                  <Select.Option key={clave.id} value={clave.id}>
                    {clave.codigo} - {clave.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Método"
              name="metodos"
              rules={[{ required: true, message: "Por favor seleccione un método" }]}
            >
              <Select placeholder="Selecciona un método">
                {metodos.map((metodo) => (
                  <Select.Option key={metodo.id} value={metodo.id}>
                    {metodo.codigo}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>

      <Modal
        title="Registrar Método"
        open={isModalOpenMetodos}
        onOk={handleOkMetodos}
        onCancel={handleCancelMetodos}
        width={800}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={formMetodo} layout="vertical">
          <Form.Item
            label="Nombre del Método:"
            name="codigo"
            rules={[{ required: true, message: "Por favor ingrese el nombre del método" }]}
          >
            <Input placeholder="Nombre del método" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de éxito */}
      <Modal
          title="Éxito"
          open={isSuccessModalVisible}
          onCancel={() => setIsSuccessModalVisible(false)}
          footer={[
              <Button key="close" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
                  Cerrar
              </Button>
          ]}
      >
          <p style={{ textAlign: "center", fontSize: "16px" }}>{successMessage}</p>
      </Modal>


    </div>
  );
};

export default RegistroCotizacion;