import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Select, Button, Row, Col,Checkbox, Modal, message, Divider, Card, Result, Descriptions, Spin} from "antd";
//import { CloseCircleOutlined  } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import "./cssOrdenTrabajo/GenerarOrdenTrabajo.css";
import { getAllReceptor, createReceptor } from "../../../apis/ApisServicioCliente/ResectorApi";
import { createOrdenTrabajo } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { createOrdenTrabajoServico } from "../../../apis/ApisServicioCliente/OrdenTabajoServiciosApi";
import {getAllOrdenTrabajoById} from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
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
  const [serviciosParaEliminar, setServiciosParaEliminar] = useState([]);
  const [dataCotizacion, setCotizacionData] = useState([]);
  
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
    const fetchOrdenData = async () => {
      try {
        const response = await getAllOrdenTrabajoById(id); // <-- usa id directamente desde useParams
        const data = response.data;
        //console.log("data: ", data);
        setCotizacionData(data);           // info general
        setCliente(data.cliente);          // info cliente
        setEmpresa(data.empresa);          // info empresa
        setServicios(data.servicios);      // lista de servicios
  
      } catch (error) {
        console.error("Error al obtener la información de la orden de trabajo", error);
      }
    };
  
    fetchOrdenData();
    fetchReceptor();
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
      // Filtrar los servicios que NO se deben eliminar
      const serviciosAFiltrar = servicios.filter(
        servicio => !serviciosParaEliminar.includes(servicio.id)
      );
      
      // Crear los servicios relacionados
      for (const concepto of serviciosAFiltrar) {
        const dataServicio = {
          cantidad: concepto.cantidad,
          descripcion: concepto.descripcion,
          ordenTrabajo: ordenTrabajoId,
          servicio: concepto.servicio.id,
        };
        //console.log("Servicio a crear:", dataServicio);
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
      ////console.log(response.data);
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

      <div style={{ padding: 20 }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: 20 }}>Información del cliente</h2>

      {cliente && Object.keys(cliente).length > 0 ? (
        <Card
        className="informacion-cliente-card" bordered={false}
        >
          <Descriptions
            column={1}
            labelStyle={{}}
            contentStyle={{}}
            colon={false}
          >
            
            <Descriptions.Item 
              label={<span className="informacion-cliente-label">Nombre:</span>}
            >
              <span className="informacion-cliente-content">{cliente.nombreCompleto}</span>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<span className="informacion-cliente-label">Email:</span>}
            >
              <span className="informacion-cliente-content">{cliente.correo}</span>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<span className="informacion-cliente-label">Dirección Cliente:</span>}
            >
              <span className="informacion-cliente-content">
                {`${cliente.direccion.calle}, ${cliente.direccion.numero}, ${cliente.direccion.colonia}, ${cliente.direccion.ciudad}, ${cliente.direccion.estado}, C.P. ${cliente.direccion.codigoPostal}`}
              </span>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<span className="informacion-cliente-label">Empresa:</span>}
            >
              <span className="informacion-cliente-content">{empresas.nombre}</span>
            </Descriptions.Item>

            <Descriptions.Item 
              label={<span className="informacion-cliente-label">Dirección Empresa:</span>}
            >
              <span className="informacion-cliente-content">
                {`${empresas.direccion.calle}, ${empresas.direccion.numero}, ${empresas.direccion.colonia}, ${empresas.direccion.ciudad}, ${empresas.direccion.estado}, C.P. ${empresas.direccion.codigoPostal}`}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Spin tip="Cargando información del cliente..." />
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
              <Checkbox 
                checked={serviciosParaEliminar.includes(servicio.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    // Agregar el id al estado
                    setServiciosParaEliminar(prev => [...prev, servicio.id]);
                  } else {
                    // Remover el id del estado
                    setServiciosParaEliminar(prev =>
                      prev.filter(id => id !== servicio.id)
                    );
                  }
                }}
              >
                Eliminar
              </Checkbox>
              </Row>
                          </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['servicios', servicio.servicio.id, 'servicio']}
                    label="Servicio"
                    rules={[{ required: true, message: "Por favor, seleccione un servicio." }]}
                    initialValue={servicio.servicio.id}
                  >
                    <Select
                      placeholder="Selecciona un servicio"
                      disabled={true}
                    >
                      {servicios.map((servicio) => (
                        <Select.Option key={servicio.servicio.id} value={servicio.servicio.id}>
                          {servicio.servicio.nombre}
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
        <p><strong>Cotización asociada:</strong> #{dataCotizacion.numero}</p>
        <p>Se crearán también los servicios asociados automáticamente.</p>
      </Modal>

    </div>
    </div>
  );
};

export default GenerarOrdenTrabajo;
