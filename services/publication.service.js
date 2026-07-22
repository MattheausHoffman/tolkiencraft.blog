import sanitizeHtml from 'sanitize-html';
import {
  createPublicationRecord,
  deletePublicationRecord,
  getPublicationById,
  publicationSlugExists,
  updatePublicationRecord
} from '../models/publication.model.js';
import { HttpError } from '../utils/http-error.js';
import { slugify } from '../utils/slug.js';

const BLOCK_TYPES = new Set([
  'title', 'subtitle', 'text', 'paragraph', 'list', 'ordered_list', 'quote',
  'image', 'gallery', 'link', 'button', 'code', 'table', 'notice', 'highlight',
  'separator', 'video', 'download'
]);

const RICH_TEXT_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    a: ['href', 'target', 'rel']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    b: 'strong',
    i: 'em',
    a: (tagName, attribs) => {
      const external = attribs.target === '_blank';
      return {
        tagName,
        attribs: {
          href: safeLinkUrl(attribs.href),
          ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})
        }
      };
    }
  }
};

function text(value, maxLength = 5000) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function safeLinkUrl(value) {
  const url = text(value, 1000);
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('#')) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function safeMediaUrl(value) {
  const url = text(value, 1000);
  if (!url) return '';
  if (url.startsWith('/assets/')) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function sanitizeRich(value) {
  return sanitizeHtml(String(value || ''), RICH_TEXT_OPTIONS).trim();
}

function arrayOfRichText(value, maxItems = 100) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => sanitizeRich(item)).filter(Boolean);
}

function alignment(value) {
  return ['left', 'center', 'right'].includes(value) ? value : 'left';
}

