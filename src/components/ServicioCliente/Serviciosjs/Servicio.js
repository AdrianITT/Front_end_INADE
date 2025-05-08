import React, { useState, useEffect, useMemo, useRef } from "react";
import { Tabs, Table, Input, Button, Modal, Form, Row, Col, Select, Checkbox, message, Space } from "antd";
import "./Servicio.css"
import Highlighter from 'react-highlight-words';
//import { Link} from "react-router-dom";
import { ExclamationCircleOutlined, EditOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { deleteServicio, createServicio, updateServicio, getServicioData } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { createMetodo , deleteMetodo, getAllMetodoData} from "../../../apis/ApisServicioCliente/MetodoApi";
import { getAllClaveCDFI } from "../../../apis/ApisServicioCliente/ClavecdfiApi";
import { getAllUnidadCDFI } from "../../../apis/ApisServicioCliente/unidadcdfiApi";
import { getAllObjectImpuesto_Api } from "../../../apis/ApisServicioCliente/ObjetoimpuestoApi";




const Servicio = () => {
  const [serviceToEdit, setServiceToEdit] = useState(null); // Para almacenar el servicio seleccionado
  const [formMetodo] = Form.useForm();
  const [clavecdfi, setClaveCDFI]=useState([]);
  const [unidad , setUnidadCDFI]=useState([]);
  const [objetoimpuesto, setObjetoImpuesto]=useState([]);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [servicio, setServicios]=useState([]);
  const [showInput, setShowInput] = useState(false);
  const [isModalOpenServicios, setIsModalOpenServicios] = useState(false);
  const [isModalOpenMetodos, setIsModalOpenMetodos] = useState(false);
  const [filteredServicios, setFilteredServicios] = useState(servicio);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [metodos, setMetodos] = useState([]);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [isModalOpenServiciosEdit, setIsModalOpenServiciosEdit] = useState(false); // Modal de edición
  const [currentMethodId, setCurrentMethodId] = useState(null);
  const [isServiceDeleteModalVisible, setIsServiceDeleteModalVisible] = useState(false); 
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Mensaje dinámico
  //const [searchServicios, setSearchServicios] = useState("");
  // Al inicio del componente, declara el estado y la función
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
  
    // Lógica de búsqueda
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
    };
  
    const handleReset = (clearFilters) => {
      clearFilters();
      setSearchText('');
    };
  
    // Column helper
    const getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({ 
        setSelectedKeys, 
        selectedKeys, 
        confirm, 
        clearFilters, 
        close 
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Buscar ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => {
                if (clearFilters) handleReset(clearFilters);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reiniciar
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText(selectedKeys[0]);
                setSearchedColumn(dataIndex);
              }}
            >
              Filtrar
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              Cerrar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });

