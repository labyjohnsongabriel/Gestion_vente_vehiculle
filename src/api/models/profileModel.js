const pool = require('../config/db');

class Profile {
  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async createOrUpdate(userId, { phone, address, bio, social = {} }) {
    const profile = await this.findByUserId(userId);
    
    if (profile) {
      await pool.query(
        'UPDATE profiles SET phone = ?, address = ?, bio = ?, social = ? WHERE user_id = ?',
        [phone, address, bio, JSON.stringify(social), userId]
      );
    } else {
      await pool.query(
        'INSERT INTO profiles (user_id, phone, address, bio, social) VALUES (?, ?, ?, ?, ?)',
        [userId, phone, address, bio, JSON.stringify(social)]
      );
    }
    
    return this.findByUserId(userId);
  }
}

module.exports = Profile;