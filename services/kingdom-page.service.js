import { getKingdomById } from '../models/kingdom.model.js';
import { getKingdomPageByKingdomId, updateKingdomPageRecord } from '../models/kingdom-page.model.js';
import { validateBlocks } from './publication.service.js';
import { HttpError } from '../utils/http-error.js';

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength) || null;
}

function safeImageUrl(value) {
  const url = text(value, 1000);
  if (!url) return null;
  if (url.startsWith('/assets/')) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function getOrCreateKingdomPage(kingdomId) {
  const kingdom = await getKingdomById(kingdomId);
  if (!kingdom) throw new HttpError(404, 'Reino não encontrado.');
  return getKingdomPageByKingdomId(kingdomId);
}

export async function updateKingdomPage(kingdomId, payload, admin) {
  const kingdom = await getKingdomById(kingdomId);
  if (!kingdom) throw new HttpError(404, 'Reino não encontrado.');

  const pageData = {
    seoTitle: text(payload?.seoTitle, 180),
    metaDescription: text(payload?.metaDescription, 320),
    metaKeywords: text(payload?.metaKeywords, 500),
    ogTitle: text(payload?.ogTitle, 180),
    ogDescription: text(payload?.ogDescription, 320),
    ogImageUrl: safeImageUrl(payload?.ogImageUrl),
    updatedByAdminId: admin.id
  };
  const blocks = validateBlocks(payload?.blocks || [], 'página do Reino');
  return updateKingdomPageRecord(kingdomId, pageData, blocks);
}
