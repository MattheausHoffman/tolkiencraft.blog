import { showTimedAlert } from '../auth-ui.js';
import { initAdminShell } from '../admin-session.js';
import { adminApi, uploadMedia } from './api.js';
import {
  BLOCK_OPTIONS,
  blockLabel,
  createDefaultBlock,
  escapeHtml,
  renderBlockFields
} from './block-definitions.js';

const form = document.querySelector('[data-publication-editor]');
const alertElement = document.querySelector('[data-auth-alert]');
const blockList = document.querySelector('[data-block-list]');
const blockTypeSelect = document.querySelector('[data-block-type]');
const editorGuide = document.querySelector('[data-editor-guide]');
const blockCount = document.querySelector('[data-block-count]');
const saveState = document.querySelector('[data-save-state]');

let publicationId = null;
let blocks = [];
let slugTouched = false;
let isSaving = false;
let clientId = 1;

function currentPublicationId() {
  const match = window.location.pathname.match(/\/adm\/publicacoes\/(\d+)\/editar$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190);
}

function markDirty() {
  if (isSaving) return;
  saveState.textContent = 'Existem alterações ainda não salvas.';
}

function markSaved(message = 'Todas as alterações foram salvas.') {
  saveState.textContent = message;
}

function ensureClientIds() {
  blocks = blocks.map((block) => ({ ...block, clientId: block.clientId || `block-${clientId++}`, collapsed: Boolean(block.collapsed) }));
}

function titleNumberAt(index) {
  return blocks.slice(0, index + 1).filter((block) => block.type === 'title').length;
}

function renderGuide() {
  const titles = blocks.filter((block) => block.type === 'title');
  editorGuide.innerHTML = titles.length
    ? titles.map((block, index) => `<li><span>${index + 1}.</span> ${escapeHtml(block.data.text || 'Título sem nome')}</li>`).join('')
    : '<li>Nenhum título adicionado.</li>';
}

function renderBlocks() {
  ensureClientIds();
  blockCount.textContent = `${blocks.length} ${blocks.length === 1 ? 'bloco' : 'blocos'}`;
  renderGuide();

  if (!blocks.length) {
    blockList.innerHTML = '<p class="empty-state">Adicione o primeiro bloco da publicação.</p>';
    return;
  }

  blockList.innerHTML = blocks.map((block, index) => {
    const titleSuffix = block.type === 'title' ? ` ${titleNumberAt(index)}` : '';
    const summary = block.type === 'title' || block.type === 'subtitle'
      ? block.data.text || ''
      : block.type === 'image' ? block.data.alt || block.data.url || '' : '';
    return `<article class="block-editor-card ${block.collapsed ? 'is-collapsed' : ''}" data-block-index="${index}" data-block-id="${block.clientId}">
      <header class="block-editor-card__header">
        <div><span class="block-editor-card__number">${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHtml(blockLabel(block.type))}${titleSuffix}</strong>${summary ? `<small>${escapeHtml(summary)}</small>` : ''}</div></div>
        <div class="block-editor-card__actions">
          <button type="button" title="Mover para cima" data-block-up ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" title="Mover para baixo" data-block-down ${index === blocks.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" data-block-edit>${block.collapsed ? 'Editar' : 'Recolher'}</button>
          <button type="button" class="is-danger" data-block-delete>Excluir</button>
        </div>
      </header>
      ${block.collapsed ? '' : `<div class="block-editor-card__body">${renderBlockFields(block)}</div>`}
    </article>`;
  }).join('');
}

function normalizeTable(block) {
  const rowsCount = Math.min(Math.max(Number(block.data.rowsCount) || 1, 1), 30);
  const columnsCount = Math.min(Math.max(Number(block.data.columnsCount) || 1, 1), 12);
  block.data.rowsCount = rowsCount;
  block.data.columnsCount = columnsCount;
  block.data.headers = Array.from({ length: columnsCount }, (_, index) => block.data.headers?.[index] || '');
  block.data.rows = Array.from({ length: rowsCount }, (_, rowIndex) => (
    Array.from({ length: columnsCount }, (_, columnIndex) => block.data.rows?.[rowIndex]?.[columnIndex] || '')
  ));
}

