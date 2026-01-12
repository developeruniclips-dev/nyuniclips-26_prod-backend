const { pool } = require('../config/db');

const UserModel = {
    
    findAll: () => {
        return pool.query("SELECT * FROM users");
    },

    findById: (id) => {
        return pool.query("SELECT * FROM users WHERE id= ?", [id]);
    },

    create: (fname, lname, email, password = null, isScholar = 0) => {
        return pool.query(
            "INSERT INTO users (fname, lname, email, password, isScholar) VALUES (?, ?, ?, ?, ?)",
            [fname, lname, email, password, isScholar]
        );
    },

    update: (id, fname, lname, email) => {
        return pool.query(
            "UPDATE users SET fname = ?, lname = ?, email = ? WHERE id = ?",
            [fname, lname, email, id]
        );
    },

    delete: async (id) => {
        // Delete in order to respect foreign key constraints
        await pool.query("DELETE FROM videos WHERE scholar_user_id = ?", [id]);
        await pool.query("DELETE FROM scholar_subjects WHERE scholar_user_id = ?", [id]);
        await pool.query("DELETE FROM scholar_profile WHERE user_id = ?", [id]);
        await pool.query("DELETE FROM user_roles WHERE user_id = ?", [id]);
        await pool.query("DELETE FROM purchases WHERE user_id = ?", [id]);
        return pool.query("DELETE FROM users WHERE id = ?", [id]);
    },

    findByEmail: (email) => {
        return pool.query("SELECT * FROM users WHERE email = ?", [email]);
    }
};

module.exports = { UserModel };
