// src/components/Cliente.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, Input, Button, Modal, Form, Spin, Table, Checkbox, Result, Row, Col, Select } from "antd";
import StickyBox from "react-sticky-box";
import { useNavigate } from "react-router-dom";
import {ExclamationCircleOutlined } from "@ant-design/icons";
import ClienteTable from "./ClienteTable";
import { createEmpresas } from "../../../apis/ApisServicioCliente/EmpresaApi";
import { useCatalogos } from "../Clientejs/useCatalogos";
import { getAllCliente, createCliente, deleteCliente } from "../../../apis/ApisServicioCliente/ClienteApi";
import { getAllTitulo } from "../../../apis/ApisServicioCliente/TituloApi";
import "./Cliente.css";

const Cliente = () => {
  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteIdToDelete, setClienteIdToDelete] = useState(null);
  const [createCompany, setCreateCompany] = useState(false);
  const [titulos, setTitulos] = useState([]);
  
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Obtener el ID de la organización (se hace una sola vez)
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // Usar el custom hook para cargar catálogos (regimen fiscal, empresas, usos CFDI)
  const { regimenFiscal, empresas, usosCfdi, loading: catalogosLoading } = useCatalogos(organizationId);

  // Función para cargar clientes desde la API y formatearlos para la tabla
  const loadClientes = useCallback(async () => {
    try {
      //Obtener todas las empresas de la organizacion
      const empresaDeLaOrganizacion=empresas.filter(empresa=> empresa.organizacion===organizationId)

      const res = await getAllCliente();

      //Filtrar los clientes que pertenecen a las empresas de la organizacion
      const clientesFiltrados = res.data.filter(cliente=> empresaDeLaOrganizacion.some(empresa=>empresa.id===cliente.empresa));
      // Se formatean los clientes: se calcula un flag "incompleto" si faltan datos
      const clientesFormateados = clientesFiltrados.map((cliente) => {
        const datosIncompletos =
          !cliente.nombrePila || !cliente.apPaterno || !cliente.empresa;
        return {
          key: cliente.id,
          Cliente: `${cliente.nombrePila || "Sin nombre"} ${cliente.apPaterno || ""} ${cliente.apMaterno || ""}`,
          Empresa: empresas.find((e) => e.id === cliente.empresa)?.nombre || "Empresa no encontrada",
          Correo: cliente.correo || "Sin correo",
          activo: cliente.activo,
          incompleto: datosIncompletos,
        };
      });
      // Ordenar los clientes, mostrando primero aquellos con datos incompletos
      const sortedClientes = clientesFormateados.sort((a, b) => b.incompleto - a.incompleto);
      setClientes(sortedClientes);
    } catch (error) {
      console.error("Error al cargar los clientes", error);
    }
  }, [empresas, organizationId ]);

  useEffect(() => {
    if (empresas.length > 0) { // Solo cargar clientes si las empresas ya están cargadas
      const fetchData = async () => {
        setLoading(true);
        await loadClientes();
        setLoading(false);
      };
      fetchData();
    }
  }, [empresas, loadClientes]); // Depender de empresas y loadClientes

  // Cargar clientes al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadClientes();
      setLoading(false);
    };
    fetchData();
  }, [loadClientes]);

  // Cargar títulos (puedes extraer esto a un hook si se requiere)
  useEffect(() => {

    const fetchTitulos = async () => {
      try {
        const response = await getAllTitulo();
        setTitulos(response.data);
      } catch (error) {
        console.error("Error al cargar los títulos:", error);
      }
    };
    fetchTitulos();
  }, []);

  // Función para eliminar un cliente
  const handleDeleteCliente = async (id) => {
    try {
      await deleteCliente(id);
      setClientes((prev) => prev.filter((cliente) => cliente.key !== id));
      setIsAlertModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar el cliente", error);
    }
  };

  // Funciones para mostrar y ocultar el modal de alerta de eliminación
  const showAlertModal = (id) => {
    setClienteIdToDelete(id);
    setIsAlertModalOpen(true);
  };

  const handleOkAlert = () => {
    if (clienteIdToDelete) {
      handleDeleteCliente(clienteIdToDelete);
    }
    setIsAlertModalOpen(false);
  };

  const handleCancelAlert = () => {
    setIsAlertModalOpen(false);
  };

  // Función para crear un cliente (y crear empresa si es necesario)
  const createClientAndReturnId = async (formValues, createCompanyFlag) => {
    let empresaId = formValues.empresa;
    if (createCompanyFlag) {
      const empresaData = {
        nombre: formValues.nombre,
        rfc: formValues.rfc,
        regimenFiscal: parseInt(formValues.regimenFiscal, 10),
        condicionPago: formValues.condicionPago,
        calle: formValues.calle,
        numero: formValues.numero,
        colonia: formValues.colonia,
        ciudad: formValues.ciudad,
        codigoPostal: formValues.codigoPostal,
        estado: formValues.estado,
        organizacion: organizationId,
        UsoCfdi: formValues.UsoCfdi,
      };
      try {
        const createEmpresaResponse = await createEmpresas(empresaData);
        empresaId = createEmpresaResponse.data.id;
      } catch (error) {
        console.error("Error al crear la empresa", error);
        return null;
      }
    }
  
    const clienteData = {
      nombrePila: formValues.nombrePila,
      apPaterno: formValues.apPaterno,
      apMaterno: formValues.apMaterno,
      correo: formValues.correo,
      telefono: formValues.telefono || "",
      celular: formValues.celular || "",
      fax: formValues.fax || "No disponible",
      empresa: empresaId,
      titulo: formValues.titulo,
      //UsoCfdi: formValues.UsoCfdi || 3,
    };
  
    if (!clienteData.nombrePila || !clienteData.apPaterno || !clienteData.correo || !clienteData.empresa) {
      console.error("Faltan campos obligatorios para crear el cliente");
      return null;
    }
    try {
      const createClienteResponse = await createCliente(clienteData);
      return createClienteResponse.data.id;
    } catch (error) {
      console.error("Error al crear el cliente", error);
      return null;
    }
  };

  // Handler para el modal de creación de cliente
  const handleOk = async () => {
    try {
      const formValues = await form.validateFields();
      const newClientId = await createClientAndReturnId(formValues, createCompany);
      if (newClientId) {
        await loadClientes();
        setIsModalOpen(false);
        form.resetFields();
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  // Handler para crear cliente y redirigir a cotización
  const handleCreateAndCotizar = async () => {
    try {
      const formValues = await form.validateFields();
      const newClientId = await createClientAndReturnId(formValues, createCompany);
      if (newClientId) {
        await loadClientes();
        setIsModalOpen(false);
        form.resetFields();
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          navigate(`/crear_cotizacion/${newClientId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error al crear y cotizar", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCheckboxChange = (e) => {
    setCreateCompany(e.target.checked);
  };

  // Función para renderizar la barra de tabs con StickyBox
  const renderTabBar = (props, DefaultTabBar) => (
    <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );

  return (
    <div className="container-center">
      <h1 className="title-center">Clientes</h1>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Cargando clientes..." />
        </div>
      ) : (
        <>

          <div className="button-top-container">
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Añadir Cliente
            </Button>
          </div>
          <div className="tab-center">
            <Tabs
              defaultActiveKey="1"
              renderTabBar={renderTabBar}
              items={[
                {
                  label: "Clientes Activos",
                  key: "1",
                  children: <ClienteTable clientes={clientes} showAlertModal={showAlertModal} />,
                },

              ]}
            />
          </div>
        </>
      )}

      {/* Modal para añadir cliente */}
      <Modal
        title="Añadir Cliente"
        open={isModalOpen}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="create" type="primary" onClick={handleOk}>
            Crear Cliente
          </Button>,
          <Button
            key="create-quote"
            type="primary"
            style={{ backgroundColor: "#1890ff" }}
            onClick={handleCreateAndCotizar}
          >
            Crear y Cotizar
          </Button>,
        ]}
      >
        <Form name="clienteForm" form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre:"
                name="nombrePila"
                rules={[{ required: true, message: "Por favor ingresa el nombre." }]}
              >
                <Input placeholder="Ingresa Nombre del cliente" />
              </Form.Item>
              <Form.Item
                label="Apellidos paterno:"
                name="apPaterno"
                rules={[{ required: true, message: "Por favor ingresa los apellidos." }]}
              >
                <Input placeholder="Ingresa Ambos apellidos del cliente" />
              </Form.Item>
              <Form.Item
                label="Apellidos materno:"
                name="apMaterno"
                rules={[{ message: "Por favor ingresa los apellidos." }]}
              >
                <Input placeholder="Ingresa Ambos apellidos del cliente" />
              </Form.Item>
              <Form.Item label="Título:" name="titulo">
                <Select placeholder="Selecciona un título">
                  {titulos.map((t) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.titulo} - {t.abreviatura}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Correo Electrónico:"
                name="correo"
                rules={[{ required: true, message: "Por favor ingresa un correo electrónico." }]}
              >
                <Input placeholder="Correo electrónico" />
              </Form.Item>
              <Form.Item label="Teléfono:" name="telefono">
                <Input placeholder="Teléfono" />
              </Form.Item>
              <Form.Item label="Celular:" name="celular">
                <Input placeholder="Celular" />
              </Form.Item>
              <Form.Item label="Fax:" name="fax">
                <Input placeholder="Fax" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="createCompany" valuePropName="checked">
            <Checkbox onChange={handleCheckboxChange}>Crear empresa</Checkbox>
          </Form.Item>
          {createCompany ? (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Nombre empresa:"
                    name="nombre"
                    rules={[{ required: true, message: "Por favor ingresa el nombre de la empresa." }]}
                  >
                    <Input placeholder="Ingresa el Nombre de la Empresa" />
                  </Form.Item>

                  <Form.Item 
                  label="Regimen fiscal:" 
                  name="regimenFiscal"
                  rules={[{ required: true, message: 'Régimen requerido' }]}>
                    <Select
                        showSearch
                        placeholder="Selecciona un Régimen fiscal"
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
                      {regimenFiscal.map((regimen) => (
                        <Select.Option 
                          key={regimen.id} 
                          value={regimen.id}
                          label={`${regimen.codigo} - ${regimen.nombre}`}
                        >
                          {regimen.codigo} - {regimen.nombre}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item 
                  label="Uso CFDI:" 
                  name="UsoCfdi">
                  <Select
                      showSearch
                      placeholder="Selecciona un Uso CFDI"
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
                    {usosCfdi.map((uso) => (
                      <Select.Option 
                        key={uso.id} 
                        value={uso.id}
                        label={`${uso.codigo} - ${uso.descripcion}`}
                      >
                        {uso.codigo} - {uso.descripcion}
                      </Select.Option>
                    ))}
                  </Select>
                  </Form.Item>
                  <Form.Item
                    label="RFC:"
                    name="rfc"
                    rules={[{ required: true, message: "Por favor ingresa el RFC." }]}
                  >
                    <Input placeholder="Ingrese RFC" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Calle:"
                    name="calle"
                    rules={[{ required: true, message: "Por favor ingresa la calle." }]}
                  >
                    <Input placeholder="Calle" />
                  </Form.Item>
                  <Form.Item
                    label="Número:"
                    name="numero"
                    rules={[{ required: true, message: "Por favor ingresa el número." }]}
                  >
                    <Input placeholder="Número" />
                  </Form.Item>
                  <Form.Item
                    label="Colonia:"
                    name="colonia"
                    rules={[{ required: true, message: "Por favor ingresa la colonia." }]}
                  >
                    <Input placeholder="Colonia" />
                  </Form.Item>
                  <Form.Item
                    label="Ciudad:"
                    name="ciudad"
                    rules={[{ required: true, message: "Por favor ingresa la ciudad." }]}
                  >
                    <Input placeholder="Ciudad" />
                  </Form.Item>
                  <Form.Item
                    label="Código Postal:"
                    name="codigoPostal"
                    rules={[{ required: true, message: "Por favor ingresa el código postal." }]}
                  >
                    <Input placeholder="Código Postal" />
                  </Form.Item>
                  <Form.Item
                    label="Estado:"
                    name="estado"
                    rules={[{ required: true, message: "Por favor ingresa el estado." }]}
                  >
                    <Input placeholder="Estado" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ) : (
          <Form.Item
            label="Empresa:"
            name="empresa"
            rules={[{ required: true, message: "Por favor selecciona una empresa o crea una nueva." }]}
          >
            <Select
              placeholder="Selecciona una empresa"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare(
                  (optionB?.label ?? '').toLowerCase()
                )
              }
            >
              {empresas.map((empresa) => (
                <Select.Option 
                  key={empresa.id} 
                  value={empresa.id}
                  label={empresa.nombre}
                >
                  {empresa.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          )}
        </Form>
      </Modal>
  
      {/* Modal de confirmación para eliminar cliente */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <ExclamationCircleOutlined style={{ fontSize: "42px", color: "#faad14" }} />
            <p style={{ marginTop: "8px" }}>¿Estás seguro?</p>
          </div>
        }
        open={isAlertModalOpen}
        onOk={handleOkAlert}
        onCancel={handleCancelAlert}
        okText="Sí, eliminar"
        cancelText="No, cancelar"
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelAlert} style={{ backgroundColor: "#f5222d", color: "#fff" }}>
            No, cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleOkAlert}>
            Sí, eliminar
          </Button>,
        ]}
      >
        <p style={{ textAlign: "center", marginBottom: 0 }}>
          ¡No podrás revertir esto!
        </p>
      </Modal>
      
      {/* Modal de Éxito */}
      <Modal
        title="Cliente Creado con Éxito"
        open={isSuccessModalOpen}
        onOk={() => setIsSuccessModalOpen(false)}
        onCancel={() => setIsSuccessModalOpen(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsSuccessModalOpen(false)}>
            Cerrar
          </Button>
        ]}
      >
        <Result status="success" title="¡El cliente ha sido creado correctamente!" />
      </Modal>
    </div>
  );
};

export default Cliente;
