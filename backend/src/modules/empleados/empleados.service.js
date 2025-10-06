const { pool } = require('../../config/db');
const {
  buildListEmpleadosQuery,
  buildCountEmpleadosQuery,
  INSERT_EMPLEADO,
  GET_EMPLEADO_BY_ID,
  GET_PERFILES_ACTIVOS,
  GET_PERFILES_HISTORIAL,
  GET_COMPONENTES_ACTIVOS,
  GET_COMPONENTES_HISTORIAL,
  buildUpdateEmpleadoQuery,
  VERIFY_EMPLEADO_ACTIVO,
  VERIFY_PERFIL_EXISTS,
  CLOSE_PERFIL_ACTIVO,
  INSERT_EMPL_PERFIL,
  VERIFY_COMPONENTE_EXISTS,
  CLOSE_COMPONENTE_ACTIVO,
  INSERT_EMPL_COMPONENTE,
  // nuevos:
  GET_PERFILES_ALL,
  GET_COMPONENTES_ALL,
} = require('./empleados.queries');

class EmpleadosService {
  // ===== LISTAR =====
  static async listar(params) {
    const client = await pool.connect();
    try {
      const { text, vals, page, pageSize } = buildListEmpleadosQuery(params);
      const listRes = await client.query(text, vals);
      const countQ = buildCountEmpleadosQuery(params);
      const countRes = await client.query(countQ.text, countQ.vals);

      return {
        data: listRes.rows,
        total: countRes.rows[0]?.total ?? 0,
        page,
        pageSize,
      };
    } finally {
      client.release();
    }
  }

  // ===== CREAR =====
  static async crear(payload, userId) {
    const vals = [
      payload.cedula_empleado,
      payload.primer_nombre_empl,
      payload.segundo_nombre_empl || null,
      payload.primer_apellido_empl,
      payload.segundo_apellido_empl || null,
      payload.fecha_nacimiento_empl || null,
      payload.email_empleado,
      payload.movil_empleado || null,
      payload.estado || null,
      userId,
    ];
    const res = await pool.query(INSERT_EMPLEADO, vals);
    return res.rows[0];
  }

  // ===== DETALLE =====
  static async obtener(idEmpleado) {
    const client = await pool.connect();
    try {
      const emp = await client.query(GET_EMPLEADO_BY_ID, [idEmpleado]);
      if (emp.rowCount === 0) return null;

      const [perfAct, perfHist, compAct, compHist] = await Promise.all([
        client.query(GET_PERFILES_ACTIVOS, [idEmpleado]),
        client.query(GET_PERFILES_HISTORIAL, [idEmpleado]),
        client.query(GET_COMPONENTES_ACTIVOS, [idEmpleado]),
        client.query(GET_COMPONENTES_HISTORIAL, [idEmpleado]),
      ]);

      return {
        empleado: emp.rows[0],
        perfiles_activos: perfAct.rows,
        perfiles_historial: perfHist.rows,
        componentes_activos: compAct.rows,
        componentes_historial: compHist.rows,
      };
    } finally {
      client.release();
    }
  }

  // ===== UPDATE =====
  static async actualizar(idEmpleado, payload, userId) {
    const q = buildUpdateEmpleadoQuery(idEmpleado, payload, userId);
    if (!q) return null;
    const res = await pool.query(q.text, q.vals);
    return res.rows[0] || null;
  }

  // ===== ASIGNAR PERFIL =====
  static async asignarPerfil(idEmpleado, idPerfil, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const e = await client.query(VERIFY_EMPLEADO_ACTIVO, [idEmpleado]);
      if (e.rowCount === 0) throw new Error('Empleado inactivo o no existe');

      const p = await client.query(VERIFY_PERFIL_EXISTS, [idPerfil]);
      if (p.rowCount === 0) throw new Error('Perfil no existe');

      await client.query(CLOSE_PERFIL_ACTIVO, [idEmpleado, userId]);
      const ins = await client.query(INSERT_EMPL_PERFIL, [idEmpleado, idPerfil, userId]);

      await client.query('COMMIT');
      return ins.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ===== ASIGNAR COMPONENTE =====
  static async asignarComponente(idEmpleado, idComponente, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const e = await client.query(VERIFY_EMPLEADO_ACTIVO, [idEmpleado]);
      if (e.rowCount === 0) throw new Error('Empleado inactivo o no existe');

      const c = await client.query(VERIFY_COMPONENTE_EXISTS, [idComponente]);
      if (c.rowCount === 0) throw new Error('Componente no existe');

      await client.query(CLOSE_COMPONENTE_ACTIVO, [idEmpleado, userId]);
      const ins = await client.query(INSERT_EMPL_COMPONENTE, [idEmpleado, idComponente, userId]);

      await client.query('COMMIT');
      return ins.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ===== NUEVOS: Catálogos =====
  static async listarPerfilesAll() {
    const { rows } = await pool.query(GET_PERFILES_ALL);
    return rows;
  }
  static async listarComponentesAll() {
    const { rows } = await pool.query(GET_COMPONENTES_ALL);
    return rows;
  }
}

module.exports = EmpleadosService;
