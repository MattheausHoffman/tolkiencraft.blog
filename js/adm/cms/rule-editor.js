import { showTimedAlert } from '../auth-ui.js';
import { initAdminShell } from '../admin-session.js';
import { adminApi } from './api.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function currentRuleId() {
  const match = window.location.pathname.match(/^\/adm\/regras\/(\d+)\/editar\/?$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function clearFieldErrors(form) {
  form.querySelectorAll('[data-field-error]').forEach((element) => {
    element.textContent = '';
  });
  form.querySelectorAll('[aria-invalid="true"]').forEach((element) => {
    element.removeAttribute('aria-invalid');
  });
}

function applyFieldErrors(form, errors = {}) {
  Object.entries(errors || {}).forEach(([field, message]) => {
    const input = form.elements.namedItem(field);
    const error = form.querySelector(`[data-field-error="${field}"]`);
    if (input) input.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  });
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-rule-editor]');
  const id = currentRuleId();
  const titleInput = form.elements.titulo;
  const slugInput = form.elements.slug;
  const descriptionInput = form.elements.descricao;
  const counter = document.querySelector('[data-description-counter]');
  const sectionList = document.querySelector('[data-rule-sections]');
  const saveButton = document.querySelector('[data-save-button]');
  let sections = [];

  function updateSlug() {
    slugInput.value = slugify(titleInput.value);
  }

  function updateCounter() {
    const length = descriptionInput.value.length;
    counter.textContent = `${length}/500`;
    counter.classList.toggle('is-at-limit', length >= 500);
  }

  function renderSections() {
    sectionList.innerHTML = sections.length ? sections.map((section, index) => `
      <article class="block-editor-card" data-rule-section-index="${index}">
        <header class="block-editor-card__header">
          <div>
            <span class="block-editor-card__number">${String(index + 1).padStart(2, '0')}</span>
            <div><strong data-section-label>${escapeHtml(section.title || `Seção ${index + 1}`)}</strong><small>${section.items.length} ${section.items.length === 1 ? 'item' : 'itens'}</small></div>
          </div>
          <div class="block-editor-card__actions">
            <button type="button" title="Mover para cima" data-section-up ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" title="Mover para baixo" data-section-down ${index === sections.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="is-danger" data-section-delete>Excluir</button>
          </div>
        </header>
        <div class="block-editor-card__body">
          <div class="admin-form-grid">
            <div class="form-field form-field--wide">
              <label for="section-title-${index}">Título da Seção</label>
              <input id="section-title-${index}" maxlength="120" required value="${escapeHtml(section.title)}" data-section-title>
            </div>
            <div class="form-field form-field--wide">
              <label for="section-items-${index}">Itens da Lista</label>
              <textarea id="section-items-${index}" rows="7" required data-section-items>${escapeHtml(section.items.join('\n'))}</textarea>
              <small>Informe um item por linha. Linhas vazias serão ignoradas.</small>
            </div>
          </div>
        </div>
      </article>`).join('') : '<p class="empty-state">Nenhuma seção adicionada. A Regra pode exibir somente a descrição ou receber seções com listas.</p>';
  }

  function fillRule(rule) {
    titleInput.value = rule.titulo || '';
    slugInput.value = rule.slug || '';
    descriptionInput.value = rule.descricao || '';
    form.elements.status.value = rule.status || 'active';
    form.elements.ordemExibicao.value = rule.ordemExibicao ?? 0;
    sections = (rule.sections || []).map((section) => ({
      title: section.title || '',
      items: Array.isArray(section.items) ? section.items : []
    }));
    updateCounter();
    renderSections();
  }

  function formPayload() {
    return {
      titulo: titleInput.value,
      descricao: descriptionInput.value,
      status: form.elements.status.value,
      ordemExibicao: form.elements.ordemExibicao.value,
      sections
    };
  }

  titleInput.addEventListener('input', updateSlug);
  descriptionInput.addEventListener('input', updateCounter);
  updateSlug();
  updateCounter();
  renderSections();

  document.querySelector('[data-add-rule-section]').addEventListener('click', () => {
    sections.push({ title: '', items: [] });
    renderSections();
    sectionList.lastElementChild?.querySelector('[data-section-title]')?.focus();
  });

  sectionList.addEventListener('input', (event) => {
    const card = event.target.closest('[data-rule-section-index]');
    if (!card) return;
    const index = Number.parseInt(card.dataset.ruleSectionIndex, 10);
    if (event.target.matches('[data-section-title]')) {
      sections[index].title = event.target.value;
      card.querySelector('[data-section-label]').textContent = event.target.value || `Seção ${index + 1}`;
    }
    if (event.target.matches('[data-section-items]')) {
      sections[index].items = event.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
      card.querySelector('.block-editor-card__header small').textContent = `${sections[index].items.length} ${sections[index].items.length === 1 ? 'item' : 'itens'}`;
    }
  });

  sectionList.addEventListener('click', (event) => {
    const card = event.target.closest('[data-rule-section-index]');
    if (!card) return;
    const index = Number.parseInt(card.dataset.ruleSectionIndex, 10);
    if (event.target.closest('[data-section-up]') && index > 0) {
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      renderSections();
    } else if (event.target.closest('[data-section-down]') && index < sections.length - 1) {
      [sections[index + 1], sections[index]] = [sections[index], sections[index + 1]];
      renderSections();
    } else if (event.target.closest('[data-section-delete]')) {
      sections.splice(index, 1);
      renderSections();
    }
  });

  if (id) {
    document.querySelector('[data-editor-title]').textContent = 'Editar Regra';
    document.querySelector('[data-editor-breadcrumb]').textContent = 'Editar';
    saveButton.textContent = 'Atualizar Regra';
    try {
      const data = await adminApi(`/api/admin/regras/${id}`);
      fillRule(data.rule);
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    if (!form.reportValidity()) return;

    saveButton.disabled = true;
    const originalText = saveButton.textContent;
    saveButton.textContent = id ? 'Atualizando...' : 'Salvando...';
    try {
      const data = await adminApi(id ? `/api/admin/regras/${id}` : '/api/admin/regras', {
        method: id ? 'PUT' : 'POST',
        body: formPayload()
      });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      if (!id && data.redirect) {
        window.setTimeout(() => window.location.replace(data.redirect), 450);
      } else if (data.rule) {
        fillRule(data.rule);
      }
    } catch (error) {
      applyFieldErrors(form, error.errors);
      showTimedAlert(alertElement, error.message);
      form.querySelector('[aria-invalid="true"]')?.focus();
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  });
}

init().catch((error) => console.error(error));
