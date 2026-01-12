const { UserModel } = require('../models/User');
const { pool } = require('../config/db');

//get all users
const getAllUsers = async(req, res) => {
    try {
        // Get users with their scholar status by joining with scholar_profile and user_roles
        const [rows] = await pool.query(`
            SELECT 
                u.id, 
                u.fname, 
                u.lname, 
                u.email, 
                u.created_at,
                CASE 
                    WHEN sp.id IS NOT NULL THEN 1
                    WHEN EXISTS (
                        SELECT 1 FROM user_roles ur 
                        JOIN roles r ON ur.role_id = r.id 
                        WHERE ur.user_id = u.id AND r.name = 'Scholar'
                    ) THEN 1 
                    ELSE 0 
                END as is_scholar
            FROM users u
            LEFT JOIN scholar_profile sp ON u.id = sp.user_id
            ORDER BY u.id ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//get one user 
const getOneUser = async(req, res) => {
    try {
        const id = Number(req.params.id);
        if(!id) {
            return res.status(404).json({message: 'User ID not found'});
        }
        const [row] = await UserModel.findById(id);
        res.status(201).json(row);
    } catch (error) {
        console.error("Error fetching user", error);
        res.status(500).json({message: "Server error fetching user"});
    }
};

//update user
const updateUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { fname, lname, email } = req.body;

        const [existing] = await UserModel.findById(id);

        if (existing.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        await UserModel.update(id, fname, lname, email);

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error updating user" });
    }
};

const deleteUser = async(req, res) => {
    try {
        const id = Number(req.params.id);

        const [existing] = await UserModel.findById(id);
        if (existing.length === 0) return res.status(404).json({ message: "User not found" });

        await UserModel.delete(id);
        res.json({ message: "User deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting the user", error);
        res.status(500).json({message: "Server Error deleting the user"});
    }
};

// Get user profile with roles
const getUserProfile = async (req, res) => {
    try {
        console.log('getUserProfile called');
        console.log('req.user:', req.user);
        
        if (!req.user || !req.user.id) {
            console.error('No user ID in request');
            return res.status(400).json({ message: "Invalid token: user ID missing" });
        }
        
        const userId = req.user.id;
        console.log('Fetching profile for userId:', userId);
        
        const [userRows] = await UserModel.findById(userId);
        if (userRows.length === 0) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: "User not found" });
        }
        
        const user = userRows[0];
        console.log('User found:', user.email);
        
        // Get user roles
        const [roleRows] = await pool.query(`
            SELECT r.name AS role_name
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `, [userId]);
        
        const roles = roleRows.map(row => row.role_name);
        console.log('User roles:', roles);
        
        // Remove sensitive data
        delete user.password;
        
        res.json({
            ...user,
            roles
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        console.error("Full error:", error);
        res.status(500).json({ message: "Server error fetching profile", error: error.message });
    }
};

// Update user profile with file upload
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fname,
            lname,
            email,
            bio,
            favoriteSubject,
            favoriteFood,
            hobbies,
            iban
        } = req.body;
        
        let taxCardUrl = null;
        let profileImageUrl = null;
        
        // Handle multiple files from different fields
        if (req.files) {
            if (req.files.taxCard) {
                taxCardUrl = req.files.taxCard[0].path.replace(/\\/g, '/');
            }
            if (req.files.profileImage) {
                profileImageUrl = req.files.profileImage[0].path.replace(/\\/g, '/');
            }
        } else if (req.file) {
            // Single file upload
            if (req.file.fieldname === 'taxCard') {
                taxCardUrl = req.file.path.replace(/\\/g, '/');
            } else if (req.file.fieldname === 'profileImage') {
                profileImageUrl = req.file.path.replace(/\\/g, '/');
            }
        }
        
        const updateFields = {};
        if (fname) updateFields.fname = fname;
        if (lname) updateFields.lname = lname;
        if (email) updateFields.email = email;
        if (bio !== undefined) updateFields.bio = bio;
        if (favoriteSubject !== undefined) updateFields.favorite_subject = favoriteSubject;
        if (favoriteFood !== undefined) updateFields.favorite_food = favoriteFood;
        if (hobbies !== undefined) updateFields.hobbies = hobbies;
        if (iban !== undefined) updateFields.iban = iban;
        if (taxCardUrl) updateFields.tax_card_url = taxCardUrl;
        if (profileImageUrl) updateFields.profile_image_url = profileImageUrl;
        
        // Build dynamic update query
        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);
        
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE users SET ${setClause} WHERE id = ?`;
        
        await pool.query(query, [...values, userId]);
        
        console.log('Profile updated successfully for user:', userId);
        res.json({ message: "Profile updated successfully", updatedFields: fields });
    } catch (error) {
        console.error("Error updating user profile:", error);
        console.error("Full error:", error);
        res.status(500).json({ message: "Server error updating profile", error: error.message });
    }
};

module.exports = { getAllUsers, getOneUser, updateUser, deleteUser, getUserProfile, updateUserProfile };
