const ALLOWED_SORT = new Set([
  "id_componente",
  "componente",
  "fecha_auditoria",
]);

function normalizePagination({ page, pageSize, limit, offset }) {
  let _limit, _offset, _page, _pageSize;
  if (Number.isInteger(limit) || Number.isInteger(offset)) {
    _limit = Number(limit) > 0 ? Number(limit) : 10;
    _offset = Number(offset) >= 0 ? Number(offset) : 0;
    _page = Math.floor(_offset / _limit) + 1;
    _pageSize = _limit;
  } else {
    _page = Number(page) > 0 ? Number(page) : 1;
    _pageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
    _limit = _pageSize;
    _offset = (_page - 1) * _pageSize;
  }
  return { limit: _limit, offset: _offset, page: _page, pageSize: _pageSize };
}

function buildListComponentesQuery({ q, sortBy, sortDir, page, pageSize, limit, offset }) {
  const vals = [];
  const where = [];

  if (q && String(q).trim() !== "") {
    vals.push(`%${q.trim()}%`);
    where.push(`(componente ILIKE $${vals.length})`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = ALLOWED_SORT.has(sortBy) ? sortBy : "id_componente";
  const orderDir = String(sortDir || "").toLowerCase() === "asc" ? "ASC" : "DESC";

  const { limit: _limit, offset: _offset, page: _page, pageSize: _pageSize } =
    normalizePagination({ page, pageSize, limit, offset });

  vals.push(_limit);
  const pLimit = `$${vals.length}`;
  vals.push(_offset);
  const pOffset = `$${vals.length}`;

  const text = `
    SELECT id_componente, componente, id_user_auditoria, fecha_auditoria
      FROM tbl_componentes
      ${whereSQL}
     ORDER BY ${orderBy} ${orderDir}
     LIMIT ${pLimit} OFFSET ${pOffset}
  `;

  return { text, vals, page: _page, pageSize: _pageSize };
}

function buildCountComponentesQuery({ q }) {
  const vals = [];
  const where = [];

  if (q && String(q).trim() !== "") {
    vals.push(`%${q.trim()}%`);
    where.push(`(componente ILIKE $${vals.length})`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const text = `SELECT COUNT(*)::INT AS total FROM tbl_componentes ${whereSQL}`;
  return { text, vals };
}

module.exports = {
  ALLOWED_SORT,
  normalizePagination,
  buildListComponentesQuery,
  buildCountComponentesQuery,
};
