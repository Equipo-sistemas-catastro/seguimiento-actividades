"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tooltip,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Space,
  Table,
  Divider,
  Empty,
  Select,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import {
  listEstadosActividades,
  fetchMisActividadesKanban,
  moveActividadEstado,
  createActividad,
  fetchActividadById,
  updateActividad,
  listMisRequerimientosAsignados,
  fetchMisObligaciones,
} from "@/features/mis-actividades/service";
import { fetchMisRequerimientoById } from "@/features/requerimientos/service";

const { Text, Title } = Typography;

/* ===================== Utils ===================== */
const MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmt = (d) => (d && dayjs(d).isValid()
  ? `${String(dayjs(d).date()).padStart(2,"0")} ${MES[dayjs(d).month()]} ${dayjs(d).year()}`
  : "");
const trunc = (s, n = 90) => (!s ? "" : s.length > n ? s.slice(0, n - 1) + "…" : s);
const diffDias = (a, b) => {
  const da = dayjs(a), db = dayjs(b);
  return (da.isValid() && db.isValid()) ? db.startOf("day").diff(da.startOf("day"), "day") : null;
};
function nombreEmpleado(e = {}) {
  const join = (...arr) => arr.map(v => (v == null ? "" : String(v).trim())).filter(Boolean).join(" ");
  return (
    e.nombre_completo ||
    e.nombre ||
    join(
      e.primer_nombre_empl ?? e.primer_nombre,
      e.segundo_nombre_empl ?? e.segundo_nombre,
      e.primer_apellido_empl ?? e.primer_apellido,
      e.segundo_apellido_empl ?? e.segundo_apellido
    ) ||
    (e.id_empleado != null ? `#${e.id_empleado}` : "Empleado")
  );
}

/* =============== Modal Requerimientos =============== */
function ModalRequerimientos({ open, onCancel, onOk, selectedId }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [data, setData] = useState({ items: [], total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await listMisRequerimientosAsignados({ q, page, pageSize });
      setData(resp);
      if (selectedId) setSelectedRowKeys([selectedId]);
    } catch (e) { message.error(e?.message || "Error cargando requerimientos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open, page, pageSize]);
  useEffect(() => { if (open && selectedId) setSelectedRowKeys([selectedId]); }, [open, selectedId]);

  const columns = [
    { title: "ID", dataIndex: "id_req", width: 90 },
    { title: "Descripción", dataIndex: "descripcion_req", ellipsis: true },
    { title: "Fechas", key: "fechas", width: 260, render: (_, r) => (<span><CalendarOutlined /> {fmt(r.fecha_inicio_req)} — {fmt(r.fecha_fin_req)}</span>) },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => { setSelectedRowKeys([]); onCancel?.(); }}
      title="Seleccionar requerimiento"
      okText="Usar seleccionado"
      onOk={() => {
        const sel = data.items.find((x) => x.id_req === selectedRowKeys[0]);
        if (!sel) return message.warning("Selecciona un requerimiento");
        onOk?.(sel);
      }}
      width={900}
      zIndex={1100}
      destroyOnHidden
    >
      <Space style={{ marginBottom: 12 }} align="center">
        <Input.Search
          placeholder="Buscar por descripción…"
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={() => { setPage(1); load(); }}
          style={{ width: 360 }}
        />
      </Space>
      <Table
        rowKey="id_req"
        loading={loading}
        columns={columns}
        dataSource={data.items}
        pagination={{
          current: page, pageSize, total: data.total, showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); }
        }}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys.slice(-1)),
          onSelect: (record, selected) => setSelectedRowKeys(selected ? [record.id_req] : [])
        }}
        size="small"
      />
    </Modal>
  );
}

