import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  InputNumber,
  Divider,
  Card,
  message,
  Checkbox,
  Modal,
  Typography,
  DatePicker
} from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { getAllServicio, getServicioData } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getAllDataPrecotizacion } from "../../../apis/ApisServicioCliente/PrecotizacionApi";
import {updateServicioPreCotizacionById, deleteServicioPreCotizacionById, createServicioPreCotizacion} from "../../../apis/ApisServicioCliente/ServiciosPrecotizacionApi";
import { getAllTipoMoneda } from "../../../apis/ApisServicioCliente/Moneda";
import { getAllIva } from "../../../apis/ApisServicioCliente/ivaApi";
import { updatePrecotizacion, getAllPrecotizacionByOrganizacion  } from "../../../apis/ApisServicioCliente/PrecotizacionApi";
import { cifrarId, descifrarId } from "../secretKey/SecretKey";
import { validarAccesoPorOrganizacion } from "../validacionAccesoPorOrganizacion";


const EditarPreCotizacion = () => {
  const { ids } = useParams(); // ID de la precotización
  const id=descifrarId(ids);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const { Title } = Typography;
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState(""); // si aplica
  const [empresa, setEmpresa] = useState("");
  const [correos, setCorreo] = useState("");
  const [fechaSolicitada, setFechaSolicitada] = useState(null);
  const [fechaCaducidad, setFechaCaducidad] = useState(null);
  const [tipoMonedaSeleccionada, setTipoMonedaSeleccionada] = useState(null);
  const [ivaSeleccionado, setIvaSeleccionado] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [tiposMonedaData, setTiposMonedaData] = useState([]);
  const [ivasData, setIvasData] = useState([]);
  const [serviciosEliminados, setServiciosEliminados] = useState([]);
  // Obtener el ID de la organización del usuario desde el local storage
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);
  useEffect(() => {
    const verificar = async () => {
      console.log(id);
      const acceso = await validarAccesoPorOrganizacion({
        fetchFunction: getAllPrecotizacionByOrganizacion,
        organizationId,
        id,
        campoId: "precotizacionId",
        navigate,
        mensajeError: "Acceso denegado a esta precotización.",
      });
      console.log(acceso);
      if (!acceso) return;
    };

    verificar();
  }, [organizationId, id]);

  useEffect(() => {
    const fetchPrecotizacionData = async () => {
      try {
        const response = await getAllDataPrecotizacion(id);
        const data = response.data;
    
        // Extraer servicios
        const serviciosMapped = data.precotizacionservicios.map((serv) => ({
          id: serv.precotizacionservicioId,
          servicio: serv.servicioId,
          cantidad: serv.cantidad,
          descripcion: serv.descripcion,
          precio: parseFloat(serv.precio),
          eliminar: false,
        }));
        //console.log("Servicios mapeados:", serviciosMapped);
        //console.log("Datos de la precotización:", data);
        //console.log("Datos de la precotización:", data.cliente.nombreCompleto);
        // Asignar campos al formulario
        form.setFieldsValue({
          servicios: serviciosMapped,
          nombre: data.cliente?.nombrePila || "",
          apellido: data.cliente?.apPaterno ||"", // si tienes otro campo, deberás extraerlo también
          empresa: data.empresa?.nombre || "",
          correo: data.cliente?.correo || "",
          tipoMoneda: data.tipoMoneda?.id || null,
          iva: data.iva?.id || null,
          descuento: parseFloat(data.descuento) || 0,
          fechaSolicitada: dayjs(data.fechaSolicitud, "DD-MM-YYYY"),
          fechaCaducidad: dayjs(data.fechaCaducidad, "DD-MM-YYYY"),
        });
        
        
        setApellido(data.cliente?.apPaterno || ""); // si tienes otro campo, deberás extraerlo también
        setNombreCliente(data.cliente?.nombreCompleto || "");
        setTipoMonedaSeleccionada(data.tipoMoneda?.id || null);
        setIvaSeleccionado(data.iva?.id || null);
        setDescuento(parseFloat(data.descuento) || 0);
        setFechaSolicitada(dayjs(data.fechaSolicitud, "DD-MM-YYYY"));
        setFechaCaducidad(dayjs(data.fechaCaducidad, "DD-MM-YYYY"));
        setEmpresa(data.empresa?.nombre || "");
        setCorreo(data.cliente?.correo || "");
        setNombre(data.cliente?.nombrePila || "");
      } catch (error) {
        console.error("Error al obtener datos de la precotización:", error);
        message.error("Error al cargar la precotización");
      }
    };
    

    const fetchServiciosDisponibles = async () => {
      try {
        const response = await getServicioData(organizationId);
        setServiciosDisponibles(response.data);
      } catch (error) {
        console.error("Error al cargar servicios disponibles:", error);
        message.error("Error al cargar los servicios disponibles");
      }
    };
    

    fetchPrecotizacionData();
    fetchServiciosDisponibles();
  }, [id, form]);
  useEffect(() => {
    // ...
    const fetchMonedas = async () => {
      const res = await getAllTipoMoneda(); // tu función
      setTiposMonedaData(res.data);
    };
  
    const fetchIvas = async () => {
      const res = await getAllIva(); // tu función
      setIvasData(res.data);
    };
  
    fetchMonedas();
    fetchIvas();
  }, []);
  

  const handleInputChange = (fieldIndex, fieldName, value) => {
    const currentServices = form.getFieldValue("servicios") || [];
    const updatedServices = [...currentServices];
    updatedServices[fieldIndex] = { ...updatedServices[fieldIndex], [fieldName]: value };
    form.setFieldsValue({ servicios: updatedServices });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const serviciosForm = values.servicios || [];
  
      const serviciosOriginales = form.getFieldValue("servicios") || [];
      const serviciosGuardados = serviciosOriginales.map((s) => s.id);
      //console.log("Servicios guardados:", serviciosGuardados);
      const eliminados = serviciosEliminados;


  
      const nuevos = serviciosForm.filter((s) => !s.id);
      const existentes = serviciosForm.filter((s) => s.id && serviciosGuardados.includes(s.id));

      const monedaSeleccionada = tiposMonedaData.find((m) => m.id === tipoMonedaSeleccionada)
      //const serviciosSeleccionados = serviciosForm.map((s) => s.servicio);
  
      //console.log("Nuevos:", nuevos);
      //console.log("Existentes:", existentes);
      //console.log("Eliminados:", eliminados);
      // Actualizar datos generales de la precotización
      await updatePrecotizacion(id, {
        nombreCliente: values.nombre,
        apellidoCliente: values.apellido,
        correo: values.correo,
        nombreEmpresa: values.empresa,
        tipoMoneda: tipoMonedaSeleccionada,
        iva: ivaSeleccionado,
        descuento: descuento,
        fechaSolicitud: dayjs(fechaSolicitada).format("YYYY-MM-DD"),
        fechaCaducidad: dayjs(fechaCaducidad).format("YYYY-MM-DD"),
        organizacion: organizationId, // si la organización no cambia, puedes dejarla fija
        estado: 8, // igual si ya lo tienes por default
        denominacion:monedaSeleccionada.codigo,
      });

  
      // Actualizar datos generales de la precotización (si tienes un endpoint tipo updatePrecotizacionById)
      // await updatePrecotizacionById(id, {
      //   nombre, apellido, correo, empresa, tipoMonedaSeleccionada, ivaSeleccionado, fechaSolicitada, etc.
      // });
  
      // Actualizar servicios existentes
      const updatePromises = existentes.map((serv) =>
        updateServicioPreCotizacionById(serv.id, {
          precio: serv.precio,
          cantidad: serv.cantidad,
          descripcion: serv.descripcion,
          servicioId: serv.servicio,
        })
      );
  
      // Crear nuevos servicios (si tienes un endpoint tipo createServicioPrecotizacion)
      const createPromises = nuevos.map((serv) =>
        createServicioPreCotizacion({
          //precotizacionId: id,
          servicio: serv.servicio,
          cantidad: serv.cantidad,
          precio: serv.precio,
          descripcion: serv.descripcion,
          preCotizacion: id,
        })
      );
      //console.log("Create promises:", createPromises);
  
      // Eliminar servicios (si tienes un endpoint tipo deleteServicioPreCotizacionById)
      const deletePromises = eliminados.map((idServicio) =>
        deleteServicioPreCotizacionById(idServicio)
      );
  
      // Ejecutar todo
      await Promise.allSettled([...updatePromises, ...createPromises, ...deletePromises]);
  
      message.success("Pre-cotización actualizada correctamente");
      navigate(`/preCotizacionDetalles/${cifrarId(id)}`);
    } catch (error) {
      console.error("Error al actualizar la precotización:", error);
      message.error("Ocurrió un error al actualizar la precotización");
    } finally {
      setLoading(false);
    }
  };
  
    const handleFechaSolicitadaChange = (date) => {
      setFechaSolicitada(date);
      if (date) {
        setFechaCaducidad(dayjs(date).add(1, "month"));
      } else {
        setFechaCaducidad(null);
      }
    };

  return (
    <div className="cotizacion-container">
      <Form layout="vertical" form={form}>
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
                          <Input />
                     </Form.Item>
                </Col>
                <Col span={12}>
                     <Form.Item
                          label="Apellido"
                          name="apellido"
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
              </Form>
      <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
        Servicios de la Pre-cotización #{id} - {nombreCliente}
      </Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider>Servicios</Divider>
          <Form.List name="servicios">
            {(fields , { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    type="inner"
                    title={`Servicio ${index + 1}`}
                    bordered={true}
                    style={{
                      marginBottom: 24,
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Button
                      danger
                      onClick={() => {
                        const current = form.getFieldValue("servicios") || [];
                        const servicio = current[field.name];

                        if (servicio?.id) {
                          // Agregar a lista de eliminados antes de remover
                          setServiciosEliminados((prev) => [...prev, servicio.id]);
                        }

                        remove(field.name);
                      }}
                    >
                      Eliminar
                    </Button>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "servicio"]}
                          label="Servicio"
                          rules={[{ required: true, message: "Seleccione un servicio" }]}
                        >
                          <Select placeholder="Seleccione un servicio" showSearch >
                            {serviciosDisponibles.map((s) => (
                              <Select.Option key={s.id} value={s.id}>
                                {s.nombreServicio || s.nombre}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "cantidad"]}
                          label="Cantidad"
                          rules={[{ required: true, message: "Ingrese la cantidad" }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: "100%" }}
                            onChange={(value) => handleInputChange(index, "cantidad", value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "precio"]}
                          label="Precio"
                          rules={[{ required: true, message: "Ingrese el precio" }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: "100%" }}
                            onChange={(value) => handleInputChange(index, "precio", value)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...field}
                      name={[field.name, "descripcion"]}
                      label="Descripción"
                      rules={[{ required: true, message: "Ingrese la descripción" }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Descripción del servicio"
                        onChange={(e) =>
                          handleInputChange(index, "descripcion", e.target.value)
                        }
                      />
                    </Form.Item>
                  </Card>
                ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon="+">
                  Agregar Servicio
                </Button>
              </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              style={{ padding: "0 40px" }}
            >
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Card>
            
    </div>
  );
};

export default EditarPreCotizacion;
