"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  DatePicker,
  Tag,
  Avatar,
  Skeleton,
  Tooltip,
} from "antd";
import { PlusOutlined, TeamOutlined, CalendarOutlined } from "@ant-design/icons";
import {
  fetchRequerimientos,
  fetchRequerimientoById,
  createRequerimiento,
  updateRequerimiento,
  listEstados,
  listEmpleadosActivos,
} from "@/features/requerimientos/service";

const { Title, Paragraph, Text } = Typography;

/* ===================== Utils ===================== */
function calcDuracion(start, end) {
  if (!start || !end) return "";
  const s = start?.toDate?.() ?? new Date(start);
  const e = end?.toDate?.() ?? new Date(end);
  if (isNaN(s) || isNaN(e) || e < s) return "";
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  let anchor = new Date(s.getFullYear(), s.getMonth() + months, s.getDate());
  if (anchor > e) {
    months -= 1;
    anchor = new Date(s.getFullYear(), s.getMonth() + months, s.getDate());
  }
  const MS_DAY = 24 * 60 * 60 * 1000;
  const days = Math.floor((e - anchor) / MS_DAY);
  return `${months} meses, ${days} días`;
}

function toYMD(val) {
  if (!val) return null;
  if (typeof val?.format === "function") return val.format("YYYY-MM-DD");
  const d = val?.toDate?.() ?? new Date(val);
  if (isNaN(d)) return null;
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayjsSafe(ymd) {
  try {
    const dayjs = require("dayjs");
    return dayjs(ymd);
  } catch {
    const d = new Date(ymd);
    return {
      toDate: () => d,
      format: () => {
        const pad = (n) => `${n}`.padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      },
    };
  }
}

/** Formatea "dd Mmm aaaa" con la primera letra del mes en mayúscula. */
function fmtYMDHuman(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  const dd = String(d.getDate()).padStart(2, "0");
  const MMM = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${MMM} ${yyyy}`;
}

function fmtNumber(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("es-CO");
}

function joinNonEmpty(arr) {
  return arr.map((v) => (v == null ? "" : String(v).trim())).filter(Boolean).join(" ");
}

function stringToColor(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}
function getInitialFromEmpleado(emp) {
  const n = emp?.primer_nombre_empl || emp?.primer_nombre || emp?.nombre || "";
  const ch = String(n).trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}
function fullNameFromEmpleado(e) {
  return joinNonEmpty([
    e.primer_nombre_empl ?? e.primer_nombre,
    e.segundo_nombre_empl ?? e.segundo_nombre,
    e.primer_apellido_empl ?? e.primer_apellido,
    e.segundo_apellido_empl ?? e.segundo_apellido,
  ]);
}

const COLUMN_IDS = [1, 2, 3];

/* ===================== Page ===================== */
export default function RequerimientosKanbanPage() {
  const { message } = App.useApp();

  // Estados (catálogo)
  const [catLoading, setCatLoading] = useState(true);
  const [estados, setEstados] = useState([]); // [{id, nombre}]
  const [estadosMap, setEstadosMap] = useState({}); // { [id:number]: nombre }

  // Listado base
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  // Drag highlight
  const [dragOverCol, setDragOverCol] = useState(null);

  // Modal requerimiento
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [duracion, setDuracion] = useState("");

  // Empleados modal
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [empRows, setEmpRows] = useState([]);
  const [empTotal, setEmpTotal] = useState(0);
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(10);
  const [empQ, setEmpQ] = useState("");
  const [empSelectedKeys, setEmpSelectedKeys] = useState([]);
  const [empleadosSel, setEmpleadosSel] = useState([]);

  /* ---------- Cargar estados (BD) y luego tablero ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatLoading(true);
        const list = await listEstados(); // [{id, nombre}]
        if (cancelled) return;
        setEstados(list);
        const m = {};
        list.forEach(x => { m[Number(x.id)] = x.nombre; });
        setEstadosMap(m);
      } catch (e) {
        console.warn("listEstados:", e?.response?.data || e);
        setEstados([]); setEstadosMap({});
      } finally {
        if (!cancelled) setCatLoading(false);
      }
      await loadBoard();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Cargar tablero ---------- */
  const loadBoard = async ({ qOverride } = {}) => {
    setLoading(true);
    try {
      const { items } = await fetchRequerimientos({
        q: qOverride ?? q,
        page: 1,
        pageSize: 1000,
      });

      // Normaliza tipos
      const normalized = (items || []).map(it => ({
        ...it,
        id_req: Number(it.id_req),
        id_estado: Number(it.id_estado),
      }));

      // Anexa empleados por req
      const queue = [...normalized];
      const out = [];
      const workers = Array.from({ length: 6 }, () => (async function worker() {
        while (queue.length) {
          const it = queue.shift();
          try {
            const det = await fetchRequerimientoById(it.id_req);
            out.push({ ...it, empleados: det?.empleados || [] });
          } catch {
            out.push({ ...it, empleados: [] });
          }
        }
      })());
      await Promise.all(workers);

      setRows(out);
    } catch (e) {
      console.warn("fetchRequerimientos:", e?.response?.data || e);
      setRows([]);
      message.error("No se pudieron cargar los requerimientos");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async () => {
    await loadBoard({ qOverride: q });
  };

  /* ---------- Partición por columnas ---------- */
  const cols = useMemo(() => {
    const sortAsc = (a, b) => {
      const da = a?.fecha_inicio_req ? new Date(a.fecha_inicio_req).getTime() : Number.POSITIVE_INFINITY;
      const db = b?.fecha_inicio_req ? new Date(b.fecha_inicio_req).getTime() : Number.POSITIVE_INFINITY;
      return da - db;
    };
    const by = (stateId) => rows.filter(r => Number(r.id_estado) === Number(stateId)).sort(sortAsc);
    return { 1: by(1), 2: by(2), 3: by(3) };
  }, [rows]);

  /* ---------- DnD nativo ---------- */
  function onCardDragStart(e, item) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id_req: item.id_req, from: item.id_estado }));
    e.dataTransfer.effectAllowed = "move";
  }
  function onColumnDragOver(e, stateId) {
    e.preventDefault();
    if (dragOverCol !== stateId) setDragOverCol(stateId);
  }
  function onColumnDragLeave(e, stateId) {
    setTimeout(() => { setDragOverCol((prev) => (prev === stateId ? null : prev)); }, 30);
  }
  async function onColumnDrop(e, toState) {
    e.preventDefault();
    setDragOverCol(null);
    try {
      const data = e.dataTransfer.getData("text/plain");
      if (!data) return;
      const { id_req, from } = JSON.parse(data || "{}");
      if (!id_req || Number(from) === Number(toState)) return;

      const card = rows.find(r => Number(r.id_req) === Number(id_req));
      if (!card) return;

      await updateRequerimiento(Number(id_req), {
        descripcion_req: card.descripcion_req,
        fecha_inicio_req: card.fecha_inicio_req,
        fecha_fin_req: card.fecha_fin_req,
        id_estado: Number(toState),
      });

      setRows(prev => prev.map(r => (Number(r.id_req) === Number(id_req) ? { ...r, id_estado: Number(toState) } : r)));
      await loadBoard();
      message.success("Estado actualizado");
    } catch (err) {
      console.warn("DND drop error:", err?.response?.data || err);
      message.error("No se pudo cambiar el estado");
    }
  }

  /* ---------- Empleados modal ---------- */
  const loadEmpleados = async (opts = {}) => {
    setEmpLoading(true);
    try {
      const { items, total, page, pageSize } = await listEmpleadosActivos({
        q: empQ, page: empPage, pageSize: empPageSize, ...opts,
      });
      setEmpRows(items);
      setEmpTotal(total);
      setEmpPage(page);
      setEmpPageSize(pageSize);
    } catch (e) {
      console.warn("listEmpleadosActivos:", e?.response?.data || e);
      setEmpRows([]); setEmpTotal(0);
    } finally {
      setEmpLoading(false);
    }
  };
  const openEmpModal = () => {
    setEmpQ("");
    const pre = form.getFieldValue("empleados") || [];
    setEmpSelectedKeys(pre);
    setEmpModalOpen(true);
    loadEmpleados({ page: 1 });
  };
  const confirmEmpPick = () => {
    const picked = empRows.filter(r => empSelectedKeys.includes(r.id));
    if (!picked.length) { message.warning("Selecciona al menos un empleado"); return; }
    form.setFieldsValue({ empleados: picked.map(p => p.id) });
    setEmpleadosSel(picked.map(p => ({ id: p.id, cedula: p.cedula, nombre: p.nombre })));
    setEmpModalOpen(false);
  };

  /* ---------- Abrir modal CRUD ---------- */
  const handleAdd = () => { setEditingId(null); setOpen(true); };
  const handleEdit = (req) => { setEditingId(req.id_req); setOpen(true); };

  /* ---------- Inicializar modal ---------- */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const init = async () => {
      if (!editingId) {
        form.resetFields();
        form.setFieldsValue({ id_estado: 1 }); // por defecto: POR HACER
        setDuracion("");
        setEmpleadosSel([]);
        setEmpSelectedKeys([]);
        return;
      }
      try {
        const row = rows.find(r => Number(r.id_req) === Number(editingId)) || (await fetchRequerimientoById(editingId));
        if (cancelled) return;

        form.setFieldsValue({
          descripcion_req: row.descripcion_req ?? "",
          fecha_inicio_req: row.fecha_inicio_req ? dayjsSafe(row.fecha_inicio_req) : null,
          fecha_fin_req: row.fecha_fin_req ? dayjsSafe(row.fecha_fin_req) : null,
          id_estado: Number(row.id_estado) ?? 1,
          empleados: Array.isArray(row.empleados) ? row.empleados.map(e => e.id_empleado) : [],
        });

        setDuracion(calcDuracion(dayjsSafe(row.fecha_inicio_req), dayjsSafe(row.fecha_fin_req)));

        const chips = Array.isArray(row.empleados) ? row.empleados.map(e => ({
          id: e.id_empleado,
          cedula: e.cedula_empleado,
          nombre: joinNonEmpty([e.primer_nombre_empl, e.primer_apellido_empl]),
          primer_nombre_empl: e.primer_nombre_empl,
          segundo_nombre_empl: e.segundo_nombre_empl,
          primer_apellido_empl: e.primer_apellido_empl,
          segundo_apellido_empl: e.segundo_apellido_empl,
        })) : [];
        setEmpleadosSel(chips);
        setEmpSelectedKeys(chips.map(c => c.id));
      } catch (e) {
        console.warn("init modal:", e?.response?.data || e);
        message.error("No se pudo cargar el requerimiento");
      }
    };

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDatesChange = () => {
    const s = form.getFieldValue("fecha_inicio_req");
    const e = form.getFieldValue("fecha_fin_req");
    setDuracion(calcDuracion(s, e));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        descripcion_req: values.descripcion_req?.trim(),
        fecha_inicio_req: toYMD(values.fecha_inicio_req),
        fecha_fin_req: toYMD(values.fecha_fin_req),
        id_estado: Number(values.id_estado ?? 1),
        empleados: values.empleados || [],
      };

      if (editingId) {
        await updateRequerimiento(Number(editingId), payload);
        message.success("Requerimiento actualizado");
      } else {
        const id = await createRequerimiento(payload);
        if (!id) throw new Error("No se obtuvo id del nuevo requerimiento");
        message.success("Requerimiento creado");
      }
      setOpen(false);
      setEditingId(null);
      await loadBoard();
    } catch (e) {
      const serverMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error al guardar";
      console.warn("save requerimiento:", e?.response?.data || e);
      message.error(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Card ---------- */
  function CardReq({ item }) {
    const empleados = Array.isArray(item.empleados) ? item.empleados : [];
    const extraCount = Math.max(0, empleados.length - 5);
    const restNames = extraCount > 0 ? empleados.slice(5).map(fullNameFromEmpleado).join(", ") : "";

    return (
      <div
        draggable
        onDragStart={(e) => onCardDragStart(e, item)}
        onClick={() => handleEdit(item)}
        style={{ marginBottom: 8 }}
      >
        <Card hoverable size="small" style={{ borderRadius: 10 }} styles={{ body: { padding: 12 } }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag color="default" style={{ margin: 0 }}>#{item.id_req}</Tag>
                <Text strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>
                  {item.descripcion_req}
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <CalendarOutlined />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {fmtYMDHuman(item.fecha_inicio_req)} &nbsp;—&nbsp; {fmtYMDHuman(item.fecha_fin_req)}
                </Text>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              {empleados.slice(0, 5).map((e) => (
                <Tooltip title={fullNameFromEmpleado(e)} placement="top" key={e.id_empleado}>
                  <Avatar size="small" style={{ background: stringToColor(e.id_empleado), fontSize: 12 }}>
                    {getInitialFromEmpleado(e)}
                  </Avatar>
                </Tooltip>
              ))}
              {extraCount > 0 && (
                <Tooltip title={restNames} placement="top">
                  <Avatar size="small">+{extraCount}</Avatar>
                </Tooltip>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- Columna ---------- */
  function Column({ stateId }) {
    const items = cols[stateId] || [];
    const isOver = dragOverCol === stateId;
    const titulo = estadosMap[stateId] ?? "";

    return (
      <div style={{ flex: 1, minWidth: 320, maxWidth: 480 }}>
        <Card style={{ borderRadius: 12, background: "#f9fafb" }} styles={{ body: { padding: 12 } }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {catLoading ? <Skeleton.Input active size="small" style={{ width: 140 }} /> : <Text strong>{titulo}</Text>}
              <Tag color="default">{items.length}</Tag>
            </div>
          </div>

          {stateId === 1 && (
            <div style={{ marginBottom: 8 }}>
              <Button type="text" icon={<PlusOutlined />} onClick={handleAdd}>Crear</Button>
            </div>
          )}

          <div
            onDragOver={(e) => onColumnDragOver(e, stateId)}
            onDragLeave={(e) => onColumnDragLeave(e, stateId)}
            onDrop={(e) => onColumnDrop(e, stateId)}
            style={{
              minHeight: 24,
              transition: "background 0.15s, box-shadow 0.15s",
              background: isOver ? "#e6f4ff" : "transparent",
              boxShadow: isOver ? "inset 0 0 0 2px #1677ff33" : "none",
              borderRadius: 8,
              padding: 2,
            }}
          >
            {loading ? (
              <>
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 8 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
              </>
            ) : (
              items.map((it) => <CardReq key={it.id_req} item={it} />)
            )}
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- UI ---------- */
  const joinNonEmptyModal = joinNonEmpty;

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0 }}>Requerimientos</Title>
          <Input.Search
            placeholder="Buscar por descripción"
            allowClear
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={onSearch}
            style={{ maxWidth: 420 }}
          />
        </div>
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          Gestión de requerimientos (tareas/proyectos).
        </Paragraph>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {COLUMN_IDS.map((id) => (<Column key={id} stateId={id} />))}
      </div>

      {/* Modal crear/editar requerimiento */}
      <Modal
        title={editingId ? "Editar requerimiento" : "Nuevo requerimiento"}
        open={open}
        onOk={handleSubmit}
        confirmLoading={saving}
        onCancel={() => { setOpen(false); setEditingId(null); }}
        destroyOnHidden
        forceRender
        width={860}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          onValuesChange={(changed) => {
            if ("fecha_inicio_req" in changed || "fecha_fin_req" in changed) {
              const s = form.getFieldValue("fecha_inicio_req");
              const e = form.getFieldValue("fecha_fin_req");
              setDuracion(calcDuracion(s, e));
            }
          }}
        >
          <Form.Item
            name="descripcion_req"
            label="Descripción"
            rules={[{ required: true, message: "Ingresa la descripción" }]}
          >
            <Input.TextArea rows={3} maxLength={2000} showCount />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="fecha_inicio_req"
              label="Fecha inicio"
              rules={[{ required: true, message: "Selecciona la fecha de inicio" }]}
            >
              <DatePicker style={{ width: "100%" }} onChange={handleDatesChange} />
            </Form.Item>
            <Form.Item
              name="fecha_fin_req"
              label="Fecha fin"
              rules={[
                { required: true, message: "Selecciona la fecha de fin" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const s = getFieldValue("fecha_inicio_req");
                    if (!s || !value) return Promise.resolve();
                    const sv = s?.toDate?.() ?? s;
                    const ev = value?.toDate?.() ?? value;
                    if (ev >= sv) return Promise.resolve();
                    return Promise.reject(new Error("La fecha fin debe ser mayor o igual a la fecha inicio"));
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} onChange={handleDatesChange} />
            </Form.Item>
          </div>

          <Form.Item label="Duración">
            <Input value={duracion || ""} disabled />
          </Form.Item>

          <Form.Item
            name="id_estado"
            label="Estado"
            rules={[{ required: true, message: "Selecciona el estado" }]}
          >
            <Select
              placeholder="Selecciona..."
              options={estados.map(e => ({ value: Number(e.id), label: e.nombre }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Campo real para validación, oculto (ya NO es obligatorio) */}
          <Form.Item
            name="empleados"
            style={{ display: "none" }}
          >
            <Input type="hidden" />
          </Form.Item>

          {/* Visual de empleados + botón para abrir modal */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ minWidth: 160, fontWeight: 500 }}>Empleados asignados</div>
            {empleadosSel?.length ? (
              <Space size="small" wrap>
                {empleadosSel.map(e => (
                  <Tag
                    key={e.id}
                    color="blue"
                    closable
                    onClose={(ev) => {
                      ev.preventDefault();
                      const next = empleadosSel.filter(x => x.id !== e.id);
                      setEmpleadosSel(next);
                      form.setFieldsValue({ empleados: next.map(x => x.id) });
                    }}
                  >
                    {fmtNumber(e.cedula)} — {e.nombre || fullNameFromEmpleado(e) || `ID ${e.id}`}
                  </Tag>
                ))}
                <Button size="small" icon={<TeamOutlined />} onClick={() => openEmpModal()}>
                  Cambiar
                </Button>
              </Space>
            ) : (
              <Button icon={<TeamOutlined />} onClick={() => openEmpModal()}>
                Asignar requerimiento a empleados
              </Button>
            )}
          </div>
        </Form>
      </Modal>

      {/* Modal seleccionar empleados */}
      <Modal
        title="Seleccionar empleados activos"
        open={empModalOpen}
        onOk={confirmEmpPick}
        okButtonProps={{ disabled: !empSelectedKeys?.length }}
        onCancel={() => setEmpModalOpen(false)}
        width={900}
        destroyOnHidden
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
          <Input.Search
            placeholder="Buscar por nombre..."
            allowClear
            value={empQ}
            onChange={(e) => setEmpQ(e.target.value)}
            onSearch={() => { setEmpPage(1); loadEmpleados({ page: 1 }); }}
            style={{ maxWidth: 420 }}
          />
          <Button onClick={() => loadEmpleados()}>Actualizar</Button>
        </div>

        <Table
          rowKey={(r) => r.id}
          loading={empLoading}
          columns={[
            { title: "Cédula", dataIndex: "cedula", width: 160, render: (v) => fmtNumber(v) },
            { title: "Nombres", render: (_, r) => joinNonEmptyModal([r.primer_nombre, r.segundo_nombre]) },
            { title: "Apellidos", render: (_, r) => joinNonEmptyModal([r.primer_apellido, r.segundo_apellido]) },
          ]}
          dataSource={empRows}
          pagination={{
            current: empPage,
            pageSize: empPageSize,
            total: empTotal,
            showSizeChanger: true,
            onChange: (p, ps) => { setEmpPage(p); setEmpPageSize(ps); loadEmpleados({ page: p, pageSize: ps }); },
          }}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: empSelectedKeys || [],
            onChange: (keys) => setEmpSelectedKeys(keys),
          }}
          onRow={(record) => ({
            onDoubleClick: () => {
              setEmpSelectedKeys((prev) => {
                const set = new Set(prev);
                if (set.has(record.id)) set.delete(record.id);
                else set.add(record.id);
                return Array.from(set);
              });
            },
          })}
        />
      </Modal>
    </div>
  );
}
