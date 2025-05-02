const Settings = require("../models/Settings");
const logger = require("../utils/logger");

class SettingsService {
  async getUserSettings(userId) {
    try {
      const settings = await Settings.findOne({ userId }).lean();
      if (!settings) {
        return this.createDefaultSettings(userId);
      }
      return settings;
    } catch (error) {
      logger.error(`Error getting settings for user ${userId}:`, error);
      throw error;
    }
  }

  async updateUserSettings(userId, updates) {
    try {
      const updatedSettings = await Settings.findOneAndUpdate(
        { userId },
        { $set: updates, lastUpdated: new Date() },
        { new: true, upsert: true }
      ).lean();

      logger.info(`Settings updated for user ${userId}`);
      return updatedSettings;
    } catch (error) {
      logger.error(`Error updating settings for user ${userId}:`, error);
      throw error;
    }
  }

  async createDefaultSettings(userId) {
    const defaultSettings = {
      userId,
      theme: {
        darkMode: false,
        primaryColor: "#1976d2",
        secondaryColor: "#9c27b0",
      },
      notifications: {
        enabled: true,
        email: true,
        push: false,
        frequency: "immediate",
      },
      preferences: {
        language: "fr",
        timezone: "Europe/Paris",
        dashboardLayout: "standard",
        fontSize: "medium",
      },
      advanced: {
        developerMode: false,
        analytics: true,
      },
    };

    try {
      const settings = new Settings(defaultSettings);
      await settings.save();
      logger.info(`Default settings created for user ${userId}`);
      return settings.toObject();
    } catch (error) {
      logger.error(
        `Error creating default settings for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  async resetUserSettings(userId) {
    try {
      await Settings.deleteOne({ userId });
      return this.createDefaultSettings(userId);
    } catch (error) {
      logger.error(`Error resetting settings for user ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
