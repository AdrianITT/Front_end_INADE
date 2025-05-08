import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, Select, message, Modal, Result, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom"; // Importa useNavigate
import "./Cliente.css";
import { updateCliente, getClienteById, getClienteDataById } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getAllTitulo } from '../../../apis/ApisServicioCliente/TituloApi';
import { getAllUsoCDFI } from '../../../apis/ApisServicioCliente/UsocfdiApi'; // Asegúrate de que este API esté implementada correctamente

const EditarCliente = () => {
  const { clienteId } = useParams();  // Obtén el id desde la URL
  const navigate = useNavigate(); // Hook para manejar navegación
  const [clienteData, setClienteData] = useState(null);  // Guardar los datos del cliente
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [form] = Form.useForm();
  const [titulos, setTitulos] = useState([]);
  const [usoCfdiOptions, setUsoCfdiOptions] = useState([]);  // Opciones de UsoCfdi
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Estado del modal de éxito

  // Obtén los datos del cliente cuando el componente se monta
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await getClienteById(clienteId);
        const cliente = response.data;
        setClienteData(cliente);
        form.setFieldsValue(cliente); // ← Establece datos básicos
  
        // Ahora intenta obtener dirección
        const direccionRes = await getClienteDataById(clienteId);
        //console.log("Dirección del cliente:", direccionRes.data);
        const direccion = direccionRes.data;
        //console.log("Dirección del cliente1:", direccion.cliente.empresa.calle);
        // Solo si el cliente NO tiene dirección, usamos la de la empresa
        const direccionActual = form.getFieldsValue(["calleCliente", "numeroCliente"]);
        //console.log("Dirección actual:", direccionActual);
        const sinDireccion = !direccionActual.calleCliente || !direccionActual.numeroCliente;
        //console.log("Sin dirección:", sinDireccion);
  
        if (sinDireccion && direccion?.cliente?.empresa) {
          form.setFieldsValue({
            calleCliente: direccion.cliente.empresa.calle || "",
            numeroCliente: direccion.cliente.empresa.numero || "",
            coloniaCliente: direccion.cliente.empresa.colonia || "",
            ciudadCliente: direccion.cliente.empresa.ciudad || "",
            estadoCliente: direccion.cliente.empresa.estado || "",
            codigoPostalCliente: direccion.cliente.empresa.codigoPostal || "",
          });
        }
  
      } catch (error) {
        console.error("Error al obtener los datos del cliente o la dirección:", error);
        message.error("Error al cargar los datos del cliente");
      } finally {
        setLoading(false);
      }
    };
    

    const fetchTitulos = async () => {
      try {
        const response = await getAllTitulo();
        setTitulos(response.data);  // Guardar los títulos en el estado
      } catch (error) {
        console.error('Error al cargar los títulos:', error);
      }
    };

    const fetchUsoCfdi = async () => {
      try {
        const response = await getAllUsoCDFI(); // Obtén las opciones de UsoCfdi desde la API
        setUsoCfdiOptions(response.data); // Almacena las opciones
      } catch (error) {
        console.error('Error al cargar los Usos de CFDI:', error);
        message.error("Error al cargar los Usos de CFDI");
      }
    };

    fetchCliente();

    fetchTitulos();
    fetchUsoCfdi();
  }, [clienteId]);

  useEffect(() => {
    if (clienteData) {
      form.setFieldsValue(clienteData);  // Establece los valores en el formulario una vez que se cargan los datos
    }
  }, [clienteData, form]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Maneja la actualización del cliente
  const handleSave = async (values) => {
    try {
      // Preservamos los valores originales y añadimos la empresa
      const updatedValues = { ...values };

      // Añadimos el campo UsoCfdi
      updatedValues.empresa = clienteData.empresa;  // Aseguramos que el id de empresa no cambie
      updatedValues.UsoCfdi = values.UsoCfdi || clienteData.UsoCfdi || 3;  // Si no se proporciona, se usa el valor original o por defecto

      await updateCliente(clienteId, updatedValues);  // Llama a la API para actualizar los datos
      
      // Mostrar modal de éxito
      setIsSuccessModalOpen(true);

      // Esperar 3 segundos antes de cerrar el modal y redirigir
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        navigate("/cliente");  // Redirige a la lista de clientes
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar el cliente", error);
      message.error("Error al actualizar el cliente");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  return (
    <div className="editar-cliente-container">
      <h1 className="editar-cliente-title">Editar Cliente</h1>
      <Form
        form={form}  // Usa el formulario gestionado por Form.useForm()
        layout="vertical"
        onFinish={handleSave}
        className="editar-cliente-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre:"
              name="nombrePila"
              rules={[{ required: true, message: 'Por favor ingresa el nombre.' }]}
            >
              <Input placeholder="Ingresa Nombre del cliente" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Apellidos materno:"
              name="apMaterno"
            >
              <Input placeholder="Ingresa Ambos apellidos del cliente" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Apellidos paterno:"
              name="apPaterno"
              rules={[{ required: true, message: 'Por favor ingresa los apellidos.' }]}
            >
              <Input placeholder="Ingresa Ambos apellidos del cliente" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Título:"
              name="titulo"
            >
              <Select placeholder="Selecciona un título">
                {titulos.map((titulo) => (
                  <Select.Option key={titulo.id} value={titulo.id}>
                    {titulo.titulo} - {titulo.abreviatura}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Correo electrónico:"
              name="correo"
              rules={[
                { type: "email", message: "Por favor ingresa un correo válido" },
                { required: true, message: "Por favor ingresa un correo" },
              ]}
            >
              <Input placeholder="Correo electrónico" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Teléfono:" name="telefono">
              <Input placeholder="teléfono" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Celular:" name="celular">
              <Input placeholder="celular" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Fax:" name="fax">
              <Input placeholder="fax" />
            </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item
            label="Sub - Division"
            name="division"
          >
            <Input placeholder="division" />
          </Form.Item>
          </Col>
        </Row>
        <Row gutter={30}>
            <Divider>Direccion del cliente</Divider>
              <Col span={12}>
                <Form.Item
                  label="Calle:"
                  name="calleCliente"
                  rules={[{ required: true, message: 'Calle requerida' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Numero externo:"
                  name="numeroCliente"
                  rules={[{ required: true, message: 'Número requerido' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Colonia:"
                  name="coloniaCliente"
                  rules={[{ required: true, message: 'Colonia requerida' }]}
                >
                  <Input />
                </Form.Item>
                  </Col>
                  <Col span={12}>
                <Form.Item
                  label="Ciudad:"
                  name="ciudadCliente"
                  rules={[{ required: true, message: 'Ciudad requerida' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Codigo Postal:"
                  name="codigoPostalCliente"
                  rules={[{ required: true, message: 'Código postal requerido' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Estado:"
                  name="estadoCliente"
                  rules={[{ required: true, message: 'Estado requerido' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
          </Row>
        {/* Campo para seleccionar UsoCfdi 
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Uso CFDI:"
              name="UsoCfdi"
              rules={[{ required: true, message: "Por favor selecciona un uso CFDI" }]}
            >
              <Select placeholder="Selecciona un uso CFDI">
                {usoCfdiOptions.map((usoCfdi) => (
                  <Select.Option key={usoCfdi.id} value={usoCfdi.id}>
                    {usoCfdi.codigo} - {usoCfdi.descripcion}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>*/}

        <div className="editar-cliente-buttons">
          <Button type="primary" htmlType="submit">
            Guardar cambios
          </Button>
          <Button type="default" onClick={handleGoBack}>
            Cancelar
          </Button>
        </div>
      </Form>

      {/* ✅ Modal de éxito al actualizar */}
      <Modal
        title="Actualización Exitosa"
        open={isSuccessModalOpen}
        footer={null}
        closable={false}
      >
        <Result
          status="success"
          title="¡El cliente ha sido actualizado correctamente!"
        />
      </Modal>
    </div>
  );
};

export default EditarCliente;
