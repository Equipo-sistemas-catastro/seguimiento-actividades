"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Tag,
  Tooltip,
  Typography,
  DatePicker,
} from "antd";
import { EditOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchEmpleados,
  getEmpleadoDetalle,
  createEmpleado,
  updateEmpleado,
} from "@/features/empleados/service";

const { Title } = Typography;
const { Search } = Input;

export default function EmpleadosPage() {
  const { message, modal } = App.useApp();

  // Filtros / tabla
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState(""); // "", "activo", "inactivo"
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id_empleado");
  const [sortDir, setSortDir] = useState("DESC");

  // Modal & Form
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState(null); // fila seleccionada (de la tabla)

  // Debounce búsqueda
  const debounceRef = useRef(null);
  const onChangeSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(value);
      setPage(1);
      load({ q: value, page: 1 });
    }, 450);
  };

  // Cargar tabla
  const load = async (args = {}) => {
    setLoading(true);
    try {
      const res = await fetchEmpleados({
        q,
        estado,
        page,
        pageSize,
        sortBy,
        sortDir,
        ...args,
      });
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // Columnas
  const columns = useMemo(
    () => [
      {
        title: "Cédula",
        dataIndex: "cedula",
        key: "cedula",
        sorter: true,
        width: 140,
      },
      {
        title: "Nombre",
        dataIndex: "nombre",
        key: "nombre",
        sorter: true,
        render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
      },
      { title: "Correo", dataIndex: "email", key: "email", ellipsis: true },
      { title: "Móvil", dataIndex: "movil", key: "movil", width: 120 },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        width: 100,
        filters: [
          { text: "Activo", value: "activo" },
          { text: "Inactivo", value: "inactivo" },
        ],
        render: (v) =>
          v === "activo" ? <Tag color="green">ACTIVO</Tag> : <Tag color="red">INACTIVO</Tag>,
      },
      {
        title: "Acciones",
        key: "actions",
        fixed: "right",
        width: 90,
        render: (_, row) => (
          <Tooltip title="Editar">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(row)}
              aria-label="Editar"
            />
          </Tooltip>
        ),
      },
    ],
    []
  );

  // Cambios de tabla (paginación / orden / filtros)
  const handleTableChange = (pagination, filters, sorter) => {
    const current = pagination?.current || 1;
    const size = pagination?.pageSize || 10;

    const fEstado =
      Array.isArray(filters?.estado) && filters.estado.length
        ? String(filters.estado[0])
        : estado;

    let nextSortBy = sortBy;
    let nextSortDir = sortDir;
    if (sorter && sorter.field) {
      if (sorter.field === "cedula") nextSortBy = "cedula_empleado";
      else if (sorter.field === "nombre") nextSortBy = "primer_apellido_empl";
      else nextSortBy = "id_empleado";
      nextSortDir = sorter.order === "ascend" ? "ASC" : "DESC";
    }

    setPage(current);
    setPageSize(size);
    setEstado(fEstado);
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);

    load({
      page: current,
      pageSize: size,
      estado: fEstado,
      sortBy: nextSortBy,
      sortDir: nextSortDir,
    });
  };

  // Crear
  const handleNew = () => {
    setEditingRow(null);
    form.resetFields();
    form.setFieldsValue({ estado: "activo" });
    setOpen(true);
  };

  // Editar: prefill inmediato con la fila y luego sobre-escribe con el detalle real
  const handleEdit = async (row) => {
    try {
      setEditingRow(row);

      // Prefill inmediato desde la fila (ya normalizada)
      form.setFieldsValue({
        cedula: row.cedula ?? "",
        primer_nombre_empl: row.primer_nombre_empl ?? "",
        segundo_nombre_empl: row.segundo_nombre_empl ?? "",
        primer_apellido_empl: row.primer_apellido_empl ?? "",
        segundo_apellido_empl: row.segundo_apellido_empl ?? "",
        email: row.email ?? "",
        movil: row.movil ?? "",
        estado: row.estado ?? "activo",
        fecha_nacimiento_empl: row.fecha_nacimiento_empl
          ? dayjs(row.fecha_nacimiento_empl)
          : null,
      });

      setOpen(true);

      // Luego intenta cargar el detalle según tu JSON { empleado, ... }
      const id = row.id ?? row.id_empleado ?? null;
      const detail = await getEmpleadoDetalle(id);

      if (detail) {
        form.setFieldsValue({
          cedula: detail.cedula ?? "",
          primer_nombre_empl: detail.primer_nombre_empl ?? "",
          segundo_nombre_empl: detail.segundo_nombre_empl ?? "",
          primer_apellido_empl: detail.primer_apellido_empl ?? "",
          segundo_apellido_empl: detail.segundo_apellido_empl ?? "",
          email: detail.email ?? "",
          movil: detail.movil ?? "",
          estado: detail.estado ?? "activo",
          fecha_nacimiento_empl: detail.fecha_nacimiento_empl
            ? dayjs(detail.fecha_nacimiento_empl)
            : null,
        });
      }
    } catch (e) {
      console.error("Error cargando detalle empleado", e?.response?.data || e);
      message.error("No se pudo cargar el detalle del empleado");
    }
  };

  // Guardar (crear/editar)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // transformar fecha para backend (YYYY-MM-DD)
      const payload = {
        ...values,
        fecha_nacimiento_empl: values.fecha_nacimiento_empl
          ? values.fecha_nacimiento_empl.format("YYYY-MM-DD")
          : null,
      };

      if (editingRow?.id || editingRow?.id_empleado) {
        const id = editingRow.id ?? editingRow.id_empleado;
        await updateEmpleado(id, payload);
        message.success("Empleado actualizado");
      } else {
        await createEmpleado(payload);
        message.success("Empleado creado");
      }

      setOpen(false);
      setEditingRow(null);
      form.resetFields();
      load(); // refrescar listado
    } catch (e) {
      if (e?.errorFields) return; // errores de validación del formulario
      console.error("Error guardando empleado", e?.response?.data || e);
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
          setOpen(false);
          setEditingRow(null);
          form.resetFields();
        },
      });
    } else {
      setOpen(false);
      setEditingRow(null);
      form.resetFields();
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <Card>
        {/* Título */}
        <Title level={4} style={{ margin: 0 }}>
          Empleados
        </Title>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>
            Crear nuevo empleado
          </Button>

          <Space.Compact style={{ width: 520, maxWidth: "100%" }}>
            <Search
              placeholder="Buscar por cédula, nombre, apellido o correo"
              allowClear
              onChange={(e) => onChangeSearch(e.target.value)}
              onSearch={(v) => onChangeSearch(v)}
              enterButton="Buscar"
            />
            <Select
              value={estado}
              onChange={(v) => {
                setEstado(v);
                setPage(1);
                load({ estado: v, page: 1 });
              }}
              style={{ minWidth: 160 }}
              options={[
                { label: "Todos", value: "" },
                { label: "Activos", value: "activo" },
                { label: "Inactivos", value: "inactivo" },
              ]}
            />
          </Space.Compact>
        </div>

        {/* Tabla */}
        <Table
          style={{ marginTop: 16 }}
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `${t} registro${t === 1 ? "" : "s"}`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        open={open}
        title={editingRow ? "Editar empleado" : "Nuevo empleado"}
        onCancel={handleCancel}
        footer={
          <Space>
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={handleSubmit}
            >
              {editingRow ? "Guardar cambios" : "Crear"}
            </Button>
          </Space>
        }
        // Mantener el Form montado para evitar el warning de useForm no conectado
        forceRender
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="empleadoForm">
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
            <Form.Item
              label="Primer nombre"
              name="primer_nombre_empl"
              rules={[{ required: true, message: "Obligatorio" }]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="Segundo nombre" name="segundo_nombre_empl">
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item
              label="Primer apellido"
              name="primer_apellido_empl"
              rules={[{ required: true, message: "Obligatorio" }]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label="Segundo apellido" name="segundo_apellido_empl">
              <Input maxLength={100} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              label="Correo"
              name="email"
              rules={[{ type: "email", message: "Correo inválido" }]}
            >
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
            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: "Selecciona un estado" }]}
            >
              <Select
                options={[
                  { label: "Activo", value: "activo" },
                  { label: "Inactivo", value: "inactivo" },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
