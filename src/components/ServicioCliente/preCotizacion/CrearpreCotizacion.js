import React, { useState, useEffect, useMemo } from "react";
import "../Cotizacionesjs/Crearcotizacion.css";
//import "./Crearcotizacion.css";
import { Form, Input, Button, Row, Col, Select, Checkbox, Divider, message, DatePicker, Card, Modal, Alert,InputNumber, Spin } from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { getAllTipoMoneda } from "../../../apis/ApisServicioCliente/Moneda";
import { getAllIva } from "../../../apis/ApisServicioCliente/ivaApi";
import { getServicioData } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { createPreCotizacion} from "../../../apis/ApisServicioCliente/precotizacionApi";
import { createServicioPreCotizacion } from "../../../apis/ApisServicioCliente/ServiciosPrecotizacionApi";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import { getAllEmpresas } from "../../../apis/ApisServicioCliente/EmpresaApi";
//import { getAllCliente } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getAllMetodo,createMetodo} from "../../../apis/ApisServicioCliente/MetodoApi";
import {createServicio} from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getAllUnidadCDFI } from "../../../apis/ApisServicioCliente/unidadcdfiApi";
import { getAllClaveCDFI } from "../../../apis/ApisServicioCliente/ClavecdfiApi";
import {getUserById}from "../../../apis/ApisServicioCliente/UserApi";
//import ErrorModal from "./PreCotizacionesModal/PreCotizacionModal";

const { TextArea } = Input;

