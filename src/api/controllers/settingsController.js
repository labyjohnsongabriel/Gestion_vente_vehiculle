const settingsService = require("../services/settingsService");
const logger = require("../utils/logger");
const APIError = require("../utils/errorHandler");

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getUserSettings(req.user.id);
      res.json({
        success: true,
        data: settings,
        message: "Settings retrieved successfully",
      });
    } catch (error) {
      logger.error("Get settings error:", error);
      next(new APIError("Failed to retrieve settings", 500));
    }
  }

  async updateSettings(req, res, next) {
    try {
      const { theme, notifications, preferences, advanced } = req.body;

      const updates = {
        ...(theme && { theme }),
        ...(notifications && { notifications }),
        ...(preferences && { preferences }),
        ...(advanced && { advanced }),
      };

      const updatedSettings = await settingsService.updateUserSettings(
        req.user.id,
        updates
      );

      res.json({
        success: true,
        data: updatedSettings,
        message: "Settings updated successfully",
      });
    } catch (error) {
      logger.error("Update settings error:", error);
      next(new APIError("Failed to update settings", 500));
    }
  }

  async resetSettings(req, res, next) {
    try {
      const defaultSettings = await settingsService.resetUserSettings(
        req.user.id
      );
      res.json({
        success: true,
        data: defaultSettings,
        message: "Settings reset to defaults",
      });
    } catch (error) {
      logger.error("Reset settings error:", error);
      next(new APIError("Failed to reset settings", 500));
    }
  }
}

module.exports = new SettingsController();
