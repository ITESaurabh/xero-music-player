const path = require('path');
const { APP_CONF_FOLDER } = require('./config/core_config');
const Database = require('better-sqlite3');

const dbPath = path.join(APP_CONF_FOLDER, 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
module.exports = db;
