import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { env } from '../config/environment.js';

function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error('O nome do banco de dados contém caracteres inválidos.');
  }

  return `\`${identifier}\``;
}

export async function bootstrapDatabase() {
  const connection = await mysql.createConnection({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    charset: 'utf8mb4'
  });

  try {
    const databaseName = quoteIdentifier(env.database.name);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
    );
    await connection.changeUser({ database: env.database.name });

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT NOT NULL AUTO_INCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_admins_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
        expires INT UNSIGNED NOT NULL,
        data MEDIUMTEXT COLLATE utf8mb4_bin,
        PRIMARY KEY (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
    `);

    const [existingAdmins] = await connection.execute(
      'SELECT id FROM admins WHERE id = ? OR email = ? LIMIT 1',
      [env.defaultAdmin.id, env.defaultAdmin.email]
    );

    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash(
        env.defaultAdmin.password,
        env.security.bcryptRounds
      );

      await connection.execute(
        'INSERT INTO admins (id, nome, email, senha) VALUES (?, ?, ?, ?)',
        [env.defaultAdmin.id, env.defaultAdmin.name, env.defaultAdmin.email, passwordHash]
      );

      console.info('Administrador padrão criado com hash bcrypt.');
    }
  } finally {
    await connection.end();
  }
}
