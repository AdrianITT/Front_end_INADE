import React, { useState, useRef,useEffect,useCallback } from 'react';
import { ExclamationCircleOutlined } from "@ant-design/icons";
import './Empresa.css';
import { Button, Input, Space, Table, Modal, Form,Select, Row, Col, Result} from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
//import { Link } from 'react-router-dom';
import {getAllEmpresas, createEmpresas, deleteEmpresa, updateEmpresa,getEmpresaById} from '../../apis/EmpresaApi';
import { getAllRegimenFiscal } from '../../apis/Regimenfiscla';


const Empresa = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Usar Form.useForm para obtener acceso al formulario
  const [empresas, setEmpresas] = useState([]);
  const [empresaIdToDelete, setEmpresasIdToDelete]= useState(null);
  const [regimenfiscal, setRegimenFiscal]=useState([]); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // <-- Modal éxito

  /*Funciones del modal de edicion de datos */
  const showEditModal = (id) => {
    setIsEditModalOpen(true);
    // Cargar los datos de la empresa a editar
    const fetchEmpresa = async () => {
      const res = await getEmpresaById(id);
      setEmpresaToEdit(res.data);
      form.setFieldsValue({
        nombre: res.data.nombre,
        rfc: res.data.rfc,
        regimenFiscal: res.data.regimenFiscal,
        condicionPago: res.data.condicionPago,
        calle: res.data.calle,
        numero: res.data.numero,
        colonia: res.data.colonia,
        ciudad: res.data.ciudad,
        codigoPostal: res.data.codigoPostal,
        estado: res.data.estado,
        organizacion: res.data.organizacion,
      });
    };
    fetchEmpresa();
  };

  const handleEditOk = async () => {
    try {
      const data = await form.validateFields();
      // Asignar el ID de la organización del usuario que ha iniciado sesión
      const userOrganizationId = localStorage.getItem("organizacion_id"); // O la forma en la que almacenas el ID de la organización
      const empresaData = {
        ...data,
        organizacion: parseInt(userOrganizationId),
      };
      // Llamar a la función para actualizar la empresa
      const response = await updateEmpresa(empresaToEdit.id, empresaData);
      if (response && response.data) {
        loadgetAllEmpresas(); // Recargar los datos de la tabla
        setIsEditModalOpen(false);
        setIsSuccessModalOpen(true); // Mostrar modal de éxito
      }
    } catch (error) {
      console.log("Error al validar el formulario", error);
    }
  };
  
  


    // Función que elimina el Empresa
    const handleDeleteEmpresa = async (id) => {
      try {
        // Llamamos a la API para eliminar el cliente
        await deleteEmpresa(id);
        
        // Filtramos el cliente eliminado de la lista
        setEmpresas(empresas.filter((item) => item.key !== id));
  
        // Cerramos el modal de confirmación
        setIsModalVisible(false);
      } catch (error) {
        console.log('Error al eliminar el cliente', error);
      }
    };

  const showModal = () => {
    setIsModalOpen(true)
  };

  /*despliega la informacion de la tabla */
  // Usar useCallback para asegurar que la función no se recree en cada renderizado
  const loadgetAllEmpresas = useCallback(async () => {
    try {
      const res = await getAllEmpresas();
      const empresasData = res.data ? res.data : res;
  
      // Obtener el id de la organización del usuario autenticado
      const userOrganizationId = localStorage.getItem("organizacion_id"); // O la forma en la que almacenas el ID de la organización
  
      // Filtrar solo las empresas de la organización del usuario
      const filteredEmpresas = empresasData.filter(
        (empresa) => empresa.organizacion === parseInt(userOrganizationId)
      );
  
      const formattedData = filteredEmpresas.map((empresa) => {
        // Determinar si la empresa tiene datos incompletos
        const datosIncompletos = 
          !empresa.calle || !empresa.numero || !empresa.colonia || 
          !empresa.ciudad || !empresa.estado || !empresa.codigoPostal;
  
        return {
          key: empresa.id,
          Empresa: empresa.nombre,
          RFC: empresa.rfc,
          Direccion: `${empresa.calle || ''} ${empresa.numero || ''}, ${empresa.colonia || ''}, ${empresa.ciudad || ''}, ${empresa.estado || ''}, ${empresa.codigoPostal || ''}`,
          incompleta: datosIncompletos // Flag para marcar las filas incompletas
        };
      });
      // 🔹 Ordenar primero las empresas con datos incompletos
      const sortedEmpresas = formattedData.sort((a, b) => {
      return b.incompleta - a.incompleta; // true (1) va antes que false (0)
      });
  
      setEmpresas(sortedEmpresas);
    } catch (error) {
      console.error("Error al cargar las empresas:", error);
    }
  }, []);
  

  useEffect(() => {
    const fetchRegimenFiscal= async()=>{
      try{
          const response=await getAllRegimenFiscal();
          setRegimenFiscal(response.data);
      }catch(error){
      console.error('Error al cargar los titulos', error);
      }
    };

    fetchRegimenFiscal();
    loadgetAllEmpresas();
  }, [loadgetAllEmpresas]); // Solo se ejecutará cuando loadgetAllEmpresas cambie

  /*  Crear una nueva empresa */
  const handleOk = async () => {
    try {
      const data = await form.validateFields();
      // Asignar el ID de la organización del usuario que ha iniciado sesión
      const userOrganizationId = localStorage.getItem("organizacion_id"); // O la forma en la que almacenas el ID de la organización
      const empresaData = {
        ...data,
        organizacion: parseInt(userOrganizationId),
      };
      // Llamar a la función para crear la empresa
      const response = await createEmpresas(empresaData);
      if (response && response.data) {
        loadgetAllEmpresas(); // Recargar los datos de la tabla
        setIsModalOpen(false); 
        setIsSuccessModalOpen(true); // Mostrar modal de éxito
      }
    } catch (error) {
      console.log("Error al validar el formulario", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              if(clearFilters) handleReset(clearFilters);
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reiniciar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
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
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
    //funcion para la alerta
    const showModalAlert = (id) => {
      setEmpresasIdToDelete(id);
      setIsModalVisible(true);
    };

    const handleOkAlert = () => {
      if (empresaIdToDelete) {
        handleDeleteEmpresa(empresaIdToDelete);}
      console.log("Eliminado");
      setIsModalVisible(false);
    };

    const handleCancelAlert = () => {
      console.log("Cancelado");
      setIsModalVisible(false);
    };

  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'key',
      width: '5%',
    },
    {
      title: 'Empresa',
      dataIndex: 'Empresa',
      key: 'Empresa',
      width: '20%',
      ...getColumnSearchProps('Empresa'),
    },
    {
      title: 'RFC',
      dataIndex: 'RFC',
      key: 'RFC',
      width: '10%',
      ...getColumnSearchProps('RFC'),
    },
    {
      title: 'Direccion',
      dataIndex: 'Direccion',
      key: 'Direccion',
      width: '30%',
      ...getColumnSearchProps('Direccion'),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() => showEditModal(record.key)}
            style={{
              backgroundColor: "#1677ff",
              borderColor: "#1677ff",
              marginRight: "4px",
            }}>
            <EditOutlined />
          </Button>
          <Button
            type="danger" onClick={()=>showModalAlert(record.key)}
            style={{
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
            }}
          >
            <CloseOutlined />
          </Button>
        </>
      ),
    },
  ];
  

  return (
    <div >
      <div className="content-center">
        <h1>Empresas</h1>
      </div>
      <div className='button-ends'>
      <Button type="primary" onClick={showModal}>
        Añadir Empresa
      </Button>
      </div>
      <div className="table-center">
        {/* Pasar los datos al componente Table */}
        <Table columns={columns} dataSource={empresas} rowKey="id" bordered rowClassName={(record)=>record.incompleta? 'fila-incompleta': ''}/>
      </div>
        {/*Modal para agregar Empresa */}
      <Modal title="Registro" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={800} okText="Crear Empresa" cancelarText="Cancelar">
          <Form 
          form={form}
          name='wrap'
          labelCol={{
               flex:'150px',
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
               flex:1,
          }}
          colon={false}
          style={{
               maxWidth:'100%',
          }}>
          <Row gutter={16}>
               <Col span={12}>
                    <Form.Item
                    label="Nombre de Empresa"
                    name="nombre"
                    rules={[
                    {
                         required: true,
                    },
                    ]}><Input /></Form.Item>
                    <Form.Item
                    label="RFC"
                    name="rfc"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />

               </Form.Item>
               <Form.Item label="Regimen fiscal:" name="regimenFiscal">
               <Select>
                    {regimenfiscal.map((regimen)=>(
                      <Select.Option key={regimen.id}
                      value={regimen.id}>
                        {regimen.codigo}-{regimen.nombre}
                      </Select.Option>
                    ))}
               </Select>
               </Form.Item>
              <Form.Item
                    label="Condiciones de pago:"
                    name="condicionPago"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />

               </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item
                    label="Calle:"
                    name="calle"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
               <Form.Item
                    label="Numero:"
                    name="numero"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
               <Form.Item
                    label="Colonia:"
                    name="colonia"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
               <Form.Item
                    label="Ciudad:"
                    name="ciudad"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
               <Form.Item
                    label="Codigo Postal:"
                    name="codigoPostal"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
               <Form.Item
                    label="Estado:"
                    name="estado"
                    rules={[
                    {
                         required: true,
                    },
                    ]}>
               <Input />
               </Form.Item>
          </Col>
     </Row>
     </Form>
      </Modal>

      {/* en este modal se muestra la alerta al borrar un usuario*/}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <ExclamationCircleOutlined style={{ fontSize: "42px", color: "#faad14" }} />
            <p style={{ marginTop: "8px" }}>¿Estás seguro?</p>
          </div>
        }
        visible={isModalVisible}
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

      {/*Modal Edicion de datos */}
      <Modal
        title="Editar Empresa"
        visible={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form
          form={form}
          name='wrap'
          labelCol={{
            flex: '150px',
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
          style={{
            maxWidth: '100%',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre de Empresa"
                name="nombre"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="RFC"
                name="rfc"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Regimen fiscal:"
                name="regimenFiscal"
                rules={[
                  {
                    required: true,
                  },
                ]}
                labelCol={{ span: 24 }} // Hace que el label ocupe toda la fila
                wrapperCol={{ span: 24 }} // Hace que el Select esté debajo del label 
              >
                <Select>
                  {regimenfiscal.map((regimen) => (
                    <Select.Option key={regimen.id} value={regimen.id}>
                      {regimen.codigo}-{regimen.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Condición de Pago:"
                name="condicionPago"
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
                label="Calle:"
                name="calle"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Numero:"
                name="numero"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Colonia:"
                name="colonia"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Ciudad:"
                name="ciudad"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Codigo Postal:"
                name="codigoPostal"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Estado:"
                name="estado"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 3. Modal de éxito (mensaje)*/}
  <Modal
    title="Empresa creada con éxito"
    open={isSuccessModalOpen}
    onOk={() => setIsSuccessModalOpen(false)}
    onCancel={() => setIsSuccessModalOpen(false)}
    footer={[
      <Button key="cerrar" type="primary" onClick={() => setIsSuccessModalOpen(false)}>
        Cerrar
      </Button>
    ]}
  ><Result status="success"
  title="¡La empresa se ha creado correctamente!"></Result>
    
  </Modal>

    </div>
  );
};

export default Empresa;
