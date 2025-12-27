const Log = require('../models/Log');

const logger = {
  async log(action, details = {}, level = 'info') {
    try {
      await Log.create({
        action,
        details,
        level,
        userId: details.userId || null,
        eventId: details.eventId || null,
        ipAddress: details.ipAddress || null
      });
    } catch (error) {
      console.error('Logger error:', error.message);
    }
  },

  async info(action, details = {}) {
    return this.log(action, details, 'info');
  },

  async warning(action, details = {}) {
    return this.log(action, details, 'warning');
  },

  async error(action, details = {}) {
    return this.log(action, details, 'error');
  }
};

module.exports = logger;
