import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../../apis/ApisServicioCliente/UserApi";
import { getAllRol } from "../../../apis/ApisServicioCliente/RolApi";
import "./user.css";

const { Option } = Select;

const EditarUsuario = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data);
        form.setFieldsValue({
          username: response.data.username,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          rol: response.data.rol,
        });
      } catch (error) {
        console.error("Error al cargar el usuario", error);
      }
    };

    const loadRoles = async () => {
      try {
        const response = await getAllRol();
        const filteredRoles = response.data.filter((role) => role.id !== 1);
        setRoles(filteredRoles);
      } catch (error) {
        console.error("Error al cargar los roles", error);
      }
    };

    loadUser();
    loadRoles();
  }, [id, form]);

  const handleGuardar = async (values) => {
    try {
      // Armar el objeto de actualización sin incluir la contraseña si no se ingresó
      const userData = {
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        rol: values.rol,
      };
  
      if (values.password) {
        userData.password = values.password;
      }
  
      await updateUser(id, userData);  // Ahora este método hace un PATCH
      message.success("Usuario actualizado exitosamente");
      navigate("/usuario");
    } catch (error) {
      console.error("Error al actualizar usuario", error.response?.data);
      message.error("Error al actualizar usuario");
    }
  };
  

  const handleCancelar = () => {
    navigate("/usuario");
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Editar Usuario</h1>
      <Form form={form} layout="vertical" onFinish={handleGuardar}>
        <Form.Item
          label="Username:"
          name="username"
          rules={[{ required: true, message: "Por favor ingresa el nombre de usuario" }]}
        >
          <Input placeholder="Nombre de usuario" />
        </Form.Item>
        <Form.Item
          label="Nombre:"
          name="first_name"
          rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
        >
          <Input placeholder="Nombre" />
        </Form.Item>
        <Form.Item
          label="Apellidos:"
          name="last_name"
          rules={[{ required: true, message: "Por favor ingresa los apellidos" }]}
        >
          <Input placeholder="Apellidos" />
        </Form.Item>
        <Form.Item
          label="Correo electrónico:"
          name="email"
          rules={[
            { required: true, message: "Por favor ingresa un correo electrónico" },
            { type: "email", message: "Por favor ingresa un correo válido" },
          ]}
        >
          <Input placeholder="Correo electrónico" />
        </Form.Item>
        <Form.Item
          label="Rol:"
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
          label="Contraseña:"
          name="password"
          rules={[
            { min: 5, message: "La contraseña debe tener al menos 5 caracteres" },
          ]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>
        <Form.Item
          label="Confirmar Contraseña:"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
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
          <Input.Password placeholder="Confirmar Contraseña" />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <Button type="primary" htmlType="submit">
            Guardar cambios
          </Button>
          <Button type="default" onClick={handleCancelar}>
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditarUsuario;