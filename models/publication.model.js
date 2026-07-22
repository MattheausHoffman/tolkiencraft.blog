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

function mapPublication(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    author: row.author,
    authorAdminId: row.author_admin_id,
    status: row.status,
    displayOrder: row.display_order,
    previousPublicationId: row.previous_publication_id,
    nextPublicationId: row.next_publication_id,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImageUrl: row.og_image_url,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blockCount: Number(row.block_count || 0),
    previousPublication: row.previous_slug ? {
      title: row.previous_title,
      slug: row.previous_slug
    } : null,
    nextPublication: row.next_slug ? {
      title: row.next_title,
      slug: row.next_slug
    } : null
  };
}

function normalizeSort(sort) {
  const sorts = {
    order_asc: 'p.display_order ASC, COALESCE(p.published_at, p.created_at) DESC, p.id ASC',
    order_desc: 'p.display_order DESC, COALESCE(p.published_at, p.created_at) DESC, p.id DESC',
    newest: 'COALESCE(p.published_at, p.created_at) DESC, p.id DESC',
    oldest: 'COALESCE(p.published_at, p.created_at) ASC, p.id ASC',
    title_asc: 'p.title ASC, p.id ASC',
    title_desc: 'p.title DESC, p.id DESC',
    updated: 'p.updated_at DESC, p.id DESC'
  };
  return sorts[sort] || sorts.order_asc;
}

