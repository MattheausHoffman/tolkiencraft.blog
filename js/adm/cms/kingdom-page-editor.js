import { showTimedAlert } from '../auth-ui.js';
import { initAdminShell } from '../admin-session.js';
import { adminApi } from './api.js';
import { createBlockEditor } from './block-editor.js';

const form = document.querySelector('[data-kingdom-page-editor]');
const alertElement = document.querySelector('[data-auth-alert]');
const saveState = document.querySelector('[data-save-state]');
let isSaving = false;
let dirty = false;

function currentKingdomId() {
  const match = window.location.pathname.match(/^\/adm\/reinos\/(\d+)\/pagina\/?$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function markDirty() {
  if (isSaving) return;
  dirty = true;
  saveState.textContent = 'Existem alterações ainda não salvas.';
}

function markSaved(updatedAt) {
  dirty = false;
  saveState.textContent = updatedAt
    ? `Última atualização: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(updatedAt))}`
    : 'Todas as alterações foram salvas.';
}

function fillKingdom(page) {
  const kingdom = page.kingdom;
  document.querySelector('[data-kingdom-name]').textContent = kingdom.nome;
  document.querySelector('[data-kingdom-status]').textContent = kingdom.status === 'active' ? 'Ativo' : 'Inativo';
  document.querySelector('[data-kingdom-leader]').textContent = kingdom.lideranca;
  document.querySelector('[data-kingdom-races]').textContent = kingdom.racas;
  document.querySelector('[data-kingdom-description]').textContent = kingdom.descricao;
  document.querySelector('[data-kingdom-slug]').textContent = `/reinos/${kingdom.slug}`;
  const banner = document.querySelector('[data-kingdom-banner]');
  banner.hidden = !kingdom.imagem;
  if (kingdom.imagem) {
    banner.querySelector('img').src = kingdom.imagem;
    banner.querySelector('img').alt = `Banner do Reino ${kingdom.nome}`;
  }
  const viewLink = document.querySelector('[data-view-page]');
  viewLink.href = `/reinos/${kingdom.slug}`;
  document.querySelector('[data-edit-kingdom]').href = `/adm/reinos/${kingdom.id}/editar`;
}

function readPayload(blockEditor) {
  const data = new FormData(form);
  return {
    seoTitle: String(data.get('seoTitle') || '').trim(),
    metaDescription: String(data.get('metaDescription') || '').trim(),
    metaKeywords: String(data.get('metaKeywords') || '').trim(),
    ogTitle: String(data.get('ogTitle') || '').trim(),
    ogDescription: String(data.get('ogDescription') || '').trim(),
    ogImageUrl: String(data.get('ogImageUrl') || '').trim(),
    blocks: blockEditor.getBlocks()
  };
}

async function init() {
  const session = await initAdminShell({ alertElement });
  if (!session) return;
  const kingdomId = currentKingdomId();
  if (!kingdomId) throw new Error('Reino inválido.');

  const blockEditor = createBlockEditor({
    blockList: document.querySelector('[data-block-list]'),
    blockTypeSelect: document.querySelector('[data-block-type]'),
    addButton: document.querySelector('[data-add-block]'),
    blockCount: document.querySelector('[data-block-count]'),
    editorGuide: document.querySelector('[data-editor-guide]'),
    alertElement,
    emptyMessage: 'Adicione o primeiro bloco da página do Reino.',
    onDirty: markDirty
  });

  const data = await adminApi(`/api/admin/reinos/${kingdomId}/pagina`);
  const page = data.page;
  fillKingdom(page);
  for (const name of ['seoTitle', 'metaDescription', 'metaKeywords', 'ogTitle', 'ogDescription', 'ogImageUrl']) {
    form.elements[name].value = page[name] || '';
  }
  blockEditor.setBlocks(page.blocks);
  markSaved(page.updatedAt);

  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSaving) return;
    isSaving = true;
    const button = event.submitter || document.querySelector('[data-save-page]');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Salvando...';
    try {
      const result = await adminApi(`/api/admin/reinos/${kingdomId}/pagina`, {
        method: 'PUT',
        body: readPayload(blockEditor)
      });
      fillKingdom(result.page);
      blockEditor.setBlocks(result.page.blocks);
      markSaved(result.page.updatedAt);
      showTimedAlert(alertElement, result.message, 3000, 'success');
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      isSaving = false;
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

init().catch((error) => {
  console.error(error);
  showTimedAlert(alertElement, error.message || 'Não foi possível abrir o editor.');
});
