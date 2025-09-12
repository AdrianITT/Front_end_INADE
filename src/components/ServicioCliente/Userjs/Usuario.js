import React, { useState, useEffect } from "react";
import { ExclamationCircleOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { Table, Input, Button, Modal, Form, Row, Col, Select, message } from "antd";
import { Link } from "react-router-dom";
import { getAllUser, createUser, deleteUser } from "../../../apis/ApisServicioCliente/UserApi";
import { getAllRol } from "../../../apis/ApisServicioCliente/RolApi";
import "../Empresasjs/Empresa.css";

const { Option } = Select;

const Usuario = () => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [roles, setRoles] = useState([]);
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  // 1. Cargar usuarios y roles desde el backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Cargar en paralelo para mejor rendimiento
      const [usersResponse, rolesResponse] = await Promise.all([
        getAllUser(),
        getAllRol()
      ]);

      // Filtrar roles (id 2 o 3)
      const filteredRoles = rolesResponse.data.filter(role => role.id === 1 || role.id === 2 || role.id === 3);
      setRoles(filteredRoles);

      // Filtrar usuarios por organización y mapear con nombres de rol
      const filteredUsers = usersResponse.data
        .filter(user => user.organizacion === organizationId)
        .map(user => {
          const userRole = filteredRoles.find(role => role.id === user.rol);
          return {
            ...user,
            rolName: userRole ? userRole.name : 'Sin rol'
          };
        });

      setDataSource(filteredUsers);
      setFilteredData(filteredUsers);
      } catch (error) {
        console.error("Error al cargar los usuarios", error);
      }
    };

    const loadRoles = async () => {
      try {
        const response = await getAllRol();
        const filteredRoles = response.data.filter((role) => role.id !==1);
        setRoles(filteredRoles);
      } catch (error) {
        console.error("Error al cargar los roles", error);
      }
    };

    loadUsers();
    loadRoles();
  }, [organizationId]); // Dependencia: organizationId

  const onSearch = (value) => {
    if (!value) {
      setFilteredData(dataSource);
      return;
    }
    const lowerValue = value.toLowerCase();
    const filtered = dataSource.filter((user) =>
      user.username.toLowerCase().includes(lowerValue) ||
      user.email.toLowerCase().includes(lowerValue) ||
      (user.first_name && user.first_name.toLowerCase().includes(lowerValue)) ||
      (user.last_name && user.last_name.toLowerCase().includes(lowerValue))
    );
    setFilteredData(filtered);
  };

  const showAddUserModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
       const allowedRoleIds = [1, 2, 3];
      const userData = {
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        rol: values.rol,
        organizacion: organizationId,
      };
      const response = await createUser(userData);
      const newUser = response.data;

      if (
      newUser.organizacion === organizationId &&
      allowedRoleIds.includes(newUser.rol)
    ) {
      setDataSource((prev) => [...prev, newUser]);
      setFilteredData((prev) => [...prev, newUser]);
    }

    setIsModalOpen(false);
    form.resetFields();
    message.success("Usuario creado exitosamente");

    // Volver a cargar los usuarios desde el backend
    const updatedUsers = await getAllUser();
    const filteredUsers = updatedUsers.data.filter(
      (user) =>
        user.organizacion === organizationId &&
        allowedRoleIds.includes(user.rol) // 🔥 aplicar filtro de roles
    );

    setDataSource(filteredUsers);
    setFilteredData(filteredUsers);
    } catch (error) {
      console.error("Error al crear usuario", error);
      message.error("Error al crear usuario");
    }
  };

  const showModalAlert = (record) => {
    setUserIdToDelete(record.id);
    setIsModalVisible(true);
  };

  const handleOkAlert = async () => {
    try {
      if (userIdToDelete) {
        await deleteUser(userIdToDelete);
        setDataSource((prev) => prev.filter((item) => item.id !== userIdToDelete));
        setFilteredData((prev) => prev.filter((item) => item.id !== userIdToDelete));
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error al eliminar usuario", error);
    }
  };

  const handleCancelAlert = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Correo", dataIndex: "email", key: "email" },
    { title: "Nombre", dataIndex: "first_name", key: "first_name" },
    { title: "Apellidos", dataIndex: "last_name", key: "last_name" },
    { title: "Rol", dataIndex: "rolName", key: "rolName", 
      filters: roles.map(role => ({
      text: role.name,
      value: role.name,
    })),
    onFilter: (value, record) => record.rolName === value,
    filterMultiple: false,
    sorter: (a, b) => a.rolName.localeCompare(b.rolName) },
    {
      title: "Opciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Link to={`/EditarUsuario/${record.id}`}>
            <Button
              type="primary"
              style={{ marginRight: "8px" }}
              className="action-button-edit"
            >
              <EditOutlined />
            </Button>
          </Link>
          <Button
            type="danger"
            onClick={() => showModalAlert(record)}
            className="action-button-delete"
          >
            <CloseOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="table-container">
      <h1 className="table-title">Usuarios del Sistema</h1>
      <center>
        <Input.Search
          placeholder="Buscar usuario..."
          enterButton="Buscar"
          style={{ maxWidth: "300px" }}
          onSearch={onSearch}
        />
      </center>
      <div className="button-end">
        <Button type="primary" onClick={showAddUserModal}>
          Añadir Usuario
        </Button>
      </div>
      <div className="table-wrapper">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
        />
      </div>
      <Modal
        title="Crear Nuevo Usuario"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Por favor ingresa un nombre de usuario" }]}
              >
                <Input placeholder="Nombre de usuario" />
              </Form.Item>
              <Form.Item
                label="Nombre"
                name="first_name"
                rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
              <Form.Item
                label="Apellidos"
                name="last_name"
                rules={[{ required: true, message: "Por favor ingresa los apellidos" }]}
              >
                <Input placeholder="Apellidos" />
              </Form.Item>
              <Form.Item
                label="Correo electrónico"
                name="email"
                rules={[
                  { required: true, message: "Por favor ingresa un correo electrónico" },
                  { type: "email", message: "Por favor ingresa un correo válido" },
                ]}
              >
                <Input placeholder="Correo electrónico" />
              </Form.Item>
              
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rol"
                name="rol"
                rules={[{ required: true, message: "Por favor selecciona un rol" }]}
              >
                <Select placeholder="Selecciona un rol">
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Contraseña"
                name="password"
                rules={[{ required: true, message: "Por favor ingresa una contraseña" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label="Confirmación de contraseña"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Por favor confirma la contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Las contraseñas no coinciden"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: "right" }}>
            <Button onClick={handleCancel} style={{ marginRight: "8px" }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit">
              Crear Usuario
            </Button>
          </div>
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
        visible={isModalVisible}
        onOk={handleOkAlert}
        onCancel={handleCancelAlert}
        okText="Sí, eliminar"
        cancelText="No, cancelar"
        centered
        footer={[
          <Button
            key="cancel"
            onClick={handleCancelAlert}
            style={{ backgroundColor: "#f5222d", color: "#fff" }}
          >
            No, cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleOkAlert}>
            Sí, eliminar
          </Button>,
        ]}
      >
        <p style={{ textAlign: "center", marginBottom: 0 }}>¡No podrás revertir esto!</p>
      </Modal>
    </div>
  );
};

export default Usuario;