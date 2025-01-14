const path = require('path');
// const sqlite = require('sqlite3');
const { APP_CONF_FOLDER } = require('./config/core_config');

const dbPath = path.join(APP_CONF_FOLDER, 'data.db');

// const db = new sqlite(dbPath);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

module.exports = db;