/* =============== Modal Obligaciones =============== */
function ModalObligaciones({ open, onCancel, onOk, disabled, preselectedIds = [] }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(preselectedIds);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchMisObligaciones();
      setItems(rows);
      if (preselectedIds?.length) setSelected(preselectedIds);
    } catch (e) { message.error(e?.message || "Error cargando obligaciones"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (open && !disabled) load(); }, [open, disabled]);
  useEffect(() => { if (open) setSelected(preselectedIds || []); }, [open, preselectedIds]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((x) => String(x.obligacion_contractual || "").toLowerCase().includes(term));
  }, [items, q]);

  const columns = [
    { title: "ID", dataIndex: "id_obligacion", width: 90 },
    { title: "Obligación", dataIndex: "obligacion_contractual", ellipsis: true },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => { onCancel?.(); }}
      title="Seleccionar obligaciones"
      okText="Usar seleccionadas"
      onOk={() => {
        if (!selected.length) return message.warning("Selecciona al menos una obligación");
        const rows = items.filter((x) => selected.includes(x.id_obligacion));
        onOk?.(rows);
      }}
      width={900}
      zIndex={1100}
      destroyOnHidden
    >
      <Space style={{ marginBottom: 12 }} align="center">
        <Input.Search
          placeholder="Buscar por descripción…"
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 360 }}
          disabled={disabled}
        />
      </Space>
      <Table
        rowKey="id_obligacion"
        loading={loading}
        columns={columns}
        dataSource={filtered}
        pagination={false}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys: selected,
          onChange: (keys) => setSelected(keys),
          getCheckboxProps: () => ({ disabled })
        }}
        size="small"
      />
    </Modal>
  );
}

/* =============== Bloques informativos =============== */
function RequerimientoInfo({ req }) {
  if (!req) return null;
  const dur = diffDias(req.fecha_inicio_req, req.fecha_fin_req);
  return (
    <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 6, padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong>Descripción:</Text> <Text>{req.descripcion_req || "—"}</Text>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div><Text strong>Inicio:</Text> <Text>{fmt(req.fecha_inicio_req) || "—"}</Text></div>
        <div><Text strong>Fin:</Text> <Text>{fmt(req.fecha_fin_req) || "—"}</Text></div>
        <div><Text strong>Duración:</Text> <Text>{dur != null ? `${dur} día(s)` : "—"}</Text></div>
        <div><Text strong>Estado:</Text>{" "}<Tag>{req.estado || req.nombre_estado || "—"}</Tag></div>
      </div>
      {Array.isArray(req.empleados) && req.empleados.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong>Empleados asignados:</Text>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {req.empleados.map((e, idx) => (<Tag key={e.id_empleado ?? idx} bordered>{nombreEmpleado(e)}</Tag>))}
          </div>
        </div>
      )}
    </div>
  );
}

function ObligacionesInfo({ obligaciones = [] }) {
  if (!obligaciones.length) return null;
  return (
    <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 6, padding: 12 }}>
      <Text strong>Obligaciones seleccionadas:</Text>
      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {obligaciones.map((o) => (<Tag key={o.id_obligacion} bordered>{o.obligacion_contractual}</Tag>))}
      </div>
    </div>
  );
}