export async function listPublications({
  includeDrafts = false,
  status = '',
  search = '',
  sort = 'order_asc',
  limit = 100,
  offset = 0
} = {}) {
  const where = [];
  const values = [];

  if (!includeDrafts) {
    where.push("p.status = 'published'");
  } else if (status === 'published' || status === 'draft') {
    where.push('p.status = ?');
    values.push(status);
  }

  if (search) {
    where.push('(p.title LIKE ? OR p.summary LIKE ? OR p.author LIKE ?)');
    const pattern = `%${search}%`;
    values.push(pattern, pattern, pattern);
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderClause = normalizeSort(sort);

  const [rows] = await databasePool.query(`
    SELECT p.*,
      (SELECT COUNT(*) FROM publication_blocks b WHERE b.publication_id = p.id) AS block_count
    FROM publications p
    ${whereClause}
    ORDER BY ${orderClause}
    LIMIT ? OFFSET ?
  `, [...values, safeLimit, safeOffset]);

  return rows.map(mapPublication);
}

async function getPublication(whereSql, value, { includeDrafts = false, connection = databasePool } = {}) {
  const statusSql = includeDrafts ? '' : "AND p.status = 'published'";
  const [rows] = await connection.execute(`
    SELECT p.*,
      previous_p.title AS previous_title,
      previous_p.slug AS previous_slug,
      next_p.title AS next_title,
      next_p.slug AS next_slug,
      (SELECT COUNT(*) FROM publication_blocks b WHERE b.publication_id = p.id) AS block_count
    FROM publications p
    LEFT JOIN publications previous_p ON previous_p.id = p.previous_publication_id AND previous_p.status = 'published'
    LEFT JOIN publications next_p ON next_p.id = p.next_publication_id AND next_p.status = 'published'
    WHERE ${whereSql} ${statusSql}
    LIMIT 1
  `, [value]);

  const publication = mapPublication(rows[0]);
  if (!publication) return null;

  const [blocks] = await connection.execute(`
    SELECT id, block_type, position, block_data, created_at, updated_at
    FROM publication_blocks
    WHERE publication_id = ?
    ORDER BY position ASC, id ASC
  `, [publication.id]);

  publication.blocks = blocks.map((block) => ({
    id: block.id,
    type: block.block_type,
    position: block.position,
    data: parseJson(block.block_data, {})
  }));

  return publication;
}

export function getPublicationById(id, options = {}) {
  return getPublication('p.id = ?', id, { ...options, includeDrafts: true });
}

export function getPublishedPublicationBySlug(slug) {
  return getPublication('p.slug = ?', slug, { includeDrafts: false });
}

export async function publicationSlugExists(slug, excludeId = null) {
  const values = [slug];
  let query = 'SELECT id FROM publications WHERE slug = ?';
  if (excludeId) {
    query += ' AND id <> ?';
    values.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await databasePool.execute(query, values);
  return rows.length > 0;
}

export async function syncPublicationNavigation(connection = databasePool) {
  const [rows] = await connection.query(`
    SELECT id
    FROM publications
    WHERE status = 'published'
    ORDER BY display_order ASC, COALESCE(published_at, created_at) DESC, id ASC
  `);

  for (let index = 0; index < rows.length; index += 1) {
    const previousId = rows[index - 1]?.id || null;
    const nextId = rows[index + 1]?.id || null;
    await connection.execute(
      'UPDATE publications SET previous_publication_id = ?, next_publication_id = ? WHERE id = ?',
      [previousId, nextId, rows[index].id]
    );
  }

  await connection.query(`
    UPDATE publications
    SET previous_publication_id = NULL, next_publication_id = NULL
    WHERE status = 'draft'
  `);
}

async function replaceBlocks(connection, publicationId, blocks) {
  await connection.execute('DELETE FROM publication_blocks WHERE publication_id = ?', [publicationId]);

  for (let position = 0; position < blocks.length; position += 1) {
    const block = blocks[position];
    await connection.execute(
      'INSERT INTO publication_blocks (publication_id, block_type, position, block_data) VALUES (?, ?, ?, ?)',
      [publicationId, block.type, position, JSON.stringify(block.data)]
    );
  }
}

export async function createPublicationRecord(publication, blocks) {
  const connection = await databasePool.getConnection();
  try {
    await connection.beginTransaction();
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
      publication.authorAdminId,
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

    await replaceBlocks(connection, result.insertId, blocks);
    await syncPublicationNavigation(connection);
    await connection.commit();
    return getPublication('p.id = ?', result.insertId, { includeDrafts: true });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePublicationRecord(id, publication, blocks) {
  const connection = await databasePool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute(
      'SELECT status, published_at FROM publications WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!existingRows[0]) {
      await connection.rollback();
      return null;
    }

    const publishedAt = publication.status === 'published'
      ? (existingRows[0].published_at || publication.publishedAt || new Date())
      : null;

    await connection.execute(`
      UPDATE publications SET
        title = ?, slug = ?, summary = ?, cover_image_url = ?, cover_image_alt = ?,
        author = ?, author_admin_id = ?, status = ?, display_order = ?, seo_title = ?,
        meta_description = ?, meta_keywords = ?, og_title = ?, og_description = ?,
        og_image_url = ?, published_at = ?
      WHERE id = ?
    `, [
      publication.title,
      publication.slug,
      publication.summary,
      publication.coverImageUrl,
      publication.coverImageAlt,
      publication.author,
      publication.authorAdminId,
      publication.status,
      publication.displayOrder,
      publication.seoTitle,
      publication.metaDescription,
      publication.metaKeywords,
      publication.ogTitle,
      publication.ogDescription,
      publication.ogImageUrl,
      publishedAt,
      id
    ]);

    await replaceBlocks(connection, id, blocks);
    await syncPublicationNavigation(connection);
    await connection.commit();
    return getPublication('p.id = ?', id, { includeDrafts: true });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deletePublicationRecord(id) {
  const connection = await databasePool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      'UPDATE publications SET previous_publication_id = NULL WHERE previous_publication_id = ?',
      [id]
    );
    await connection.execute(
      'UPDATE publications SET next_publication_id = NULL WHERE next_publication_id = ?',
      [id]
    );
    const [result] = await connection.execute('DELETE FROM publications WHERE id = ?', [id]);
    await syncPublicationNavigation(connection);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function createMediaRecord(media) {
  const [result] = await databasePool.execute(`
    INSERT INTO media_files (
      publication_id, uploaded_by_admin_id, original_name, stored_name,
      public_url, mime_type, file_size, media_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    media.publicationId || null,
    media.adminId || null,
    media.originalName,
    media.storedName,
    media.publicUrl,
    media.mimeType,
    media.fileSize,
    media.mediaType
  ]);

  return { id: result.insertId, ...media };
}
