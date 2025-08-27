"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import {
  fetchPerfiles,
  createPerfil,
  updatePerfil,
  fetchPerfilById,
  setAsignacionesPerfil,
} from "@/features/perfiles/service";
import { fetchObligaciones } from "@/features/obligaciones/service";

const { Title, Paragraph } = Typography;

export default function PerfilesPage() {
  const { message } = App.useApp();

  // ----------------- Estado principal Perfiles -----------------
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // perfil actual o null
  const [form] = Form.useForm();

  // ----------------- Estado selector de Obligaciones -----------
  const [selOpen, setSelOpen] = useState(false);
  const [selLoading, setSelLoading] = useState(false);
  const [selRows, setSelRows] = useState([]);
  const [selQ, setSelQ] = useState("");
  const [selectedObligaciones, setSelectedObligaciones] = useState([]); // array de IDs

  // ----------------- Carga de Perfiles -----------------
  const load = async () => {
    setLoading(true);
    try {
      const items = await fetchPerfiles();
      setData(items);
    } catch (e) {
      console.error("Error cargando perfiles:", e?.response?.data || e);
      message.error("No se pudieron cargar los perfiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtrado + orden ascendente por ID (frontend)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = data;
    if (term) rows = data.filter((x) => (x.perfil || "").toLowerCase().includes(term));
    return [...rows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [q, data]);

  // ----------------- Handlers Perfiles -----------------
  const handleAdd = () => {
    setEditing(null);
    setSelectedObligaciones([]); // limpio selección
    setOpen(true);
  };

  const handleEdit = async (record) => {
    setEditing(record);
    setOpen(true);
  };

  // Al abrir modal: setear form y precargar relaciones si edito
  useEffect(() => {
    if (!open) return;
    (async () => {
      if (editing) {
        form.setFieldsValue({
          perfil: editing.perfil || "",
          descripcion: editing.descripcion || "",
        });
        try {
          const detalle = await fetchPerfilById(editing.id);
          const obligaciones = Array.isArray(detalle?.obligaciones) ? detalle.obligaciones : [];
          const ids = obligaciones
            .map((o) => o.id_obligacion ?? o.id)
            .filter((x) => x != null);
          setSelectedObligaciones(ids);
        } catch {
          setSelectedObligaciones([]);
        }
      } else {
        form.resetFields();
        setSelectedObligaciones([]);
      }
    })();
  }, [open, editing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Paso 1: crear/actualizar perfil y obtener idPerfil confiable
      let idPerfil = editing?.id;
      if (editing) {
        await updatePerfil(idPerfil, values);
      } else {
        idPerfil = await createPerfil(values); // ahora SIEMPRE retorna el id
      }

      if (!idPerfil) {
        throw new Error("El backend no devolvió el id del perfil al guardar.");
      }

      // Paso 2: asignar obligaciones (en su propio try para diagnosticar)
      try {
        await setAsignacionesPerfil(idPerfil, {
          obligacionesIds: selectedObligaciones,
          usuariosIds: [],
        });
      } catch (e2) {
        console.error("Asignaciones (PUT /perfiles/:id/asignaciones) falló:", e2?.response?.data || e2);
        message.error("El perfil se guardó, pero falló la asignación de obligaciones");
        // Opcional: salir aquí si prefieres no cerrar el modal
        // return;
      }

      message.success(editing ? "Perfil actualizado" : "Perfil creado");
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      // e?.response?.data puede venir vacío ({}) → mostramos un mensaje claro
      const serverMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (typeof e?.message === "string" ? e.message : null) ||
        "Error desconocido al guardar el perfil";

      console.error("Guardar perfil:", e?.response?.data || e);
      message.error(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  // ----------------- Selector de Obligaciones -----------------
  const openSelector = async () => {
    setSelOpen(true);
    await loadObligaciones();
  };

  const loadObligaciones = async () => {
    setSelLoading(true);
    try {
      const items = await fetchObligaciones();
      setSelRows(items || []);
    } catch (e) {
      console.error("Obligaciones (selector):", e?.response?.data || e);
      message.error("No se pudieron cargar las obligaciones");
    } finally {
      setSelLoading(false);
    }
  };

  const selFiltered = useMemo(() => {
    const term = selQ.trim().toLowerCase();
    let rows = selRows;
    if (term) rows = selRows.filter((x) => (x.obligacion || "").toLowerCase().includes(term));
    return [...rows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [selQ, selRows]);

  const rowSelection = {
    selectedRowKeys: selectedObligaciones,
    onChange: (keys) => setSelectedObligaciones(keys),
    preserveSelectedRowKeys: true,
  };

  // Columnas del selector (SOLO selección, sin editar)
  const selColumns = [
    { title: "ID", dataIndex: "id", width: 90 },
    { title: "Obligación contractual", dataIndex: "obligacion" },
  ];

  // ----------------- Columnas Perfiles -----------------
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90, sorter: (a,b) => (a.id??0)-(b.id??0), defaultSortOrder: "ascend" },
    { title: "Perfil", dataIndex: "perfil", key: "perfil" },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
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
          {/* 🔒 Sin eliminar por política */}
        </Space>
      ),
    },
  ];

  // ----------------- Render -----------------
  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0 }}>Perfiles laborales</Title>
        </div>

        {/* Toolbar debajo del título */}
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
            Agregar nuevo perfil
          </Button>

          <Input.Search
            placeholder="Buscar por nombre del perfil..."
            allowClear
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(val) => setQ(val)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <Paragraph style={{ marginTop: 0 }}>
          Gestiona los perfiles laborales.
        </Paragraph>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal crear/editar perfil */}
      <Modal
        title={editing ? "Editar perfil" : "Agregar nuevo perfil"}
        open={open}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => { setOpen(false); setEditing(null); }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="perfil"
            label="Perfil"
            rules={[{ required: true, message: "Ingresa el nombre del perfil" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <Space>
              <Tooltip title="Selecciona una o varias obligaciones para asociarlas a este perfil">
                <Button icon={<LinkOutlined />} onClick={openSelector}>
                  Relacionar obligación contractual
                </Button>
              </Tooltip>
              <span style={{ color: "#888" }}>
                {selectedObligaciones.length
                  ? `${selectedObligaciones.length} obligación(es) seleccionada(s)`
                  : "Sin obligaciones seleccionadas"}
              </span>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal SELECTOR de obligaciones (checkboxes, sin edición) */}
      <Modal
        title="Seleccionar obligaciones"
        open={selOpen}
        onCancel={() => setSelOpen(false)}
        onOk={() => setSelOpen(false)}
        okText="Aceptar"
        destroyOnHidden
        width={920}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Input.Search
            placeholder="Buscar obligación..."
            allowClear
            value={selQ}
            onChange={(e) => setSelQ(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={selLoading}
          columns={selColumns}
          dataSource={selFiltered}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedObligaciones,
            onChange: (keys) => setSelectedObligaciones(keys),
            preserveSelectedRowKeys: true,
          }}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
}
