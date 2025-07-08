const { Pool } = require('pg');

const pool = new Pool(); // reads from process.env automatically

module.exports = {
  query: (text, params) => pool.query(text, params),
};
