const { pool } = require("../../config/db");
const {
  buildListComponentesQuery,
  buildCountComponentesQuery,
} = require("./componentes.queries");

class ComponentesService {
  static async listar(params) {
    const client = await pool.connect();
    try {
      const listQ = buildListComponentesQuery(params);
      const { rows } = await client.query(listQ.text, listQ.vals);

      const countQ = buildCountComponentesQuery(params);
      const countRes = await client.query(countQ.text, countQ.vals);
      const total = countRes.rows?.[0]?.total ?? 0;

      return {
        items: rows,
        total,
        page: listQ.page,
        pageSize: listQ.pageSize,
      };
    } finally {
      client.release();
    }
  }
}

module.exports = ComponentesService;
