import assert from 'node:assert/strict';
import test from 'node:test';
import { renderTimeline } from '../js/pages/eventos.js';

test('renderiza somente o card informativo quando não há Eventos', () => {
  const markup = renderTimeline([]);

  assert.match(markup, /Não há eventos registrados até o momento\./);
  assert.equal((markup.match(/<article/g) || []).length, 1);
  assert.equal((markup.match(/timeline-month/g) || []).length, 0);
});

test('renderiza somente os meses que possuem Eventos e mantém o markup sem links', () => {
  const markup = renderTimeline([{
    nome: '<Evento>',
    descricao: 'Descrição segura',
    mes: 3,
    diaInicial: null,
    diaFinal: null
  }]);

  assert.equal((markup.match(/<section class="timeline-month"/g) || []).length, 1);
  assert.match(markup, />Março<\/h2>/);
  assert.doesNotMatch(markup, />Janeiro<\/h2>|>Fevereiro<\/h2>|>Abril<\/h2>/);
  assert.equal((markup.match(/<article class="timeline-item"/g) || []).length, 1);
  assert.match(markup, /<time>A definir<\/time>/);
  assert.match(markup, /&lt;Evento&gt;/);
  assert.doesNotMatch(markup, /<a\b|href=|timeline-item--featured/);
});
