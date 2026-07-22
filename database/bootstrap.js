import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { env } from '../config/environment.js';
import { SEED_PUBLICATIONS } from '../data/seed-publications.js';

function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error('O nome do banco de dados contém caracteres inválidos.');
  }

  return `\`${identifier}\``;
}

async function createTables(connection) {
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

  await connection.query(`
    CREATE TABLE IF NOT EXISTS publications (
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      slug VARCHAR(190) NOT NULL,
      summary VARCHAR(500) NOT NULL,
      cover_image_url VARCHAR(500) NULL,
      cover_image_alt VARCHAR(255) NULL,
      author VARCHAR(100) NOT NULL,
      author_admin_id INT NULL,
      status ENUM('draft','published') NOT NULL DEFAULT 'draft',
      display_order INT NOT NULL DEFAULT 0,
      previous_publication_id INT NULL,
      next_publication_id INT NULL,
      seo_title VARCHAR(180) NULL,
      meta_description VARCHAR(320) NULL,
      meta_keywords VARCHAR(500) NULL,
      og_title VARCHAR(180) NULL,
      og_description VARCHAR(320) NULL,
      og_image_url VARCHAR(500) NULL,
      published_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_publications_slug (slug),
      KEY idx_publications_status_order (status, display_order, published_at),
      KEY idx_publications_created_at (created_at),
      CONSTRAINT fk_publications_author FOREIGN KEY (author_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
      CONSTRAINT fk_publications_previous FOREIGN KEY (previous_publication_id) REFERENCES publications(id) ON DELETE SET NULL,
      CONSTRAINT fk_publications_next FOREIGN KEY (next_publication_id) REFERENCES publications(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS publication_blocks (
      id BIGINT NOT NULL AUTO_INCREMENT,
      publication_id INT NOT NULL,
      block_type VARCHAR(40) NOT NULL,
      position INT NOT NULL DEFAULT 0,
      block_data JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_publication_block_position (publication_id, position),
      KEY idx_publication_blocks_type (block_type),
      CONSTRAINT fk_publication_blocks_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS media_files (
      id BIGINT NOT NULL AUTO_INCREMENT,
      publication_id INT NULL,
      uploaded_by_admin_id INT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      public_url VARCHAR(500) NOT NULL,
      mime_type VARCHAR(120) NOT NULL,
      file_size BIGINT UNSIGNED NOT NULL,
      media_type ENUM('image','file') NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_media_stored_name (stored_name),
      KEY idx_media_created_at (created_at),
      CONSTRAINT fk_media_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL,
      CONSTRAINT fk_media_admin FOREIGN KEY (uploaded_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

async function seedAdmin(connection) {
  const [existingAdmins] = await connection.execute(
    'SELECT id FROM admins WHERE id = ? OR email = ? LIMIT 1',
    [env.defaultAdmin.id, env.defaultAdmin.email]
  );

  if (existingAdmins.length > 0) return existingAdmins[0].id;

  const passwordHash = await bcrypt.hash(
    env.defaultAdmin.password,
    env.security.bcryptRounds
  );

  await connection.execute(
    'INSERT INTO admins (id, nome, email, senha) VALUES (?, ?, ?, ?)',
    [env.defaultAdmin.id, env.defaultAdmin.name, env.defaultAdmin.email, passwordHash]
  );

  console.info('Administrador padrão criado com hash bcrypt.');
  return env.defaultAdmin.id;
}

async function syncPublicationNavigation(connection) {
  const [publications] = await connection.query(`
    SELECT id
    FROM publications
    WHERE status = 'published'
    ORDER BY display_order ASC, COALESCE(published_at, created_at) DESC, id ASC
  `);

  for (let index = 0; index < publications.length; index += 1) {
    const previousId = publications[index - 1]?.id || null;
    const nextId = publications[index + 1]?.id || null;
    await connection.execute(
      'UPDATE publications SET previous_publication_id = ?, next_publication_id = ? WHERE id = ?',
      [previousId, nextId, publications[index].id]
    );
  }

  await connection.query(`
    UPDATE publications
    SET previous_publication_id = NULL, next_publication_id = NULL
    WHERE status = 'draft'
  `);
}

async function seedPublications(connection, adminId) {
  for (const publication of SEED_PUBLICATIONS) {
    const [existing] = await connection.execute(
      'SELECT id FROM publications WHERE slug = ? LIMIT 1',
      [publication.slug]
    );

    if (existing.length > 0) continue;

    const [result] = await connection.execute(`
      INSERT INTO publications (
        title, slug, summary, cover_image_url, cover_image_alt, author,
        author_admin_id, status, display_order, seo_title, meta_description,
        meta_keywords, og_title, og_description, og_image_url, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      publication.title,
      publication.slug,
      publication.summary,
      publication.coverImageUrl,
      publication.coverImageAlt,
      publication.author,
      adminId,
      publication.status,
      publication.displayOrder,
      publication.seoTitle,
      publication.metaDescription,
      publication.metaKeywords,
      publication.ogTitle,
      publication.ogDescription,
      publication.ogImageUrl,
      publication.publishedAt
    ]);

    for (let position = 0; position < publication.blocks.length; position += 1) {
      const block = publication.blocks[position];
      await connection.execute(
        'INSERT INTO publication_blocks (publication_id, block_type, position, block_data) VALUES (?, ?, ?, ?)',
        [result.insertId, block.type, position, JSON.stringify(block.data)]
      );
    }
  }

  await syncPublicationNavigation(connection);
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
    await createTables(connection);
    const adminId = await seedAdmin(connection);
    await seedPublications(connection, adminId);
  } finally {
    await connection.end();
  }
}
