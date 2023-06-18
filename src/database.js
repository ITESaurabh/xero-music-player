const path = require('path');
const sqlite = require('better-sqlite3');
const { APP_CONF_FOLDER } = require('./config/core_config');

const dbPath = path.join(APP_CONF_FOLDER, 'data.db');
const db = new sqlite(dbPath);

module.exports = db;
