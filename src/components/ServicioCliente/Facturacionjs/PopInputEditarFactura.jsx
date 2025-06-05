// src/components/PopInputEditar.jsx
import React, { useState } from "react";
import { Popover, Input, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const PopInputEditar = ({ id,onActualizar, label = "Nuevo valor", fieldName = "nombre", valorActual = "" }) => {
  const [visible, setVisible] = useState(false);
  const [nuevoValor, setNuevoValor] = useState(valorActual);

  const handleActualizar = () => {
    onActualizar({ [fieldName]: nuevoValor }); // Envía un objeto como { nombre: "valor nuevo" }
    setVisible(false);
  };

  const contenidoPopover = (
    <div style={{ maxWidth: 200 }}>
      <Input
        placeholder={label}
        value={nuevoValor}
        onChange={(e) => setNuevoValor(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Button type="primary" block onClick={handleActualizar}>
        Actualizar
      </Button>
    </div>
  );

  return (
    <Popover
      content={contenidoPopover}
      title={`Editar ${label.toLowerCase()}`}
      trigger="click"
      open={visible}
      onOpenChange={(v) => setVisible(v)}
    >
      <Button icon={<EditOutlined />} type="link">
        Editar
      </Button>
    </Popover>
  );
};

export default PopInputEditar;
