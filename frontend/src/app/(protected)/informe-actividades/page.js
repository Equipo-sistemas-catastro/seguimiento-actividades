"use client";
import { useEffect, useState } from "react";
import {
  Card, Row, Col, Select, Button, Table, Input, Typography, App, Spin,
} from "antd";
import {
  FilePdfOutlined, SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAniosInforme,
  getMesesInforme,
  generarInformeActividades,
} from "@/features/informe-actividades/service";

const { Title, Text } = Typography;
const { Option } = Select;

/** ===== Helpers ===== **/
const formatMoneyCOP = (value) =>
  `$${Number(value || 0).toLocaleString("es-CO")}`;
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

const MESES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

function normalizarMes(mes) {
  if (mes === null || mes === undefined) return { idx: null, nombre: "" };
  if (typeof mes === "number") return { idx: mes - 1, nombre: MESES[mes - 1] };
  const s = String(mes).trim().toLowerCase();
  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= 12)
    return { idx: n - 1, nombre: MESES[n - 1] };
  const idx = MESES.indexOf(s);
  return { idx, nombre: idx >= 0 ? MESES[idx] : s };
}
function daysInMonth(year, monthIdx0) {
  return new Date(year, monthIdx0 + 1, 0).getDate();
}

/** Convierte rutas UNC y locales a file:/// */
function toFileURL(raw = "") {
  let s = (raw || "").trim();
  if (!s) return "";
  if (/^(https?:\/\/|file:\/\/)/i.test(s)) return s;
  if (/^\\\\/.test(s)) {
    s = s.replace(/^\\\\+/, "").replace(/\\/g, "/");
    return `file:///${s}`;
  }
  if (/^[a-zA-Z]:\\/.test(s)) {
    s = s.replace(/\\/g, "/");
    return `file:///${s}`;
  }
  return `file:///${s}`;
}

