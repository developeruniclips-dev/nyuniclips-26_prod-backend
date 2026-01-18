const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { UserModel } = require("../models/User");
const { UserRoleModel } = require("../models/userRole");
const { pool } = require("../config/db");

// Request password reset (send token)
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find user by email
        const [userRows] = await UserModel.findByEmail(email);
        if (userRows.length === 0) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ 
                message: "If an account with that email exists, a password reset link has been sent." 
            });
        }

        const user = userRows[0];

        // Check if user is SuperAdmin - they cannot reset password
        const [roleRows] = await UserRoleModel.getRolesById(user.id);
        const roles = roleRows.map(row => row.name);

        if (roles.includes('SuperAdmin')) {
            return res.status(403).json({ 
                message: "SuperAdmin accounts cannot reset password through this system. Please contact tech support.",
                contactSupport: true
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store token in database
        await pool.query(
            `UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?`,
            [hashedToken, expiresAt, user.id]
        );

        // In production, you would send an email here with the reset link
        // For now, we'll return the token (for development/testing)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // TODO: Send email with resetUrl
        // For development, log it
        console.log(`Password reset URL for ${email}: ${resetUrl}`);

        res.status(200).json({ 
            message: "If an account with that email exists, a password reset link has been sent.",
            // Remove this in production - only for testing
            ...(process.env.NODE_ENV !== 'production' && { resetUrl, token: resetToken })
        });

    } catch (error) {
        console.error("Error requesting password reset:", error);
        res.status(500).json({ message: "Server error processing request" });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: "Token, email, and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Find user by email
        const [userRows] = await UserModel.findByEmail(email);
        if (userRows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const user = userRows[0];

        // Check if user is SuperAdmin - they cannot reset password
        const [roleRows] = await UserRoleModel.getRolesById(user.id);
        const roles = roleRows.map(row => row.name);

        if (roles.includes('SuperAdmin')) {
            return res.status(403).json({ 
                message: "SuperAdmin accounts cannot reset password through this system. Please contact tech support.",
                contactSupport: true
            });
        }

        // Hash the provided token and compare
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Check if token matches and is not expired
        const [tokenCheck] = await pool.query(
            `SELECT id FROM users WHERE id = ? AND password_reset_token = ? AND password_reset_expires > NOW()`,
            [user.id, hashedToken]
        );

        if (tokenCheck.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            `UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?`,
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error resetting password" });
    }
};

// Change password (for logged-in users, except SuperAdmin)
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        // Check if user is SuperAdmin
        const roles = req.user.roles || [];
        if (roles.includes('SuperAdmin')) {
            return res.status(403).json({ 
                message: "SuperAdmin accounts cannot change password through this system. Please contact tech support.",
                contactSupport: true
            });
        }

        // Get user
        const [userRows] = await UserModel.findById(userId);
        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userRows[0];

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error changing password" });
    }
};

module.exports = { requestPasswordReset, resetPassword, changePassword };
