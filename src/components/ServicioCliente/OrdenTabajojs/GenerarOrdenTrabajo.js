import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Select, Button, Row, Col,Checkbox, Modal, message, Divider, Card, Result} from "antd";
//import { CloseCircleOutlined  } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import "./cssOrdenTrabajo/GenerarOrdenTrabajo.css";
import { getAllCliente } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getAllEmpresas } from "../../../apis/ApisServicioCliente/EmpresaApi";
import { getAllReceptor, createReceptor } from "../../../apis/ApisServicioCliente/ResectorApi";
import { getServicioById } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getCotizacionById, getDetallecotizaciondataById} from "../../../apis/ApisServicioCliente/CotizacionApi";
import { getCotizacionServiciosByCotizacion } from "../../../apis/ApisServicioCliente/CotizacionServicioApi";
import { createOrdenTrabajo } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { createOrdenTrabajoServico } from "../../../apis/ApisServicioCliente/OrdenTabajoServiciosApi";
const { TextArea } = Input;
const { Option } = Select;

const GenerarOrdenTrabajo = () => {
  const [form] = Form.useForm();
  const [formModal] = Form.useForm(); // Formulario para el moda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cliente, setCliente] = useState({});
  const [empresas, setEmpresa] = useState({});
  const [receptor, setReceptor] = useState([]);
  const { id } = useParams();
  const [servicios, setServicios] = useState([]);
  const [cotizacionId] = useState(id);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);
  const navigate=useNavigate();
  const [isOrdenConfirmModalVisible, setIsOrdenConfirmModalVisible] = useState(false);
  const [ordenFormValues, setOrdenFormValues] = useState(null);
  
    // Obtener el ID de la organización una sola vez
    const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  //const [selectedServicios, setSelectedServicios] = useState([]); // Servicios seleccionados por el usuario


  useEffect(() => {
    
    const fetchReceptor= async () =>{
      try{
        const response=await getAllReceptor();
        setReceptor(response.data);
      }catch(error){console.error('Error al cargar los receptores', error);}
    };

    const fetchCotizacionServicios = async () => {
      try {
        const response = await getDetallecotizaciondataById(cotizacionId);
        const serviciosData = response.data.cotizacionServicio.map((item, index) => ({
          ...item,
          // Generamos un identificador único para cada concepto.
        }));
    
        // Almacenamos la data en el estado (puede ser la misma variable que usas para renderizar los conceptos)
        setServicios(serviciosData);
              
        // Convierte el arreglo en un objeto cuyas keys son el id
        const serviciosObj = {};
        serviciosData.forEach(item => {
          serviciosObj[item.id] = {
            servicio: item.servicio,
            cantidad: item.cantidad,
            descripcion: item.descripcion
          };
        });

        form.setFieldsValue({
          servicios: serviciosObj
        });
        console.log("Servicios de la cotización:", serviciosData);
        console.log("Valores del formulario:", form.getFieldsValue());
      } catch (error) {
        console.error("Error al obtener los servicios de la cotización", error);
      }
    };
    
    const fetchCliente = async () => {
      try {
        const cotizacionResponse = await getCotizacionById(cotizacionId); 
        const clienteId = cotizacionResponse.data.cliente; 
        //console.log("ID del cliente de la cotización:", clienteId);
    
        // Obtener los datos del cliente
        const clienteResponse = await getAllCliente(clienteId);
        //console.log("Datos del cliente obtenido:", clienteResponse.data);
        
        const clienteData = Array.isArray(clienteResponse.data) 
          ? clienteResponse.data.find(c => c.id === clienteId) 
          : clienteResponse.data;
    
        //console.log("Cliente seleccionado:", clienteData);
    
        if (clienteData) {
          setCliente(clienteData); 
    
          // Verificar si `empresa` existe en los datos del cliente
          if (clienteData.empresa) {
            const empresaId = clienteData.empresa;  
            //console.log("ID de la empresa asociado al cliente:", empresaId);
    
            // Obtener todas las empresas
            const empresasResponse = await getAllEmpresas();
            //console.log("Empresas disponibles:", empresasResponse.data);
    
            // Buscar la empresa del cliente
            const empresaRelacionada = empresasResponse.data.find(emp => emp.id === empresaId);
            //console.log("Empresa relacionada con el cliente:", empresaRelacionada);
    
            if (empresaRelacionada) {
              setEmpresa(empresaRelacionada);
              form.setFieldsValue({
                calle: empresaRelacionada.calle,
                numero: empresaRelacionada.numero,
                colonia: empresaRelacionada.colonia,
                codigoPostal: empresaRelacionada.codigoPostal,
                ciudad: empresaRelacionada.ciudad,
                estado: empresaRelacionada.estado
              });
            } else {
              console.error("No se encontró la empresa asociada al cliente.");
            }
          } else {
            console.warn("El cliente no tiene una empresa asociada.");
          }
        } else {
          console.error("No se encontró el cliente con el ID especificado.");
        }
      } catch (error) {
        console.error("Error al cargar los datos del cliente", error);
      }
    };
    
    

    fetchReceptor();
    fetchCliente();
    fetchCotizacionServicios();
  }, [id, form,cotizacionId]);
  

  const onFinish = async (values) => {
    try {
      await form.validateFields();
      setOrdenFormValues(values); // guardamos los valores validados
      setIsOrdenConfirmModalVisible(true); // mostramos el modal
    } catch (error) {
      message.error("Por favor completa todos los campos requeridos.");
    }
  };

  const handleConfirmCrearOrden = async () => {
    try {
      const ordenData = {
        receptor: ordenFormValues.receptor,
        cotizacion: cotizacionId,
        estado: 2,
      };
      const ordenResponse = await createOrdenTrabajo(ordenData);
      const ordenTrabajoId = ordenResponse.data.id;
  
      // Crear los servicios relacionados
      for (const concepto of servicios) {
        const dataServicio = {
          cantidad: concepto.cantidad,
          descripcion: concepto.descripcion,
          ordenTrabajo: ordenTrabajoId,
          servicio: concepto.servicio,
        };
        console.log("Servicio a crear:", dataServicio);
        await createOrdenTrabajoServico(dataServicio);
      }
  
      setNewOrderId(ordenTrabajoId);
      message.success("Orden de trabajo y servicios creados correctamente");
      setIsOrdenConfirmModalVisible(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error al crear la orden de trabajo o los servicios", error);
      message.error("Error al crear la orden de trabajo o los servicios");
    }
  };
  
  



  // Función para manejar el cambio de cantidad o precio
  const handleInputChange = (index, field, value) => {
    setServicios((prev) => {
      const newServicios = [...prev];
      newServicios[index] = { ...newServicios[index], [field]: value };
      return newServicios;
    });
  };


  const handleCreateReceptor = async (values) => {
    try {
      
      const receptorData = {
        ...values, // Campos del formulario
        organizacion: organizationId, 
      };

      // Crear el receptor
      const response = await createReceptor(receptorData);
      //console.log(response.data);
      message.success("Receptor creado correctamente");

      // Actualiza la lista de receptores
      const updatedReceptors = await getAllReceptor();
      setReceptor(updatedReceptors.data);

      // Cierra el modal
      setIsModalOpen(false);
      formModal.resetFields(); // Limpia el formulario del modal
    } catch (error) {
      console.error("Error al crear el receptor", error);
      message.error("Error al crear el receptor");
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formModal.submit(); // Envía el formulario del modal
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    formModal.resetFields(); // Limpia el formulario del modal
  };

  const handleRemoveConcepto = (indexToRemove) => {
    if (servicios.length > 1) {
      setServicios((prev) => prev.filter((_, index) => index !== indexToRemove));
    } else {
      message.warning("Debe haber al menos un concepto.");
    }
  };
  

// Obtener datos del receptor seleccionado (usado en el modal de confirmación)
const receptorSeleccionado = receptor.find(r => r.id === ordenFormValues?.receptor);


  return (
    <div className="orden-trabajo-container">
      <h1 className="orden-trabajo-title">Generar Orden de Trabajo para Cotización </h1>

      <div className="orden-trabajo-info">
        <p>
          <strong>Por favor, complete todos los campos requeridos con la información correcta.</strong> La información para generar esta "Orden de Trabajo" se obtiene de la cotización. Tenga en cuenta que cualquier cambio o actualización también se reflejará en la cotización correspondiente.
        </p>
      </div>

      <div className="orden-trabajo-card">
        <h3>Información del cliente</h3>
        {cliente && Object.keys(cliente).length > 0 ? (
          <div>
            <p><strong>Nombre:</strong> {`${cliente.nombrePila} ${cliente.apPaterno} ${cliente.apMaterno}`}</p>
            <p><strong>Email:</strong> {cliente.correo}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono}</p>
            <p><strong>Celular:</strong> {cliente.celular}</p>
            <p><strong>Fax:</strong> {cliente.fax}</p>
            <p><strong>Dirección:</strong></p>
            <p><strong>Calle:</strong>{empresas.calle}</p>
            <p><strong>Número:</strong>{empresas.numero}</p>
            <p><strong>Colonia:</strong>{empresas.colonia}</p>
            <p><strong>Ciudad:</strong>{empresas.ciudad}</p>
            <p><strong>Estado:</strong>{empresas.estado}</p>
            <p><strong>Código Postal:</strong>{empresas.codigoPostal}</p>
          </div>
        ) : (
          <p>Cargando información del cliente...</p>
        )}
      </div>

      <div className="orden-trabajo-warning">
        <p>Agrega un Receptor y Datos del proyecto!</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="orden-trabajo-form"
        initialValues={{
          receptor: '',
          calle: empresas ? empresas.calle : '',
          numero: empresas ? empresas.numero : '',
          colonia: empresas ? empresas.colonia : '',
          codigoPostal: empresas ? empresas.codigoPostal : '',
          ciudad: empresas ? empresas.ciudad : '',
          estado: empresas ? empresas.estado : ''
        }}
      >
        <h2 className="section-title">Receptor</h2>
        <Row align="middle" gutter={16}>
          <Col span={20}>
            <Form.Item
              name="receptor"
              label="Seleccione el receptor de la orden"
              rules={[{ required: true, message: "Seleccione un receptor" }]}
            >
              <Select placeholder="Seleccione un receptor" className="form-select">
                {receptor.map((recep) => (
                  <Option key={recep.id} value={recep.id}>
                    {recep.nombrePila} {recep.apPaterno} {recep.apMaterno}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
          <Button
            type="primary"
            icon={<i className="fas fa-user-plus"></i>}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            onClick={showModal}
          >
            Agregar Receptor
          </Button>
          </Col>
        </Row>

        <Divider>Agregar Conceptos</Divider>
        {servicios.map((servicio, index) => (
          <div key={servicio.id}>
            <Card>
              <h3>Concepto {index +1}</h3>
              <div>            
              <Row justify="end">
                <Checkbox onChange={() => handleRemoveConcepto(index)}>
                  Eliminar
                </Checkbox>
              </Row>
                          </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['servicios', servicio.id, 'servicio']}
                    label="Servicio"
                    rules={[{ required: true, message: "Por favor, seleccione un servicio." }]}
                    initialValue={servicio.servicio}
                  >
                    <Select
                      placeholder="Selecciona un servicio"
                      disabled={true}
                    >
                      {servicios.map((servicio) => (
                        <Select.Option key={servicio.servicio} value={servicio.servicio}>
                          {servicio.servicioNombre}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['servicios', servicio.id, 'cantidad']}
                    label="Cantidad"
                    rules={[{ required: true, message: "Por favor ingresa la cantidad." }]}
                    initialValue={servicio.cantidad}
                  >
                    <Input
                      
                      min="1"
                      onChange={(e) => handleInputChange(index, "cantidad", parseFloat(e.target.value))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                <Form.Item
                  name={['servicios', servicio.id, 'descripcion']}
                  label="Descripción"
                  rules={[{ required: true, message: "Por favor ingresa la descripción." }]}
                  initialValue={servicio.descripcion} 
                >
                  <TextArea
                    placeholder="Escribe aquí la descripción del servicio"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    rows={2}
                    value={servicio.descripcion} // Muestra la descripción actual
                    onChange={(e) =>
                      handleInputChange(index, "descripcion", e.target.value)
                    }
                  />
                </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        ))}

        <div className="form-buttons">
          <Button type="primary" htmlType="submit" className="register-button">
            Registrar
          </Button>
          <Button type="default" className="cancel-button" onClick={() => navigate(`/detalles_cotizaciones/${cotizacionId}`)}>
            Cancelar
          </Button>
        </div>
      </Form>



      <div>
      {/* Modal con el formulario reseptor*/}
      <Modal
        title="Agregar Receptor"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancelar" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="guardar" type="primary" onClick={handleOk}>
            Guardar
          </Button>,
        ]}
      >
        <Form form={formModal} layout="vertical" onFinish={handleCreateReceptor}>
          <Form.Item
                name="nombrePila"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
            <Form.Item
            name="apPaterno"
            label="Apellido Paterno"
            rules={[{ required: true, message: 'Por favor ingrese el apellido paterno' }]}
          >
            <Input placeholder="Apellido Paterno" />
          </Form.Item>
          <Form.Item
              name="apMaterno"
              label="Apellido Materno"
              rules={[{ required: true, message: 'Por favor ingrese el apellido materno' }]}
            >
              <Input placeholder="Apellido Materno" />
            </Form.Item>
            <Form.Item
              name="correo"
              label="Correo Electrónico"
            >
              <Input placeholder="Correo electrónico" />
            </Form.Item>
          <Form.Item
            label="Celular:"
            name="celular"
          >
            <Input placeholder="Celular" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        title="Orden Creada"
        open={isSuccessModalOpen}
        onOk={() => setIsSuccessModalOpen(false)}
        onCancel={() => {setIsSuccessModalOpen(false); navigate(`/DetalleOrdenTrabajo/${newOrderId}`);}}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => {setIsSuccessModalOpen(false); navigate(`/DetalleOrdenTrabajo/${newOrderId}`);}}
          >
            Cerrar
          </Button>,
        ]}
      >
        <Result
        status="success"
        title="¡La orden de trabajo se creó exitosamente!"></Result>
      </Modal>
      <Modal
        title="¿Crear orden de trabajo?"
        open={isOrdenConfirmModalVisible}
        onOk={handleConfirmCrearOrden}
        onCancel={() => setIsOrdenConfirmModalVisible(false)}
        okText="Crear"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de crear esta orden de trabajo?</p>
        <p><strong>Receptor:</strong> {receptorSeleccionado ? `${receptorSeleccionado.nombrePila} ${receptorSeleccionado.apPaterno} ${receptorSeleccionado.apMaterno}` : "N/A"}</p>
        <p><strong>Cotización asociada:</strong> #{cotizacionId}</p>
        <p>Se crearán también los servicios asociados automáticamente.</p>
      </Modal>

    </div>
    </div>
  );
};

export default GenerarOrdenTrabajo;
