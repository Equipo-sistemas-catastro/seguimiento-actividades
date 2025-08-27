module.exports = {
  list(q, page, pageSize) {
    page = Number(page) || 1;
    pageSize = Math.min(Number(pageSize) || 10, 100);
    const off = (page - 1) * pageSize;

    const values = [];
    let where = 'WHERE 1=1';
    if (q) {
      values.push(`%${q}%`);
      where += ` AND (TRIM(name_user) ILIKE $${values.length} OR TRIM(email_user) ILIKE $${values.length})`;
    }

    return {
      data: {
        name: 'users_list',
        text: `
          SELECT id_user, TRIM(name_user) AS name, TRIM(email_user) AS email, id_perfil
          FROM tbl_users
          ${where}
          ORDER BY name ASC
          LIMIT ${pageSize} OFFSET ${off};`,
        values
      },
      count: {
        name: 'users_count',
        text: `SELECT COUNT(*)::int AS total FROM tbl_users ${where};`,
        values
      },
      page, pageSize
    };
  }
};
