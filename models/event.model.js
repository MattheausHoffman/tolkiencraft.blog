import { databasePool } from '../database/connection.js';

function mapEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    descricao: String(row.descricao || '').slice(0, 25),
    mes: row.mes,
    diaInicial: row.dia_inicial,
    diaFinal: row.dia_final,
    ano: row.ano,
    ordemExibicao: row.ordem_exibicao,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeSort(sort) {
  const sorts = {
    calendar: 'e.ano ASC, e.mes ASC, e.dia_inicial IS NULL ASC, e.dia_inicial ASC, e.ordem_exibicao ASC, e.id ASC',
    order_asc: 'e.mes ASC, e.ordem_exibicao ASC, e.dia_inicial IS NULL ASC, e.dia_inicial ASC, e.id ASC',
    order_desc: 'e.mes ASC, e.ordem_exibicao DESC, e.dia_inicial IS NULL ASC, e.dia_inicial ASC, e.id DESC',
    month_desc: 'e.mes DESC, e.dia_inicial IS NULL ASC, e.dia_inicial ASC, e.ordem_exibicao ASC, e.id ASC',
    name_asc: 'e.nome ASC, e.id ASC',
    name_desc: 'e.nome DESC, e.id DESC',
    updated: 'e.updated_at DESC, e.id DESC',
    newest: 'e.created_at DESC, e.id DESC',
    oldest: 'e.created_at ASC, e.id ASC'
  };
  return sorts[sort] || sorts.calendar;
}

export async function listEvents({
  year = new Date().getFullYear(),
  month = 0,
  search = '',
  sort = 'calendar',
  limit = 500,
  offset = 0
} = {}) {
  const where = ['e.ano = ?'];
  const values = [year];

  if (Number.isInteger(month) && month >= 1 && month <= 12) {
    where.push('e.mes = ?');
    values.push(month);
  }

  if (search) {
    where.push('(e.nome LIKE ? OR e.descricao LIKE ?)');
    const pattern = `%${search}%`;
    values.push(pattern, pattern);
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const [rows] = await databasePool.query(`
    SELECT e.*
    FROM eventos e
    WHERE ${where.join(' AND ')}
    ORDER BY ${normalizeSort(sort)}
    LIMIT ? OFFSET ?
  `, [...values, safeLimit, safeOffset]);

  return rows.map(mapEvent);
}

export async function getEventById(id, year = new Date().getFullYear()) {
  const [rows] = await databasePool.execute(
    'SELECT * FROM eventos WHERE id = ? AND ano = ? LIMIT 1',
    [id, year]
  );
  return mapEvent(rows[0]);
}

export async function createEventRecord(event) {
  const [result] = await databasePool.execute(`
    INSERT INTO eventos (
      nome, descricao, mes, dia_inicial, dia_final, ano, ordem_exibicao
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    event.nome,
    event.descricao,
    event.mes,
    event.diaInicial,
    event.diaFinal,
    event.ano,
    event.ordemExibicao
  ]);
  return getEventById(result.insertId, event.ano);
}

export async function updateEventRecord(id, event) {
  const [result] = await databasePool.execute(`
    UPDATE eventos SET
      nome = ?, descricao = ?, mes = ?, dia_inicial = ?,
      dia_final = ?, ano = ?, ordem_exibicao = ?
    WHERE id = ? AND ano = ?
  `, [
    event.nome,
    event.descricao,
    event.mes,
    event.diaInicial,
    event.diaFinal,
    event.ano,
    event.ordemExibicao,
    id,
    event.ano
  ]);
  if (result.affectedRows === 0) return null;
  return getEventById(id, event.ano);
}

export async function deleteEventRecord(id, year = new Date().getFullYear()) {
  const [result] = await databasePool.execute(
    'DELETE FROM eventos WHERE id = ? AND ano = ?',
    [id, year]
  );
  return result.affectedRows > 0;
}

export async function deleteEventsOutsideYear(year = new Date().getFullYear()) {
  const [result] = await databasePool.execute(
    'DELETE FROM eventos WHERE ano <> ?',
    [year]
  );
  return result.affectedRows;
}