/* =============== Modal Crear / Editar Actividad =============== */
function ModalActividad({ open, onCancel, idActividad, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reqModal, setReqModal] = useState(false);
  const [oblModal, setOblModal] = useState(false);
  const [reqSel, setReqSel] = useState(null);
  const [oblsSel, setOblsSel] = useState([]); // [{id_obligacion, obligacion_contractual}]
  const isEdit = !!idActividad;
  const estadoWatch = Form.useWatch("id_estado", form);
  const disabledAll = isEdit && Number(estadoWatch) === 3;
  const formDisabled = disabledAll || !reqSel;

  useEffect(() => {
    if (open && !isEdit) {
      form.resetFields();
      setReqSel(null);
      setOblsSel([]);
    }
  }, [open, isEdit]); // eslint-disable-line

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !open) return;
      setLoading(true);
      try {
        const d = await fetchActividadById(idActividad);
        const item = d?.item || d || {};

        setReqSel(item.id_req ? {
          id_req: Number(item.id_req),
          descripcion_req: item.descripcion_req || item.requerimiento || "",
          fecha_inicio_req: item.fecha_inicio_req ?? null,
          fecha_fin_req: item.fecha_fin_req ?? null,
          estado: item.estado_req || item.nombre_estado_req || item.estado || null,
        } : null);

        form.setFieldsValue({
          actividad: item.actividad || "",
          id_estado: Number(item.id_estado) || 1,
          fecha_inicio_actividad: item.fecha_inicio_actividad ? dayjs(item.fecha_inicio_actividad) : null,
          fecha_fin_programada: item.fecha_fin_programada ? dayjs(item.fecha_fin_programada) : null,
        });

        // Cargar obligaciones actuales de la actividad -> oblsSel
        let obls = [];
        const raw = Array.isArray(item.obligaciones) && item.obligaciones.length
          ? item.obligaciones
          : (Array.isArray(item.actividad_obligaciones) ? item.actividad_obligaciones : []);
        if (raw.length && raw[0]?.obligacion_contractual) {
          obls = raw.map(o => ({ id_obligacion: Number(o.id_obligacion), obligacion_contractual: o.obligacion_contractual }));
        } else if (raw.length) {
          const catalog = await fetchMisObligaciones();
          const map = new Map(catalog.map(o => [Number(o.id_obligacion), o.obligacion_contractual]));
          obls = raw
            .map(o => Number(o?.id_obligacion ?? o))
            .filter(Number.isFinite)
            .map(id => ({ id_obligacion: id, obligacion_contractual: map.get(id) || `Obligación #${id}` }));
        }
        setOblsSel(obls);

        // Enriquecer requerimiento seleccionado
        if (item.id_req) {
          const det = await fetchMisRequerimientoById(item.id_req);
          setReqSel(prev => ({ ...(prev || {}), ...det }));
        }
      } catch (e) {
        message.error(e?.message || "Error cargando la actividad");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, idActividad, isEdit]); // eslint-disable-line

  const disabledDate = (current) => {
    if (!reqSel) return true;
    const ini = reqSel.fecha_inicio_req ? dayjs(reqSel.fecha_inicio_req) : null;
    const fin = reqSel.fecha_fin_req ? dayjs(reqSel.fecha_fin_req) : null;
    if (!ini || !fin) return false;
    return current.isBefore(ini, "day") || current.isAfter(fin, "day");
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      if (!reqSel?.id_req) return message.warning("Debes seleccionar un requerimiento");

      // SIEMPRE enviar obligaciones (regla backend)
      const idsObl = oblsSel.map(o => Number(o.id_obligacion)).filter(Number.isFinite);
      if (!idsObl.length) return message.warning("Debes seleccionar al menos una obligación");

      const payload = {
        id_req: Number(reqSel.id_req),
        actividad: (v.actividad || "").trim(),
        fecha_inicio_actividad: v.fecha_inicio_actividad?.format("YYYY-MM-DD"),
        fecha_fin_programada: v.fecha_fin_programada?.format("YYYY-MM-DD"),
        id_estado: Number(v.id_estado || 1),
        obligaciones: idsObl,
      };

      // Si Finalizada (3), setear fecha_fin_actividad = hoy
      if (payload.id_estado === 3) {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        payload.fecha_fin_actividad = `${yyyy}-${mm}-${dd}`;
      }

      if (isEdit) await updateActividad(idActividad, payload);
      else await createActividad(payload);

      message.success("Actividad guardada");
      onSaved?.();
      onCancel?.();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.error || e?.message || "No fue posible guardar");
    }
  };

  const footer = [
    <Button key="cancel" onClick={onCancel}>Cancelar</Button>,
    !disabledAll && <Button key="ok" type="primary" onClick={onSubmit}>Guardar</Button>,
  ].filter(Boolean);

  return (
    <>
      <Modal
        open={open}
        title={isEdit ? (disabledAll ? "Actividad (Finalizada)" : "Editar actividad") : "Crear actividad"}
        onCancel={onCancel}
        footer={footer}
        confirmLoading={loading}
        destroyOnHidden
        zIndex={1000}
      >
        <Form form={form} layout="vertical" initialValues={{ id_estado: 1 }}>
          {/* Requerimiento */}
          <Form.Item label="Relacionar requerimiento" required tooltip="Obligatorio para habilitar el formulario">
            {reqSel ? (
              <>
                <RequerimientoInfo req={reqSel} />
                <div style={{ marginTop: 10 }}>
                  <Button onClick={() => setReqModal(true)} disabled={disabledAll}>Cambiar requerimiento</Button>
                </div>
              </>
            ) : (
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => setReqModal(true)}>
                Relacionar requerimiento
              </Button>
            )}
          </Form.Item>

          {/* Actividad */}
          <Form.Item name="actividad" label="Actividad" rules={[{ required: true, message: "La descripción es obligatoria" }]}>
            <Input.TextArea placeholder="Descripción de la actividad…" autoSize={{ minRows: 2, maxRows: 6 }} disabled={formDisabled} />
          </Form.Item>

          {/* Fechas */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="fecha_inicio_actividad" label="Fecha inicio" rules={[{ required: true, message: "Fecha inicio obligatoria" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledDate} disabled={formDisabled} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fecha_fin_programada" label="Fecha fin programada" rules={[{ required: true, message: "Fecha fin programada obligatoria" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledDate} disabled={formDisabled} />
              </Form.Item>
            </Col>
          </Row>

          {/* Estado */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="id_estado" label="Estado">
                <SelectEstado disabled={formDisabled} />
              </Form.Item>
            </Col>
          </Row>

          {/* Obligaciones (full width) */}
          <Form.Item label="Obligación contractual" required>
            {oblsSel.length ? (
              <>
                <ObligacionesInfo obligaciones={oblsSel} />
                <div style={{ marginTop: 10 }}>
                  <Button onClick={() => setOblModal(true)} disabled={formDisabled}>Cambiar obligaciones</Button>
                </div>
              </>
            ) : (
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => setOblModal(true)} disabled={formDisabled}>
                Relacionar obligaciones
              </Button>
            )}
          </Form.Item>

          {disabledAll && (<><Divider /><Text type="secondary">Esta actividad está <b>Finalizada</b>. No se permiten cambios.</Text></>)}
        </Form>
      </Modal>

      {/* Modales hijos */}
      <ModalRequerimientos
        open={reqModal && !disabledAll}
        selectedId={reqSel?.id_req || null}
        onCancel={() => setReqModal(false)}
        onOk={async (sel) => {
          try {
            const det = await fetchMisRequerimientoById(sel.id_req);
            setReqSel({ ...sel, ...det });
            setOblsSel([]); // al cambiar de requerimiento, limpiar obligaciones
            form.setFieldsValue({ fecha_inicio_actividad: null, fecha_fin_programada: null });
          } catch {
            setReqSel(sel);
            setOblsSel([]);
          } finally {
            setReqModal(false);
          }
        }}
      />
      <ModalObligaciones
        open={oblModal && !disabledAll}
        disabled={!reqSel}
        preselectedIds={oblsSel.map(o => o.id_obligacion)}
        onCancel={() => setOblModal(false)}
        onOk={(rows) => { setOblsSel(rows); setOblModal(false); }}
      />
    </>
  );
}

/* =============== Select de Estados (1,2,3) =============== */
function SelectEstado({ value, onChange, disabled }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [opts, setOpts] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rows = await listEstadosActividades();
        setOpts(rows.map((r) => ({ label: r.estado, value: r.id_estado })));
      } catch { message.error("Error cargando estados"); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      options={opts}
      placeholder="Selecciona estado…"
      allowClear={false}
    />
  );
}

