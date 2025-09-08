"use client";

import { useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  DatePicker,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  fetchContratos,
  fetchContratoById,
  createContrato,
  updateContrato,
  listTiposContrato,
  listEntidades,
  listEmpleadosActivos,
  fetchEmpleadoById,
} from "@/features/contratos/service";

const { Title, Paragraph, Text } = Typography;

// ---------- Utils ----------
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

function fmtYMD(val) {
  if (!val) return "";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d)) return String(val);
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtMoney(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return `$ ${v}`;
  return `$ ${n.toLocaleString("es-CO")}`;
}

function fmtNumber(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("es-CO");
}

function joinNonEmpty(arr) {
  return arr
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(" ");
}

// ---------- Page ----------
export default function ContratosPage() {
  const { message } = App.useApp();

  // Listado
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal contrato
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Catálogos
  const [tipos, setTipos] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // Duración
  const [duracion, setDuracion] = useState("");

  // Empleado (selector modal)
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [empRows, setEmpRows] = useState([]);
  const [empTotal, setEmpTotal] = useState(0);
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(10);
  const [empQ, setEmpQ] = useState("");
  const [empSelectedKey, setEmpSelectedKey] = useState(null);
  const [empleadoSel, setEmpleadoSel] = useState(null); // {id, cedula, nombre}

  // Cargar lista contratos
  const load = async (opts = {}) => {
    setLoading(true);
    try {
      const { items, total: t, page: p, pageSize: ps } = await fetchContratos({
        q, page, pageSize, ...opts,
      });
      setRows(items || []);
      setTotal(t || 0);
      setPage(p || 1);
      setPageSize(ps || 10);
    } catch (e) {
      console.warn("fetchContratos:", e?.response?.data || e);
      message.error("No se pudieron cargar los contratos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-line */ }, []);

  const onSearch = () => load({ page: 1 });
  const onTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    load({ page: pagination.current, pageSize: pagination.pageSize });
  };

  // Abrir modal (nuevo/editar)
  const handleAdd = () => { setEditingId(null); setOpen(true); };
  const handleEdit = (record) => { setEditingId(record.id_contrato ?? record.id); setOpen(true); };

  // Al abrir modal: cargar catálogos + setear form + precargar empleado
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const init = async () => {
      // Catálogos
      try {
        setCatLoading(true);
        const [t, e] = await Promise.all([listTiposContrato(), listEntidades()]);
        if (cancelled) return;
        setTipos(Array.isArray(t) ? t : []);
        setEntidades(Array.isArray(e) ? e : []);
      } catch (err) {
        console.warn("catálogos:", err?.response?.data || err);
        message.warning("No se pudieron cargar catálogos de tipos/entidades");
        setTipos([]); setEntidades([]);
      } finally {
        setCatLoading(false);
      }

      // Form + empleado
      if (!editingId) {
        form.resetFields();
        setDuracion("");
        setEmpleadoSel(null);
        setEmpSelectedKey(null);
        return;
      }
      try {
        const row = await fetchContratoById(editingId);
        if (cancelled) return;

        form.setFieldsValue({
          num_contrato: row.num_contrato,
          fecha_inicio_contrato: row.fecha_inicio_contrato ? dayjsSafe(row.fecha_inicio_contrato) : null,
          fecha_fin_contrato: row.fecha_fin_contrato ? dayjsSafe(row.fecha_fin_contrato) : null,
          valor_contrato: row.valor_contrato ?? null,
          supervisor_contrato: row.supervisor_contrato ?? "",
          id_tipo_contrato: row.id_tipo_contrato ?? null,
          id_entidad: row.id_entidad ?? null,
          id_empleado: row.id_empleado ?? null,
        });

        setDuracion(calcDuracion(
          dayjsSafe(row.fecha_inicio_contrato),
          dayjsSafe(row.fecha_fin_contrato)
        ));

        // Precargar datos del empleado para mostrar cédula + nombres
        if (row.id_empleado) {
          try {
            const emp = await fetchEmpleadoById(row.id_empleado);
            if (!cancelled && emp) {
              setEmpleadoSel({ id: emp.id, cedula: emp.cedula, nombre: emp.nombre });
              setEmpSelectedKey(emp.id);
            } else if (!cancelled) {
              setEmpleadoSel({ id: row.id_empleado, cedula: "", nombre: "" });
              setEmpSelectedKey(row.id_empleado);
            }
          } catch {
            if (!cancelled) {
              setEmpleadoSel({ id: row.id_empleado, cedula: "", nombre: "" });
              setEmpSelectedKey(row.id_empleado);
            }
          }
        }
      } catch (e) {
        console.warn("fetchContratoById:", e?.response?.data || e);
        message.error("No se pudo cargar el contrato");
      }
    };

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Empleados modal: carga
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
    setEmpSelectedKey(form.getFieldValue("id_empleado") || null);
    setEmpModalOpen(true);
    loadEmpleados({ page: 1 });
  };

  const confirmEmpPick = () => {
    const picked = empRows.find(r => r.id === empSelectedKey);
    if (!picked) { message.warning("Selecciona un empleado"); return; }
    form.setFieldsValue({ id_empleado: picked.id });
    setEmpleadoSel({ id: picked.id, cedula: picked.cedula, nombre: picked.nombre });
    setEmpModalOpen(false);
  };

  // Duración reactiva
  const handleDatesChange = () => {
    const s = form.getFieldValue("fecha_inicio_contrato");
    const e = form.getFieldValue("fecha_fin_contrato");
    setDuracion(calcDuracion(s, e));
  };

  // Guardar
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        num_contrato: values.num_contrato?.trim(),
        fecha_inicio_contrato: toYMD(values.fecha_inicio_contrato),
        fecha_fin_contrato: toYMD(values.fecha_fin_contrato),
        valor_contrato: values.valor_contrato ?? null,
        supervisor_contrato: values.supervisor_contrato?.trim() || null,
        id_tipo_contrato: values.id_tipo_contrato,
        id_entidad: values.id_entidad,
        id_empleado: values.id_empleado,
      };
      if (editingId) {
        await updateContrato(editingId, payload);
        message.success("Contrato actualizado");
      } else {
        const id = await createContrato(payload);
        if (!id) throw new Error("No se obtuvo id del nuevo contrato");
        message.success("Contrato creado");
      }
      setOpen(false);
      setEditingId(null);
      await load();
    } catch (e) {
      const serverMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error al guardar";
      console.warn("save contrato:", e?.response?.data || e);
      message.error(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  // Tabla (lista Contratos)
  const columns = [
    { title: "Nro. Contrato", dataIndex: "num_contrato" },
    { title: "Fecha Inicio", dataIndex: "fecha_inicio_contrato", render: (v) => fmtYMD(v) },
    { title: "Fecha Final", dataIndex: "fecha_fin_contrato", render: (v) => fmtYMD(v) },
    { title: "Duración", dataIndex: "duracion" },
    {
      title: "Valor Contrato",
      dataIndex: "valor_contrato",
      render: (v) => fmtMoney(v),
      align: "right",
      width: 160,
    },
    {
      title: "Cédula Empleado",
      dataIndex: "cedula_empleado",
      width: 160,
      render: (v) => fmtNumber(v),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              size="small"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title level={4} style={{ margin: 0 }}>Contratos</Title>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Nuevo contrato
          </Button>

          <Input.Search
            placeholder="Buscar por No. de contrato o cédula (numérica)"
            allowClear
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={onSearch}
            style={{ maxWidth: 420 }}
          />
        </div>

        <Paragraph style={{ marginTop: 0 }}>
          Administra los contratos laborales. No se permite eliminación.
        </Paragraph>

        <Table
          rowKey={(r) => r.id_contrato}
          loading={loading}
          columns={columns}
          dataSource={rows}
          onChange={onTableChange}
          pagination={{ current: page, pageSize, total, showSizeChanger: true }}
        />
      </Card>

      {/* Modal crear/editar contrato */}
      <Modal
        title={editingId ? "Editar contrato" : "Nuevo contrato"}
        open={open}
        onOk={handleSubmit}
        confirmLoading={saving || catLoading}
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
            if ("fecha_inicio_contrato" in changed || "fecha_fin_contrato" in changed) {
              const s = form.getFieldValue("fecha_inicio_contrato");
              const e = form.getFieldValue("fecha_fin_contrato");
              setDuracion(calcDuracion(s, e));
            }
          }}
        >
          <Form.Item
            name="num_contrato"
            label="Código / No. contrato"
            rules={[{ required: true, message: "Ingresa el número de contrato" }]}
          >
            <Input maxLength={20} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="fecha_inicio_contrato"
              label="Fecha inicio"
              rules={[{ required: true, message: "Selecciona la fecha de inicio" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="fecha_fin_contrato"
              label="Fecha fin"
              rules={[
                { required: true, message: "Selecciona la fecha de fin" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const s = getFieldValue("fecha_inicio_contrato");
                    if (!s || !value) return Promise.resolve();
                    const sv = s?.toDate?.() ?? s;
                    const ev = value?.toDate?.() ?? value;
                    if (ev > sv) return Promise.resolve(); // estrictamente mayor
                    return Promise.reject(new Error("La fecha fin debe ser mayor a la fecha inicio"));
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item label="Duración">
            <Input value={duracion || ""} disabled />
          </Form.Item>

          <Form.Item
            name="valor_contrato"
            label="Valor del contrato"
            rules={[{ required: true, message: "Ingresa el valor del contrato" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={1000}
              formatter={(v) => {
                if (v == null || v === "") return "";
                const parts = String(v).replace(/[$\s,]/g, "").split(".");
                parts[0] = `$ ${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                return parts.join(".");
              }}
              parser={(v) => (v ? Number(v.replace(/[$\s,]/g, "")) : null)}
            />
          </Form.Item>

          <Form.Item name="supervisor_contrato" label="Supervisor del contrato">
            <Input />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="id_tipo_contrato"
              label="Tipo de contrato"
              rules={[{ required: true, message: "Selecciona el tipo de contrato" }]}
            >
              <Select
                placeholder="Selecciona..."
                options={tipos.map(t => ({ value: t.id, label: t.nombre }))}
                showSearch
                optionFilterProp="label"
                loading={catLoading}
              />
            </Form.Item>

            <Form.Item
              name="id_entidad"
              label="Entidad contratante"
              rules={[{ required: true, message: "Selecciona la entidad" }]}
            >
              <Select
                placeholder="Selecciona..."
                options={entidades.map(e => ({ value: e.id, label: e.nombre }))}
                showSearch
                optionFilterProp="label"
                loading={catLoading}
              />
            </Form.Item>
          </div>

          {/* Campo real para validación, oculto */}
          <Form.Item
            name="id_empleado"
            rules={[{ required: true, message: "Selecciona el empleado" }]}
            style={{ display: "none" }}
          >
            <Input type="hidden" />
          </Form.Item>

          {/* Visual de empleado + botón para abrir modal */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ minWidth: 120, fontWeight: 500 }}>Empleado</div>
            {empleadoSel ? (
              <Space size="small" wrap>
                <Tag color="blue">{empleadoSel.cedula ? fmtNumber(empleadoSel.cedula) : "Sin cédula"}</Tag>
                <Text>{empleadoSel.nombre || `ID ${empleadoSel.id}`}</Text>
                <Button size="small" icon={<UserAddOutlined />} onClick={() => openEmpModal()}>
                  Cambiar
                </Button>
              </Space>
            ) : (
              <Button icon={<UserAddOutlined />} onClick={() => openEmpModal()}>
                Relacionar empleado
              </Button>
            )}
          </div>
        </Form>
      </Modal>

      {/* Modal seleccionar empleado */}
      <Modal
        title="Seleccionar empleado activo"
        open={empModalOpen}
        onOk={confirmEmpPick}
        okButtonProps={{ disabled: !empSelectedKey }}
        onCancel={() => setEmpModalOpen(false)}
        width={900}
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
            { title: "Nombres (primer, segundo)", render: (_, r) => joinNonEmpty([r.primer_nombre, r.segundo_nombre]) },
            { title: "Apellidos (primer, segundo)", render: (_, r) => joinNonEmpty([r.primer_apellido, r.segundo_apellido]) },
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
            type: "radio",
            selectedRowKeys: empSelectedKey ? [empSelectedKey] : [],
            onChange: (keys) => setEmpSelectedKey(keys?.[0] ?? null),
          }}
          onRow={(record) => ({
            onDoubleClick: () => {
              setEmpSelectedKey(record.id);
              setTimeout(confirmEmpPick, 0);
            },
          })}
        />
      </Modal>
    </div>
  );
}
