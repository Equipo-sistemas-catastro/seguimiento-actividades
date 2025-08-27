// SQL del módulo Obligaciones
const buildList = (q, page, pageSize) => {
  page = Number(page) || 1;
  pageSize = Math.min(Number(pageSize) || 10, 100);
  const off = (page - 1) * pageSize;

  const values = [];
  let where = 'WHERE 1=1';
  if (q) {
    values.push(`%${q}%`);
    where += ` AND obligacion_contractual ILIKE $${values.length}`;
  }

  return {
    data: {
      name: 'oblig_list',
      text: `
        SELECT id_obligacion, obligacion_contractual, id_user_auditoria, fecha_auditoria
        FROM tbl_obligacion_contractual
        ${where}
        ORDER BY id_obligacion DESC
        LIMIT ${pageSize} OFFSET ${off};`,
      values
    },
    count: {
      name: 'oblig_count',
      text: `
        SELECT COUNT(*)::int AS total
        FROM tbl_obligacion_contractual
        ${where};`,
      values
    },
    page, pageSize
  };
};

module.exports = {
  list: buildList,

  getById(id) {
    return {
      name: 'oblig_get',
      text: `
        SELECT id_obligacion, obligacion_contractual, id_user_auditoria, fecha_auditoria
        FROM tbl_obligacion_contractual
        WHERE id_obligacion = $1;`,
      values: [id]
    };
  },

  insert(obligacion_contractual, userId) {
    return {
      name: 'oblig_insert',
      text: `
        INSERT INTO tbl_obligacion_contractual (obligacion_contractual, id_user_auditoria, fecha_auditoria)
        VALUES ($1, $2, NOW())
        RETURNING id_obligacion;`,
      values: [obligacion_contractual, userId]
    };
  },

  update(id, obligacion_contractual, userId) {
    return {
      name: 'oblig_update',
      text: `
        UPDATE tbl_obligacion_contractual
           SET obligacion_contractual = $2,
               id_user_auditoria = $3,
               fecha_auditoria = NOW()
         WHERE id_obligacion = $1;`,
      values: [id, obligacion_contractual, userId]
    };
  },

  remove(id) {
    return {
      name: 'oblig_delete',
      text: `DELETE FROM tbl_obligacion_contractual WHERE id_obligacion = $1;`,
      values: [id]
    };
  },

  // Perfiles que referencian una obligación
  perfilesByObligacion(idObligacion) {
    return {
      name: 'oblig_perfiles',
      text: `
        SELECT p.id_perfil, p.perfil
          FROM tbl_perfil_obligaciones po
          JOIN tbl_perfiles p ON p.id_perfil = po.id_perfil
         WHERE po.id_obligacion = $1
         ORDER BY p.perfil;`,
      values: [idObligacion]
    };
  }
};
