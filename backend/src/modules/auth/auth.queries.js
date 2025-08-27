module.exports = {
  findUserForLogin(email, password) {
    return {
      name: 'auth_find_user_for_login',
      text: `
        SELECT 
          u.id_user,
          TRIM(u.name_user)  AS name,
          TRIM(u.email_user) AS email,
          u.id_role_user     AS id_role_user
        FROM tbl_users u
        WHERE TRIM(u.email_user) = $1
          AND TRIM(u.user_password) = $2
        LIMIT 1;`,
      values: [email, password]
    };
  },
  getUserById(id) {
    return {
      name: 'auth_get_user_by_id',
      text: `
        SELECT 
          u.id_user,
          TRIM(u.name_user)  AS name,
          TRIM(u.email_user) AS email,
          u.id_role_user     AS id_role_user
        FROM tbl_users u
        WHERE u.id_user = $1
        LIMIT 1;`,
      values: [id]
    };
  }
};
