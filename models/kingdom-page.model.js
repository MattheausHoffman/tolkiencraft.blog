import { databasePool } from '../database/connection.js';

function parseJson(value, fallback = {}) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapKingdomPage(row) {
  if (!row) return null;
  return {
    id: row.page_id,
    kingdomId: row.kingdom_id,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImageUrl: row.og_image_url,
    createdAt: row.page_created_at,
    updatedAt: row.page_updated_at,
    kingdom: {
      id: row.kingdom_id,
      nome: row.nome,
      slug: row.slug,
      imagem: row.imagem,
      status: row.status,
      racas: row.racas,
      lideranca: row.lideranca,
      descricao: row.descricao,
      ordemExibicao: row.ordem_exibicao,
      createdAt: row.kingdom_created_at,
      updatedAt: row.kingdom_updated_at
    }
  };
}

export async function ensureKingdomPageRecord(kingdomId, connection = databasePool) {
  await connection.execute(
    'INSERT INTO kingdom_pages (kingdom_id) VALUES (?) ON DUPLICATE KEY UPDATE kingdom_id = VALUES(kingdom_id)',
    [kingdomId]
  );
}

async function getKingdomPage(whereSql, value, connection = databasePool) {
  const [rows] = await connection.execute(`
    SELECT
      kp.id AS page_id, kp.kingdom_id, kp.seo_title, kp.meta_description,
      kp.meta_keywords, kp.og_title, kp.og_description, kp.og_image_url,
      kp.created_at AS page_created_at, kp.updated_at AS page_updated_at,
      r.nome, r.slug, r.imagem, r.status, r.racas, r.lideranca, r.descricao,
      r.ordem_exibicao, r.created_at AS kingdom_created_at,
      r.updated_at AS kingdom_updated_at
    FROM kingdom_pages kp
    INNER JOIN reinos r ON r.id = kp.kingdom_id
    WHERE ${whereSql}
    LIMIT 1
  `, [value]);

  const page = mapKingdomPage(rows[0]);
  if (!page) return null;

  const [blocks] = await connection.execute(`
    SELECT id, block_type, position, block_data
    FROM kingdom_page_blocks
    WHERE kingdom_page_id = ?
    ORDER BY position ASC, id ASC
  `, [page.id]);

  page.blocks = blocks.map((block) => ({
    id: block.id,
    type: block.block_type,
    position: block.position,
    data: parseJson(block.block_data, {})
  }));
  return page;
}

export async function getKingdomPageByKingdomId(kingdomId, connection = databasePool) {
  await ensureKingdomPageRecord(kingdomId, connection);
  return getKingdomPage('r.id = ?', kingdomId, connection);
}

export function getKingdomPageBySlug(slug, connection = databasePool) {
  return getKingdomPage('r.slug = ?', slug, connection);
}

export async function getKingdomPageNavigation(kingdomId, connection = databasePool) {
  const [rows] = await connection.query(`
    SELECT id, nome, slug
    FROM reinos
    ORDER BY ordem_exibicao ASC, nome ASC, id ASC
  `);
  const index = rows.findIndex((row) => row.id === kingdomId);
  const mapLink = (row) => row ? { nome: row.nome, slug: row.slug } : null;
  return {
    previousKingdom: mapLink(rows[index - 1]),
    nextKingdom: mapLink(rows[index + 1])
  };
}

async function replaceBlocks(connection, pageId, blocks) {
  await connection.execute('DELETE FROM kingdom_page_blocks WHERE kingdom_page_id = ?', [pageId]);
  for (let position = 0; position < blocks.length; position += 1) {
    const block = blocks[position];
    await connection.execute(
      'INSERT INTO kingdom_page_blocks (kingdom_page_id, block_type, position, block_data) VALUES (?, ?, ?, ?)',
      [pageId, block.type, position, JSON.stringify(block.data)]
    );
  }
}

export async function updateKingdomPageRecord(kingdomId, pageData, blocks) {
  const connection = await databasePool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureKingdomPageRecord(kingdomId, connection);
    const [pages] = await connection.execute(
      'SELECT id FROM kingdom_pages WHERE kingdom_id = ? FOR UPDATE',
      [kingdomId]
    );
    const pageId = pages[0]?.id;
    if (!pageId) {
      await connection.rollback();
      return null;
    }

    await connection.execute(`
      UPDATE kingdom_pages SET
        seo_title = ?, meta_description = ?, meta_keywords = ?, og_title = ?,
        og_description = ?, og_image_url = ?, updated_by_admin_id = ?
      WHERE id = ?
    `, [
      pageData.seoTitle,
      pageData.metaDescription,
      pageData.metaKeywords,
      pageData.ogTitle,
      pageData.ogDescription,
      pageData.ogImageUrl,
      pageData.updatedByAdminId,
      pageId
    ]);
    await replaceBlocks(connection, pageId, blocks);
    await connection.commit();
    return getKingdomPage('r.id = ?', kingdomId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
