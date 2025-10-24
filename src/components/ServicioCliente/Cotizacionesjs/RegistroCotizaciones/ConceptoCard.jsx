// ConceptoCard.jsx
import React from "react";
import { Row, Col, Form, Input, Select, Checkbox, Card, Tooltip } from "antd";
import "./ConceptoCa.css";

const { TextArea } = Input;

const ConceptoCard = ({
  concepto,
  index,
  servicios,
  onChange,
  onServicioChange,
  onRemove,
}) => {
  return (
    <Card style={{ marginTop: 16 }}>
      <h3>Concepto {concepto.id}</h3>

      <Row justify="end">
        <Col>
          <Checkbox onChange={() => onRemove(concepto.id)}>Eliminar</Checkbox>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Servicio"
            name={["conceptos", index, "servicio"]}
            rules={[{ required: true, message: "Selecciona el servicio." }]}
          >
            <Select
              showSearch
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 'auto', minWidth: '100%' }}
              className="select-wrap-text"
              style={{ width: "100%", whiteSpace: "normal", wordWrap: "break-word" }}
              placeholder="Selecciona un servicio"
              value={concepto.servicio || undefined}
              onChange={(value) => onServicioChange(concepto.id, value)}
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {servicios.map((serv) => (
                <Select.Option key={serv.id} value={serv.id} label={serv.nombreServicio}>
                  <Tooltip title={serv.nombreServicio}>
                    <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
                      {serv.nombreServicio}
                    </div>
                  </Tooltip>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Método Relacionado">
            <Input value={concepto.metodoCodigo} disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Cantidad de servicios" required>
            <Input
              min={1}
              value={concepto.cantidad}
              onChange={(e) => onChange(concepto.id, "cantidad", e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Precio sugerido">
            <Input disabled value={concepto.precio} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Precio final" required>
            <Input
              min={0}
              value={concepto.precioFinal}
              onChange={(e) => onChange(concepto.id, "precioFinal", e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form.Item
            label="Notas"
            name={["conceptos", index, "descripcion"]}
            rules={[{ required: true, message: "Ingresa la descripción." }]}
          >
            <TextArea
              rows={2}
              value={concepto.descripcion}
              onChange={(e) => onChange(concepto.id, "descripcion", e.target.value)}
              placeholder="Notas que aparecerán al final de la cotización"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ConceptoCard;
