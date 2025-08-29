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
  Tag,
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
  const [editing, setEditing] = useState(null); // { id, perfil, descripcion } | null
  const [form] = Form.useForm();

  // ----------------- Estado selector de Obligaciones -----------
  const [selOpen, setSelOpen] = useState(false);
  const [selLoading, setSelLoading] = useState(false);
  const [selRows, setSelRows] = useState([]);
  const [selQ, setSelQ] = useState("");

  // Selección de obligaciones:
  // - selectedIds: ids actualmente seleccionados
  // - selectedMap: { [id]: nombre } para mostrar tags y permitir deseleccionar desde el modal principal
  const [selectedObligaciones, setSelectedObligaciones] = useState([]); // number[]
  const [selectedMap, setSelectedMap] = useState({}); // { [id]: nombre }

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
    setSelectedObligaciones([]);
    setSelectedMap({});
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
          const ids = [];
          const map = {};
          for (const o of obligaciones) {
            const id = o.id_obligacion ?? o.id;
            if (id != null) {
              ids.push(id);
              map[id] = o.obligacion_contractual ?? o.obligacion ?? o.descripcion ?? `Obligación ${id}`;
            }
          }
          setSelectedObligaciones(ids);
          setSelectedMap(map);
        } catch {
          setSelectedObligaciones([]);
          setSelectedMap({});
        }
      } else {
        form.resetFields();
        setSelectedObligaciones([]);
        setSelectedMap({});
      }
    })();
  }, [open, editing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Paso 1: crear/actualizar perfil y obtener idPerfil
      let idPerfil = editing?.id;
      if (editing) {
        await updatePerfil(idPerfil, values);
      } else {
        idPerfil = await createPerfil(values);
      }

      if (!idPerfil) {
        throw new Error("El backend no devolvió el id del perfil al guardar.");
      }

      // Paso 2: asignar obligaciones (contrato real del backend)
      await setAsignacionesPerfil(idPerfil, {
        obligacionesIds: selectedObligaciones,
        usuariosIds: [],
      });

      message.success(editing ? "Perfil actualizado" : "Perfil creado");
      setOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
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

  // Buscador + orden asc
  const selFiltered = useMemo(() => {
    const term = selQ.trim().toLowerCase();
    let rows = selRows;
    if (term) rows = selRows.filter((x) => (x.obligacion || "").toLowerCase().includes(term));
    return [...rows].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [selQ, selRows]);

  // rowSelection: checkbox por fila
  const rowSelection = {
    selectedRowKeys: selectedObligaciones,
    onChange: (keys) => {
      // Reconstruye el mapa de nombres usando:
      // - filas actuales del selector (para los recién añadidos)
      // - y conserva los que ya estaban si siguen seleccionados
      const nextIds = Array.isArray(keys) ? keys : [];
      const nextMap = {};

      // Conserva nombres previos si el id sigue seleccionado
      for (const id of nextIds) {
        if (selectedMap[id]) {
          nextMap[id] = selectedMap[id];
        }
      }

      // Completa nombres faltantes desde las filas visibles
      for (const row of selRows) {
        if (nextIds.includes(row.id) && !nextMap[row.id]) {
          nextMap[row.id] = row.obligacion || `Obligación ${row.id}`;
        }
      }

      setSelectedObligaciones(nextIds);
      setSelectedMap(nextMap);
    },
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

          {/* Relacionar obligaciones */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
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

            {/* Listado de obligaciones seleccionadas como tags (se pueden deseleccionar) */}
            {!!selectedObligaciones.length && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {selectedObligaciones
                  .sort((a, b) => (a ?? 0) - (b ?? 0))
                  .map((id) => (
                    <Tag
                      key={id}
                      closable
                      onClose={(e) => {
                        e.preventDefault(); // evitar cierre de modal al hacer click
                        const nextIds = selectedObligaciones.filter((x) => x !== id);
                        const nextMap = { ...selectedMap };
                        delete nextMap[id];
                        setSelectedObligaciones(nextIds);
                        setSelectedMap(nextMap);
                      }}
                    >
                      {selectedMap[id] || `Obligación ${id}`}
                    </Tag>
                  ))}
              </div>
            )}
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
          <div style={{ fontSize: 12, color: "#888", alignSelf: "center" }}>
            {selectedObligaciones.length
              ? `${selectedObligaciones.length} seleccionada(s)`
              : "Nada seleccionado"}
          </div>
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
            ...rowSelection,
          }}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
}
