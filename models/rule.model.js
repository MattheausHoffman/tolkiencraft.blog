import { databasePool } from '../database/connection.js';

function parseSections(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRule(row) {
  if (!row) return null;
  return {
    id: row.id,
    titulo: row.titulo,
    slug: row.slug,
    descricao: row.descricao,
    sections: parseSections(row.secoes),
    ordemExibicao: row.ordem_exibicao,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeSort(sort) {
  const sorts = {
    order_asc: 'r.ordem_exibicao ASC, r.titulo ASC, r.id ASC',
    order_desc: 'r.ordem_exibicao DESC, r.titulo ASC, r.id DESC',
    updated: 'r.updated_at DESC, r.id DESC',
    newest: 'r.created_at DESC, r.id DESC',
    oldest: 'r.created_at ASC, r.id ASC',
    title_asc: 'r.titulo ASC, r.id ASC',
    title_desc: 'r.titulo DESC, r.id DESC',
    status: "FIELD(r.status, 'active', 'inactive'), r.ordem_exibicao ASC, r.titulo ASC"
  };
  return sorts[sort] || sorts.order_asc;
}

export async function listRules({
  includeInactive = false,
  status = '',
  search = '',
  sort = 'order_asc',
  limit = 500,
  offset = 0
} = {}) {
  const where = [];
  const values = [];

  if (!includeInactive) {
    where.push("r.status = 'active'");
  } else if (status === 'active' || status === 'inactive') {
    where.push('r.status = ?');
    values.push(status);
  }

  if (search) {
    where.push('(r.titulo LIKE ? OR r.descricao LIKE ?)');
    const pattern = `%${search}%`;
    values.push(pattern, pattern);
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await databasePool.query(`
    SELECT r.*
    FROM regras r
    ${whereClause}
    ORDER BY ${normalizeSort(sort)}
    LIMIT ? OFFSET ?
  `, [...values, safeLimit, safeOffset]);

  return rows.map(mapRule);
}

export async function getRuleById(id) {
  const [rows] = await databasePool.execute(
    'SELECT * FROM regras WHERE id = ? LIMIT 1',
    [id]
  );
  return mapRule(rows[0]);
}

export async function ruleTitleExists(titulo, excludeId = null) {
  const values = [titulo];
  let query = 'SELECT id FROM regras WHERE titulo = ?';
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await databasePool.execute(query, values);
  return rows.length > 0;
}

export async function ruleSlugExists(slug, excludeId = null) {
  const values = [slug];
  let query = 'SELECT id FROM regras WHERE slug = ?';
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await databasePool.execute(query, values);
  return rows.length > 0;
}

export async function createRuleRecord(rule) {
  const [result] = await databasePool.execute(`
    INSERT INTO regras (
      titulo, slug, descricao, secoes, ordem_exibicao, status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    rule.titulo,
    rule.slug,
    rule.descricao,
    JSON.stringify(rule.sections),
    rule.ordemExibicao,
    rule.status
  ]);
  return getRuleById(result.insertId);
}

export async function updateRuleRecord(id, rule) {
  const [result] = await databasePool.execute(`
    UPDATE regras SET
      titulo = ?, slug = ?, descricao = ?, secoes = ?,
      ordem_exibicao = ?, status = ?
    WHERE id = ?
  `, [
    rule.titulo,
    rule.slug,
    rule.descricao,
    JSON.stringify(rule.sections),
    rule.ordemExibicao,
    rule.status,
    id
  ]);
  if (result.affectedRows === 0) return null;
  return getRuleById(id);
}

export async function deleteRuleRecord(id) {
  const [result] = await databasePool.execute('DELETE FROM regras WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
