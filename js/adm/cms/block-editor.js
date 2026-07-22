import { showTimedAlert } from '../auth-ui.js';
import { uploadMedia } from './api.js';
import {
  BLOCK_OPTIONS,
  blockLabel,
  createDefaultBlock,
  escapeHtml,
  renderBlockFields
} from './block-definitions.js';

export function createBlockEditor({
  blockList,
  blockTypeSelect,
  addButton,
  blockCount,
  editorGuide,
  alertElement,
  getMediaOwnerId = () => null,
  emptyMessage = 'Adicione o primeiro bloco.',
  onDirty = () => {}
}) {
  let blocks = [];
  let clientId = 1;

  function ensureClientIds() {
    blocks = blocks.map((block) => ({
      ...block,
      clientId: block.clientId || `block-${clientId++}`,
      collapsed: Boolean(block.collapsed)
    }));
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

  function render() {
    ensureClientIds();
    blockCount.textContent = `${blocks.length} ${blocks.length === 1 ? 'bloco' : 'blocos'}`;
    renderGuide();
    if (!blocks.length) {
      blockList.innerHTML = `<p class="empty-state">${escapeHtml(emptyMessage)}</p>`;
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

  function getContext(element) {
    const card = element.closest('[data-block-index]');
    if (!card) return null;
    const index = Number.parseInt(card.dataset.blockIndex, 10);
    return { block: blocks[index], index };
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
      const data = await uploadMedia(file, getMediaOwnerId());
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

  function handleRichCommand(button) {
    const content = button.closest('[data-rich-editor]')?.querySelector('[data-rich-field]');
    if (!content) return;
    content.focus();
    const command = button.dataset.richCommand;
    if (command === 'createLink') {
      const url = window.prompt('Informe a URL do link:');
      if (url) document.execCommand('createLink', false, url);
    } else if (command === 'inlineCode') {
      const selectedText = window.getSelection()?.toString() || 'código';
      document.execCommand('insertHTML', false, `<code>${escapeHtml(selectedText)}</code>`);
    } else {
      document.execCommand(command, false, button.dataset.richValue || null);
    }
    content.dispatchEvent(new Event('input', { bubbles: true }));
  }

  blockTypeSelect.innerHTML = BLOCK_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  addButton.addEventListener('click', () => {
    blocks.push({ ...createDefaultBlock(blockTypeSelect.value), clientId: `block-${clientId++}`, collapsed: false });
    render();
    onDirty();
    blockList.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  blockList.addEventListener('mousedown', (event) => {
    if (event.target.closest('[data-rich-command]')) event.preventDefault();
  });

  blockList.addEventListener('click', async (event) => {
    const target = event.target;
    const context = getContext(target);
    if (!context) return;
    const { block, index } = context;
    if (target.closest('[data-block-up]') && index > 0) {
      [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      render(); onDirty(); return;
    }
    if (target.closest('[data-block-down]') && index < blocks.length - 1) {
      [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
      render(); onDirty(); return;
    }
    if (target.closest('[data-block-edit]')) {
      block.collapsed = !block.collapsed; render(); return;
    }
    if (target.closest('[data-block-delete]')) {
      blocks.splice(index, 1); render(); onDirty(); return;
    }
    const richCommand = target.closest('[data-rich-command]');
    if (richCommand) { handleRichCommand(richCommand); onDirty(); return; }
    const blockUpload = target.closest('[data-block-upload]');
    if (blockUpload) {
      const media = await uploadForButton(blockUpload, 'image/jpeg,image/png,image/webp,image/gif');
      if (media) { block.data.url = media.publicUrl; render(); onDirty(); }
      return;
    }
    const fileUpload = target.closest('[data-file-upload]');
    if (fileUpload) {
      const media = await uploadForButton(fileUpload, '.pdf,.zip,.txt,.doc,.docx,.xls,.xlsx');
      if (media) { block.data.url = media.publicUrl; render(); onDirty(); }
      return;
    }
    const galleryAdd = target.closest('[data-gallery-add]');
    if (galleryAdd) {
      block.data.images ||= [];
      block.data.images.push({ url: '', alt: '', caption: '' });
      render(); onDirty(); return;
    }
    const galleryRemove = target.closest('[data-gallery-remove]');
    if (galleryRemove) {
      block.data.images.splice(Number(galleryRemove.dataset.galleryRemove), 1);
      render(); onDirty(); return;
    }
    const galleryUpload = target.closest('[data-gallery-upload]');
    if (galleryUpload) {
      const media = await uploadForButton(galleryUpload, 'image/jpeg,image/png,image/webp,image/gif');
      if (media) {
        block.data.images[Number(galleryUpload.dataset.galleryUpload)].url = media.publicUrl;
        render(); onDirty();
      }
    }
  });

  blockList.addEventListener('input', (event) => {
    const context = getContext(event.target);
    if (!context) return;
    const { block } = context;
    const galleryItem = event.target.closest('[data-gallery-index]');
    if (galleryItem) {
      const map = { 'gallery-url': 'url', 'gallery-alt': 'alt', 'gallery-caption': 'caption' };
      const field = map[event.target.dataset.blockField];
      if (field) block.data.images[Number(galleryItem.dataset.galleryIndex)][field] = event.target.value;
      onDirty(); return;
    }
    if (event.target.dataset.tableHeader !== undefined) {
      block.data.headers[Number(event.target.dataset.tableHeader)] = event.target.value;
      onDirty(); return;
    }
    if (event.target.dataset.tableRow !== undefined) {
      block.data.rows[Number(event.target.dataset.tableRow)][Number(event.target.dataset.tableColumn)] = event.target.value;
      onDirty(); return;
    }
    if (event.target.dataset.richField) {
      block.data[event.target.dataset.richField] = event.target.innerHTML;
      onDirty(); return;
    }
    const field = event.target.dataset.blockField;
    if (!field) return;
    if (field === 'items') block.data.items = event.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
    else if (event.target.type === 'checkbox') block.data[field] = event.target.checked;
    else if (event.target.type === 'number') block.data[field] = Number(event.target.value);
    else block.data[field] = event.target.value;
    if (block.type === 'title') renderGuide();
    onDirty();
  });

  blockList.addEventListener('change', (event) => {
    const context = getContext(event.target);
    if (!context) return;
    const { block } = context;
    const field = event.target.dataset.blockField;
    if (!field) return;
    if (event.target.type === 'checkbox') block.data[field] = event.target.checked;
    else if (event.target.type === 'number') block.data[field] = Number(event.target.value);
    else block.data[field] = event.target.value;
    if (block.type === 'table' && ['rowsCount', 'columnsCount', 'hasHeader'].includes(field)) {
      normalizeTable(block);
      render();
    }
    onDirty();
  });

  render();
  return {
    getBlocks: () => blocks.map(({ type, data }) => ({ type, data: structuredClone(data) })),
    setBlocks(nextBlocks) {
      blocks = (nextBlocks || []).map((block) => ({
        type: block.type,
        data: structuredClone(block.data || {}),
        clientId: `block-${clientId++}`,
        collapsed: false
      }));
      render();
    }
  };
}
