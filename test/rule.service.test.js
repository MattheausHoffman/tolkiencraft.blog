import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRulePayload } from '../services/rule.service.js';

test('normaliza uma Regra completa preservando quebras de linha e listas', () => {
  const rule = validateRulePayload({
    titulo: 'Sistema de Combate',
    descricao: 'Primeira linha.\nSegunda linha.',
    status: 'inactive',
    ordemExibicao: '12',
    sections: [{
      title: ' Diretrizes ',
      items: [' Primeiro item. ', '', 'Segundo item.']
    }]
  });

  assert.deepEqual(rule, {
    titulo: 'Sistema de Combate',
    descricao: 'Primeira linha.\nSegunda linha.',
    status: 'inactive',
    ordemExibicao: 12,
    sections: [{
      title: 'Diretrizes',
      items: ['Primeiro item.', 'Segundo item.']
    }]
  });
});

test('permite Regra contendo somente a descrição', () => {
  const rule = validateRulePayload({
    titulo: 'Regra simples',
    descricao: 'Texto obrigatório.',
    ordemExibicao: 0,
    sections: []
  });
  assert.deepEqual(rule.sections, []);
  assert.equal(rule.status, 'active');
});

test('exige título e descrição', () => {
  assert.throws(
    () => validateRulePayload({ titulo: '', descricao: '', ordemExibicao: 0 }),
    (error) => error.status === 400 && Boolean(error.errors.titulo) && Boolean(error.errors.descricao)
  );
});

test('rejeita seção sem título', () => {
  assert.throws(
    () => validateRulePayload({
      titulo: 'Regra',
      descricao: 'Descrição',
      ordemExibicao: 0,
      sections: [{ title: '', items: ['Item'] }]
    }),
    (error) => error.status === 400 && Boolean(error.errors.sections)
  );
});

test('rejeita seção sem itens', () => {
  assert.throws(
    () => validateRulePayload({
      titulo: 'Regra',
      descricao: 'Descrição',
      ordemExibicao: 0,
      sections: [{ title: 'Diretrizes', items: [] }]
    }),
    (error) => error.status === 400 && Boolean(error.errors.sections)
  );
});

test('rejeita ordem de exibição inválida', () => {
  assert.throws(
    () => validateRulePayload({
      titulo: 'Regra',
      descricao: 'Descrição',
      ordemExibicao: 'abc'
    }),
    (error) => error.status === 400 && Boolean(error.errors.ordemExibicao)
  );
});

test('rejeita status diferente de Ativa ou Inativa', () => {
  assert.throws(
    () => validateRulePayload({
      titulo: 'Regra',
      descricao: 'Descrição',
      status: 'archived',
      ordemExibicao: 0
    }),
    (error) => error.status === 400 && Boolean(error.errors.status)
  );
});
