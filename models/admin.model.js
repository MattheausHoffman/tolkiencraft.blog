import { databasePool } from '../database/connection.js';

export async function findAdminByEmail(email) {
  const [rows] = await databasePool.execute(
    `SELECT id, nome, email, senha, created_at
     FROM admins
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}
