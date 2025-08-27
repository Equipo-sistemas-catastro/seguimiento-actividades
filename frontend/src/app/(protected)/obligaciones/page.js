"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card, Typography, Table, App, Button, Space, Tooltip,
  Modal, Form, Input,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  fetchObligaciones,
  createObligacion,
  updateObligacion,
  // deleteObligacion, // 🔒 Eliminado del UI por política
} from "@/features/obligaciones/service";

const { Title, Paragraph } = Typography;

export default function ObligacionesPage() {
  const { message } = App.useApp();

  // datos
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // búsqueda
  const [q, setQ] = useState("");

  // modal crear/editar
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // {id, obligacion} | null
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const items = await fetchObligaciones();
      setData(items);
    } catch (e) {
      console.error("Error cargando obligaciones:", e?.response?.data || e);
      message.error("No se pudieron cargar las obligaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtrado + orden por ID ascendente en cliente
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = data;
    if (term) {
      rows = data.filter((x) => (x.obligacion || "").toLowerCase().includes(term));
    }
    return [...rows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [q, data]);

  // Sin tocar el form aquí: solo control de estado
  const handleAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  // Sin tocar el form aquí: solo control de estado
  const handleEdit = (record) => {
    setEditing(record);
    setOpen(true);
  };

  // ✅ Setear/limpiar el form SOLO cuando el modal está abierto y el Form montado
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        obligacion: editing.obligacion || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, editing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        await updateObligacion(editing.id, { obligacion: values.obligacion });
        message.success("Obligación actualizada");
      } else {
        await createObligacion({ obligacion: values.obligacion });
        message.success("Obligación creada");
      }

      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      if (e?.errorFields) return; // validación del form
      console.error("Guardar obligación:", e?.response?.data || e);
      message.error("No se pudo guardar la obligación");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90, sorter: (a,b) => (a.id??0)-(b.id??0), defaultSortOrder: "ascend" },
    { title: "Obligación contractual", dataIndex: "obligacion", key: "obligacion" },
    {
      title: "Acciones",
      key: "acciones",
      width: 90,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="default"
              size="small"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {/* 🔒 Sin botón eliminar por política */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        {/* Encabezado igual a Perfiles */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0 }}>Obligaciones contractuales</Title>
        </div>

        {/* Toolbar debajo del título: botón izq, buscador der */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar nueva obligación
          </Button>

          <Input.Search
            placeholder="Buscar por descripción de la obligación..."
            allowClear
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(val) => setQ(val)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <Paragraph style={{ marginTop: 0 }}>
          Gestiona las obligaciones contractuales.
        </Paragraph>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal crear/editar */}
      <Modal
        title={editing ? "Editar obligación" : "Agregar nueva obligación"}
        open={open}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        destroyOnHidden   // mantiene desmontaje; el useEffect maneja el set/reset
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="obligacion"
            label="Obligación contractual"
            rules={[{ required: true, message: "Ingresa la obligación" }, { min: 3, message: "Mínimo 3 caracteres" }]}
          >
            <Input.TextArea rows={3} showCount maxLength={2000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
