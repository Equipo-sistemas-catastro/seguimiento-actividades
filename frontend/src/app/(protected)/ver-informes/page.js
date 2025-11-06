"use client";
import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  FilePdfOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

import {
  buscarEmpleados,
  getAniosEmpleado,
  getMesesEmpleado,
  generarInformeEmpleado,
  exportarPdfEmpleado,
} from "@/features/ver-informes/service";

const { Title, Text } = Typography;
const { Option } = Select;

/** ===== Helpers ===== **/
const formatMoneyCOP = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;
const formatDateDDMMYYYY = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const onlyDigits = (s = "") => (s || "").replace(/\D/g, "");
const toIntOrNull = (s) => {
  const n = Number(onlyDigits(s));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export default function VerInformesPage() {
  const { message } = App.useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSel, setEmpleadoSel] = useState(null);

  const [anios, setAnios] = useState([]);
  const [meses, setMeses] = useState([]);
  const [anio, setAnio] = useState(null);
  const [mes, setMes] = useState(null);

  const [informe, setInforme] = useState([]);
  const [contrato, setContrato] = useState(null);
  const [numInforme, setNumInforme] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [dificultades, setDificultades] = useState("");
  const [valorPeriodo, setValorPeriodo] = useState(null);

  const [loading, setLoading] = useState(false);

  const cargarEmpleados = async () => {
    try {
      const data = await buscarEmpleados(search);
      setEmpleados(data);
    } catch {
      message.error("Error cargando empleados");
    }
  };

  useEffect(() => {
    if (modalOpen) cargarEmpleados();
  }, [modalOpen]); // eslint-disable-line

  const onSeleccionarEmpleado = (rec) => setEmpleadoSel(rec);

  const nombreEmpleado = useMemo(
    () => empleadoSel?.nombre_completo || "",
    [empleadoSel]
  );

  const onAceptarEmpleado = async () => {
    if (!empleadoSel) return message.warning("Seleccione un empleado");
    setModalOpen(false);
    try {
      const res = await getAniosEmpleado(empleadoSel.id_empleado);
      setAnios(res);
      setMeses([]);
      setAnio(null);
      setMes(null);
      setInforme([]);
      setContrato(null);
    } catch {
      message.error("Error cargando años del informe");
    }
  };

  const loadMeses = async (id_empleado, anioSel) => {
    try {
      const res = await getMesesEmpleado(id_empleado, anioSel);
      setMeses(res);
    } catch {
      message.error("Error cargando meses del informe");
    }
  };

  const generarInforme = async () => {
    if (!empleadoSel) return message.warning("Debe seleccionar un empleado");
    if (!anio || !mes) return message.warning("Debe seleccionar año y mes");
    setLoading(true);
    try {
      const res = await generarInformeEmpleado(
        empleadoSel.id_empleado,
        anio,
        mes
      );
      setInforme(res || []);
      setContrato(res?.length ? res[0] : null);
    } catch {
      message.error("Error generando el informe");
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async () => {
    if (!empleadoSel) return message.warning("Debe seleccionar un empleado");
    if (!informe?.length) return message.warning("Primero genere el informe.");
    const payload = {
      id_empleado: empleadoSel.id_empleado,
      numInforme,
      anio,
      mes,
      observaciones,
      dificultades,
      valorPeriodo,
    };
    setLoading(true);
    try {
      const blob = await exportarPdfEmpleado(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Informe_Actividades_${anio}_${mes}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      message.error("No se pudo exportar el PDF");
    } finally {
      setLoading(false);
    }
  };

  const camposCompletos =
    numInforme.trim() &&
    observaciones.trim() &&
    dificultades.trim() &&
    valorPeriodo !== null &&
    !isNaN(valorPeriodo);

  const puedeGenerar = empleadoSel && anio && mes;

  const columns = [
    { title: "Obligación contractual", dataIndex: "obligacion_contractual" },
    { title: "Descripción de actividades", dataIndex: "descripcion_actividades" },
    {
      title: "Evidencia",
      dataIndex: "url_evidencia",
      render: (text) => (
        <a href={text} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        variant="outlined"
        title={<Title level={4}>Ver Informes</Title>}
        style={{ margin: 20 }}
      >
        {/* --- BLOQUE EMPLEADO --- */}
        <Row gutter={16} align="bottom">
          <Col span={8}>
            <Text strong>Empleado</Text>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                icon={<UserSwitchOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Buscar Empleado
              </Button>
              {empleadoSel && (
                <Text type="secondary">
                  Seleccionado: <b>{nombreEmpleado}</b> — C.C.{" "}
                  {empleadoSel.cedula_empleado}
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* --- BLOQUE AÑO / MES / GENERAR --- */}
        {empleadoSel && (
          <Row gutter={16} align="bottom" style={{ marginTop: 25 }}>
            <Col span={5}>
              <Text strong>Año</Text>
              <Select
                placeholder="Seleccione año"
                value={anio}
                disabled={!empleadoSel}
                onChange={(v) => {
                  setAnio(v);
                  setMes(null);
                  if (empleadoSel) loadMeses(empleadoSel.id_empleado, v);
                }}
                style={{ width: "100%" }}
              >
                {anios.map((a) => (
                  <Option key={a} value={a}>
                    {a}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={5}>
              <Text strong>Mes</Text>
              <Select
                placeholder="Seleccione mes"
                value={mes}
                disabled={!empleadoSel || !anio}
                onChange={setMes}
                style={{ width: "100%" }}
              >
                {meses.map((m) => (
                  <Option key={m} value={m}>
                    {m}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={4}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={generarInforme}
                style={{ marginTop: 22 }}
                disabled={!puedeGenerar}
              >
                Generar informe
              </Button>
            </Col>

            <Col span={3}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setEmpleadoSel(null);
                  setAnios([]);
                  setMeses([]);
                  setAnio(null);
                  setMes(null);
                  setInforme([]);
                  setContrato(null);
                  setNumInforme("");
                  setObservaciones("");
                  setDificultades("");
                  setValorPeriodo(null);
                }}
                style={{ marginTop: 22 }}
              >
                Limpiar
              </Button>
            </Col>
          </Row>
        )}

        {/* --- RESULTADOS --- */}
        {informe.length > 0 && (
          <>
            <Card
              variant="outlined"
              style={{ marginTop: 20 }}
              title="Datos del contrato"
            >
              <p>
                <strong>No. Contrato:</strong> {contrato?.num_contrato}
              </p>
              <p>
                <strong>Nombre contratista:</strong> {contrato?.nombre_empleado}
              </p>
              <p>
                <strong>Entidad contratante:</strong>{" "}
                {contrato?.entidad_contratante}
              </p>
              <p>
                <strong>Supervisor ITM:</strong> {contrato?.supervisor_contrato}
              </p>
              <p>
                <strong>Valor total contrato:</strong>{" "}
                {formatMoneyCOP(contrato?.valor_contrato)}
              </p>
              <p>
                <strong>Duración:</strong> {contrato?.duracion_contrato}
              </p>
              <p>
                <strong>Fecha inicio actividades:</strong>{" "}
                {formatDateDDMMYYYY(contrato?.fecha_inicio_contrato)}
              </p>
              <p>
                <strong>Objeto contrato:</strong> {contrato?.objeto_contrato}
              </p>
            </Card>

            <Card
              variant="outlined"
              style={{ marginTop: 20 }}
              title="Observaciones y valor del periodo"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>No. Informe *</Text>
                  <Input
                    placeholder="Solo números"
                    value={numInforme}
                    onChange={(e) => setNumInforme(onlyDigits(e.target.value))}
                  />
                </Col>
                <Col span={8}>
                  <Text strong>Valor del periodo *</Text>
                  <Input
                    prefix="$ "
                    value={
                      valorPeriodo !== null
                        ? Number(valorPeriodo).toLocaleString("es-CO")
                        : ""
                    }
                    onChange={(e) =>
                      setValorPeriodo(toIntOrNull(e.target.value))
                    }
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Text strong>Observaciones *</Text>
                  <Input.TextArea
                    maxLength={100}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Dificultades *</Text>
                  <Input.TextArea
                    maxLength={100}
                    value={dificultades}
                    onChange={(e) => setDificultades(e.target.value)}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: 20 }}>
                <Col span={6}>
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={exportarPDF}
                    disabled={!camposCompletos}
                  >
                    Exportar PDF
                  </Button>
                </Col>
              </Row>
            </Card>

            <Card
              variant="outlined"
              style={{ marginTop: 20 }}
              title="Actividades relacionadas"
            >
              <Table
                rowKey={(r) => r.id_obligacion || r.obligacion_contractual}
                columns={columns}
                dataSource={informe}
                pagination={false}
              />
            </Card>
          </>
        )}
      </Card>

      {/* Modal empleados */}
      <Modal
        title="Buscar empleado"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onAceptarEmpleado}
        okText="Aceptar"
        cancelText="Cancelar"
        width={800}
        okButtonProps={{ disabled: !empleadoSel }}
      >
        <Space direction="vertical" style={{ width: "100%", marginBottom: 12 }}>
          <Input.Search
            placeholder="Buscar por nombre o apellido..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={cargarEmpleados}
            enterButton="Buscar"
          />
        </Space>

        <Table
          rowKey="id_empleado"
          dataSource={empleados}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "",
              dataIndex: "check",
              width: 50,
              align: "center",
              render: (_, record) => (
                <Checkbox
                  checked={empleadoSel?.id_empleado === record.id_empleado}
                  onChange={() => onSeleccionarEmpleado(record)}
                />
              ),
            },
            { title: "Cédula", dataIndex: "cedula_empleado", width: 140 },
            { title: "Nombre completo", dataIndex: "nombre_completo" },
          ]}
        />
      </Modal>
    </Spin>
  );
}
