import React,{useState, useEffect} from "react";
import { Form, Input, Button, Row, Col, Select, Alert } from "antd";
import { getAllRol } from "../../../../apis/ApisServicioCliente/RolApi";

const { Option } = Select;

const UsuarioForm = ({
  form,
}) => {
       const [roles, setRoles] = useState([]);
     const loadRoles = async () => {
     try {
     const response = await getAllRol();
     const filteredRoles = response.data.filter((role) => role.id === 3);
     setRoles(filteredRoles);
     } catch (error) {
     console.error("Error al cargar los roles", error);
     }
     };
     useEffect(() => {
     loadRoles();
     }, []);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
              <Alert
          message="Usuario"
          description="Tendra que iniciar sesión con este Nombre de usuario una vez que se complete el registro."
          type="info"
          showIcon
        />
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>
        Crear nuevo usuario
      </h2>

      <Form
        form={form}
        layout="vertical"
        className="usuario-form"
      >
        <Row gutter={16}>
          {/* === COLUMNA IZQUIERDA === */}
          <Col span={12}>
            <Form.Item
              label="Nombre de usuario"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Por favor ingresa un nombre de usuario",
                },
              ]}
            >
              <Input placeholder="Nombre de usuario" />
            </Form.Item>

            <Form.Item
              label="Nombre"
              name="first_name"
              rules={[
                { required: true, message: "Por favor ingresa el nombre" },
              ]}
            >
              <Input placeholder="Nombre" />
            </Form.Item>

            <Form.Item
              label="Apellidos"
              name="last_name"
              rules={[
                { required: true, message: "Por favor ingresa los apellidos" },
              ]}
            >
              <Input placeholder="Apellidos" />
            </Form.Item>

            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Por favor ingresa un correo electrónico",
                },
                { type: "email", message: "Por favor ingresa un correo válido" },
              ]}
            >
              <Input placeholder="Correo electrónico" />
            </Form.Item>
          </Col>

          {/* === COLUMNA DERECHA === */}
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
              rules={[
                { required: true, message: "Por favor ingresa una contraseña" },
                { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
              ]}
            >
              <Input.Password placeholder="Contraseña" />
            </Form.Item>

            <Form.Item
              label="Confirmación de contraseña"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Por favor confirma la contraseña" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Las contraseñas no coinciden")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirmar contraseña" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UsuarioForm;
