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
  Upload,
  Alert,
} from "antd";
import { PlusOutlined, EditOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import {
  fetchPerfiles,
  createPerfil,
  updatePerfil,
  fetchPerfilById,
  setAsignacionesPerfil,
  importObligacionesExcel, // NUEVO
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

  // Selección de obligaciones manual
  const [selectedObligaciones, setSelectedObligaciones] = useState([]); // number[]
  const [selectedMap, setSelectedMap] = useState({}); // { [id]: nombre }

  // ----------------- Estado Excel -----------------
  // fileList controlado para AntD Upload (max 1 archivo)
  const [excelFiles, setExcelFiles] = useState([]); // [{uid, name, originFileObj, ...}]

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
    setExcelFiles([]);
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
        setExcelFiles([]); // al editar, limpiamos cualquier archivo previo
      } else {
        form.resetFields();
        setSelectedObligaciones([]);
        setSelectedMap({});
        setExcelFiles([]);
      }
    })();
  }, [open, editing, form]);

  // ----------------- Excel: Upload control -----------------
  const beforeUploadExcel = (file) => {
    const name = (file?.name || "").toLowerCase();
    const isExcel =
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!isExcel) {
      message.error("Formato no soportado. Sube un archivo .xlsx o .xls");
      return Upload.LIST_IGNORE;
    }

    setExcelFiles([file]); // max 1
    message.success(`"${file.name}" listo para importar (reemplazará las relaciones)`);
    return Upload.LIST_IGNORE; // evita upload automático
  };

  const onRemoveExcel = () => {
    setExcelFiles([]);
    return true;
  };

  const hasExcel = excelFiles.length > 0;
  const excelFile = hasExcel ? (excelFiles[0].originFileObj || excelFiles[0]) : null;

  // ----------------- Guardar -----------------
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

      // Paso 2: obligaciones
      if (hasExcel && excelFile) {
        // Si hay Excel seleccionado → REEMPLAZA relaciones desde backend
        const stats = await importObligacionesExcel(idPerfil, excelFile);
        message.success(
          `Importado desde Excel: ${stats?.relacionesCreadas ?? 0} relaciones nuevas, ` +
          `${stats?.relacionesEliminadas ?? 0} eliminadas`
        );
      } else {
        // Si NO hay Excel → flujo manual: asignar selección actual
        await setAsignacionesPerfil(idPerfil, {
          obligacionesIds: selectedObligaciones,
          usuariosIds: [],
        });
        message.success(editing ? "Perfil actualizado" : "Perfil creado");
      }

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

  // ----------------- Selector de Obligaciones (modal aparte) -----------------
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

  // rowSelection: checkbox por fila (modal de selector - todas las obligaciones)
  const rowSelection = {
    selectedRowKeys: selectedObligaciones,
    onChange: (keys) => {
      const nextIds = Array.isArray(keys) ? keys : [];
      const nextMap = {};

      for (const id of nextIds) {
        if (selectedMap[id]) nextMap[id] = selectedMap[id];
      }
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

  const selColumns = [
    { title: "ID", dataIndex: "id", width: 90 },
    { title: "Obligación contractual", dataIndex: "obligacion" },
  ];

  // ----------------- Tabla SOLO con las obligaciones ya relacionadas (en el modal de editar) -----------------
  const relatedRows = useMemo(() => {
    // Construye la tabla a partir de la selección actual (solo esas)
    return selectedObligaciones.map((id) => ({
      id,
      obligacion: selectedMap[id] || `Obligación ${id}`,
    }));
  }, [selectedObligaciones, selectedMap]);

  const relatedRowSelection = {
    type: "checkbox",
    selectedRowKeys: selectedObligaciones, // todas comienzan marcadas
    onChange: (keys) => {
      // Al desmarcar, quitamos el id de la selección (se eliminará al guardar)
      setSelectedObligaciones(Array.isArray(keys) ? keys : []);
    },
    getCheckboxProps: () => ({ disabled: hasExcel }), // si hay Excel, deshabilita
    preserveSelectedRowKeys: true,
  };

  const relatedColumns = [
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
        width={920}
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

          {/* Aviso sobre prioridad de Excel */}
          <Alert
            type={hasExcel ? "warning" : "info"}
            showIcon
            style={{ marginBottom: 12 }}
            message={
              hasExcel
                ? "Se importará desde Excel y se REEMPLAZARÁN las obligaciones relacionadas con este perfil."
                : "Opcional: puedes relacionar obligaciones manualmente o cargar un Excel para reemplazarlas."
            }
          />

          {/* Cargar Excel */}
          <Form.Item label="Cargar obligaciones desde Excel (.xlsx / .xls)">
            <Upload
              beforeUpload={beforeUploadExcel}
              onRemove={onRemoveExcel}
              fileList={excelFiles}
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
            </Upload>
            <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
              Se tomará la <b>primera fila</b> como encabezado y se leerá la <b>primera columna</b> como lista de obligaciones.
            </div>
          </Form.Item>

          {/* Botón para abrir el selector (todas las obligaciones) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <Space>
              <Tooltip title="Selecciona una o varias obligaciones para asociarlas a este perfil">
                <Button icon={<LinkOutlined />} onClick={openSelector} disabled={hasExcel}>
                  Relacionar obligación contractual
                </Button>
              </Tooltip>
              <span style={{ color: hasExcel ? "#faad14" : "#888" }}>
                {hasExcel
                  ? "Se ignorará la selección manual porque hay un Excel cargado"
                  : selectedObligaciones.length
                    ? `${selectedObligaciones.length} obligación(es) seleccionada(s)`
                    : "Sin obligaciones seleccionadas"}
              </span>
            </Space>

            {/* SOLO EN EDITAR: Tabla con las obligaciones YA RELACIONADAS (con checkboxes) */}
            {editing && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <b>Obligaciones actualmente relacionadas</b>
                </div>
                <Table
                  rowKey="id"
                  size="small"
                  columns={[
                    { title: "ID", dataIndex: "id", width: 90 },
                    { title: "Obligación contractual", dataIndex: "obligacion" },
                  ]}
                  dataSource={relatedRows}
                  rowSelection={relatedRowSelection}
                  pagination={{ pageSize: 7 }}
                  scroll={{ y: 260 }}
                  style={hasExcel ? { opacity: 0.6, pointerEvents: "none" } : {}}
                />
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
          columns={[{ title: "ID", dataIndex: "id", width: 90 }, { title: "Obligación contractual", dataIndex: "obligacion" }]}
          dataSource={selFiltered}
          rowSelection={{ type: "checkbox", selectedRowKeys: selectedObligaciones, onChange: rowSelection.onChange, preserveSelectedRowKeys: true }}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
}
