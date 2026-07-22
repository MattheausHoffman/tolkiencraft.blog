import { databasePool } from '../database/connection.js';

function mapKingdom(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    imagem: row.imagem,
    status: row.status,
    racas: row.racas,
    lideranca: row.lideranca,
    descricao: row.descricao,
    ordemExibicao: row.ordem_exibicao,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeSort(sort) {
  const sorts = {
    order_asc: 'r.ordem_exibicao ASC, r.nome ASC, r.id ASC',
    order_desc: 'r.ordem_exibicao DESC, r.nome ASC, r.id DESC',
    updated: 'r.updated_at DESC, r.id DESC',
    newest: 'r.created_at DESC, r.id DESC',
    oldest: 'r.created_at ASC, r.id ASC',
    name_asc: 'r.nome ASC, r.id ASC',
    name_desc: 'r.nome DESC, r.id DESC',
    status: "FIELD(r.status, 'active', 'inactive'), r.ordem_exibicao ASC, r.nome ASC"
  };
  return sorts[sort] || sorts.order_asc;
}

export async function listKingdoms({
  status = '',
  search = '',
  sort = 'order_asc',
  limit = 250,
  offset = 0
} = {}) {
  const where = [];
  const values = [];

  if (status === 'active' || status === 'inactive') {
    where.push('r.status = ?');
    values.push(status);
  }

  if (search) {
    where.push('(r.nome LIKE ? OR r.racas LIKE ? OR r.lideranca LIKE ? OR r.descricao LIKE ?)');
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern, pattern);
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 250, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderClause = normalizeSort(sort);

  const [rows] = await databasePool.query(`
    SELECT r.*
    FROM reinos r
    ${whereClause}
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `, [...values, safeLimit, safeOffset]);

  return rows.map(mapKingdom);
}

export async function getKingdomById(id) {
  const [rows] = await databasePool.execute(
    'SELECT * FROM reinos WHERE id = ? LIMIT 1',
    [id]
  );
  return mapKingdom(rows[0]);
}

export async function getKingdomBySlug(slug) {
  const [rows] = await databasePool.execute(
    'SELECT * FROM reinos WHERE slug = ? LIMIT 1',
    [slug]
  );
  return mapKingdom(rows[0]);
}

export async function kingdomNameExists(nome, excludeId = null) {
  const values = [nome];
  let query = 'SELECT id FROM reinos WHERE nome = ?';
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await databasePool.execute(query, values);
  return rows.length > 0;
}

export async function kingdomSlugExists(slug, excludeId = null) {
  const values = [slug];
  let query = 'SELECT id FROM reinos WHERE slug = ?';
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await databasePool.execute(query, values);
  return rows.length > 0;
}

export async function createKingdomRecord(kingdom) {
  const [result] = await databasePool.execute(`
    INSERT INTO reinos (
      nome, slug, imagem, status, racas, lideranca, descricao, ordem_exibicao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    kingdom.nome,
    kingdom.slug,
    kingdom.imagem || null,
    kingdom.status,
    kingdom.racas,
    kingdom.lideranca,
    kingdom.descricao,
    kingdom.ordemExibicao
  ]);
  return getKingdomById(result.insertId);
}

export async function updateKingdomRecord(id, kingdom) {
  const [result] = await databasePool.execute(`
    UPDATE reinos SET
      nome = ?, slug = ?, imagem = ?, status = ?, racas = ?,
      lideranca = ?, descricao = ?, ordem_exibicao = ?
    WHERE id = ?
  `, [
    kingdom.nome,
    kingdom.slug,
    kingdom.imagem || null,
    kingdom.status,
    kingdom.racas,
    kingdom.lideranca,
    kingdom.descricao,
    kingdom.ordemExibicao,
    id
  ]);
  if (result.affectedRows === 0) return null;
  return getKingdomById(id);
}

export async function deleteKingdomRecord(id) {
  const [result] = await databasePool.execute('DELETE FROM reinos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
