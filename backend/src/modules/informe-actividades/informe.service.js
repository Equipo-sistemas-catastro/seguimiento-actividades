// backend/src/modules/informe-actividades/informe.service.js
const { pool } = require("../../config/db");
const q = require("./informe.queries");
const puppeteer = require("puppeteer");

exports.listAniosDisponibles = async (id_user) => {
  const { rows } = await pool.query(q.qAnios, [id_user]);
  return rows.map((r) => r.anio);
};

exports.listMesesDisponibles = async (id_user, anio) => {
  const { rows } = await pool.query(q.qMeses, [id_user, anio]);
  return rows.map((r) => r.mes);
};

exports.generarInformeActividades = async (id_user, anio, mes) => {
  try {
    const { rows } = await pool.query(q.qInforme, [id_user, anio, mes]);
    return rows;
  } catch (err) {
    console.error("❌ Error en generarInformeActividades:", err);
    throw err;
  }
};

// ===== Helpers PDF =====
function toFileURL(raw = "") {
  let s = (raw || "").trim();
  if (!s) return "";
  if (/^(https?:\/\/|file:\/\/|mailto:)/i.test(s)) return s;
  if (/^\\\\/.test(s)) {
    s = s.replace(/^\\\\+/, "").replace(/\\/g, "/");
    return `file:///${s}`;
  }
  if (/^[a-zA-Z]:\\/.test(s)) {
    s = s.replace(/\\/g, "/");
    return `file:///${s}`;
  }
  return `file:///${s.replace(/\\/g, "/")}`;
}
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function daysInMonth(y, m0) { return new Date(y, m0 + 1, 0).getDate(); }
function formatMoneyCOP(v){ const n=Number(v||0); return isFinite(n)?`$${n.toLocaleString("es-CO")}`:"$0"; }
function formatDateDDMMYYYY(value){
  if(!value) return "-";
  const d=new Date(value); if(isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function htmlTemplate(data) {
  const { numInforme="", anio="", mes="", observaciones="", dificultades="", valorPeriodo=0, contrato={}, informe=[] } = data;
  const mesIdx = (() => { const n=Number(mes); if(Number.isInteger(n)&&n>=1&&n<=12) return n-1; const i=MESES.indexOf(String(mes).toLowerCase()); return i>=0?i:0; })();
  const nombreMes = MESES[mesIdx];
  const diaFin = daysInMonth(Number(anio), mesIdx);

  const rows = informe.map(r => {
    const evidencia = (r.url_evidencia || "").trim();
    const href = evidencia ? toFileURL(evidencia) : "";
    const linkHtml = evidencia ? `<a href="${href}" target="_blank" rel="noreferrer">${evidencia}</a>` : "";
    return `
      <tr>
        <td>${r.obligacion_contractual || ""}</td>
        <td>${(r.descripcion_actividades || "").replace(/\n/g,"<br/>")}</td>
        <td class="link-cell">${linkHtml}</td>
      </tr>`;
  }).join("");

  return `
<!doctype html>
<html lang="es"><head><meta charset="utf-8"/>
<title>Informe actividades</title>
<style>
  @page { size: Letter; margin: 28pt; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color:#000; }
  table { width:100%; border-collapse:collapse; table-layout:fixed; }
  th, td { border:1px solid #000; padding:6pt; vertical-align:top; word-wrap:break-word; }
  th { font-weight:bold; background:#fff; text-align:left; }
  .center { text-align:center; }
  a { color:#00f; text-decoration:underline; }
  .small { font-size:9pt; }
  .wrap-pre { white-space: pre-wrap; }
</style></head>
<body>

<table>
  <tr>
    <th colspan="2" class="center">INFORME EJECUCION DE ACTIVIDADES No. ${numInforme || ""}</th>
    <th class="center">OBJETO DEL CONTRATO</th>
  </tr>
  <tr><th>No. CONTRATO</th><td>${contrato?.num_contrato || "-"}</td><td rowspan="7">${contrato?.objeto_contrato || "Sin descripción"}</td></tr>
  <tr><th>NOMBRE CONTRATISTA</th><td>${contrato?.nombre_empleado || "-"}</td></tr>
  <tr><th>ENTIDAD CONTRATANTE</th><td>${contrato?.entidad_contratante || "-"}</td></tr>
  <tr><th>SUPERVISOR ITM</th><td>${contrato?.supervisor_contrato || "-"}</td></tr>
  <tr><th>VALOR TOTAL DE CONTRATO</th><td>${formatMoneyCOP(contrato?.valor_contrato)}</td></tr>
  <tr><th>DURACION DEL CONTRATO</th><td>${contrato?.duracion_contrato || "-"}</td></tr>
  <tr><th>FECHA INICIO DE ACTIVIDADES</th><td>${formatDateDDMMYYYY(contrato?.fecha_inicio_contrato)}</td></tr>

  <tr>
    <th>ACTIVIDAD DEL CONTRATO: Obligaciones específicas según contrato</th>
    <th>DESCRIPCIÓN DE LA ACTIVIDAD: Ejecución o desarrollo de las obligaciones específicas según contrato</th>
    <th>DESCRIPCIÓN DE EVIDENCIA: Evidencias de las obligaciones del contrato</th>
  </tr>

  ${rows}

  <tr><td colspan="3">Declaro el cumplimiento del pago de aportes al Sistema de Seguridad Social.</td></tr>
  <tr><td colspan="3">Las actividades están evidencias y en poder del supervisor para dar cumplimiento con la respectiva cancelación de los honorarios.</td></tr>
  <tr><td colspan="3" class="wrap-pre"><b>OBSERVACIONES (En caso de tenerlas):</b>\n${(observaciones||"-").trim()}</td></tr>
  <tr><td colspan="3" class="wrap-pre"><b>DIFICULTADES (En caso de tenerlas):</b>\n${(dificultades||"-").trim()}</td></tr>
</table>

<div class="small" style="margin-top:16pt;">
  <b>PERIODO EJECUTADO:</b> Del 01 de ${nombreMes} al ${String(diaFin).padStart(2,"0")} de ${nombreMes} del ${anio}
</div>
<div class="small" style="margin-top:8pt;">
  <b>VALOR DEL PERIODO A COBRAR:</b> ${formatMoneyCOP(valorPeriodo)}
</div>
<div class="small" style="margin-top:24pt;">
  Para constancia se firma en Medellín a los días ${diaFin} del mes ${nombreMes} del año ${anio}.
</div>

<div style="margin-top:28pt;">
  <div style="border-bottom:1px solid #000;width:250pt;height:16pt;"></div>
  <div>${contrato?.nombre_empleado || "-"}</div>
  <div class="small">Firma del contratista</div>
</div>

<div style="margin-top:36pt;">
  <div style="border-bottom:1px solid #000;width:250pt;height:16pt;"></div>
  <div>Bibiana Patricia Gómez Pérez</div>
  <div class="small">Supervisor (a) Catastro</div>
</div>

</body></html>`;
}

exports.renderInformeActividadesPdf = async (payload) => {
  const html = htmlTemplate(payload);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox","--disable-setuid-sandbox"],
    executablePath: puppeteer.executablePath()
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      // 28pt ≈ 0.39in (Puppeteer espera pulgadas como number/string)
      margin: { top: 0.39, right: 0.39, bottom: 0.39, left: 0.39 },
    });
    await page.close();
    return pdf; // Buffer
  } finally {
    await browser.close();
  }
};
