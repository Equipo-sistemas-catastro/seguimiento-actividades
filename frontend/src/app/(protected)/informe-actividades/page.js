"use client";
import { useEffect, useState } from "react";
import {
  Card, Row, Col, Select, Button, Table, Input, Typography, App, Spin,
} from "antd";
import {
  FilePdfOutlined, SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import {
  getAniosInforme,
  getMesesInforme,
  generarInformeActividades,
} from "@/features/informe-actividades/service";

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

export default function InformeActividadesPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [anios, setAnios] = useState([]);
  const [meses, setMeses] = useState([]);
  const [anio, setAnio] = useState(null);
  const [mes, setMes] = useState(null);
  const [informe, setInforme] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [dificultades, setDificultades] = useState("");
  const [valorPeriodo, setValorPeriodo] = useState(null);
  const [numInforme, setNumInforme] = useState("");
  const [contrato, setContrato] = useState(null);

  useEffect(() => {
    getAniosInforme()
      .then(setAnios)
      .catch(() => message.error("Error cargando años del informe"));
  }, [message]);

  const loadMeses = async (anioSel) => {
    try {
      const res = await getMesesInforme(anioSel);
      setMeses(res);
    } catch {
      message.error("Error cargando meses del informe");
    }
  };

  const generarInforme = async () => {
    if (!anio || !mes)
      return message.warning("Debe seleccionar año y mes");
    setLoading(true);
    try {
      const res = await generarInformeActividades(anio, mes);
      setInforme(res || []);
      setContrato(res?.length ? res[0] : null);
    } catch {
      message.error("Error generando el informe");
    } finally {
      setLoading(false);
    }
  };

  /** ===== Exportar PDF (fetch binario, no Axios) ===== **/
  const exportarPDF = async () => {
    if (!informe?.length) return message.warning("Primero genere el informe.");

    const payload = {
      numInforme,
      anio,
      mes,
      observaciones,
      dificultades,
      valorPeriodo,
    };

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5012/api";

      const resp = await fetch(`${base}/informe-actividades/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Accept": "application/pdf",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP ${resp.status} - ${t}`);
      }

      const buf = await resp.arrayBuffer();
      const blob = new Blob([buf], { type: "application/pdf" });
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

  /** ===== UI ===== **/
  const camposCompletos =
    numInforme.trim() &&
    observaciones.trim() &&
    dificultades.trim() &&
    valorPeriodo !== null &&
    !isNaN(valorPeriodo);

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
      <Card variant="outlined" title={<Title level={4}>Informe de Actividades</Title>} style={{ margin: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Text strong>Año</Text>
            <Select
              placeholder="Seleccione año"
              value={anio}
              onChange={(v) => { setAnio(v); loadMeses(v); setMes(null); }}
              style={{ width: "100%" }}
            >
              {anios.map((a) => (<Option key={a} value={a}>{a}</Option>))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Mes</Text>
            <Select
              placeholder="Seleccione mes"
              value={mes}
              onChange={setMes}
              disabled={!anio}
              style={{ width: "100%" }}
            >
              {meses.map((m) => (<Option key={m} value={m}>{m}</Option>))}
            </Select>
          </Col>
          <Col span={6}>
            <Button type="primary" icon={<SearchOutlined />} onClick={generarInforme} style={{ marginTop: 22 }}>
              Generar informe
            </Button>
          </Col>
          <Col span={6}>
            <Button icon={<ReloadOutlined />} onClick={() => { setAnio(null); setMes(null); setInforme([]); }} style={{ marginTop: 22 }}>
              Limpiar
            </Button>
          </Col>
        </Row>

        {informe.length > 0 && (
          <>
            <Card variant="outlined" style={{ marginTop: 20 }} title="Datos del contrato">
              <p><strong>No. Contrato:</strong> {contrato?.num_contrato}</p>
              <p><strong>Nombre contratista:</strong> {contrato?.nombre_empleado}</p>
              <p><strong>Entidad contratante:</strong> {contrato?.entidad_contratante}</p>
              <p><strong>Supervisor ITM:</strong> {contrato?.supervisor_contrato}</p>
              <p><strong>Valor total contrato:</strong> {formatMoneyCOP(contrato?.valor_contrato)}</p>
              <p><strong>Duración:</strong> {contrato?.duracion_contrato}</p>
              <p><strong>Fecha inicio actividades:</strong> {formatDateDDMMYYYY(contrato?.fecha_inicio_contrato)}</p>
              <p><strong>Objeto contrato:</strong> {contrato?.objeto_contrato}</p>
            </Card>

            <Card variant="outlined" style={{ marginTop: 20 }} title="Observaciones y valor del periodo">
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>No. Informe *</Text>
                  <Input placeholder="Solo números" value={numInforme} onChange={(e) => setNumInforme(onlyDigits(e.target.value))} />
                </Col>
                <Col span={8}>
                  <Text strong>Valor del periodo *</Text>
                  <Input
                    prefix="$ "
                    value={valorPeriodo !== null ? Number(valorPeriodo).toLocaleString("es-CO") : ""}
                    onChange={(e) => setValorPeriodo(toIntOrNull(e.target.value))}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={12}>
                  <Text strong>Observaciones *</Text>
                  <Input.TextArea maxLength={100} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                </Col>
                <Col span={12}>
                  <Text strong>Dificultades *</Text>
                  <Input.TextArea maxLength={100} value={dificultades} onChange={(e) => setDificultades(e.target.value)} />
                </Col>
              </Row>

              <Row style={{ marginTop: 20 }}>
                <Col span={6}>
                  <Button type="primary" icon={<FilePdfOutlined />} onClick={exportarPDF} disabled={!camposCompletos}>
                    Exportar PDF
                  </Button>
                </Col>
              </Row>
            </Card>

            <Card variant="outlined" style={{ marginTop: 20 }} title="Actividades relacionadas">
              <Table rowKey={(r) => r.id_obligacion || r.obligacion_contractual} columns={columns} dataSource={informe} pagination={false} />
            </Card>
          </>
        )}
      </Card>
    </Spin>
  );
}
