import React, { useState } from "react";
import { Form, Input, Button, Alert, Card, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import Login_Api from "../../apis/LoginApi";
import "./Login.css";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // estado para controlar el loading
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true); // inicia el spinner
    try {
      const response = await Login_Api.post("", {
        username: values.user,
        password: values.password,
      });

      const { token, user_id, username, rol, organizacion, organizacion_id } = response.data;

      // Guarda los datos en el localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", username);
      localStorage.setItem("rol", rol);
      localStorage.setItem("organizacion", organizacion);
      localStorage.setItem("organizacion_id", organizacion_id);

      setError("");

      // Redirige según el rol del usuario
      if (rol === "Administrador") {
        navigate("/Homeadmin");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false); // finaliza el spinner
    }
  };

  return (
    <div className="center-card">
      <Card className="login-card">
        <h1>Iniciar Sesión</h1>
        {error && <Alert message={error} type="error" showIcon />}
        {loading ? (
          // Aquí se muestra el spinner mientras se procesa el login
          <Spin tip="Iniciando sesión...">
            {/* Se agrega un contenedor con altura mínima para mantener el layout */}
            <div style={{ minHeight: "150px" }} />
          </Spin>
        ) : (
          <Form
            name="login"
            onFinish={onFinish}
            style={{ marginTop: "20px" }}
            layout="vertical"
          >
            <Form.Item
              label="Usuario"
              name="user"
              rules={[{ required: true, message: "Por favor, ingrese su correo" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: "Por favor, ingrese su contraseña" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Login;
