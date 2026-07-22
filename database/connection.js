import mysql from 'mysql2/promise';
import { env } from '../config/environment.js';

export const databasePool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: env.database.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export async function verifyDatabaseConnection() {
  const connection = await databasePool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
