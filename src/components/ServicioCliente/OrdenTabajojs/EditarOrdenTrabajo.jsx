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

} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
// Usamos el endpoint actualizado (EditOrdenTrabajoData) que ahora retorna "ordenTrabajoServicios" con el precio
import { EditOrdenTrabajoData, updateOrdenTrabajo } from "../../../apis/ApisServicioCliente/OrdenTrabajoApi";
import { updateCotizacionServicioT } from "../../../apis/ApisServicioCliente/CotizacionServicioApi";
import { getAllReceptor} from "../../../apis/ApisServicioCliente/ResectorApi";
// Funciones para crear, actualizar y eliminar servicios
import {
  createOrdenTrabajoServico,
  updateOrdenTrabajoServicio,
  deleteOrdenTrabajoServicio,
} from "../../../apis/ApisServicioCliente/OrdenTabajoServiciosApi";
// Función para obtener la data de cotización (incluye precio en cotizacionServicio)
//import { getDetallecotizaciondataById } from "../../../apis/ApisServicioCliente/CotizacionApi";
// Función para obtener la lista de servicios disponibles
import { getAllServicio } from "../../../apis/ApisServicioCliente/ServiciosApi";


const EditarOrdenTrabajo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ordenData, setOrdenData] = useState(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [receptor, setReceptor] = useState([]);
  const { Title } = Typography;
  const { Option } = Select;


  useEffect(() => {
    const fetchReceptor= async () =>{
      try{
        const response=await getAllReceptor();
        setReceptor(response.data);
      }catch(error){console.error('Error al cargar los receptores', error);}
    };
    const fetchOrdenData = async () => {
      try {
        const response = await EditOrdenTrabajoData(id);
        console.log("Orden de trabajo data:", response.data);
        const data = response.data;
        setOrdenData(data.ordenTrabajo);
    
        //const resCot = await getDetallecotizaciondataById(data.ordenTrabajo.id);
        const cotServicios = data.ordenTrabajoServicios;
    
        const serviciosMapped = data.ordenTrabajoServicios.map((ots) => {
          const match = cotServicios.find(
            (cs) => cs.id === ots.servicio.id &&
            cs.cotizacion === data.ordenTrabajo.cotizacion
          );
    
          return {
            id: ots.id,
            servicio: ots.servicio.id,
            cantidad: ots.cantidad,
            descripcion: ots.descripcion,
            precio: match ? parseFloat(match.precio) : 0,
            eliminar: false,
          };
        });
    
        form.setFieldsValue({
          servicios: serviciosMapped,
          receptor: data.receptor.id || null, // ✅ Aquí lo asignas
        });
      } catch (error) {
        console.error("Error al obtener la orden de trabajo:", error);
        message.error("Error al cargar la orden de trabajo");
      }
    };
    

    const fetchServiciosDisponibles = async () => {
      try {
        const response = await getAllServicio();
        setServiciosDisponibles(response.data);
      } catch (error) {
        console.error("Error al cargar servicios disponibles:", error);
        message.error("Error al cargar los servicios disponibles");
      }
    };
    fetchOrdenData();
    fetchServiciosDisponibles();
    fetchReceptor();
  }, [id, form]);

  const handleInputChange = (fieldIndex, fieldName, value) => {
    const currentServices = form.getFieldValue("servicios") || [];
    const updatedServices = [...currentServices];
    updatedServices[fieldIndex] = { ...updatedServices[fieldIndex], [fieldName]: value };
    form.setFieldsValue({ servicios: updatedServices });
  };

    // Manejador para el checkbox "eliminar"
    const handleToggleEliminar = (fieldIndex, checked) => {
     handleInputChange(fieldIndex, "eliminar", checked);
   };


   const onFinish = async (values) => {
    setLoading(true);
    try {
      const serviciosArray = values.servicios || [];
      console.log("Servicios a guardar:", serviciosArray);
  
      // 👉 ACTUALIZAR RECEPTOR DE LA ORDEN
      await updateOrdenTrabajo(id, {
        receptor: values.receptor,
      });
  
      // Separar servicios marcados para eliminar
      const serviciosAEliminar = serviciosArray.filter((item) => item.eliminar && item.id);
      console.log("Servicios a eliminar:", serviciosAEliminar);
  
      const serviciosExistentes = serviciosArray.filter((item) => item.id && !item.eliminar);
      console.log("Servicios existentes:", serviciosExistentes);
  
      const serviciosNuevos = serviciosArray.filter((item) => !item.id && !item.eliminar);
      const insertarPromises = serviciosNuevos.map((item) => {
        const payload = {
          cantidad: item.cantidad,
          descripcion: item.descripcion,
          ordenTrabajo: parseInt(id),
          servicio: item.servicio,
        };
        return createOrdenTrabajoServico(payload);
      });
      await Promise.allSettled(insertarPromises);
  
      const actualizarOrdenPromises = serviciosExistentes.map((item) => {
        const payload = {
          cantidad: item.cantidad,
          descripcion: item.descripcion,
        };
        return updateOrdenTrabajoServicio(item.id, payload);
      });
      await Promise.allSettled(actualizarOrdenPromises);
  
      const actualizarCotizacionPromises = serviciosExistentes.map((item) => {
        const payloadCotizacion = {
          precio: item.precio,
        };
        return updateCotizacionServicioT(item.servicio, payloadCotizacion);
      });
  
      await Promise.allSettled([
        ...actualizarOrdenPromises,
        ...actualizarCotizacionPromises,
      ]);
  
      const eliminarPromises = serviciosAEliminar.map((item) =>
        deleteOrdenTrabajoServicio(item.id)
      );
      await Promise.allSettled(eliminarPromises);
  
      message.success("Orden de trabajo actualizada correctamente");
      navigate(`/DetalleOrdenTrabajo/${id}`);
    } catch (error) {
      console.error("Error al actualizar los servicios:", error);
      message.error("Error al actualizar la orden de trabajo");
    }
    setLoading(false);
  };
  

  return (
    <div className="editar-orden-container">
      <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
        Editar Servicios de la Orden de Trabajo: {ordenData ? ordenData.codigo : id}
      </Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <Divider>Servicios</Divider>
          <Form.List name="servicios">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    type="inner"
                    title={`Servicio ${index + 1}`}
                    extra={
                    <Row justify="end" style={{ marginBottom: 8 }}>
                      <Checkbox
                        checked={form.getFieldValue(["servicios", field.name, "eliminar"])}
                        onChange={(e) => handleInputChange(index, "eliminar", e.target.checked)}
                        disabled={
                          // ✅ Deshabilitar si solo hay un servicio no marcado para eliminar
                          (form.getFieldValue("servicios") || []).filter(s => !s.eliminar).length === 1 &&
                          !form.getFieldValue(["servicios", field.name, "eliminar"])
                        }
                      >
                        Marcar para eliminar
                      </Checkbox>
                    </Row>

                    }
                    bordered={true}
                    style={{
                      marginBottom: 24,
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "servicio"]}
                          label="Servicio"
                          rules={[{ required: true, message: "Seleccione un servicio" }]}
                        >
                          <Select placeholder="Seleccione un servicio" showSearch disabled={true}>
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
                ))}{/* 
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Agregar Servicio
                  </Button>
                </Form.Item>  */}
              </>
            )}
          </Form.List>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              onClick={() => setIsModalVisible(true)}
              loading={loading}
              style={{ padding: "0 40px" }}
            >
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="¿Confirmar cambios?"
        open={isModalVisible}
        onOk={() => {
          setIsModalVisible(false);
          form.submit(); // ✅ Ejecutar el envío del formulario
        }}
        onCancel={() => setIsModalVisible(false)}
        okText="Sí, guardar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas guardar los cambios realizados en los servicios de esta orden de trabajo?</p>
      </Modal>

    </div>
  );
};

export default EditarOrdenTrabajo;
