import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, message } from "antd";
import { Api_Host } from "../../../apis/api";
import dayjs from "dayjs";
import { createAddenda, updateAddenda,getAddendaByFactura} from "../../../apis/ApisServicioCliente/AddendaApi"; // 🔁 ajusta estas rutas según tu estructura
import { createAlbaran, updateAlbaran} from "../../../apis/ApisServicioCliente/Albaran";
import { Modal as AntdModal } from "antd";

const AddendaModal = ({ visible, onCancel, facturaId }) => {
  const [form] = Form.useForm();
  const [addendaExistente, setAddendaExistente] = useState(null);
  const [albaranExistente, setAlbaranExistente] = useState(null);
  const [albaranId, setAlbaranId] = useState(null);

  // 🚩 Cargar datos si ya existe una addenda para la factura
  useEffect(() => {
    const fetchData = async () => {
      if (!facturaId || !visible) return;

      try {
        const { data } = await getAddendaByFactura(facturaId);
        if (data) {
          setAddendaExistente(data.id)
          setAlbaranExistente(data.id_albaran)
          // console.log("data.id_albaran", data.id_albaran)
          form.setFieldsValue({
            fechaPedido: dayjs(data.fechaPedido),
            idPedido: data.pedido,
            albaran: data.numero_albaran,
          });
        }
        else{
          setAddendaExistente(null);
        }
      } catch (err) {
        console.log("No hay addenda previa (o error al obtener)", err);
        setAddendaExistente(null);
      }
    };

    fetchData();
  }, [facturaId, visible, form]);

// 💾 Guardar o actualizar
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payloadAddenda = {
        pedido: values.idPedido,
        fecha: values.fechaPedido.format("YYYY-MM-DD"),
        factura: facturaId,
      };

      const payloadAlbaran = {
        numero: values.albaran,
      };

      // Si ya hay Addenda, actualizamos
      if (addendaExistente) {

        await updateAddenda(addendaExistente, payloadAddenda);

        // const { data } = await getAlbaranByAlbaran(addendaExistente);
        if (albaranExistente) {
          await updateAlbaran(albaranExistente, payloadAlbaran );
        }
      } else {
        const { data: newAddenda } = await createAddenda(payloadAddenda);
        await createAlbaran({ ...payloadAlbaran, addenda: newAddenda.id });
      }


      AntdModal.confirm({
      title: "¿Deseas descargar el XML con Addenda ahora?",
      okText: "Sí, descargar",
      cancelText: "No",
      onOk: async () => {
        const fechaActual = dayjs().format("YYYY-MM-DD");
        const downloadUrl = `${Api_Host.defaults.baseURL}/factura_xml_prueba/${facturaId}/`;

        try {
          const response = await fetch(downloadUrl, {
            method: "GET",
            headers: {
              "Accept": "application/xml",
            },
          });

          if (!response.ok) {
            throw new Error("No se pudo obtener el XML.");
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `factura_addenda_${fechaActual}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          message.success("XML con Addenda descargado correctamente.");
        } catch (error) {
          console.error("❌ Error al descargar el XML:", error);
          message.error("Error al descargar el XML con Addenda.");
        }
      }
    });

      message.success("Addenda guardada correctamente");
      onCancel(); // cerrar modal
    } catch (error) {
      console.error("Error al guardar:", error);
      message.error("No se pudo guardar la addenda");
    }
  };


  return (
    <Modal
      title="Agregar Addenda (Envases Universales)"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={addendaExistente ? "Actualizar" : "Guardar"}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fechaPedido"
          label="Fecha del Pedido"
          rules={[{ required: true, message: "Por favor ingresa la fecha del pedido" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="idPedido"
          label="ID del Pedido"
          // rules={[{ required: true, message: "Por favor ingresa el ID del pedido" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="albaran"
          label="Albarán"
          // rules={[
          //   { required: true, message: "Por favor ingresa el número de albarán" },
          //   {
          //     pattern: /^\d{11}$/,
          //     message: "El albarán debe tener exactamente 11 dígitos",
          //   },
          // ]}
          // maxLength={20}
        >
          <Input  />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddendaModal;
