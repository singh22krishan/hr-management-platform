const oracledb = require("oracledb");
require("dotenv").config();

let pool;

async function init() {
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });
    console.log("Oracle DB pool created");
  }
}

async function getConnection() {
  if (!pool) await init();
  return pool.getConnection();
}

module.exports = { init, getConnection };
