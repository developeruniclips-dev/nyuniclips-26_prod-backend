const { pool } = require('../config/db');

const ScholarProfileModel = {
    create: (userId, university, degree, year, taskCardUrl = null) => {
        return pool.query(
            "INSERT INTO scholar_profile (user_id, university, degree, year, task_card_url) VALUES (?, ?, ?, ?, ?)",
            [userId, university, degree, year, taskCardUrl]
        );
    },

    findByUserId: (userId) => {
        return pool.query(
            "SELECT * FROM scholar_profile WHERE user_id = ?",
            [userId]
        );
    },

    updateTaskCard: (userId, taskCardUrl) => {
        return pool.query(
            "UPDATE scholar_profile SET task_card_url = ? WHERE user_id = ?",
            [taskCardUrl, userId]
        );
    }
};

module.exports = { ScholarProfileModel };
