import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Card,
  Typography,
  Radio,
  Input,
  Button,
  Space,
  Spin,
  Form,
  message,
  Alert
} from "antd";

// Usamos tus funciones importadas de la API
import { getPreguntas, puntRespuestas } from "../../apis/ApiSurvey/Api_Survey";

const { Title, Text } = Typography;
const { TextArea } = Input;

function EvaluacionPage() {
  const { token } = useParams();
  const fetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [encuesta, setEncuesta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [completed, setCompleted] = useState(false);
  const [errorGet, setErrorGet] = useState(false);

  const info = "Ingeniería y Administración Estratégica con domicilio en C. Puebla No. 4990, Col. Guillen Tijuana B.C., es responsable del uso y protección de sus datos personales, en este sentido y atendiendo las obligaciones legales establecidas en la Ley Federal de Protección de datos Personales en Posesión de los Particulares. Se hace de su conocimiento al cliente que, con base a lo establecido en el Art. 56 de la Ley de Infraestructura de la Calidad, garantizamos la confidencialidad de la información proporcionada y sólo podrá hacerse pública a dependencias competentes que así lo requieran para fines de evaluación de la conformidad.";

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // CORRECCIÓN: Quitamos el 'await' de aquí. La promesa se resuelve sola.
    getPreguntas(token)
      .then((res) => {
        setEncuesta(res.data);
      })
      .catch((error) => {
        console.error(error);
        setErrorGet(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!completed) return;

    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [completed]);

  const handleChange = (preguntaId, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const handleSubmit = async () => {
    try {
      setSending(true);

      const payload = {
        respuestas: Object.entries(respuestas).map(([preguntaId, valor]) => ({
          pregunta: preguntaId,
          valor
        }))
      };

      // Aquí sí está bien usar await porque la función handleSubmit es 'async'
      await puntRespuestas(token, payload);
      setCompleted(true);
    } catch (error) {
      console.error(error);
      message.error("Error enviando encuesta");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (errorGet) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5", padding: 20 }}>
        <Card style={{ maxWidth: 500, width: "100%", borderRadius: 16, textAlign: "center" }}>
          <Space direction="vertical" size="large">
            <Title level={3}>Formulario no disponible</Title>
            <Text type="secondary">Esta encuesta ya fue contestada o el enlace no es válido.</Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5", padding: 20 }}>
        <Card style={{ maxWidth: 600, width: "100%", borderRadius: 20, textAlign: "center" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ fontSize: 70 }}>✅</div>
            <Title level={2}>¡Gracias por responder!</Title>
            <Text type="secondary">Hemos recibido correctamente tu evaluación.</Text>
            <Alert type="success" showIcon message="Encuesta completada" description="Tu respuesta fue registrada exitosamente." />
          </Space>
        </Card>
      </div>
    );
  }

  if (sending) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Title level={4}>Enviando evaluación...</Title>
          <Text type="secondary">Por favor espera un momento.</Text>
        </Space>
      </div>
    );
  }

  // Salvaguarda por si 'encuesta' es null al salir de los estados de carga/error
  if (!encuesta || !encuesta.preguntas) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" }}>
      <Card style={{ maxWidth: 800, margin: "0 auto", borderRadius: 16 }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2}>{encuesta.encuesta}</Title>
            
            {/* CORRECCIÓN: Cambiado 'title' por 'message' y removido 'variant' */}
            <Alert message="Aviso de Privacidad y Confidencialidad" type="info" description={info} showIcon />
            <br />
            
            <Text type="secondary">Por favor responde la siguiente evaluación.</Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit}>
            {encuesta.preguntas.map((pregunta) => (
              <Card key={pregunta.id} size="small" style={{ marginBottom: 20, borderRadius: 12 }}>
                <Form.Item label={<Text strong>{pregunta.texto}</Text>} required>
                  
                  {/* CALIFICACION */}
                  {pregunta.tipo === "CAL" && (
                    <Radio.Group onChange={(e) => handleChange(pregunta.id, e.target.value)}>
                      <Space direction="vertical">
                        <Radio value={1}>Deficiente</Radio>
                        <Radio value={2}>Regular</Radio>
                        <Radio value={3}>Bueno</Radio>
                        <Radio value={4}>Excelente</Radio>
                      </Space>
                    </Radio.Group>
                  )}

                  {/* BOOL */}
                  {pregunta.tipo === "BOOL" && (
                    <Radio.Group onChange={(e) => handleChange(pregunta.id, e.target.value)}>
                      <Space>
                        <Radio value={true}>Sí</Radio>
                        <Radio value={false}>No</Radio>
                      </Space>
                    </Radio.Group>
                  )}

                  {/* TEXTO */}
                  {pregunta.tipo === "TXT" && (
                    <TextArea rows={4} placeholder="Escribe tu respuesta..." onChange={(e) => handleChange(pregunta.id, e.target.value)} />
                  )}
                </Form.Item>
              </Card>
            ))}

            <Form.Item style={{ marginTop: 30 }}>
              <Button type="primary" htmlType="submit" size="large" loading={sending} block>
                Enviar Encuesta
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

export default EvaluacionPage;