/* =============== Card de Actividad =============== */
function CardActividad({ a, onClick, draggable, onDragStart }) {
  const idEstado = Number(a.id_estado);
  const hoy = dayjs().startOf("day");
  const finProg = a.fecha_fin_programada && dayjs(a.fecha_fin_programada).isValid()
    ? dayjs(a.fecha_fin_programada).startOf("day")
    : null;
  const finAct = a.fecha_fin_actividad && dayjs(a.fecha_fin_actividad).isValid()
    ? dayjs(a.fecha_fin_actividad).startOf("day")
    : null;

  // Reglas solicitadas:
  // - Incumplida: estado 1 o 2 y fecha_fin_programada < hoy
  const incumplida = (idEstado === 1 || idEstado === 2) && finProg && finProg.isBefore(hoy);
  // - Finalizada Incumplida: estado 3 y fecha_fin_actividad > fecha_fin_programada
  const finalizadaIncumplida = (idEstado === 3) && finProg && finAct && finAct.isAfter(finProg);

  const isFinalizada = idEstado === 3;

  return (
    <Card
      hoverable
      size="small"
      style={{ marginBottom: 12, position: "relative" }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Text strong>{a.actividad}</Text>
        <Text type="secondary">
          <CalendarOutlined /> {fmt(a.fecha_inicio_actividad)} — {fmt(a.fecha_fin_programada)}
        </Text>

        {a.descripcion_req && (
          <Tooltip title={a.descripcion_req}>
            <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
              <Text type="secondary">Req:</Text> {trunc(a.descripcion_req, 120)}
            </Typography.Paragraph>
          </Tooltip>
        )}

        {isFinalizada && a.fecha_fin_actividad && (
          <Text><CalendarOutlined /> Fin actividad: {fmt(a.fecha_fin_actividad)}</Text>
        )}

        {/* Texto explícito solicitado */}
        {incumplida && <Text type="danger">Incumplida</Text>}
        {finalizadaIncumplida && <Text type="danger">Finalizada Incumplida</Text>}
      </div>

      {(incumplida || finalizadaIncumplida) && (
        <Tooltip title={incumplida ? "Incumplida" : "Finalizada Incumplida"}>
          <ExclamationCircleOutlined
            style={{ color: "#cf1322", position: "absolute", right: 8, bottom: 8, fontSize: 18 }}
          />
        </Tooltip>
      )}
    </Card>
  );
}

/* =============== Kanban Page =============== */
export default function MisActividadesPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState([]);
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const grouped = useMemo(() => {
    const g = { 1: [], 2: [], 3: [] };
    for (const a of items) {
      const k = Number(a.id_estado);
      if (g[k]) g[k].push(a);
    }
    return g;
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const [est, acts] = await Promise.all([
        listEstadosActividades(),
        fetchMisActividadesKanban()
      ]);
      setEstados(est.map((e) => ({ id: e.id_estado, nombre: e.estado })));
      setItems(acts);
    } catch (e) {
      message.error(e?.message || "Error cargando tablero");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); setModalOpen(true); };
  const openEdit = (a) => { setEditId(a.id_actividad); setModalOpen(true); };

  const onDragStart = (id_actividad) => (ev) => { ev.dataTransfer.setData("text/plain", String(id_actividad)); };
  const allowDrop = (ev) => ev.preventDefault();
  const onDropTo = (estadoDestino) => async (ev) => {
    ev.preventDefault();
    const id = Number(ev.dataTransfer.getData("text/plain"));
    if (!id) return;
    const card = items.find((x) => x.id_actividad === id);
    if (!card || Number(card.id_estado) === 3) return;
    try {
      await moveActividadEstado(id, estadoDestino);
      const acts = await fetchMisActividadesKanban();
      setItems(acts);
      message.success("Actividad actualizada");
    } catch (e) { message.error(e?.message || "No fue posible actualizar"); }
  };

  const colTitle = (id) => {
    const e = estados.find((x) => x.id === id);
    return e?.nombre || (id === 1 ? "Por hacer" : id === 2 ? "En ejecución" : "Finalizada");
  };

  const count1 = grouped[1]?.length || 0;
  const count2 = grouped[2]?.length || 0;
  const count3 = grouped[3]?.length || 0;

  return (
    <div style={{ padding: 12 }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>Mis Actividades</Title>

      <Row gutter={12}>
        {/* Columna 1 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space align="center">
                <Text strong>{colTitle(1)}</Text>
                <Tag bordered>{count1}</Tag>
              </Space>
            }
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size="small">Crear actividad</Button>}
            loading={loading}
            onDragOver={allowDrop}
            onDrop={onDropTo(1)}
            styles={{ body: { minHeight: 360 } }}
          >
            {count1 ? (
              grouped[1].map((a) => (
                <CardActividad
                  key={a.id_actividad}
                  a={a}
                  onClick={() => openEdit(a)}
                  draggable
                  onDragStart={onDragStart(a.id_actividad)}
                />
              ))
            ) : (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin actividades" />)}
          </Card>
        </Col>

        {/* Columna 2 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space align="center">
                <Text strong>{colTitle(2)}</Text>
                <Tag bordered>{count2}</Tag>
              </Space>
            }
            loading={loading}
            onDragOver={allowDrop}
            onDrop={onDropTo(2)}
            styles={{ body: { minHeight: 360 } }}
          >
            {count2 ? (
              grouped[2].map((a) => (
                <CardActividad
                  key={a.id_actividad}
                  a={a}
                  onClick={() => openEdit(a)}
                  draggable
                  onDragStart={onDragStart(a.id_actividad)}
                />
              ))
            ) : (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin actividades" />)}
          </Card>
        </Col>

        {/* Columna 3 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space align="center">
                <Text strong>{colTitle(3)}</Text>
                <Tag bordered>{count3}</Tag>
              </Space>
            }
            loading={loading}
            onDragOver={allowDrop}
            onDrop={onDropTo(3)}
            styles={{ body: { minHeight: 360 } }}
          >
            {count3 ? (
              grouped[3].map((a) => (
                <CardActividad
                  key={a.id_actividad}
                  a={a}
                  onClick={() => openEdit(a)}
                  draggable={false}
                />
              ))
            ) : (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin actividades" />)}
          </Card>
        </Col>
      </Row>

      {/* Modal Crear/Editar */}
      <ModalActividad
        open={modalOpen}
        idActividad={editId}
        onCancel={() => { setModalOpen(false); setEditId(null); }}
        onSaved={async () => {
          const acts = await fetchMisActividadesKanban();
          setItems(acts);
        }}
      />
    </div>
  );
}
