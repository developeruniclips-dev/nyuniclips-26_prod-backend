const { pool } = require("../config/db");

const ScholarSubjectModel = {

    requestSubject: (scholar_id, subject_id, subject_name, degree, expertise) => {
        return pool.query(
            "INSERT INTO scholar_subjects (scholar_user_id, subject_id, subject_name, degree, expertise, approved) VALUES (?, ?, ?, ?, ?, 0)",
            [scholar_id, subject_id, subject_name, degree, expertise]
        );
    },

    checkExistingRequest: (scholar_user_id, subject_id) => {
        return pool.query(
            "SELECT * FROM scholar_subjects WHERE scholar_user_id = ? AND subject_id = ?",
            [scholar_user_id, subject_id]
        );
    },

    approveSubject: (scholar_user_id, subject_id) => {
        return pool.query(
            "UPDATE scholar_subjects SET approved = 1 WHERE scholar_user_id = ? AND subject_id = ?",
            [scholar_user_id, subject_id]
        );
    },

    isApproved: (scholar_user_id, subject_id) => {
        return pool.query(
            "SELECT approved FROM scholar_subjects WHERE scholar_user_id = ? AND subject_id = ?",
            [scholar_user_id, subject_id]
        );
    }, 

    getScholarSubjectsStatus: (scholar_user_id) => {
        return pool.query(
            "SELECT subject_id, subject_name, degree, expertise, approved FROM scholar_subjects WHERE scholar_user_id = ?",
            [scholar_user_id]
        );
    },

    getAllScholarSubjects: (scholar_user_id) => {
        return pool.query(
            "SELECT * FROM scholar_subjects WHERE scholar_user_id = ? ORDER BY created_at DESC",
            [scholar_user_id]
        );
    }   
};

module.exports = { ScholarSubjectModel };