const CrearPreCotizaciones = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const { clienteId } = useParams();
  const [fechaSolicitada, setFechaSolicitada] = useState(null);
  const [tiposMonedaData, setTiposMonedaData] = useState([]); // Datos completos de tipos de moneda
  const [tipoMonedaSeleccionada, setTipoMonedaSeleccionada] = useState(null); // Valor seleccionado
  const [ivasData, setIvasData] = useState([]); // Datos completos de IVA
  const [ivaSeleccionado, setIvaSeleccionado] = useState(null); // Valor seleccionado
  const [fechaCaducidad, setFechaCaducidad] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [descuento, setDescuento] = useState(0);
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [correos, setCorreo] = useState("");
  const [clavecdfi, setClavecdfi] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [form] = Form.useForm();
  const [formNuevoServicio] = Form.useForm();
  const [conceptos, setConceptos] = useState([
    { id: 1, servicio: "", cantidad: 1, precio: 0, precioFinal: 0, descripcion: "" },
  ]);
  const [conceptosParaEliminar, setConceptosParaEliminar] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isNuevoServicioModalVisible, setIsNuevoServicioModalVisible] = useState(false);
  const [isModalOpenMetodos, setIsModalOpenMetodos] = useState(false);
  const [unidad, setUnidad] = useState([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [formMetodo] = Form.useForm();
  const [successMessage, setSuccessMessage] = useState(""); // Mensaje dinámico
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalText, setErrorModalText] = useState("");
  const [loadings, setLoadings] = useState(false);


  // Obtener el ID de la organización una sola vez
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  

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
  const fetchServicios = async () => {
    try {
      const response = await getServicioData(organizationId);
      //console.log("Servicios recibidos:", response.data);
      // Filtra los que no tengan `id`
      const validServices = Array.isArray(response.data)
        ? response.data.filter(s => s && s.id)
        : [];
      //console.log("Servicios válidos:", validServices);
      setServicios(validServices);
    } catch (error) {
      console.error("Error al cargar los servicios", error);
    }
  };
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

  useEffect(() => {
    form.setFieldsValue({
      conceptos: conceptos.map((concepto) => ({
        servicio: concepto.servicio,
        cantidad: concepto.cantidad,
        precio: concepto.precio,
        precioFinal: concepto.precioFinal,
        descripcion: concepto.descripcion,
      })),
    });
  }, [conceptos]);

  const handleFechaSolicitadaChange = (date) => {
    setFechaSolicitada(date);
    if (date) {
      setFechaCaducidad(dayjs(date).add(1, "month"));
    } else {
      setFechaCaducidad(null);
    }
  };

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
        const response = await getServicioData(organizationId);
        setServicios(response.data);
      } catch (error) {
        console.error("Error al cargar los servicios", error);
      }
    };
    fetchIva();
    fetchTipoMoneda();
    fetchServicios();
    fetchServicios();
  }, [clienteId]);




  const handleAddConcepto = () => {
    setConceptos([...conceptos, { id: conceptos.length + 1, servicio: "", cantidad: 1, precio: 0, descripcion: "" }]);
  };

  const handleRemoveConcepto = (id) => {
    if (conceptos.length > 1) {
      const updatedConceptos = conceptos.filter((concepto) => concepto.id !== id);
      setConceptos(updatedConceptos);
      form.setFieldsValue({
        conceptos: updatedConceptos.map((concepto) => ({
          servicio: concepto.servicio,
          cantidad: concepto.cantidad,
          precio: concepto.precio,
          precioFinal: concepto.precioFinal,
          descripcion: concepto.descripcion,
        })),
      });
    } else {
      message.warning("Debe haber al menos un concepto.");
    }
  };

  const handleInputChange = (id, field, value) => {
    const updatedConceptos = conceptos.map((concepto) =>
      concepto.id === id ? { ...concepto, [field]: value } : concepto
    );
    setConceptos(updatedConceptos);
    form.setFieldsValue({
      conceptos: updatedConceptos.map((concepto) => ({
        servicio: concepto.servicio,
        cantidad: concepto.cantidad,
        precio: concepto.precio,
        precioFinal: concepto.precioFinal,
        descripcion: concepto.descripcion,
      })),
    });
  };

  const handleServicioChange = (conceptoId, servicioId) => {
    const servicioSeleccionado = servicios.find(servicio => servicio.id === servicioId);
    if (servicioSeleccionado) {
      const updatedConceptos = conceptos.map((concepto) =>
        concepto.id === conceptoId
          ? {
              ...concepto,
              servicio: servicioSeleccionado.id,
              precio: servicioSeleccionado.precio || 0,
              precioFinal: concepto.precioFinal || servicioSeleccionado.precio || 0, 
              metodoRelacionado: servicioSeleccionado.metodos || null,
              metodoCodigo: servicioSeleccionado.metodos || null,
            }
          : concepto
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
  
  const error = (text) => {
    messageApi.open({
      type: 'error',
      content: text,
    });
  };

  
  const handleSubmit = async () => {
    setLoadings(true);
    const idLocalUser = localStorage.getItem("user_id")
    const userResponse = await getUserById(idLocalUser);
    let usrNameData=userResponse.data.first_name + " " + userResponse.data.last_name;
    try {
      // Validar campos del formulario
      await form.validateFields();
  
      if (!nombre || !apellido || !empresa || !fechaSolicitada || !tipoMonedaSeleccionada || !ivaSeleccionado) {
        message.error("Por favor, completa todos los campos obligatorios.");
        return;
      }
  
      // Obtener todos los clientes y empresas existentes
      //const clientesExistentes = await getAllCliente();
      const empresasExistentes = await getAllEmpresas();

      // Si no existen, continuar con la creación de la pre-cotización
      const dataPrecotizacion = {
        nombreEmpresa: empresa,
        nombreCliente: nombre,
        apellidoCliente: apellido,
        correo: correos,
        denominacion: tiposMonedaData.find((moneda) => moneda.id === tipoMonedaSeleccionada)?.codigo.replace("-", "") || "N/A",
        fechaSolicitud: fechaSolicitada.format("YYYY-MM-DD"),
        fechaCaducidad: fechaCaducidad ? fechaCaducidad.format("YYYY-MM-DD") : null,
        descuento: descuento,
        iva: ivaSeleccionado,
        organizacion: organizationId,
        tipoMoneda: tipoMonedaSeleccionada,
        estado: 8,
        nombreusuario:usrNameData,
      };
  
      // ✅ 1. Crear la Pre-Cotización y obtener el ID
      const response = await createPreCotizacion(dataPrecotizacion);
  
      if (response.status === 201 || response.status === 200) {
        const preCotizacionId = response.data.id;
  
        //console.log("✅ Pre-cotización creada con ID:", preCotizacionId);
  
        // ✅ 2. Insertar los servicios de la Pre-Cotización
        for (const concepto of conceptos) {
          if (!concepto.servicio) continue;
        
          const servicioData = {
            descripcion: concepto.descripcion || "Sin descripción",
            precio:      Number(concepto.precioFinal) || 0,
            cantidad:    Number(concepto.cantidad)   || 0,
            preCotizacion: preCotizacionId,
            servicio:    concepto.servicio,
            organizacion: organizationId,
          };
        
          try {
            await createServicioPreCotizacion(servicioData);
          } catch (err) {
            console.error(`Error al agregar servicio ${concepto.servicio}:`, err);
            message.error(`Error al agregar servicio ${concepto.servicio}`);
          }
        }
  
        //await Promise.all(serviciosPromises);
  
        message.success("Pre-cotización y servicios creados exitosamente.");
        navigate("/precotizacion");
      } else {
        message.error("Hubo un error al crear la pre-cotización.");
      }
    } catch (error) {
      console.error("❌ Error al crear la pre-cotización y servicios:", error);
  
      if (error.response) {
        //console.log("Detalles del error:", error.response.data);
        message.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error("Error al enviar los datos. Revisa la consola para más detalles.");
      }
    }finally {
      setLoadings(false);
    }
  };

  const handleOkMetodos = async () => {
    setLoadings(true);
      try {
        // Recoger los datos del formulario (lo que el usuario ha ingresado)
        const values = await formMetodo.validateFields(); // Usando Antd form.validateFields para obtener los valores
        const dataToSend = {
          ...values,
          organizacion: organizationId,   // <-- aquí
        };
        // Verificar si todos los datos necesarios están presentes
        if (!values.codigo ) {
          message.error("Por favor, complete todos los campos obligatorios.");
          return;
        }
    
        // Enviar los datos a la API
        const response = await createMetodo(dataToSend);  // Llamamos a la función que envía los datos
    
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
      }finally {
        setLoadings(false);
      }
    };
  
  const handleCancelMetodos = () => {
    setIsModalOpenMetodos(false);
  };
  const showModalMetodos = () => {
    setIsModalOpenMetodos(true);
  };
  const handleMetodoChange = (value) => {
    setMetodoSeleccionado(value);
  };
  

  return (
    <div className="cotizacion-container">
      <Spin spinning={loadings} tip="Cargando datos...">
        <h1 className="cotizacion-title">Registro de Pre-Cotización</h1>
        <Form 
        layout="vertical"
        form={form}
        >

          <div className="cotizacion-info-message">
            <strong>Por favor, complete todos los campos requeridos con la información correcta.</strong>
          </div>
      <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                      label="Nombre"
                      name="nombre"
                      rules={[
                      {
                          required: true,
                      },
                      ]}
                >
                      <Input value={nombre}
                      onChange={(e) => setNombre(e.target.value)}/>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                      label="Apellido"
                      name="Apellido"
                      rules={[
                      {
                      required: true,
                      },
                      ]}
                >
                      <Input value={apellido} 
                      onChange={(e) => setApellido(e.target.value)}/>
                </Form.Item>
            </Col>
      </Row>
      <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                      label="Nombre de Empresa"
                      name="empresa"
                      rules={[
                      {
                      required: true,
                      },
                      ]}
                >
                      <Input value={empresa} 
                      onChange={(e) => setEmpresa(e.target.value)}/>
                </Form.Item></Col>
                <Col span={12}>
                <Form.Item
                      label="Correo"
                      name="correo"
                      rules={[
                        {type:'email', message: 'El correo no es válido'},
                      {
                      required: true,
                      },
                      ]}
                >
                      <Input value={correos} 
                      onChange={(e) => setCorreo(e.target.value)}/>
                </Form.Item>
            </Col>
      </Row>

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
                <h3 style={{ marginBottom: 10 }}>Concepto {concepto.id}</h3>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Checkbox onChange={() => handleRemoveConcepto(concepto.id)}>
                      Eliminar
                    </Checkbox>
                  </Col>
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
                        showSearch
                        value={concepto.servicio || undefined}
                        onChange={(value) => handleServicioChange(concepto.id, value)}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {servicios.map(serv => (
                          <Select.Option key={serv.id} value={serv.id}>
                            {serv.nombreServicio}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Método Relacionado">
                      <Input
                        value={concepto.metodoCodigo}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Cantidad de servicios" required>
                      <InputNumber
                        min={1}
                        value={concepto.cantidad}
                        onChange={(value) => handleInputChange(concepto.id, "cantidad", value)}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item label="Precio sugerido">
                      <Input disabled value={concepto.precio} />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item label="Precio final" required>
                      <InputNumber
                        min={0}
                        value={concepto.precioFinal}
                        onChange={(value) => handleInputChange(concepto.id, "precioFinal", value)}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <Form.Item
                      label="Notas"
                      name={['conceptos', index, 'descripcion']}
                      rules={[{ required: true, message: 'Por favor ingresa la descripción.' }]}
                    >
                      <TextArea
                        rows={2}
                        value={concepto.descripcion}
                        onChange={(e) => handleInputChange(concepto.id, "descripcion", e.target.value)}
                        placeholder="Notas que aparecerán al final de la cotización (opcional)"
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
          <Alert
              message="Pro favor de verificar que los datos sean correctos"
              banner
              closable
            />

          <div className="cotizacion-totals-buttons">
            <div className="cotizacion-totals">
              <p>Subtotal: {subtotal.toFixed(3)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
              <p>Descuento ({descuento}%): {descuentoValor.toFixed(3)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
              <p>Subtotal con descuento: {subtotalConDescuento.toFixed(3)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
              <p>IVA ({ivasData.find(iva => iva.id === ivaSeleccionado)?.porcentaje || 16}%): {iva.toFixed(3)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
              <p>Total: {total.toFixed(3)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
            </div>
            <Alert
              message="Pro favor de verificar que los datos sean correctos"
              banner
              closable
            />
            <Form.Item
            name="confirmar"
            valuePropName="checked"
            rules={[{required:true, message: 'Por favor confirma que los datos son correctos.'}]}>
              <Checkbox>Los datos son correctos</Checkbox>
            </Form.Item>
            <div className="cotizacion-action-buttons">
              <div className="margin-button"><Button type="default" danger onClick={() => navigate('/preCotizacion')}> Cancelar</Button></div>
              <div className="margin-button">
                <Button type="primary" onClick={()=> setIsModalVisible(true)}>Crear</Button>
              </div>
            </div>
          </div>
        </Form>
      </Spin>
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
        <p>¡Se creó exitosamente!</p>
      </Modal>

            <Modal
            title="Crear Nuevo Servicio"
            open={isNuevoServicioModalVisible}
            onOk={async () => {
              try {
                const values = await formNuevoServicio.validateFields();
                const dataToSend = { ...values, estado: values.estado || 5, organizacion: organizationId };
      
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
      
                    <Form.Item label="Unidad cfdi:" 
                    name="unidadCfdi" 
                    rules={[{ required: true }]}>
                      <Select
                      showSearch
                      placeholder="Selecciona la unidad CFDI"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "").toLowerCase().localeCompare(
                          (optionB?.label ?? "").toLowerCase()
                        )
                      }
                      >
                        {unidad.map((unidadudfi)=>(
                          <Select.Option 
                          key={unidadudfi.id}
                          value={unidadudfi.id}
                          label={`${unidadudfi.codigo} - ${unidadudfi.nombre}`}
                          >
                            {unidadudfi.codigo}-{unidadudfi.nombre}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                      label="Clave cfdi:" 
                      name="claveCfdi" 
                      rules={[{ required: true, message: "Por favor selecciona una clave CFDI." }]}
                    >
                      <Select
                        showSearch
                        placeholder="Selecciona la clave CFDI"
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "").toLowerCase().localeCompare(
                            (optionB?.label ?? "").toLowerCase()
                          )
                        }
                      >
                        {clavecdfi.map((clave) => (
                          <Select.Option 
                            key={clave.id}
                            value={clave.id}
                            label={`${clave.codigo} - ${clave.nombre}`}
                          >
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
                    <Select
                      placeholder="Selecciona un método"
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      value={metodoSeleccionado || undefined}
                      onChange={handleMetodoChange}
                      options={metodos.map((metodo) => ({
                        value: metodo.id,
                        label: metodo.codigo,
                      }))}
                    />
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
                  <Modal
                    title="Confirmar creación"
                    open={isModalVisible}
                    onOk={async () => {
                      setIsModalVisible(false);
                      await handleSubmit(); // <-- llama a tu función real
                    }}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Sí, crear"
                    cancelText="Cancelar"
                  >
                    <p>¿Estás seguro de que deseas crear esta pre-cotización?</p>
                  </Modal>

    </div>
  );
};

export default CrearPreCotizaciones;
