"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Row, Col, Card, Typography, Space, Button, Modal,
  Form, Input, DatePicker, Select, App, Divider, List,
  Empty, Tooltip, Tag, Avatar, Skeleton
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

// Services
import {
  listEstadosMis as fetchEstados,
  fetchMisRequerimientos,
  fetchMisRequerimientoById,
  fetchMisObligaciones,
  createActividad,
  listMisActividades,
  fetchActividadById,
  updateActividad,
} from "@/features/requerimientos/service";

const { Title, Text } = Typography;

/* ======================= Utils ======================= */
function formatFecha(val) {
  if (!val) return "-";
  const d = dayjs(val);
  if (!d.isValid()) return "-";
  const txt = d.format("DD-MMM-YYYY");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
function diffDias(a, b) {
  const da = dayjs(a), db = dayjs(b);
  if (!da.isValid() || !db.isValid()) return null;
  return db.startOf("day").diff(da.startOf("day"), "day");
}
function joinNonEmpty(arr) {
  return (arr || [])
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(" ");
}
function nombreCompletoEmpleado(e = {}) {
  return (
    e.nombre_completo ||
    e.nombre ||
    joinNonEmpty([
      e.primer_nombre_empl ?? e.primer_nombre,
      e.segundo_nombre_empl ?? e.segundo_nombre,
      e.primer_apellido_empl ?? e.primer_apellido,
      e.segundo_apellido_empl ?? e.segundo_apellido,
    ]) ||
    (e.id_empleado != null ? `Empleado #${e.id_empleado}` : "Empleado")
  );
}
function inicialEmpleado(e) {
  const base =
    e?.primer_nombre_empl ??
    e?.primer_nombre ??
    (e?.nombre || "").split(" ")?.[0] ??
    "";
  const ch = (base || "").trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

/* ============== Modal selector de Obligaciones ============== */
function ObligacionesModal({ open, onClose, selectedIds = [], onConfirm }) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [obls, setObls] = useState([]);
  const [q, setQ] = useState("");

  const [sel, setSel] = useState(new Set((selectedIds || []).map(Number)));

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchMisObligaciones()
      .then((rows) => setObls(rows || []))
      .catch((e) => message.error(e?.message || "Error cargando obligaciones"))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line

  useEffect(() => {
    setSel(new Set((selectedIds || []).map(Number)));
  }, [selectedIds]);

  const filtered = useMemo(() => {
    if (!q?.trim()) return obls;
    const term = q.trim().toLowerCase();
    return (obls || []).filter((o) =>
      String(o.obligacion_contractual || "").toLowerCase().includes(term)
    );
  }, [q, obls]);

  const toggle = (rawId) => {
    const id = Number(rawId);
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setSel(next);
  };

  const allIds = filtered.map((o) => Number(o.id_obligacion));
  const allSelected = allIds.length > 0 && allIds.every((id) => sel.has(id));
  const toggleAll = () => {
    const next = new Set(sel);
    if (allSelected) allIds.forEach((id) => next.delete(id));
    else allIds.forEach((id) => next.add(id));
    setSel(next);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Seleccionar obligaciones contractuales"
      width={720}
      okText="Usar selección"
      onOk={() => onConfirm(Array.from(sel))}
      confirmLoading={loading}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="Buscar por descripción..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            allowClear
          />
          <Button onClick={() => setQ("")}>Limpiar</Button>
        </Space.Compact>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">{filtered.length} obligación(es) encontradas</Text>
          <Button type="link" onClick={toggleAll} disabled={filtered.length === 0}>
            {allSelected ? "Deseleccionar visibles" : "Seleccionar visibles"}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Empty description="Sin resultados" />
        ) : (
          <List
            bordered
            dataSource={filtered}
            style={{ maxHeight: 380, overflow: "auto" }}
            renderItem={(item) => {
              const id = Number(item.id_obligacion);
              const checked = sel.has(id);
              return (
                <List.Item onClick={() => toggle(id)} style={{ cursor: "pointer" }}>
                  <Space align="start">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(id)}
                      style={{ width: 16, height: 16 }}
                    />
                    <div>
                      <Text strong>#{id}</Text>
                      <div>{item.obligacion_contractual}</div>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        )}
      </Space>
    </Modal>
  );
}

/* ============== Modal Editar Actividad ============== */
function EditarActividadModal({ open, onClose, id_actividad, estados, fiReq, ffReq, onUpdated }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const [oblOpen, setOblOpen] = useState(false);
  const [oblSel, setOblSel] = useState([]);

  useEffect(() => {
    if (!open || !id_actividad) return;
    setLoading(true);
    fetchActividadById(id_actividad)
      .then((d) => {
        setDetalle(d);
        form.setFieldsValue({
          actividad: d?.actividad || "",
          fecha_inicio_actividad: d?.fecha_inicio_actividad ? dayjs(d.fecha_inicio_actividad) : null,
          fecha_fin_programada: d?.fecha_fin_programada ? dayjs(d.fecha_fin_programada) : null,
          id_estado: d?.id_estado ?? 1,
        });
        const obls = Array.isArray(d?.obligaciones)
          ? d.obligaciones
          : Array.isArray(d?.actividad_obligaciones)
          ? d.actividad_obligaciones
          : [];
        setOblSel(obls.map((o) => Number(o.id_obligacion)).filter(Number.isFinite));
      })
      .catch((e) => message.error(e?.message || "Error cargando actividad"))
      .finally(() => setLoading(false));
  }, [open, id_actividad]); // eslint-disable-line

  const disabledStart = (current) => {
    if (!current) return false;
    if (fiReq && current.isBefore(fiReq, "day")) return true;
    if (ffReq && current.isAfter(ffReq, "day")) return true;
    return false;
  };
  const disabledEnd = (current) => {
    if (!current) return false;
    const start = form.getFieldValue("fecha_inicio_actividad");
    if (fiReq && current.isBefore(fiReq, "day")) return true;
    if (start && current.isBefore(start, "day")) return true;
    if (ffReq && current.isAfter(ffReq, "day")) return true;
    return false;
  };

  const submit = async () => {
    try {
      const vals = await form.validateFields();
      if (!oblSel.length) {
        message.warning("Debes seleccionar al menos una obligación");
        setOblOpen(true);
        return;
      }
      setLoading(true);
      await updateActividad(id_actividad, {
        actividad: vals.actividad,
        fecha_inicio_actividad: vals.fecha_inicio_actividad?.format("YYYY-MM-DD"),
        fecha_fin_programada: vals.fecha_fin_programada?.format("YYYY-MM-DD"),
        id_estado: vals.id_estado,
        obligaciones: oblSel,
      });
      message.success("Actividad actualizada");
      onClose?.();
      onUpdated?.();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.error || e?.message || "Error actualizando la actividad");
    } finally {
      setLoading(false);
    }
  };

  const obligacionesActuales = useMemo(() => detalle?.obligaciones || detalle?.actividad_obligaciones || [], [detalle]);

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title="Editar actividad"
        width={720}
        okText="Guardar cambios"
        onOk={submit}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" validateTrigger={["onBlur", "onSubmit"]}>
          <Form.Item label="Actividad" name="actividad" rules={[{ required: true, message: "Describe la actividad" }]}>
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Fecha inicio" name="fecha_inicio_actividad" rules={[{ required: true, message: "Selecciona la fecha de inicio" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledStart} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Fecha fin programada" name="fecha_fin_programada" rules={[{ required: true, message: "Selecciona la fecha fin programada" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledEnd} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Estado" name="id_estado" rules={[{ required: true, message: "Selecciona el estado" }]}>
                <Select options={(estados || []).map((e) => ({ value: e.id, label: e.nombre }))} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }} />
          <Form.Item
            label="Obligaciones contractuales"
            required
            validateStatus={oblSel.length ? "success" : "error"}
            help={oblSel.length ? undefined : "Debes seleccionar al menos una obligación"}
          >
            <Space wrap>
              <Button onClick={() => setOblOpen(true)}>
                Seleccionar obligaciones {oblSel.length ? `(${oblSel.length})` : ""}
              </Button>
              {!!oblSel.length && (
                <Tooltip title="Limpiar selección">
                  <Button type="link" onClick={() => setOblSel([])}>Quitar selección</Button>
                </Tooltip>
              )}
            </Space>
          </Form.Item>

          <Title level={5} style={{ marginTop: 8 }}>Obligaciones relacionadas</Title>
          {(!obligacionesActuales || obligacionesActuales.length === 0) ? (
            <Text type="secondary">Sin obligaciones relacionadas</Text>
          ) : (
            <List
              size="small"
              dataSource={obligacionesActuales}
              renderItem={(o) => <List.Item>- {o.obligacion_contractual || o.descripcion || `#${o.id_obligacion}`}</List.Item>}
              style={{ maxHeight: 220, overflow: "auto" }}
            />
          )}
        </Form>
      </Modal>

      <ObligacionesModal
        open={oblOpen}
        onClose={() => setOblOpen(false)}
        selectedIds={oblSel}
        onConfirm={(ids) => { setOblSel((ids || []).map(Number)); setOblOpen(false); }}
      />
    </>
  );
}

