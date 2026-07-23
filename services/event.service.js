import {
  createEventRecord,
  deleteEventRecord,
  getEventById,
  updateEventRecord
} from '../models/event.model.js';
import { HttpError } from '../utils/http-error.js';

function rawText(value) {
  return String(value ?? '').trim();
}

function integer(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function isTrue(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function validateEventPayload(payload, currentYear = new Date().getFullYear()) {
  const nomeRaw = rawText(payload?.nome);
  const descricaoRaw = rawText(payload?.descricao);
  const mes = integer(payload?.mes);
  const ordem = integer(payload?.ordemExibicao);
  const orderWasProvided = !['', null, undefined].includes(payload?.ordemExibicao);
  const finalDayWasProvided = !['', null, undefined].includes(payload?.diaFinal);
  const dateUndefined = isTrue(payload?.aDefinir);
  const diaInicial = dateUndefined ? null : integer(payload?.diaInicial);
  const diaFinal = dateUndefined ? null : integer(payload?.diaFinal);
  const errors = {};

  if (!nomeRaw) errors.nome = 'Informe o nome do Evento.';
  if (nomeRaw.length > 150) errors.nome = 'O nome deve possuir no máximo 150 caracteres.';
  if (descricaoRaw.length > 25) errors.descricao = 'A descrição deve possuir no máximo 25 caracteres.';
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) errors.mes = 'Selecione um mês válido.';
  if (orderWasProvided && ordem === null) {
    errors.ordemExibicao = 'Informe uma ordem de exibição válida.';
  } else if (ordem !== null && (ordem < -100000 || ordem > 100000)) {
    errors.ordemExibicao = 'A ordem deve estar entre -100000 e 100000.';
  }

  if (!dateUndefined && !Number.isInteger(diaInicial)) {
    errors.diaInicial = 'Informe o Dia Inicial ou selecione “A definir”.';
  }

  if (!errors.mes && Number.isInteger(diaInicial)) {
    const lastDay = daysInMonth(currentYear, mes);
    if (diaInicial < 1 || diaInicial > lastDay) {
      errors.diaInicial = `O Dia Inicial deve estar entre 1 e ${lastDay}.`;
    }
    if (finalDayWasProvided && diaFinal === null) {
      errors.diaFinal = 'Informe um Dia Final válido.';
    } else if (diaFinal !== null && (diaFinal < 1 || diaFinal > lastDay)) {
      errors.diaFinal = `O Dia Final deve estar entre 1 e ${lastDay}.`;
    } else if (diaFinal !== null && diaFinal < diaInicial) {
      errors.diaFinal = 'O Dia Final não pode ser anterior ao Dia Inicial.';
    }
  } else if (!dateUndefined && finalDayWasProvided && diaFinal === null) {
    errors.diaFinal = 'Informe um Dia Final válido.';
  }

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Revise os campos do Evento.', errors);
  }

  return {
    nome: nomeRaw,
    descricao: descricaoRaw,
    mes,
    diaInicial,
    diaFinal,
    ano: currentYear,
    ordemExibicao: ordem ?? 0
  };
}

export async function createEvent(payload) {
  return createEventRecord(validateEventPayload(payload));
}

export async function updateEvent(id, payload) {
  const currentYear = new Date().getFullYear();
  const existing = await getEventById(id, currentYear);
  if (!existing) throw new HttpError(404, 'Evento não encontrado.');
  return updateEventRecord(id, validateEventPayload(payload, currentYear));
}

export async function removeEvent(id) {
  const deleted = await deleteEventRecord(id);
  if (!deleted) throw new HttpError(404, 'Evento não encontrado.');
  return true;
}
