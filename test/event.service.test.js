import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEventPayload } from '../services/event.service.js';

test('aceita um único dia no ano corrente', () => {
  const event = validateEventPayload({
    nome: 'Conselho Real',
    descricao: 'Reunião dos Reinos.',
    mes: 2,
    diaInicial: 29,
    diaFinal: '',
    ordemExibicao: 2,
    ano: 2025
  }, 2028);

  assert.deepEqual(event, {
    nome: 'Conselho Real',
    descricao: 'Reunião dos Reinos.',
    mes: 2,
    diaInicial: 29,
    diaFinal: null,
    ano: 2028,
    ordemExibicao: 2
  });
});

test('ignora dias informados quando a data está A definir', () => {
  const event = validateEventPayload({
    nome: 'Guerra',
    mes: 9,
    aDefinir: true,
    diaInicial: 15,
    diaFinal: 18
  }, 2026);

  assert.equal(event.diaInicial, null);
  assert.equal(event.diaFinal, null);
});

test('rejeita dia inexistente no mês e ano', () => {
  assert.throws(
    () => validateEventPayload({ nome: 'Inválido', mes: 2, diaInicial: 29 }, 2026),
    (error) => error.status === 400 && Boolean(error.errors.diaInicial)
  );
});

test('rejeita intervalo invertido', () => {
  assert.throws(
    () => validateEventPayload({ nome: 'Inválido', mes: 3, diaInicial: 15, diaFinal: 14 }, 2026),
    (error) => error.status === 400 && Boolean(error.errors.diaFinal)
  );
});

test('rejeita Dia Final não inteiro', () => {
  assert.throws(
    () => validateEventPayload({ nome: 'Inválido', mes: 3, diaInicial: 15, diaFinal: 'abc' }, 2026),
    (error) => error.status === 400 && Boolean(error.errors.diaFinal)
  );
});

test('rejeita ordem de exibição não inteira', () => {
  assert.throws(
    () => validateEventPayload({ nome: 'Inválido', mes: 3, diaInicial: 15, ordemExibicao: 1.5 }, 2026),
    (error) => error.status === 400 && Boolean(error.errors.ordemExibicao)
  );
});

test('rejeita descrição com mais de 25 caracteres', () => {
  assert.throws(
    () => validateEventPayload({
      nome: 'Inválido',
      descricao: 'Esta descrição ultrapassa vinte e cinco caracteres.',
      mes: 3,
      diaInicial: 15
    }, 2026),
    (error) => error.status === 400 && Boolean(error.errors.descricao)
  );
});
