import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Tag, Flex } from "antd";
import CreateEditReceptorModal from "./CrearEditReceptorModal";
import RelateUserModal from "./RelateUseModal";
import { ReceptoresAPI, getReceptores } from "../../../apis/ApisServicioCliente/ReceptorApi"; // ajusta la ruta si usas alias

const ReceptoresPage=()=> {
  const organizacionId=useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [createEditLoading, setCreateEditLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [relateOpen, setRelateOpen] = useState(false);
  const [relateLoading, setRelateLoading] = useState(false);
  const [receptorToRelate, setReceptorToRelate] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const rows = await getReceptores(organizacionId);

      const normalized = (rows.data || []).map((r) => ({
        id: r.id,
        nombrePila: r.nombrePila,
        apPaterno: r.apPaterno,
        apMaterno: r.apMaterno,
        correo: r.correo,
        celular: r.celular,
        organizacion: r.organizacion?.nombre ?? r.organizacion_nombre ?? "",
        user: r.user || (r.user_username ? { username: r.user_username, email: r.user_email, id: r.user_id } : null),
      }));
      setData(normalized);
    } catch (e) {
      message.error(e.message || "Error al cargar receptores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizacionId]);

  const handleCreate = () => {
    setEditingRow(null);
    setCreateEditOpen(true);
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setCreateEditOpen(true);
  };

  const handleSubmitCreateEdit = async (payload) => {
    setCreateEditLoading(true);
    try {
      if (editingRow) {
        await ReceptoresAPI.updateReceptor(editingRow.id, payload);
        message.success("Receptor actualizado");
      } else {
        await ReceptoresAPI.createReceptor(payload);
        message.success("Receptor creado");
      }
      setCreateEditOpen(false);
      setEditingRow(null);
      await loadData();
    } catch (e) {
      console.error("Error al guardar receptor:", e);
      message.error(e.message || "Error al guardar");
    } finally {
      setCreateEditLoading(false);
    }
  };

  const handleDelete = async (row) => {
    try {
      await ReceptoresAPI.deleteReceptor(row.id);
      message.success("Receptor eliminado");
      await loadData();
    } catch (e) {
      console.error("Error al eliminar receptor:", e);
      message.error(e.message || "No se pudo eliminar");
    }
  };

  const handleOpenRelate = (row) => {
    setReceptorToRelate(row);
    setRelateOpen(true);
  };

  const handleSubmitRelate = async (userId) => {
    if (!receptorToRelate) return;
    setRelateLoading(true);
    try {
      await ReceptoresAPI.relateUserToReceptor(receptorToRelate.id, userId);
      message.success("Usuario relacionado correctamente");
      setRelateOpen(false);
      setReceptorToRelate(null);
      await loadData();
    } catch (e) {
      message.error(e.message || "No se pudo relacionar el usuario");
    } finally {
      setRelateLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      title: "Nombre",
      dataIndex: "nombrePila",
      key: "nombrePila",
      render: (_, r) => `${r.nombrePila ?? ''} ${r.apPaterno ?? ''} ${r.apMaterno ?? ''}`.trim(),
      sorter: (a, b) => `${a.nombrePila} ${a.apPaterno} ${a.apMaterno}`.localeCompare(`${b.nombrePila} ${b.apPaterno} ${b.apMaterno}`),
    },
    { title: "Correo", dataIndex: "correo", key: "correo" },
    { title: "Celular", dataIndex: "celular", key: "celular" },
    // { title: "Organización", dataIndex: "organizacion", key: "organizacion" },
    {
      title: "Usuario",
      dataIndex: "user",
      key: "user",
      render: (u) => {
        if (!u) return <Tag color="default">Sin usuario</Tag>;
        return (
          <Space size={4}>
            <Tag>{u.username}</Tag>
            <span style={{ color: "#888" }}>{u.email}</span>
          </Space>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(row)}>Editar</Button>
          <Button size="small" type="default" onClick={() => handleOpenRelate(row)}>
            Relacionar usuario
          </Button>
          <Popconfirm title="¿Eliminar receptor?" onConfirm={() => handleDelete(row)}>
            <Button size="small" danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  return (
    <div className="p-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Receptores</h2>
          {/* <div style={{ color: "#888" }}>Organización ID: {organizacionId}</div> */}
        </div>
        <Space>
          <Button type="primary" onClick={handleCreate}>Nuevo receptor</Button>
          <Button onClick={loadData}>Refrescar</Button>
        </Space>
      </div>

      <Table
        rowKey={(r) => r.id}
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 900 }}
      />

      <CreateEditReceptorModal
        open={createEditOpen}
        onCancel={() => { setCreateEditOpen(false); setEditingRow(null); }}
        onSubmit={handleSubmitCreateEdit}
        initialValues={editingRow}
        organizacionId={organizacionId}
        loading={createEditLoading}
      />

      <RelateUserModal
        open={relateOpen}
        onCancel={() => { setRelateOpen(false); setReceptorToRelate(null); }}
        onSubmit={handleSubmitRelate}
        organizacionId={organizacionId}
        loading={relateLoading}
        idReceptor={receptorToRelate?.id}
      />
    </div>
  );
}
export default ReceptoresPage;