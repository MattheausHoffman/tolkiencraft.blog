import assert from 'node:assert/strict';
import test from 'node:test';
import { renderRules } from '../js/pages/regras.js';

test('renderiza a mensagem solicitada quando não há Regras ativas', () => {
  const markup = renderRules([]);
  assert.match(markup, /Não há regras cadastradas até o momento\./);
  assert.equal((markup.match(/accordion-item/g) || []).length, 1);
  assert.doesNotMatch(markup, /data-accordion-button/);
});

test('preserva o accordion, seções e listas sem criar links', () => {
  const markup = renderRules([{
    id: 7,
    titulo: '<Regra segura>',
    descricao: 'Linha 1\nLinha 2',
    sections: [{
      title: 'Diretrizes',
      items: ['Item <seguro>', 'Segundo item']
    }]
  }]);

  assert.match(markup, /data-accordion-button/);
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /Regra 01/);
  assert.match(markup, /&lt;Regra segura&gt;/);
  assert.match(markup, /<section class="rule-section">/);
  assert.match(markup, /Item &lt;seguro&gt;/);
  assert.doesNotMatch(markup, /<a\b|href=/);
});