/** ===== Page ===== **/
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

  /** ===== Exportar PDF ===== **/
  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
    const marginTop = 28.6, marginLeft = 28.35, marginRight = 28.35, marginBottom = 28.35;
    const usableWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = marginTop;

    /** === Tabla principal === **/
    const head = [
      [
        { content: `INFORME EJECUCION DE ACTIVIDADES No. ${numInforme}`, colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
        { content: "OBJETO DEL CONTRATO", styles: { halign: "center", fontStyle: "bold" } },
      ],
      [
        { content: "No. CONTRATO", styles: { fontStyle: "bold" } },
        { content: contrato?.num_contrato || "-", styles: { fontStyle: "normal" } },
        {
          content: contrato?.objeto_contrato || "Sin descripción",
          rowSpan: 7,
          styles: { valign: "top", halign: "left", fontStyle: "normal" },
        },
      ],
      [
        { content: "NOMBRE CONTRATISTA", styles: { fontStyle: "bold" } },
        { content: contrato?.nombre_empleado || "-", styles: { fontStyle: "normal" } }, null,
      ],
      [
        { content: "ENTIDAD CONTRATANTE", styles: { fontStyle: "bold" } },
        { content: contrato?.entidad_contratante || "-", styles: { fontStyle: "normal" } }, null,
      ],
      [
        { content: "SUPERVISOR ITM", styles: { fontStyle: "bold" } },
        { content: contrato?.supervisor_contrato || "-", styles: { fontStyle: "normal" } }, null,
      ],
      [
        { content: "VALOR TOTAL DE CONTRATO", styles: { fontStyle: "bold" } },
        { content: formatMoneyCOP(contrato?.valor_contrato), styles: { fontStyle: "normal" } }, null,
      ],
      [
        { content: "DURACION DEL CONTRATO", styles: { fontStyle: "bold" } },
        { content: contrato?.duracion_contrato || "-", styles: { fontStyle: "normal" } }, null,
      ],
      [
        { content: "FECHA INICIO DE ACTIVIDADES", styles: { fontStyle: "bold" } },
        { content: formatDateDDMMYYYY(contrato?.fecha_inicio_contrato), styles: { fontStyle: "normal" } }, null,
      ],
      [
        {
          content: "ACTIVIDAD DEL CONTRATO: Obligaciones específicas según contrato",
          styles: { halign: "left", fontStyle: "bold" },
        },
        {
          content: "DESCRIPCIÓN DE LA ACTIVIDAD: Ejecución o desarrollo de las obligaciones específicas según contrato",
          styles: { halign: "left", fontStyle: "bold" },
        },
        {
          content: "DESCRIPCIÓN DE EVIDENCIA: Evidencias de las obligaciones del contrato",
          styles: { halign: "left", fontStyle: "bold" },
        },
      ],
    ];

    const body = (informe || []).map((r) => [
      { content: r.obligacion_contractual },
      { content: r.descripcion_actividades },
      //{ content: "", link: toFileURL(r.url_evidencia || ""), original: r.url_evidencia || "" },
      { content: r.url_evidencia || "" },
    ]);

    body.push([{ content: "Declaro el cumplimiento del pago de aportes al Sistema de Seguridad Social.", colSpan: 3 }]);
    body.push([{ content: "Las actividades están evidencias y en poder del supervisor para dar cumplimiento con la respectiva cancelación de los honorarios.", colSpan: 3 }]);
    body.push([{ content: `OBSERVACIONES (En caso de tenerlas):\n${(observaciones || "-").trim()}`, colSpan: 3 }]);
    body.push([{ content: `DIFICULTADES (En caso de tenerlas):\n${(dificultades || "-").trim()}`, colSpan: 3 }]);

    // En la configuración de autoTable:
    autoTable(doc, {
      startY: y,
      theme: "grid",
      head,
      body,
      showHead: 'firstPage',
      styles: { fontSize: 9, cellPadding: 4, lineColor: [0,0,0], lineWidth: 0.2, textColor: 0, valign: "top" },
      headStyles: { fillColor: [255,255,255], textColor: [0,0,0] },
      columnStyles: {
        0: { cellWidth: usableWidth / 3, overflow: "linebreak" },
        1: { cellWidth: usableWidth / 3, overflow: "linebreak" },
        2: { cellWidth: usableWidth / 3, overflow: "linebreak" },
      },
      margin: { left: marginLeft, right: marginRight },

      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2 && !data.cell.colSpan) {
          const raw = data.row.raw[2];
          const text = (raw?.original ?? "").toString().trim();
          if (!text) return;
          const w = data.cell.width - 4;
          const lines = doc.splitTextToSize(text, w);
          data.row.raw[2]._lines = lines;
          data.cell.text = [""]; // Evita texto negro
        }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 2 && !data.cell.colSpan) {
          const text = (data.cell.raw || "").trim();
          if (!text) return;

          const url = toFileURL(text);
          const x = data.cell.x + 2;
          const y = data.cell.y + 10;
          const w = data.cell.width - 4;

          // Ajuste de líneas
          const lines = doc.splitTextToSize(text, w);
          let yPos = y;

          // Texto azul y subrayado visible
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 255);
          doc.setDrawColor(0, 0, 255);
          for (const line of lines) {
            const lw = doc.getTextWidth(line);
            doc.text(line, x, yPos);
            doc.line(x, yPos + 1, x + lw, yPos + 1);
            yPos += 12;
          }
          doc.setTextColor(0, 0, 0);

          // 🔹 Inyectar hipervínculo real en el PDF (nivel bajo)
          try {
            const page = doc.internal.getCurrentPageInfo().pageContext;
            const pdf = doc.internal.stream;
            const linkRect = [
              x,
              doc.internal.pageSize.getHeight() - (y + lines.length * 12),
              x + w,
              doc.internal.pageSize.getHeight() - (y - 4),
            ];
            // crear anotación
            doc.internal.write(
              `<< /Type /Annot /Subtype /Link /Rect [${linkRect.join(" ")}] /Border [0 0 0] /A << /S /URI /URI (${url}) >> >>`
            );
          } catch (err) {
            console.warn("No se pudo crear el enlace PDF directo:", err);
          }
        }
      },
    });