/* ============== Modal Crear Actividad (con lista “Actividades relacionadas”) ============== */
function CrearActividadModal({ open, onClose, id_req, estados, onCreated }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const [acts, setActs] = useState([]);
  const [actsLoading, setActsLoading] = useState(false);
  const [edit, setEdit] = useState({ open: false, id: null });

  const [oblOpen, setOblOpen] = useState(false);
  const [oblSel, setOblSel] = useState([]);

  const porHacerId = useMemo(() => {
    const found = (estados || []).find((e) => Number(e.id) === 1);
    return found ? found.id : (estados?.[0]?.id ?? 1);
  }, [estados]);

  useEffect(() => {
    if (!open || !id_req) return;
    setLoading(true);
    fetchMisRequerimientoById(id_req)
      .then((d) => {
        setDetalle(d);
        form.setFieldsValue({
          actividad: "",
          fecha_inicio_actividad: null,
          fecha_fin_programada: null,
          id_estado: porHacerId,
        });
        setOblSel([]);
        setActs([]);
        setActsLoading(true);
        return listMisActividades({ id_req })
          .then((rows) => setActs(rows || []))
          .finally(() => setActsLoading(false));
      })
      .catch((e) => message.error(e?.message || "Error cargando datos"))
      .finally(() => setLoading(false));
  }, [open, id_req, form, porHacerId]);

  const fiReq = detalle?.fecha_inicio_req ? dayjs(detalle.fecha_inicio_req) : null;
  const ffReq = detalle?.fecha_fin_req ? dayjs(detalle.fecha_fin_req) : null;

  const disabledStart = (current) => {
    if (!current) return false;
    if (fiReq && current.isBefore(fiReq, "day")) return true;
    if (ffReq && current.isAfter(ffReq, "day")) return true;
    return false;
  };
  const disabledEnd = (current) => {
    if (!current) return false;
    const start = form.getFieldValue("fecha_inicio_actividad");
    if (fiReq && current.isBefore(fiReq, "day")) return true;
    if (start && current.isBefore(start, "day")) return true;
    if (ffReq && current.isAfter(ffReq, "day")) return true;
    return false;
  };

  const submit = async () => {
    try {
      const vals = await form.validateFields();
      if (!oblSel.length) {
        message.warning("Debes seleccionar al menos una obligación");
        setOblOpen(true);
        return;
      }
      setLoading(true);
      const resp = await createActividad({
        id_req,
        actividad: vals.actividad,
        fecha_inicio_actividad: vals.fecha_inicio_actividad.format("YYYY-MM-DD"),
        fecha_fin_programada: vals.fecha_fin_programada.format("YYYY-MM-DD"),
        id_estado: vals.id_estado,
        obligaciones: oblSel,
      });
      message.success("Actividad creada");

      setActsLoading(true);
      listMisActividades({ id_req })
        .then((rows) => setActs(rows || []))
        .finally(() => setActsLoading(false));

      onCreated?.(resp);
      form.resetFields();
      setOblSel([]);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.error || e?.message || "Error creando la actividad");
    } finally {
      setLoading(false);
    }
  };

  const estadosMap = useMemo(() => {
    const m = new Map();
    (estados || []).forEach((e) => m.set(Number(e.id), e.nombre));
    return m;
  }, [estados]);

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title="Crear actividad"
        width={900}
        okText="Crear actividad"
        onOk={submit}
        confirmLoading={loading}
      >
        {/* Cabecera solo lectura */}
        <Space direction="vertical" style={{ width: "100%" }}>
          <div className="rounded-lg p-3" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <div style={{ marginTop: 8 }}>
              <Text strong>Descripción:</Text> <Text>{detalle?.descripcion_req}</Text>
            </div>
            <Space size="large" wrap style={{ marginTop: 8 }}>
              <Text><Text strong>Inicio:</Text> {formatFecha(detalle?.fecha_inicio_req)}</Text>
              <Text><Text strong>Fin:</Text> {formatFecha(detalle?.fecha_fin_req)}</Text>
              <Text>
                <Text strong>Duración:</Text>{" "}
                {(() => {
                  const d = diffDias(detalle?.fecha_inicio_req, detalle?.fecha_fin_req);
                  return d != null ? `${d} día(s)` : "-";
                })()}
              </Text>
              <Text>
                <Text strong>Estado:</Text>{" "}
                <Tag color={Number(detalle?.id_estado) === 3 ? "green" : Number(detalle?.id_estado) === 2 ? "blue" : "default"}>
                  {(() => {
                    const id = Number(detalle?.id_estado);
                    const found = (estados || []).find((e) => Number(e.id) === id);
                    return found?.nombre ?? detalle?.estado ?? "-";
                  })()}
                </Tag>
              </Text>
            </Space>

            <div style={{ marginTop: 8 }}>
              <Text strong>Empleados asignados:</Text>
              <div>
                {(detalle?.empleados || []).length === 0 ? (
                  <Text type="secondary">Ninguno</Text>
                ) : (
                  <Space wrap>
                    {(detalle?.empleados || []).map((e) => (
                      <Tag key={e.id_empleado}>
                        {`${e.primer_nombre_empl ?? ""} ${e.primer_apellido_empl ?? ""}`.trim() || `#${e.id_empleado}`}
                      </Tag>
                    ))}
                  </Space>
                )}
              </div>
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          {/* Formulario creación */}
          <Form form={form} layout="vertical" validateTrigger={["onBlur", "onSubmit"]}>
            <Form.Item label="Actividad" name="actividad" rules={[{ required: true, message: "Describe la actividad a ejecutar" }]}>
              <Input.TextArea rows={3} maxLength={1000} showCount />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item label="Fecha inicio" name="fecha_inicio_actividad" rules={[{ required: true, message: "Selecciona la fecha de inicio" }]}>
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledStart} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Fecha fin programada" name="fecha_fin_programada" rules={[{ required: true, message: "Selecciona la fecha fin programada" }]}>
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" disabledDate={disabledEnd} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Estado" name="id_estado" rules={[{ required: true, message: "Selecciona el estado" }]}>
                  <Select options={(estados || []).map((e) => ({ value: e.id, label: e.nombre }))} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Obligaciones contractuales"
              required
              validateStatus={oblSel.length ? "success" : "error"}
              help={oblSel.length ? undefined : "Debes seleccionar al menos una obligación"}
            >
              <Space>
                <Button onClick={() => setOblOpen(true)}>
                  Seleccionar obligaciones {oblSel.length ? `(${oblSel.length})` : ""}
                </Button>
                {!!oblSel.length && (
                  <Tooltip title="Limpiar selección">
                    <Button type="link" onClick={() => setOblSel([])}>Quitar selección</Button>
                  </Tooltip>
                )}
              </Space>
            </Form.Item>
          </Form>

          {/* ====== Actividades relacionadas ====== */}
          <Divider style={{ margin: "12px 0" }} />
          <Title level={5} style={{ margin: 0 }}>Actividades relacionadas</Title>
          <Card variant="outlined" styles={{ body: { padding: 8 } }}>
            {actsLoading ? (
              <Text type="secondary">Cargando...</Text>
            ) : acts.length === 0 ? (
              <Text type="secondary">No hay actividades relacionadas.</Text>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                {acts.map((a) => {
                  const obligs = Array.isArray(a.obligaciones) ? a.obligaciones :
                                 Array.isArray(a.actividad_obligaciones) ? a.actividad_obligaciones : [];
                  const tagColor =
                    Number(a.id_estado) === 3 ? "green" :
                    Number(a.id_estado) === 2 ? "blue" : "default";
                  const puedeEditar = Number(a.id_estado) !== 3;

                  return (
                    <div
                      key={a.id_actividad}
                      className="rounded-lg p-3"
                      style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
                    >
                      <div style={{ marginTop: 0 }}>
                        <Text strong>Descripción:</Text> <Text>{a.actividad}</Text>
                      </div>

                      <Space size="large" wrap style={{ marginTop: 8 }}>
                        <Text type="secondary">Inicio: {formatFecha(a.fecha_inicio_actividad)}</Text>
                        <Text type="secondary">Fin prog.: {formatFecha(a.fecha_fin_programada)}</Text>
                        {Number(a.id_estado) === 3 && (
                          <Text type="secondary">Fin act.: {formatFecha(a.fecha_fin_actividad)}</Text>
                        )}
                        <Text>
                          <Text strong>Estado:</Text>{" "}
                          <Tag color={tagColor}>
                            {(() => {
                              const id = Number(a.id_estado);
                              return estadosMap.get(id) || a.estado || "-";
                            })()}
                          </Tag>
                        </Text>
                      </Space>

                      <Divider style={{ margin: "10px 0" }} />

                      <Text strong style={{ fontSize: 13 }}>
                        Obligaciones contractuales relacionadas
                      </Text>

                      {obligs.length > 0 ? (
                        <ul style={{ margin: "6px 0 0 18px" }}>
                          {obligs.map((o, idx) => (
                            <li key={idx}>{o.obligacion_contractual || o.descripcion || `Obligación #${o.id_obligacion}`}</li>
                          ))}
                        </ul>
                      ) : (
                        <Text type="secondary">Sin obligaciones contractuales relacionadas</Text>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        {puedeEditar && (
                          <Button type="link" onClick={() => setEdit({ open: true, id: a.id_actividad })}>
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Space>
      </Modal>

      {/* Modal editar */}
      <EditarActividadModal
        open={edit.open}
        onClose={() => setEdit({ open: false, id: null })}
        id_actividad={edit.id}
        estados={estados}
        fiReq={fiReq}
        ffReq={ffReq}
        onUpdated={() => {
          setEdit({ open: false, id: null });
          setActsLoading(true);
          listMisActividades({ id_req })
            .then((rows) => setActs(rows || []))
            .finally(() => setActsLoading(false));
        }}
      />

      {/* Modal seleccionar obligaciones (crear) */}
      <ObligacionesModal
        open={oblOpen}
        onClose={() => setOblOpen(false)}
        selectedIds={oblSel}
        onConfirm={(ids) => { setOblSel((ids || []).map(Number)); setOblOpen(false); }}
      />
    </>
  );
}

/* =============================== Page =============================== */
export default function MisRequerimientosPage() {
  const { message } = App.useApp();
  const [catLoading, setCatLoading] = useState(true);
  const [estados, setEstados] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, id_req: null });

  // Cargar estados y luego tablero
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatLoading(true);
        const est = await fetchEstados();
        if (cancelled) return;
        setEstados(est || []);
      } catch (e) {
        setEstados([]);
      } finally {
        if (!cancelled) setCatLoading(false);
      }
      await loadBoard();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar tablero y ANEXAR empleados por requerimiento
  const loadBoard = async () => {
    setLoading(true);
    try {
      const { items: base = [] } = await fetchMisRequerimientos({ page: 1, pageSize: 1000 });

      const normalized = base.map(it => ({
        ...it,
        id_req: Number(it.id_req),
        id_estado: Number(it.id_estado),
      }));

      // Enriquecer con empleados desde el detalle (TODOS los asociados al requerimiento)
      const queue = [...normalized];
      const out = [];
      const workers = Array.from({ length: 6 }, () => (async function worker() {
        while (queue.length) {
          const it = queue.shift();
          try {
            const det = await fetchMisRequerimientoById(it.id_req);
            out.push({ ...it, empleados: det?.empleados || [] });
          } catch {
            out.push({ ...it, empleados: [] });
          }
        }
      })());
      await Promise.all(workers);

      setItems(out);
    } catch (e) {
      setItems([]);
      message.error("No se pudieron cargar los requerimientos");
    } finally {
      setLoading(false);
    }
  };

  const estadosMap = useMemo(() => {
    const m = new Map();
    (estados || []).forEach((e) => m.set(Number(e.id), e.nombre));
    return m;
  }, [estados]);

  const grupos = useMemo(() => {
    const g = { 1: [], 2: [], 3: [] };
    (items || []).forEach((it) => {
      const k = Number(it.id_estado);
      if (!g[k]) g[k] = [];
      g[k].push(it);
    });
    return g;
  }, [items]);

  const Column = ({ estadoId }) => {
    const titulo = estadosMap.get(estadoId) || "";
    const data = grupos[estadoId] || [];

    return (
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>{titulo}</Text>}
          variant="outlined"
          styles={{ body: { padding: 8 } }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {loading && (
              <>
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 8 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
              </>
            )}
            {!loading && data.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin requerimientos" />
            )}
            {!loading && data.map((req) => {
              const disabled = Number(req.id_estado) === 3;
              const tagColor =
                Number(req.id_estado) === 3 ? "green" :
                Number(req.id_estado) === 2 ? "blue" : "default";

              const empleadosRaw = Array.isArray(req.empleados) ? req.empleados : [];
              const maxToShow = 4;
              const show = empleadosRaw.slice(0, maxToShow);
              const hidden = empleadosRaw.slice(maxToShow);
              const extra = hidden.length;

              return (
                <Card
                  key={req.id_req}
                  size="small"
                  hoverable={!disabled}
                  style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                  onClick={() => { if (!disabled) setModal({ open: true, id_req: req.id_req }); }}
                >
                  <div style={{ position: "relative", minHeight: 60 }}>
                    <Space direction="vertical" size={2} style={{ width: "100%" }}>
                      <Text strong>{req.descripcion_req}</Text>
                      <Space size="small" wrap>
                        <Text type="secondary">Inicio: {formatFecha(req.fecha_inicio_req)}</Text>
                        <Text type="secondary">Fin: {formatFecha(req.fecha_fin_req)}</Text>
                        <Text type="secondary">
                          Duración: {(() => {
                            const d = diffDias(req.fecha_inicio_req, req.fecha_fin_req);
                            return d != null ? `${d} día(s)` : "-";
                          })()}
                        </Text>
                      </Space>
                      <div>
                        <Tag color={tagColor}>{estadosMap.get(Number(req.id_estado)) || ""}</Tag>
                      </div>
                    </Space>

                    {/* Avatares con tooltip - esquina inferior derecha */}
                    {(show.length > 0 || extra > 0) && (
                      <div
                        style={{
                          position: "absolute",
                          right: 6,
                          bottom: 6,
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {show.map((e, idx) => (
                          <Tooltip key={e.id_empleado ?? idx} title={nombreCompletoEmpleado(e)}>
                            <Avatar
                              size={26}
                              style={{
                                marginLeft: idx === 0 ? 0 : -8,
                                border: "2px solid #fff",
                                backgroundColor: "#1677ff",
                                fontSize: 12,
                              }}
                            >
                              {inicialEmpleado(e)}
                            </Avatar>
                          </Tooltip>
                        ))}
                        {extra > 0 && (
                          <Tooltip
                            title={
                              hidden.map(nombreCompletoEmpleado).join(", ")
                            }
                          >
                            <Avatar
                              size={26}
                              style={{
                                marginLeft: show.length ? -8 : 0,
                                border: "2px solid #fff",
                                backgroundColor: "#999",
                                fontSize: 12,
                              }}
                            >
                              +{extra}
                            </Avatar>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </Space>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ padding: 12 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Title level={4} style={{ margin: 0 }}>Mis Requerimientos</Title>
        <Row gutter={12}>
          <Column estadoId={1} />
          <Column estadoId={2} />
          <Column estadoId={3} />
        </Row>
      </Space>

      <CrearActividadModal
        open={modal.open}
        id_req={modal.id_req}
        estados={estados}
        onClose={() => setModal({ open: false, id_req: null })}
        onCreated={() => { setModal({ open: false, id_req: null }); loadBoard(); }}
      />
    </div>
  );
}
