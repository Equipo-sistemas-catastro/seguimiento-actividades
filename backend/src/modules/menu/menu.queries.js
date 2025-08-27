module.exports = {
  getMenusByRole(idRole) {
    return {
      name: 'menu_by_role',
      text: `
        SELECT m.id_menu, m.code, m.descripcion, m.orden
        FROM tbl_rol_menu_actividades rm
        JOIN tbl_menu_app_actividades m ON m.id_menu = rm.id_menu
        WHERE rm.id_role = $1
        ORDER BY COALESCE(m.orden, 999), m.id_menu;`,
      values: [idRole]
    };
  },
  hasAccessToCode(idRole, code) {
    return {
      name: 'menu_has_access_to_code',
      text: `
        SELECT 1
        FROM tbl_rol_menu_actividades rm
        JOIN tbl_menu_app_actividades m ON m.id_menu = rm.id_menu
        WHERE rm.id_role = $1
          AND UPPER(TRIM(m.code)) = UPPER(TRIM($2))
        LIMIT 1;`,
      values: [idRole, code]
    };
  }
};