function normalizeVideoUrl(value) {
  const url = safeLinkUrl(value);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${encodeURIComponent(parsed.pathname.replace('/', ''))}`;
    }
    if (parsed.hostname.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return parsed.toString();
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    }
    if (parsed.hostname === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
    }
    if (parsed.hostname === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

function normalizeTable(data) {
  const rowCount = Math.min(Math.max(Number(data.rowsCount) || data.rows?.length || 1, 1), 30);
  const columnCount = Math.min(Math.max(Number(data.columnsCount) || data.headers?.length || data.rows?.[0]?.length || 1, 1), 12);
  const hasHeader = Boolean(data.hasHeader);
  const headers = Array.from({ length: columnCount }, (_, index) => text(data.headers?.[index], 300));
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => (
    Array.from({ length: columnCount }, (_, columnIndex) => sanitizeRich(data.rows?.[rowIndex]?.[columnIndex]))
  ));
  return { hasHeader, headers, rows, alignment: alignment(data.alignment) };
}

function normalizeGallery(data) {
  const images = Array.isArray(data.images) ? data.images : [];
  return {
    columns: Math.min(Math.max(Number(data.columns) || 2, 1), 4),
    images: images.slice(0, 20).map((image) => ({
      url: safeMediaUrl(image?.url),
      alt: text(image?.alt, 255),
      caption: text(image?.caption, 500)
    })).filter((image) => image.url)
  };
}

function normalizeBlock(block, index) {
  const type = text(block?.type, 40);
  if (!BLOCK_TYPES.has(type)) {
    throw new HttpError(400, `O bloco ${index + 1} possui um tipo inválido.`);
  }
  const data = block?.data && typeof block.data === 'object' ? block.data : {};

  switch (type) {
    case 'title':
    case 'subtitle':
      return { type, data: { text: text(data.text, 180) } };
    case 'text':
    case 'paragraph':
      return { type, data: { html: sanitizeRich(data.html) } };
    case 'list':
    case 'ordered_list':
      return { type, data: { items: arrayOfRichText(data.items) } };
    case 'quote':
      return { type, data: { html: sanitizeRich(data.html), cite: text(data.cite, 180) } };
    case 'image':
      return {
        type,
        data: {
          url: safeMediaUrl(data.url),
          alt: text(data.alt, 255),
          caption: text(data.caption, 500),
          width: Math.min(Math.max(Number(data.width) || 100, 10), 100),
          alignment: alignment(data.alignment)
        }
      };
    case 'gallery':
      return { type, data: normalizeGallery(data) };
    case 'link':
      return {
        type,
        data: {
          url: safeLinkUrl(data.url),
          text: text(data.text, 300),
          newTab: Boolean(data.newTab)
        }
      };
    case 'button':
      return {
        type,
        data: {
          url: safeLinkUrl(data.url),
          text: text(data.text, 120),
          newTab: Boolean(data.newTab),
          style: ['primary', 'secondary', 'ghost'].includes(data.style) ? data.style : 'primary'
        }
      };
    case 'code':
      return { type, data: { code: String(data.code || '').slice(0, 100000), language: text(data.language, 50) } };
    case 'table':
      return { type, data: normalizeTable(data) };
    case 'notice':
    case 'highlight':
      return { type, data: { heading: text(data.heading, 180), html: sanitizeRich(data.html) } };
    case 'separator':
      return { type, data: {} };
    case 'video':
      return { type, data: { url: normalizeVideoUrl(data.url), title: text(data.title, 180), caption: text(data.caption, 500) } };
    case 'download':
      return { type, data: { url: safeMediaUrl(data.url) || safeLinkUrl(data.url), label: text(data.label, 180), description: text(data.description, 500) } };
    default:
      return { type, data: {} };
  }
}


export function validatePublishedBlocks(blocks) {
  if (blocks.length === 0) {
    throw new HttpError(400, 'Adicione pelo menos um bloco antes de publicar.');
  }

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const data = block.data || {};
    let valid = true;
    switch (block.type) {
      case 'title':
      case 'subtitle':
        valid = Boolean(data.text);
        break;
      case 'text':
      case 'paragraph':
      case 'quote':
        valid = Boolean(data.html);
        break;
      case 'list':
      case 'ordered_list':
        valid = Array.isArray(data.items) && data.items.length > 0;
        break;
      case 'image':
        valid = Boolean(data.url);
        break;
      case 'gallery':
        valid = Array.isArray(data.images) && data.images.length > 0;
        break;
      case 'link':
      case 'button':
        valid = Boolean(data.url && data.text);
        break;
      case 'code':
        valid = Boolean(data.code);
        break;
      case 'table':
        valid = Array.isArray(data.rows) && data.rows.length > 0;
        break;
      case 'notice':
      case 'highlight':
        valid = Boolean(data.heading && data.html);
        break;
      case 'video':
        valid = Boolean(data.url);
        break;
      case 'download':
        valid = Boolean(data.url && data.label);
        break;
      case 'separator':
        valid = true;
        break;
      default:
        valid = false;
    }
    if (!valid) {
      throw new HttpError(400, `Preencha os campos obrigatórios do bloco ${index + 1} (${block.type}).`);
    }
  }
}

export function validateBlocks(blocks, contentLabel = 'publicação') {
  if (!Array.isArray(blocks)) {
    throw new HttpError(400, `A estrutura de blocos da ${contentLabel} é inválida.`);
  }
  if (blocks.length > 250) {
    throw new HttpError(400, `A ${contentLabel} excede o limite de 250 blocos.`);
  }
  return blocks.map(normalizeBlock);
}

async function uniqueSlug(candidate, excludeId = null) {
  const base = slugify(candidate) || 'publicacao';
  let slug = base;
  let suffix = 2;
  while (await publicationSlugExists(slug, excludeId)) {
    slug = `${base.slice(0, 184)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function validatePublicationPayload(payload, admin) {
  const titleValue = text(payload?.title, 180);
  const summary = text(payload?.summary, 500);
  const status = payload?.status === 'published' ? 'published' : 'draft';
  const errors = {};

  if (!titleValue) errors.title = 'Informe o título da publicação.';
  if (!summary) errors.summary = 'Informe o resumo da publicação.';

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Revise os campos da publicação.', errors);
  }

  return {
    title: titleValue,
    summary,
    coverImageUrl: safeMediaUrl(payload.coverImageUrl),
    coverImageAlt: text(payload.coverImageAlt, 255),
    author: text(payload.author, 100) || admin.nome,
    authorAdminId: admin.id,
    status,
    displayOrder: Math.min(Math.max(Number.parseInt(payload.displayOrder, 10) || 0, -100000), 100000),
    seoTitle: text(payload.seoTitle, 180) || titleValue,
    metaDescription: text(payload.metaDescription, 320) || summary,
    metaKeywords: text(payload.metaKeywords, 500),
    ogTitle: text(payload.ogTitle, 180) || titleValue,
    ogDescription: text(payload.ogDescription, 320) || summary,
    ogImageUrl: safeMediaUrl(payload.ogImageUrl) || safeMediaUrl(payload.coverImageUrl),
    publishedAt: status === 'published' ? new Date() : null
  };
}

export async function createPublication(payload, admin) {
  const publication = validatePublicationPayload(payload, admin);
  publication.slug = await uniqueSlug(payload.slug || publication.title);
  const blocks = validateBlocks(payload.blocks || []);
  if (publication.status === 'published') validatePublishedBlocks(blocks);
  return createPublicationRecord(publication, blocks);
}

export async function updatePublication(id, payload, admin) {
  const existing = await getPublicationById(id);
  if (!existing) throw new HttpError(404, 'Publicação não encontrada.');
  const publication = validatePublicationPayload(payload, admin);
  publication.slug = await uniqueSlug(payload.slug || publication.title, id);
  publication.publishedAt = existing.publishedAt;
  const blocks = validateBlocks(payload.blocks || []);
  if (publication.status === 'published') validatePublishedBlocks(blocks);
  return updatePublicationRecord(id, publication, blocks);
}

export async function removePublication(id) {
  const deleted = await deletePublicationRecord(id);
  if (!deleted) throw new HttpError(404, 'Publicação não encontrada.');
  return true;
}