function getBlockFromElement(element) {
  const card = element.closest('[data-block-index]');
  if (!card) return null;
  const index = Number.parseInt(card.dataset.blockIndex, 10);
  return { block: blocks[index], index, card };
}

function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', () => resolve(input.files?.[0] || null), { once: true });
    input.click();
  });
}

async function uploadForButton(button, accept) {
  const file = await pickFile(accept);
  if (!file) return null;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Enviando...';
  try {
    const data = await uploadMedia(file, publicationId);
    showTimedAlert(alertElement, data.message, 3000, 'success');
    return data.media;
  } catch (error) {
    showTimedAlert(alertElement, error.message);
    return null;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function setFieldError(fieldName, message = '') {
  const field = form.elements.namedItem(fieldName);
  const error = form.querySelector(`[data-field-error="${fieldName}"]`);
  if (field instanceof HTMLElement) field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
}

function readPayload(statusOverride = null) {
  const data = new FormData(form);
  return {
    title: String(data.get('title') || '').trim(),
    slug: String(data.get('slug') || '').trim(),
    summary: String(data.get('summary') || '').trim(),
    coverImageUrl: String(data.get('coverImageUrl') || '').trim(),
    coverImageAlt: String(data.get('coverImageAlt') || '').trim(),
    author: String(data.get('author') || '').trim(),
    displayOrder: Number.parseInt(data.get('displayOrder'), 10) || 0,
    status: statusOverride || String(data.get('status') || 'draft'),
    seoTitle: String(data.get('seoTitle') || '').trim(),
    metaDescription: String(data.get('metaDescription') || '').trim(),
    metaKeywords: String(data.get('metaKeywords') || '').trim(),
    ogTitle: String(data.get('ogTitle') || '').trim(),
    ogDescription: String(data.get('ogDescription') || '').trim(),
    ogImageUrl: String(data.get('ogImageUrl') || '').trim(),
    blocks: blocks.map(({ type, data: blockData }) => ({ type, data: blockData }))
  };
}

function validatePayload(payload) {
  let valid = true;
  setFieldError('title');
  setFieldError('summary');
  if (!payload.title) {
    setFieldError('title', 'Informe o título da publicação.');
    valid = false;
  }
  if (!payload.summary) {
    setFieldError('summary', 'Informe o resumo da publicação.');
    valid = false;
  }
  if (payload.status === 'published' && blocks.length === 0) {
    showTimedAlert(alertElement, 'Adicione pelo menos um bloco antes de publicar.');
    valid = false;
  }
  return valid;
}

function fillForm(publication) {
  const fields = [
    'title', 'slug', 'summary', 'coverImageUrl', 'coverImageAlt', 'author', 'displayOrder',
    'status', 'seoTitle', 'metaDescription', 'metaKeywords', 'ogTitle', 'ogDescription', 'ogImageUrl'
  ];
  for (const name of fields) {
    if (form.elements[name]) form.elements[name].value = publication[name] ?? '';
  }
  blocks = (publication.blocks || []).map((block) => ({ type: block.type, data: block.data, clientId: `block-${clientId++}`, collapsed: false }));
  slugTouched = true;
  document.querySelector('[data-editor-title]').textContent = 'Editar Publicação';
  document.querySelector('[data-editor-breadcrumb]').textContent = 'Editar';
  updateCoverPreview();
  renderBlocks();
  markSaved(`Última atualização: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(publication.updatedAt))}`);
}

function updateCoverPreview() {
  const preview = document.querySelector('[data-cover-preview]');
  const image = preview?.querySelector('img');
  const url = form.elements.coverImageUrl.value.trim();
  if (!preview || !image) return;
  preview.hidden = !url;
  image.src = url || '';
  image.alt = form.elements.coverImageAlt.value.trim();
}

async function savePublication(statusOverride, submitter) {
  const payload = readPayload(statusOverride);
  if (!validatePayload(payload) || isSaving) return;
  isSaving = true;
  const originalText = submitter.textContent;
  submitter.disabled = true;
  submitter.textContent = 'Salvando...';
  form.elements.status.value = payload.status;

  try {
    const data = await adminApi(
      publicationId ? `/api/admin/publicacoes/${publicationId}` : '/api/admin/publicacoes',
      { method: publicationId ? 'PUT' : 'POST', body: payload }
    );
    showTimedAlert(alertElement, data.message, 3000, 'success');
    if (!publicationId && data.redirect) {
      window.location.replace(data.redirect);
      return;
    }
    fillForm(data.publication);
  } catch (error) {
    if (error.errors) {
      Object.entries(error.errors).forEach(([name, message]) => setFieldError(name, message));
    }
    showTimedAlert(alertElement, error.message);
  } finally {
    isSaving = false;
    submitter.disabled = false;
    submitter.textContent = originalText;
  }
}

function handleRichCommand(button) {
  const editor = button.closest('[data-rich-editor]');
  const content = editor?.querySelector('[data-rich-field]');
  if (!content) return;
  content.focus();
  const command = button.dataset.richCommand;
  if (command === 'createLink') {
    const url = window.prompt('Informe a URL do link:');
    if (url) document.execCommand('createLink', false, url);
  } else if (command === 'inlineCode') {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || 'código';
    document.execCommand('insertHTML', false, `<code>${escapeHtml(selectedText)}</code>`);
  } else {
    document.execCommand(command, false, button.dataset.richValue || null);
  }
  content.dispatchEvent(new Event('input', { bubbles: true }));
}

async function init() {
  const session = await initAdminShell({ alertElement });
  if (!session) return;
  publicationId = currentPublicationId();
  form.elements.author.value = session.admin.nome;
  blockTypeSelect.innerHTML = BLOCK_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

  if (publicationId) {
    try {
      const data = await adminApi(`/api/admin/publicacoes/${publicationId}`);
      fillForm(data.publication);
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    }
  } else {
    renderBlocks();
  }

  form.elements.title.addEventListener('input', () => {
    if (!slugTouched) form.elements.slug.value = slugify(form.elements.title.value);
    markDirty();
  });
  form.elements.slug.addEventListener('input', () => {
    slugTouched = true;
    form.elements.slug.value = slugify(form.elements.slug.value);
    markDirty();
  });
  form.elements.coverImageUrl.addEventListener('input', updateCoverPreview);
  form.elements.coverImageAlt.addEventListener('input', updateCoverPreview);
  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);

  document.querySelector('[data-add-block]').addEventListener('click', () => {
    blocks.push({ ...createDefaultBlock(blockTypeSelect.value), clientId: `block-${clientId++}`, collapsed: false });
    renderBlocks();
    markDirty();
    blockList.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelector('[data-cover-upload]').addEventListener('click', async (event) => {
    const media = await uploadForButton(event.currentTarget, 'image/jpeg,image/png,image/webp,image/gif');
    if (!media) return;
    form.elements.coverImageUrl.value = media.publicUrl;
    if (!form.elements.ogImageUrl.value) form.elements.ogImageUrl.value = media.publicUrl;
    updateCoverPreview();
    markDirty();
  });

  blockList.addEventListener('mousedown', (event) => {
    if (event.target.closest('[data-rich-command]')) event.preventDefault();
  });

  blockList.addEventListener('click', async (event) => {
    const target = event.target;
    const context = getBlockFromElement(target);
    if (!context) return;
    const { block, index } = context;

    if (target.closest('[data-block-up]') && index > 0) {
      [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      renderBlocks(); markDirty(); return;
    }
    if (target.closest('[data-block-down]') && index < blocks.length - 1) {
      [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
      renderBlocks(); markDirty(); return;
    }
    if (target.closest('[data-block-edit]')) {
      block.collapsed = !block.collapsed;
      renderBlocks(); return;
    }
    if (target.closest('[data-block-delete]')) {
      blocks.splice(index, 1);
      renderBlocks(); markDirty(); return;
    }
    const richCommand = target.closest('[data-rich-command]');
    if (richCommand) {
      handleRichCommand(richCommand); markDirty(); return;
    }
    const blockUpload = target.closest('[data-block-upload]');
    if (blockUpload) {
      const media = await uploadForButton(blockUpload, 'image/jpeg,image/png,image/webp,image/gif');
      if (media) { block.data.url = media.publicUrl; renderBlocks(); markDirty(); }
      return;
    }
    const fileUpload = target.closest('[data-file-upload]');
    if (fileUpload) {
      const media = await uploadForButton(fileUpload, '.pdf,.zip,.txt,.doc,.docx,.xls,.xlsx');
      if (media) { block.data.url = media.publicUrl; renderBlocks(); markDirty(); }
      return;
    }
    const galleryAdd = target.closest('[data-gallery-add]');
    if (galleryAdd) {
      block.data.images ||= [];
      block.data.images.push({ url: '', alt: '', caption: '' });
      renderBlocks(); markDirty(); return;
    }
    const galleryRemove = target.closest('[data-gallery-remove]');
    if (galleryRemove) {
      block.data.images.splice(Number(galleryRemove.dataset.galleryRemove), 1);
      renderBlocks(); markDirty(); return;
    }
    const galleryUpload = target.closest('[data-gallery-upload]');
    if (galleryUpload) {
      const media = await uploadForButton(galleryUpload, 'image/jpeg,image/png,image/webp,image/gif');
      if (media) {
        block.data.images[Number(galleryUpload.dataset.galleryUpload)].url = media.publicUrl;
        renderBlocks(); markDirty();
      }
    }
  });

  blockList.addEventListener('input', (event) => {
    const context = getBlockFromElement(event.target);
    if (!context) return;
    const { block } = context;
    const galleryItem = event.target.closest('[data-gallery-index]');
    if (galleryItem) {
      const galleryIndex = Number(galleryItem.dataset.galleryIndex);
      const field = event.target.dataset.blockField;
      const map = { 'gallery-url': 'url', 'gallery-alt': 'alt', 'gallery-caption': 'caption' };
      if (map[field]) block.data.images[galleryIndex][map[field]] = event.target.value;
      markDirty(); return;
    }
    if (event.target.dataset.tableHeader !== undefined) {
      block.data.headers[Number(event.target.dataset.tableHeader)] = event.target.value;
      markDirty(); return;
    }
    if (event.target.dataset.tableRow !== undefined) {
      block.data.rows[Number(event.target.dataset.tableRow)][Number(event.target.dataset.tableColumn)] = event.target.value;
      markDirty(); return;
    }
    if (event.target.dataset.richField) {
      block.data[event.target.dataset.richField] = event.target.innerHTML;
      markDirty(); return;
    }
    const field = event.target.dataset.blockField;
    if (!field) return;
    if (field === 'items') block.data.items = event.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
    else if (event.target.type === 'checkbox') block.data[field] = event.target.checked;
    else if (event.target.type === 'number') block.data[field] = Number(event.target.value);
    else block.data[field] = event.target.value;
    if (block.type === 'title') renderGuide();
    markDirty();
  });

  blockList.addEventListener('change', (event) => {
    const context = getBlockFromElement(event.target);
    if (!context) return;
    const { block } = context;
    const field = event.target.dataset.blockField;
    if (!field) return;
    if (event.target.type === 'checkbox') block.data[field] = event.target.checked;
    else if (event.target.type === 'number') block.data[field] = Number(event.target.value);
    else block.data[field] = event.target.value;
    if (block.type === 'table' && ['rowsCount', 'columnsCount', 'hasHeader'].includes(field)) {
      normalizeTable(block);
      renderBlocks();
    }
    markDirty();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitter = event.submitter || document.querySelector('[data-save-draft]');
    const status = submitter.matches('[data-save-draft]') ? 'draft' : 'published';
    savePublication(status, submitter);
  });

  window.addEventListener('beforeunload', (event) => {
    if (saveState.textContent.includes('não salvas')) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}

init().catch((error) => {
  console.error(error);
  showTimedAlert(alertElement, error.message || 'Não foi possível abrir o editor.');
});