const handleMetodoChange = (value) => {
  setMetodoSeleccionado(value);
};


  // Usar useEffect para obtener los servicios cuando el componente se monte
  useEffect(() => {
    const fetchMetodos = async () => {
      try {
        const response = await getAllMetodoData(organizationId);
        //console.log("Métodos:", response.data);
        setMetodos(response.data); // Almacenar los métodos en el estado
      } catch (error) {
        console.error("Error al cargar los métodos", error);
        message.error("Error al cargar los métodos");
      }
    };
    fetchMetodos();
    fetchData();
  }, []);  // El array vacío asegura que esto se ejecute solo una vez cuando el componente se monte.

  // Function to fetch all necessary data
  const fetchData = async () => {
    try {
      const [metodosRes, claveCDFIRes, unidadCDFIRes, objetoImpuestoRes,serviciosRes ] = await Promise.all([
        getAllMetodoData(organizationId),
        getAllClaveCDFI(),
        getAllUnidadCDFI(),
        getAllObjectImpuesto_Api(),
        getServicioData(organizationId)
      ]);

      setServicios(serviciosRes.data);
      //console.log("Servicios:", serviciosRes.data);
      setFilteredServicios(serviciosRes.data);
      setMetodos(metodosRes.data);
      //console.log("Métodos:", metodosRes.data);
      setClaveCDFI(claveCDFIRes.data);
      setUnidadCDFI(unidadCDFIRes.data);
      setObjetoImpuesto(objetoImpuestoRes.data);
    } catch (error) {
      console.error("Error al cargar los datos", error);
      message.error("Error al cargar los datos");
    }
  };

  // Function to refresh the service list
  const refreshServicios = async () => {
    try {
      const response = await getServicioData(organizationId);
      setServicios(response.data);
      setFilteredServicios(response.data);
    } catch (error) {
      console.error("Error al refrescar los servicios", error);
      message.error("Error al refrescar los servicios");
    }
  };

  const handleSearchServicios = (value) => {
    const filtered = servicio.filter((item) =>
      Object.values(item).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredServicios(filtered);
  };

  const handleDeleteServicio = async (id) => {
    try {
      await deleteServicio(id);  // Llamamos a la función para eliminar el servicio
      setServicios(prevServicios => prevServicios.filter(servicio => servicio.id !== id));  // Eliminamos el servicio de la lista local
      setFilteredServicios(prevServicios => prevServicios.filter(servicio => servicio.id !== id));  // Actualizamos la lista filtrada
      message.success("Servicio eliminado con éxito.");
    } catch (error) {
      message.error("Error al eliminar el servicio.");
    }
  };
  

  const showModalServicios = (service = null) => {
    if (service) {
      setServiceToEdit(service); // Si se pasa un servicio, lo establecemos en el estado
      form.setFieldsValue(service); // Pre-cargar el formulario con los datos del servicio
    } else {
      setServiceToEdit(null); // Si es para crear un nuevo servicio, limpiamos el estado
      form.resetFields(); // Restablecer los campos del formulario
    }
    setIsModalOpenServicios(true);
  };
  

  const showModalMetodos = () => {
    setIsModalOpenMetodos(true);
  };

  const handleOkServicios = async () => {
    try {
      const values = await form.validateFields(); // Usar el formulario validado
      const dataToSend = {
        ...values,
        estado: values.estado || 5,  // Si no existe el campo "estado", asignar 5 por defecto
        organizacion: organizationId,
      };

      // Verificar si todos los datos necesarios están presentes
      if (!values.metodos || !values.unidadCfdi || !values.claveCfdi ) {
        message.error("Por favor, complete todos los campos obligatorios.");
        return;
      }
        
        const response = await createServicio(dataToSend);  // Función que crea el servicio
        setServicios(prevServicios => [...prevServicios, response]);
        message.success("Servicio creado con éxito.");
        refreshServicios(); // Refresh the table after updating

        // 🔹 Establecer mensaje de éxito y abrir el modal
        setSuccessMessage("¡El servicio ha sido creado exitosamente!");
        setIsSuccessModalVisible(true);
    
      setIsModalOpenServicios(false);
    } catch (error) {
      message.error("Error al guardar el servicio.");
    }
  };

  // Mostrar modal para editar un servicio existente
  const showModalServiciosEdit = (service) => {
    setServiceToEdit(service);
    formEdit.setFieldsValue(service);
    setIsModalOpenServiciosEdit(true);
  };

  const handleCancelServiciosEdit = () => {
    setIsModalOpenServiciosEdit(false);
  };

  const handleOkServiciosEdit = async () => {
    
    try {
      const values = await formEdit.validateFields();
      //console.log("Metodos:", metodos);
      //console.log("Valores del formulario editado:", values);
      const dataToSend = {
        ...values,
        estado: values.estado || 5,
      };
      //console.log("Data a enviar:", dataToSend);
      
      // Verifica si los campos necesarios están presentes
      if ( !values.unidadCfdi || !values.claveCfdi ) {
        message.error("Por favor, complete todos los campos obligatorios.");
        return;
      }
      
      // Actualizar servicio
      const response = await updateServicio(serviceToEdit.id, dataToSend);

      setSuccessMessage("¡El servicio ha sido creado exitosamente!");

      setIsSuccessModalVisible(true);
        
      setIsModalOpenServicios(false); // Cerrar modal de creación
      if (response) {
        refreshServicios(); // Refresh the table after updating
        // Actualizar la lista local de servicios
        setServicios(prevServicios =>
          prevServicios.map(servicio =>
            servicio.id === serviceToEdit.id ? { ...servicio, ...response.data } : servicio
          )
        );
        message.success("Servicio actualizado con éxito.");
      } else {
        message.error("Error al actualizar el servicio.");
      }
  
      setIsModalOpenServiciosEdit(false);
    } catch (error) {
      message.error("Error al actualizar el servicio.");
    }
  };
  
  // Función para mostrar el modal de confirmación de eliminación
  const showModalAlertMetodo = (id) => {
    setCurrentMethodId(id);
    setIsModalVisible(true); // Mostrar el modal de confirmación
  };

  const handleDeleteMetodo = async () => {
    try {
      await deleteMetodo(currentMethodId); // Llamada a la API para eliminar el método
      setMetodos(prevMetodos => prevMetodos.filter(metodo => metodo.id !== currentMethodId)); // Actualizar el estado local
      message.success("Método eliminado con éxito.");
      setIsModalVisible(false); // Cerrar el modal de confirmación
    } catch (error) {
      message.error("Error al eliminar el método.");
      setIsModalVisible(false);
    }
  };

  const handleCancelAlertMetodo = () => {
    setIsModalVisible(false); // Cerrar el modal sin hacer nada
  };

  // Mostrar el modal de confirmación antes de eliminar un servicio
const showServiceDeleteModal = (id) => {
  setCurrentServiceId(id); 
  setIsServiceDeleteModalVisible(true);
};
// Cancelar la eliminación del servicio
const handleCancelDeleteService = () => {
  setIsServiceDeleteModalVisible(false);
};

// Confirmar eliminación del servicio
const handleConfirmDeleteService = async () => {
  if (!currentServiceId) return;

  try {
      await deleteServicio(currentServiceId); // Llamada a la API para eliminar el servicio
      message.success("Servicio eliminado con éxito.");

      // Refrescar la lista después de eliminar
      await refreshServicios();
      
  } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      message.error("Hubo un error al eliminar el servicio.");
  } finally {
      setIsServiceDeleteModalVisible(false); // Cerrar modal
  }
};

  
  const handleCancelServicios = () => {
    setIsModalOpenServicios(false);
  };

  const handleOkMetodos = async () => {
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
      setSuccessMessage("¡El método ha sido creado exitosamente!");
      setIsSuccessModalVisible(true);

      setIsModalOpenMetodos(false); // Cerrar modal de creación
      message.success("Método creado con éxito.");
    } catch (error) {
      message.error("Error al crear el método.");
    }
  };
  

  const handleCancelMetodos = () => {
    setIsModalOpenMetodos(false);
  };

  //datos de la tabla 
  const columnsServicios = [
    { title: "Código", dataIndex: "numero", key: "numero" },
    { title: "Nombre", dataIndex: "nombreServicio", key: "nombreServicio", ...getColumnSearchProps('nombreServicio') },
    { title: "Método", dataIndex: "metodos", key: "metodos"},
    { title: "Precio", dataIndex: "precio", key: "precio" },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <>
          
          <Button 
          onClick={() => showModalServiciosEdit(record)}
          type="primary" style={{ marginRight: "8px" }} 
          className="action-button-edit">
          <EditOutlined />
          </Button>
          <Button type="danger" 
          onClick={() =>showServiceDeleteModal(record.id)} 
          className="action-button-delete">
            <CloseOutlined /></Button>
        </>
      ),
    },
  ];

  const columnsMetodos = [
    { title: "#", dataIndex: "numero", key: "numero" },
    { title: "codigo", dataIndex: "codigo", key: "codigo",...getColumnSearchProps('codigo')},
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Button type="danger" 
        className="action-button-delete"
        onClick={() => showModalAlertMetodo(record.id)}><CloseOutlined /></Button>
      ),
    },
  ];

  return (
    <div className="table-container">
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: "Servicios",
            key: "1",
            children: (
              <div>
                <center>
                  <h1>Servicios</h1>
                  <Input.Search
                    placeholder="Buscar servicios..."
                    enterButton="Buscar"
                    style={{ marginBottom: "16px", maxWidth: "300px" }}
                    onSearch={(value) => handleSearchServicios(value)} // Solo busca cuando se presiona el botón
                    onChange={(e) => handleSearchServicios(e.target.value)} // Actualiza el estado del texto
                  />
                </center>
                
                <Button
                  type="primary"
                  style={{ float: "right", marginBottom: "16px" }}
                  onClick={showModalServicios}
                >
                  Añadir Servicio
                </Button>
                <Table
                  dataSource={filteredServicios}
                  columns={columnsServicios}
                  bordered
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20"],
                  }}
                />
              </div>
            ),
          },
          {
            label: "Métodos",
            key: "2",
            children: (
              <div>
                <h1 className="table-header">Métodos</h1>
                <center>
                  
                  <Input.Search
                    placeholder="Buscar servicios..."
                    enterButton="Buscar"
                    style={{ marginBottom: "16px", maxWidth: "300px" }}
                    onSearch={(value) => handleSearchServicios(value)} // Solo busca cuando se presiona el botón
                    onChange={(e) => handleSearchServicios(e.target.value)} // Actualiza el estado del texto
                  />
                </center>
                
                <Button
                  type="primary"
                  className="button-add"
                  onClick={showModalMetodos}
                >
                  Añadir Método
                </Button>
                
                <Table
                  dataSource={metodos}
                  columns={columnsMetodos}
                  bordered
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20"],
                  }}
                />
              </div>
            ),
          },
        ]}
      />
      {/* Modal de Servicios */}
      <Modal
        className="modal-content"
        title="Registrar Servicio"
        open={isModalOpenServicios}
        onOk={handleOkServicios}
        onCancel={handleCancelServicios}
        width={800}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={form} className="modal-form" layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nombre servicio:" name="nombreServicio" rules={[{ required: true, message: "Por favor ingrese un nombre" }]}>
                <Input placeholder="Nombre del servicio o concepto" />
              </Form.Item>
              
              <Form.Item label="Precio unitario:" name="precio" rules={[{ required: true, message: "Por favor ingrese un precio" }]}>
                <Input placeholder="Precio sugerido" />
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
{/* 
              <Form.Item name="crearServicio" valuePropName="checked">
                <Checkbox onChange={(e) => setShowInput(e.target.checked)}>Crear Metodo</Checkbox>
              </Form.Item>
              {showInput ? (
                <Form.Item label="Método:" name="metodoInput" rules={[{ required: true, message: "Por favor ingrese el método" }]}>
                  <Input placeholder="Nombre del método" />
                </Form.Item>
              ) : (
                <Form.Item label="Método:" name="metodos" rules={[{ required: true }]}>
                  <Select placeholder="Selecciona un método">
                  {metodos.map((metodo)=>(
                    <Select.Option key={metodo.id}
                    value={metodo.id}>
                      {metodo.codigo}
                    </Select.Option>
                  ))}
                  </Select>
                </Form.Item>
              )}*/}

            </Col>
          </Row>
        </Form>
      </Modal>
      {/* Modal de Métodos */}
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

      {/* Modal de alerta */}
      <Modal
          title={
              <div style={{ textAlign: "center" }}>
                  <ExclamationCircleOutlined style={{ fontSize: "24px", color: "#faad14" }} />
                  <p style={{ marginTop: "8px" }}>¿Estás seguro?</p>
              </div>
          }
          open={isServiceDeleteModalVisible}
          onOk={handleConfirmDeleteService}
          onCancel={handleCancelDeleteService}
          okText="Sí, eliminar"
          cancelText="No, cancelar"
          centered
          footer={[
              <Button key="cancel" onClick={handleCancelDeleteService} style={{ backgroundColor: "#f5222d", color: "#fff" }}>
                  No, cancelar
              </Button>,
              <Button key="submit" type="primary" onClick={handleConfirmDeleteService}>
                  Sí, eliminar
              </Button>,
          ]}
      >
          <p style={{ textAlign: "center", marginBottom: 0 }}>¡No podrás revertir esta acción!</p>
      </Modal>

      {/* Modal de Editar Servicio */}
      <Modal
        title="Editar Servicio"
        visible={isModalOpenServiciosEdit}
        onOk={handleOkServiciosEdit}
        onCancel={handleCancelServiciosEdit}
        width={800}
        okText="Actualizar"
        cancelText="Cancelar"
      >
        <Form form={formEdit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nombre servicio:" name="nombreServicio" rules={[{ required: true, message: "Por favor ingrese un nombre" }]}>
                <Input placeholder="Nombre del servicio o concepto" />
              </Form.Item>
              <Form.Item label="Precio unitario:" name="precio" rules={[{ required: true, message: "Por favor ingrese un precio" }]}>
                <Input placeholder="Precio sugerido" />
              </Form.Item>
              <Form.Item label="Unidad cfdi:" name="unidadCfdi" rules={[{ required: true, message: 'Por favor selecciona una unidad CFDI.' }]}>
                <Select
                  showSearch
                  placeholder="Selecciona una unidad CFDI"
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
                  {unidad.map((unidadudfi) => (
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
            <Form.Item label="Clave cfdi:" name="claveCfdi" rules={[{ required: true, message: 'Por favor selecciona una clave CFDI.' }]}>
              <Select
                showSearch
                placeholder="Selecciona una clave CFDI"
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
                    {clave.codigo}-{clave.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
              {/*
              <Form.Item label="Objeto impuesto:" name="objetoImpuesto" rules={[{ required: true }]}>
                <Select>
                  {objetoimpuesto.map((oi) => (
                    <Select.Option key={oi.id} value={oi.id}>
                      {oi.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item> */}
              <Form.Item label="Método:" name="metodos" rules={[{ required: true, message: 'Por favor selecciona un método.' }]}>
                <Select
                  placeholder="Selecciona un método"
                  showSearch
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
                  {metodos.map((metodo) => (
                    <Select.Option 
                      key={metodo.id} 
                      value={metodo.id}
                    >
                      {metodo.codigo}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal de alerta */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <ExclamationCircleOutlined style={{ fontSize: "24px", color: "#faad14" }} />
            <p style={{ marginTop: "8px" }}>¿Estás seguro que deseas eliminar este método?</p>
          </div>
        }
        visible={isModalVisible}
        onOk={handleDeleteMetodo}
        onCancel={handleCancelAlertMetodo}
        okText="Sí, eliminar"
        cancelText="No, cancelar"
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelAlertMetodo} style={{ backgroundColor: "#f5222d", color: "#fff" }}>
            No, cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleDeleteMetodo}>
            Sí, eliminar
          </Button>,
        ]}
      >
        <p style={{ textAlign: "center", marginBottom: 0 }}>¡No podrás revertir esta acción!</p>
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

export default Servicio;
