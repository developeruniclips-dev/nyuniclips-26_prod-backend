const { pool } = require('../config/db');

const UserRoleModel = {
    assignRole: (userId, roleId) => {
        return pool.query(
            "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
            [userId, roleId]
        );
    },

    getRolesById: (userId) => {
        return pool.query(
            `SELECT roles.name FROM roles
             JOIN user_roles ON roles.id = user_roles.role_id
             WHERE user_roles.user_id = ?`,
            [userId]
        );
    }
};

module.exports = { UserRoleModel };
