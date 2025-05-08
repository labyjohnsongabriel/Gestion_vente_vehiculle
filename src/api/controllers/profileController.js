// controllers/profileController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email, phone, address, birthDate, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, email, phone, address, birthDate } = req.body;

  try {
    // Check if email is already taken by another user
    const [emailCheck] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, req.user.id]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update user profile
    await db.query(
      `UPDATE users 
       SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, birthDate = ?
       WHERE id = ?`,
      [firstName, lastName, email, phone, address, birthDate, req.user.id]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get current password hash
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
