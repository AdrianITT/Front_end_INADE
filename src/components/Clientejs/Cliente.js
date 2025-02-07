import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Checkbox, Tabs, Table, Input, Form, Button, Modal, Select, Row, Col, Spin, Result } from 'antd';
import StickyBox from 'react-sticky-box';
import { Link, useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { getAllCliente, createCliente, deleteCliente } from '../../apis/ClienteApi';
import { getAllEmpresas, createEmpresas } from '../../apis/EmpresaApi';
import { getAllTitulo } from '../../apis/TituloApi';
import { getAllRegimenFiscal } from '../../apis/Regimenfiscla';
import { getAllUsoCDFI } from '../../apis/UsocfdiApi';
import './Cliente.css';

const Cliente = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createCompany, setCreateCompany] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [titulos, setTitulos] = useState([]);
  const [clienteIdToDelete, setClienteIdToDelete] = useState(null);
  const [regimenFiscal, setRegimenFiscal] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usosCfdi, setUsosCfdi] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener el ID de la organización una sola vez
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // Cargar datos iniciales (regimen, moneda, empresas y usos CFDI)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regimenRes, empresasRes, usosCfdiRes] = await Promise.all([
          getAllRegimenFiscal(),
          getAllEmpresas(),
          getAllUsoCDFI()
        ]);
        setRegimenFiscal(regimenRes.data);
        const filteredEmpresas = empresasRes.data.filter(empresa => empresa.organizacion === organizationId);
        setEmpresas(filteredEmpresas);
        setUsosCfdi(usosCfdiRes.data);
      } catch (error) {
        console.error('Error al cargar los datos', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organizationId]);

  // Función para eliminar un cliente
  const handleDeleteCliente = async (id) => {
    try {
      await deleteCliente(id);
      setClientes(prev => prev.filter(item => item.key !== id));
      setIsAlertModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar el cliente', error);
    }
  };

  // Cargar empresas y devolver un objeto con id: nombre
  const loadEmpresasMap = useCallback(async () => {
    const res = await getAllEmpresas();
    const filtered = res.data.filter(empresa => empresa.organizacion === organizationId);
    return filtered.reduce((acc, empresa) => {
      acc[empresa.id] = empresa.nombre;
      return acc;
    }, {});
  }, [organizationId]);

  // Cargar clientes y formatear datos para la tabla
  const loadClientes = useCallback(async () => {
    try {
      const empresasMap = await loadEmpresasMap();
      const res = await getAllCliente();
      const filteredClientes = res.data.filter(cliente => empresasMap[cliente.empresa]);
      const formattedData = filteredClientes.map(cliente => ({
        key: cliente.id,
        Cliente: `${cliente.nombrePila} ${cliente.apPaterno} ${cliente.apMaterno}`,
        Empresa: empresasMap[cliente.empresa] || 'Empresa no encontrada',
        Correo: cliente.correo,
        activo: cliente.activo // Se asume que existe este campo
      }));
      setClientes(formattedData);
    } catch (error) {
      console.error('Error al cargar los clientes', error);
    }
  }, [loadEmpresasMap]);

  // Cargar títulos y clientes
  useEffect(() => {
    const fetchTitulos = async () => {
      try {
        const response = await getAllTitulo();
        setTitulos(response.data);
      } catch (error) {
        console.error('Error al cargar los títulos:', error);
      }
    };
    fetchTitulos();
    loadClientes();
  }, [loadClientes]);

  // Función para crear un cliente (y empresa si se requiere)
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
      };
      try {
        const createEmpresaResponse = await createEmpresas(empresaData);
        empresaId = createEmpresaResponse.data.id;
      } catch (error) {
        console.error('Error al crear la empresa', error);
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
      fax: formValues.fax || "",
      empresa: empresaId,
      titulo: formValues.titulo,
      UsoCfdi: formValues.UsoCfdi || 3,
    };

    if (!clienteData.nombrePila || !clienteData.apPaterno || !clienteData.apMaterno || !clienteData.correo || !clienteData.empresa || !clienteData.titulo) {
      console.error("Faltan campos obligatorios para crear el cliente");
      return null;
    }
    try {
      const createClienteResponse = await createCliente(clienteData);
      return createClienteResponse.data.id;
    } catch (error) {
      console.error('Error al crear el cliente', error);
      return null;
    }
  };

  // Handlers para el modal de creación de cliente
  const handleOk = async () => {
    try {
      const formValues = await form.validateFields();
      const newClientId = await createClientAndReturnId(formValues, createCompany);
      if (newClientId) {
        loadClientes();
        setIsModalOpen(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error al crear cliente", error);
    }
  };

  const handleCreateAndCotizar = async () => {
    try {
      const formValues = await form.validateFields();
      const newClientId = await createClientAndReturnId(formValues, createCompany);
      if (newClientId) {
        loadClientes();
        setIsModalOpen(false);
        form.resetFields();
        navigate(`/crear_cotizacion/${newClientId}`);
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

  // Columnas para clientes activos
  const columnsActivos = useMemo(() => [
    { title: '#', dataIndex: 'key', key: 'key' },
    { title: 'Cliente', dataIndex: 'Cliente', key: 'Cliente' },
    { title: 'Empresa', dataIndex: 'Empresa', key: 'Empresa' },
    { title: 'Correo', dataIndex: 'Correo', key: 'Correo' },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Link to={`/crear_cotizacion/${record.key}`}>
            <Button className="action-button-cotizar">Cotizar</Button>
          </Link>
          <Link to={`/EditarCliente/${record.key}`}>
            <Button className="action-button-edit">
              <EditOutlined />
            </Button>
          </Link>
          <Button className="action-button-delete" onClick={() => showAlertModal(record.key)}>
            <CloseOutlined />
          </Button>
        </div>
      ),
    },
  ], []);

  // Columnas para clientes inactivos
  const columnsInactivos = useMemo(() => [
    { title: '#', dataIndex: 'key', key: 'key' },
    { title: 'Cliente', dataIndex: 'Cliente', key: 'Cliente' },
    { title: 'Empresa', dataIndex: 'Empresa', key: 'Empresa' },
    { title: 'Correo', dataIndex: 'Correo', key: 'Correo' },
  ], []);

  // Renderizado de la barra de tabs con StickyBox
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
          <div className="search-bar">
            <Input.Search
              placeholder="Buscar proyectos..."
              enterButton="Buscar"
              style={{ width: "300px" }}
            />
          </div>
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
                  label: 'Clientes Activos',
                  key: '1',
                  children: (
                    <Table columns={columnsActivos} dataSource={clientes} />
                  ),
                },
                {
                  label: 'Clientes Inactivos',
                  key: '2',
                  children: (
                    <Table
                      dataSource={clientes.filter(c => !c.activo)}
                      columns={columnsInactivos}
                      bordered
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['3', '5', '10'],
                      }}
                    />
                  ),
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
          <Button key="create-quote" type="primary" style={{ backgroundColor: '#1890ff' }} onClick={handleCreateAndCotizar}>
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
                rules={[{ required: true, message: 'Por favor ingresa el nombre.' }]}
              >
                <Input placeholder="Ingresa Nombre del cliente" />
              </Form.Item>
              <Form.Item
                label="Apellidos paterno:"
                name="apPaterno"
                rules={[{ required: true, message: 'Por favor ingresa los apellidos.' }]}
              >
                <Input placeholder="Ingresa Ambos apellidos del cliente" />
              </Form.Item>
              <Form.Item
                label="Apellidos materno:"
                name="apMaterno"
                rules={[{ required: true, message: 'Por favor ingresa los apellidos.' }]}
              >
                <Input placeholder="Ingresa Ambos apellidos del cliente" />
              </Form.Item>
              <Form.Item label="Título:" name="titulo">
                <Select placeholder="Selecciona un título">
                  {titulos.map(t => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.titulo} - {t.abreviatura}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Uso CFDI:" name="UsoCfdi">
                <Select placeholder="Selecciona un Uso CFDI">
                  {usosCfdi.map(uso => (
                    <Select.Option key={uso.id} value={uso.id}>
                      {uso.codigo} - {uso.descripcion}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Correo Electrónico:"
                name="correo"
                rules={[{ required: true, message: 'Por favor ingresa un correo electrónico.' }]}
              >
                <Input placeholder="Correo electrónico" />
              </Form.Item>
              <Form.Item label="Teléfono:" name="telefono">
                <Input placeholder="Teléfono" />
              </Form.Item>
              <Form.Item
                label="Celular:"
                name="celular"
                rules={[{ required: true, message: 'Por favor ingresa un número de celular.' }]}
              >
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
                    rules={[{ required: true, message: 'Por favor ingresa el nombre de la empresa.' }]}
                  >
                    <Input placeholder="Ingresa el Nombre de la Empresa" />
                  </Form.Item>
                  <Form.Item label="Régimen fiscal:" name="regimenFiscal">
                    <Select placeholder="Selecciona el régimen fiscal">
                      {regimenFiscal.map(reg => (
                        <Select.Option key={reg.id} value={reg.id}>
                          {reg.codigo} - {reg.nombre}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="RFC:"
                    name="rfc"
                    rules={[{ required: true, message: 'Por favor ingresa el RFC.' }]}
                  >
                    <Input placeholder="Ingrese RFC" />
                  </Form.Item>
                  <Form.Item
                    label="Condiciones pago:"
                    name="condicionPago"
                    rules={[{ required: true, message: 'Por favor ingresa la condición de pago.' }]}
                  >
                    <Input placeholder="Condición de pago" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Calle:"
                    name="calle"
                    rules={[{ required: true, message: 'Por favor ingresa la calle.' }]}
                  >
                    <Input placeholder="Calle" />
                  </Form.Item>
                  <Form.Item
                    label="Número:"
                    name="numero"
                    rules={[{ required: true, message: 'Por favor ingresa el número.' }]}
                  >
                    <Input placeholder="Número" />
                  </Form.Item>
                  <Form.Item
                    label="Colonia:"
                    name="colonia"
                    rules={[{ required: true, message: 'Por favor ingresa la colonia.' }]}
                  >
                    <Input placeholder="Colonia" />
                  </Form.Item>
                  <Form.Item
                    label="Ciudad:"
                    name="ciudad"
                    rules={[{ required: true, message: 'Por favor ingresa la ciudad.' }]}
                  >
                    <Input placeholder="Ciudad" />
                  </Form.Item>
                  <Form.Item
                    label="Código Postal:"
                    name="codigoPostal"
                    rules={[{ required: true, message: 'Por favor ingresa el código postal.' }]}
                  >
                    <Input placeholder="Código Postal" />
                  </Form.Item>
                  <Form.Item
                    label="Estado:"
                    name="estado"
                    rules={[{ required: true, message: 'Por favor ingresa el estado.' }]}
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
              rules={[{ required: true, message: 'Por favor selecciona una empresa o crea una nueva.' }]}
            >
              <Select placeholder="Selecciona una empresa">
                {empresas.map(empresa => (
                  <Select.Option key={empresa.id} value={empresa.id}>
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
