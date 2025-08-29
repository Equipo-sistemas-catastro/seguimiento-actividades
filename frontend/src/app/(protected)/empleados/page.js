"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  App, Button, Card, Form, Input, Modal, Select,
  Space, Table, Tag, Tooltip, Typography, DatePicker, Divider,
} from "antd";
import { EditOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchEmpleados, getEmpleadoDetalle, createEmpleado, updateEmpleado,
  fetchPerfilesAll, fetchComponentesAll,
  assignPerfilEmpleado, assignComponenteEmpleado,
} from "@/features/empleados/service";

const { Title } = Typography;
const { Search } = Input;

export default function EmpleadosPage() {
  const { message, modal } = App.useApp();

  // -------- Tabla / filtros --------
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id_empleado");
  const [sortDir, setSortDir] = useState("DESC");

  // -------- Modal / Form --------
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // combos
  const [perfilesOpts, setPerfilesOpts] = useState([]);
  const [componentesOpts, setComponentesOpts] = useState([]);

  // relaciones activas iniciales (para detectar cambios en edición)
  const [initialPerfilId, setInitialPerfilId] = useState(undefined);
  const [initialComponenteId, setInitialComponenteId] = useState(undefined);

  // estado del formulario (para deshabilitar selects)
  const [estadoForm, setEstadoForm] = useState("activo");

  // -------- Cargar tabla --------
  const load = async (args = {}) => {
    setLoading(true);
    try {
      const res = await fetchEmpleados({ q, estado, page, pageSize, sortBy, sortDir, ...args });
      setData(res.items);
      setTotal(res.total);
      setPage(res.page);
      setPageSize(res.pageSize);
    } catch (e) {
      console.error("Error listando empleados", e?.response?.data || e);
      message.error(e?.response?.data?.message || "No se pudo cargar el listado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [estado]);

  // debounce búsqueda
  const debounceRef = useRef(null);
  const onChangeSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(value); setPage(1); load({ q: value, page: 1 });
    }, 450);
  };

  // columnas
  const columns = useMemo(() => [
    { title: "Cédula", dataIndex: "cedula", key: "cedula", sorter: true, width: 140 },
    { title: "Nombre", dataIndex: "nombre", key: "nombre", sorter: true, render: (t) => <span style={{fontWeight:500}}>{t}</span> },
    { title: "Correo", dataIndex: "email", key: "email", ellipsis: true },
    { title: "Móvil", dataIndex: "movil", key: "movil", width: 120 },
    {
      title: "Estado", dataIndex: "estado", key: "estado", width: 120,
      filters: [{ text: "Activo", value: "activo" }, { text: "Inactivo", value: "inactivo" }],
      render: (v) => (v === "activo" ? <Tag color="green">ACTIVO</Tag> : <Tag color="red">INACTIVO</Tag>),
    },
    {
      title: "Acciones", key: "actions", fixed: "right", width: 70,
      render: (_, row) => (
        <Tooltip title="Editar">
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(row)} aria-label="Editar" />
        </Tooltip>
      ),
    },
  ], []);

  const handleTableChange = (pagination, filters, sorter) => {
    const current = pagination?.current || 1;
    const size = pagination?.pageSize || 10;

    const fEstado = Array.isArray(filters?.estado) && filters.estado.length ? String(filters.estado[0]) : estado;

    let nextSortBy = sortBy, nextSortDir = sortDir;
    if (sorter && sorter.field) {
      if (sorter.field === "cedula") nextSortBy = "cedula_empleado";
      else if (sorter.field === "nombre") nextSortBy = "primer_apellido_empl";
      else nextSortBy = "id_empleado";
      nextSortDir = sorter.order === "ascend" ? "ASC" : "DESC";
    }

    setPage(current); setPageSize(size); setEstado(fEstado);
    setSortBy(nextSortBy); setSortDir(nextSortDir);
    load({ page: current, pageSize: size, estado: fEstado, sortBy: nextSortBy, sortDir: nextSortDir });
  };

  // -------- Crear --------
  const handleNew = async () => {
    setEditingRow(null);
    setInitialPerfilId(undefined);
    setInitialComponenteId(undefined);

    setOpen(true);             // abrir primero
    form.resetFields();
    form.setFieldsValue({ estado: "activo" });
    setEstadoForm("activo");

    try {
      const [perfiles, componentes] = await Promise.all([fetchPerfilesAll(), fetchComponentesAll()]);
      setPerfilesOpts(perfiles);
      setComponentesOpts(componentes);
    } catch (e) {
      console.warn("Catálogos:", e?.response?.data || e);
    }
  };

  // -------- Editar --------
  const handleEdit = async (row) => {
    setEditingRow(row);

    setOpen(true);             // abrir primero
    form.resetFields();
    form.setFieldsValue({
      cedula: row.cedula ?? "",
      primer_nombre_empl: row.primer_nombre_empl ?? "",
      segundo_nombre_empl: row.segundo_nombre_empl ?? "",
      primer_apellido_empl: row.primer_apellido_empl ?? "",
      segundo_apellido_empl: row.segundo_apellido_empl ?? "",
      email: row.email ?? "",
      movil: row.movil ?? "",
      estado: row.estado ?? "activo",
      fecha_nacimiento_empl: row.fecha_nacimiento_empl ? dayjs(row.fecha_nacimiento_empl) : null,
    });
    setEstadoForm(row.estado ?? "activo");

    try {
      const [perfiles, componentes] = await Promise.all([fetchPerfilesAll(), fetchComponentesAll()]);
      setPerfilesOpts(perfiles);
      setComponentesOpts(componentes);
    } catch (e) {
      console.warn("Catálogos:", e?.response?.data || e);
    }

    try {
      const id = row.id ?? row.id_empleado;
      const detail = await getEmpleadoDetalle(id);
      if (detail) {
        setInitialPerfilId(detail.perfil_id);
        setInitialComponenteId(detail.componente_id);
        form.setFieldsValue({
          cedula: detail.cedula ?? "",
          primer_nombre_empl: detail.primer_nombre_empl ?? "",
          segundo_nombre_empl: detail.segundo_nombre_empl ?? "",
          primer_apellido_empl: detail.primer_apellido_empl ?? "",
          segundo_apellido_empl: detail.segundo_apellido_empl ?? "",
          email: detail.email ?? "",
          movil: detail.movil ?? "",
          estado: detail.estado ?? "activo",
          fecha_nacimiento_empl: detail.fecha_nacimiento_empl ? dayjs(detail.fecha_nacimiento_empl) : null,
          perfil_id: detail.perfil_id ?? undefined,
          componente_id: detail.componente_id ?? undefined,
        });
        setEstadoForm(detail.estado ?? "activo");
      }
    } catch (e) {
      console.warn("Detalle empleado:", e?.response?.data || e);
    }
  };

  // -------- Guardar (crear/editar + relaciones) --------
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        ...values,
        fecha_nacimiento_empl: values.fecha_nacimiento_empl
          ? values.fecha_nacimiento_empl.format("YYYY-MM-DD")
          : null,
      };

      let empleadoGuardado;
      if (editingRow?.id || editingRow?.id_empleado) {
        const id = editingRow.id ?? editingRow.id_empleado;
        empleadoGuardado = await updateEmpleado(id, payload);
      } else {
        empleadoGuardado = await createEmpleado(payload);
      }

      // Asignaciones (solo si estado activo)
      const idEmpleado = empleadoGuardado?.id || editingRow?.id || editingRow?.id_empleado;
      const esActivo = (payload.estado ?? empleadoGuardado?.estado) === "activo";

      if (idEmpleado && esActivo) {
        const nextPerfilId = values.perfil_id != null ? Number(values.perfil_id) : undefined;
        const nextComponenteId = values.componente_id != null ? Number(values.componente_id) : undefined;

        const promises = [];
        if (typeof nextPerfilId !== "undefined" &&
            (typeof initialPerfilId === "undefined" || nextPerfilId !== Number(initialPerfilId))) {
          promises.push(assignPerfilEmpleado(idEmpleado, nextPerfilId));
        }
        if (typeof nextComponenteId !== "undefined" &&
            (typeof initialComponenteId === "undefined" || nextComponenteId !== Number(initialComponenteId))) {
          promises.push(assignComponenteEmpleado(idEmpleado, nextComponenteId));
        }
        if (promises.length) await Promise.all(promises);
      }

      message.success(editingRow ? "Empleado actualizado" : "Empleado creado");
      setOpen(false);
      setEditingRow(null);
      setInitialPerfilId(undefined);
      setInitialComponenteId(undefined);
      form.resetFields();
      load();
    } catch (e) {
      if (e?.errorFields) return; // validación antd
      console.error("Guardar empleado:", e?.response?.data || e);
      message.error(e?.response?.data?.message || "No se pudo guardar el empleado");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      modal.confirm({
        title: "Descartar cambios",
        content: "Tienes cambios sin guardar. ¿Deseas salir sin guardar?",
        okText: "Sí, salir",
        cancelText: "Volver",
        onOk: () => {
          setOpen(false); setEditingRow(null);
          setInitialPerfilId(undefined); setInitialComponenteId(undefined);
          form.resetFields();
        },
      });
    } else {
      setOpen(false); setEditingRow(null);
      setInitialPerfilId(undefined); setInitialComponenteId(undefined);
      form.resetFields();
    }
  };

  // -------- Render --------
  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        <Title level={4} style={{ margin: 0 }}>Empleados</Title>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginTop:12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>Crear nuevo empleado</Button>
          <Space.Compact style={{ width: 520, maxWidth: "100%" }}>
            <Search placeholder="Buscar por cédula, nombre, apellido o correo" allowClear
              onChange={(e) => onChangeSearch(e.target.value)} onSearch={(v) => onChangeSearch(v)} enterButton="Buscar" />
            <Select value={estado} onChange={(v)=>{ setEstado(v); setPage(1); load({ estado:v, page:1 }); }}
              style={{ minWidth: 160 }}
              options={[{label:"Todos",value:""},{label:"Activos",value:"activo"},{label:"Inactivos",value:"inactivo"}]} />
          </Space.Compact>
        </div>

        <Table style={{ marginTop: 16 }} rowKey="id" loading={loading} columns={columns} dataSource={data}
          onChange={handleTableChange}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t)=>`${t} registro${t===1?"":"s"}` }}
          scroll={{ x: 900 }} />
      </Card>

      <Modal
        open={open}
        title={editingRow ? "Editar empleado" : "Nuevo empleado"}
        onCancel={handleCancel}
        footer={
          <Space>
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={handleSubmit}>
              {editingRow ? "Guardar cambios" : "Crear"}
            </Button>
          </Space>
        }
        forceRender
        maskClosable={false}
        width={780}
      >
        <Form
          form={form}
          layout="vertical"
          name="empleadoForm"
          onValuesChange={(_, all) => {
            if (all && typeof all.estado !== "undefined") {
              setEstadoForm(all.estado);
            }
          }}
        >
          <Form.Item
            label="Cédula"
            name="cedula"
            rules={[
              { required: true, message: "La cédula es obligatoria" },
              { pattern: /^[0-9]{5,20}$/, message: "Solo números (5 a 20 dígitos)" },
            ]}
          >
            <Input maxLength={20} placeholder="Ej: 1234567890" disabled={!!editingRow} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Primer nombre" name="primer_nombre_empl" rules={[{ required: true, message: "Obligatorio" }]}>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="Segundo nombre" name="segundo_nombre_empl">
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="Primer apellido" name="primer_apellido_empl" rules={[{ required: true, message: "Obligatorio" }]}>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="Segundo apellido" name="segundo_apellido_empl">
              <Input maxLength={100} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Correo" name="email" rules={[{ type: "email", message: "Correo inválido" }]}>
              <Input maxLength={100} placeholder="nombre@dominio.com" />
            </Form.Item>
            <Form.Item label="Móvil" name="movil">
              <Input maxLength={20} placeholder="Opcional" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Fecha de nacimiento" name="fecha_nacimiento_empl">
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Estado" name="estado" rules={[{ required: true, message: "Selecciona un estado" }]}>
              <Select options={[{ label: "Activo", value: "activo" }, { label: "Inactivo", value: "inactivo" }]} />
            </Form.Item>
          </div>

          <Divider orientation="left" style={{ margin: "8px 0 16px" }}>Relaciones (opcional)</Divider>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item label="Perfil laboral" name="perfil_id">
              <Select
                showSearch optionFilterProp="label"
                placeholder="Seleccione perfil (opcional)"
                options={perfilesOpts}
                allowClear={!editingRow}
                disabled={estadoForm !== "activo"}
              />
            </Form.Item>

            <Form.Item label="Componente (Área)" name="componente_id">
              <Select
                showSearch optionFilterProp="label"
                placeholder="Seleccione componente (opcional)"
                options={componentesOpts}
                allowClear={!editingRow}
                disabled={estadoForm !== "activo"}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