/*
    // ======= Hipervínculos de evidencia post-render (ajuste de altura real) =======
    try {
      const table = doc.lastAutoTable;
      if (table && Array.isArray(table.body)) {
        for (const row of table.body) {
          const cell = row.cells[2];
          if (!cell) continue;
          const raw = row.raw[2];
          const text = (raw?.original ?? raw?.content ?? raw ?? "").toString().trim();
          const url = raw?.link || toFileURL(text);
          if (!text) continue;

          const x = cell.x + 2;
          let yPos = cell.y + 10;
          const w = cell.width - 4;

          // recalculamos líneas para saber altura
          const lines = doc.splitTextToSize(text, w);
          const textHeight = lines.length * 12 + 4;

          // aumentamos la altura de la celda (y por tanto la fila)
          if (textHeight > cell.height) {
            cell.height = textHeight;
          }

          // repintar el texto azul en la posición ajustada
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 255);
          doc.setDrawColor(0, 0, 255);

          for (const line of lines) {
            const lw = doc.getTextWidth(line);
            doc.text(line, x, yPos);
            doc.line(x, yPos + 1, x + lw, yPos + 1);
            doc.link(x, yPos - 9, lw, 12, { url });
            yPos += 12;
          }

          // limpiar texto negro original (sobrepintando con fondo blanco)
          doc.setFillColor(255, 255, 255);
          doc.rect(cell.x + 1, cell.y + 1, cell.width - 2, cell.height - 2, "F");

          doc.setTextColor(0, 0, 255);
          yPos = cell.y + 10;
          for (const line of lines) {
            const lw = doc.getTextWidth(line);
            doc.text(line, x, yPos);
            doc.line(x, yPos + 1, x + lw, yPos + 1);
            doc.link(x, yPos - 9, lw, 12, { url });
            yPos += 12;
          }

          doc.setTextColor(0, 0, 0);
          doc.setDrawColor(0, 0, 0);
        }
      }
    } catch (err) {
      console.error("Error aplicando hipervínculos:", err);
    }
*/
    /** === Bloque final (sin cambios) === */
    let yEnd = doc.lastAutoTable.finalY + 30;
    const { idx: mesIdx, nombre: nombreMes } = normalizarMes(mes);
    const diaInicio = 1;
    const diaFin = daysInMonth(Number(anio), mesIdx);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const label = "PERIODO EJECUTADO:";
    doc.text(label, marginLeft, yEnd);
    const labelW = doc.getTextWidth(label + " ");
    doc.setFont("helvetica", "normal");
    doc.text(
      `Del ${String(diaInicio).padStart(2, "0")} de ${nombreMes} al ${String(diaFin).padStart(2, "0")} de ${nombreMes} del ${anio}`,
      marginLeft + labelW,
      yEnd
    );

    yEnd += 18;
    doc.setFont("helvetica", "bold");
    doc.text("VALOR DEL PERIODO A COBRAR:", marginLeft, yEnd);
    const valW = doc.getTextWidth("VALOR DEL PERIODO A COBRAR: ");
    doc.setFont("helvetica", "normal");
    doc.text(formatMoneyCOP(valorPeriodo), marginLeft + valW, yEnd);

    const alturaBloqueProtegido = 240;
    if (yEnd + 36 + alturaBloqueProtegido > pageHeight - marginBottom) {
      doc.addPage();
      yEnd = marginTop;
    }

    yEnd += 36;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Para constancia se firma en Medellín a los días ${diaFin} del mes ${nombreMes} del año ${anio}.`, marginLeft, yEnd);

    yEnd += 40;
    doc.line(marginLeft, yEnd, marginLeft + 250, yEnd);
    yEnd += 14;
    doc.text(contrato?.nombre_empleado || "-", marginLeft, yEnd);
    yEnd += 14;
    doc.text("Firma del contratista", marginLeft, yEnd);

    yEnd += 80;
    doc.line(marginLeft, yEnd, marginLeft + 250, yEnd);
    yEnd += 14;
    doc.text("Bibiana Patricia Gómez Pérez", marginLeft, yEnd);
    yEnd += 14;
    doc.text("Supervisor (a) Catastro", marginLeft, yEnd);

    doc.save(`Informe_Actividades_${anio}_${mes}.pdf`);
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
