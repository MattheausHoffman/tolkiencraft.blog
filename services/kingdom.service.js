import {
  createKingdomRecord,
  deleteKingdomRecord,
  getKingdomById,
  kingdomNameExists,
  kingdomSlugExists,
  updateKingdomRecord
} from '../models/kingdom.model.js';
import { HttpError } from '../utils/http-error.js';
import { slugify } from '../utils/slug.js';

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function safeImageUrl(value) {
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

async function uniqueSlug(candidate, excludeId = null) {
  const base = slugify(candidate) || 'reino';
  let slug = base;
  let suffix = 2;
  while (await kingdomSlugExists(slug, excludeId)) {
    slug = `${base.slice(0, 184)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function validateKingdomPayload(payload, excludeId = null) {
  const nome = text(payload?.nome, 100);
  const racas = text(payload?.racas, 255);
  const lideranca = text(payload?.lideranca, 150);
  const descricaoRaw = String(payload?.descricao ?? '').trim();
  const descricao = descricaoRaw.slice(0, 100);
  const imagemRaw = text(payload?.imagem, 1000);
  const imagem = safeImageUrl(imagemRaw);
  const status = payload?.status === 'inactive' ? 'inactive' : 'active';
  const errors = {};

  if (!nome) errors.nome = 'Informe o nome do Reino.';
  if (nome && await kingdomNameExists(nome, excludeId)) errors.nome = 'Já existe um Reino com esse nome.';
  if (!racas) errors.racas = 'Informe ao menos uma raça.';
  if (!lideranca) errors.lideranca = 'Informe a liderança do Reino.';
  if (!descricaoRaw) errors.descricao = 'Informe a descrição do Reino.';
  if (imagemRaw && !imagem) errors.imagem = 'Informe uma URL de imagem válida ou utilize o upload.';
  if (descricaoRaw.length > 100) errors.descricao = 'A descrição deve possuir no máximo 100 caracteres.';

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Revise os campos do Reino.', errors);
  }

  return {
    nome,
    slug: await uniqueSlug(nome, excludeId),
    imagem,
    status,
    racas,
    lideranca,
    descricao,
    ordemExibicao: Math.min(Math.max(Number.parseInt(payload?.ordemExibicao, 10) || 0, -100000), 100000)
  };
}

export async function createKingdom(payload) {
  const kingdom = await validateKingdomPayload(payload);
  return createKingdomRecord(kingdom);
}

export async function updateKingdom(id, payload) {
  const existing = await getKingdomById(id);
  if (!existing) throw new HttpError(404, 'Reino não encontrado.');
  const kingdom = await validateKingdomPayload(payload, id);
  return updateKingdomRecord(id, kingdom);
}

export async function removeKingdom(id) {
  const deleted = await deleteKingdomRecord(id);
  if (!deleted) throw new HttpError(404, 'Reino não encontrado.');
  return true;
}
