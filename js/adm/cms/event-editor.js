import { showTimedAlert } from '../auth-ui.js';
import { initAdminShell } from '../admin-session.js';
import { adminApi } from './api.js';

function currentEventId() {
  const match = window.location.pathname.match(/^\/adm\/eventos\/(\d+)\/editar\/?$/);
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

function formPayload(form) {
  const data = new FormData(form);
  return {
    nome: data.get('nome'),
    mes: data.get('mes'),
    diaInicial: data.get('diaInicial'),
    diaFinal: data.get('diaFinal'),
    aDefinir: form.elements.aDefinir.checked,
    descricao: data.get('descricao'),
    ordemExibicao: data.get('ordemExibicao')
  };
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-event-editor]');
  const id = currentEventId();
  const monthInput = form.elements.mes;
  const undefinedInput = form.elements.aDefinir;
  const startDayInput = form.elements.diaInicial;
  const endDayInput = form.elements.diaFinal;
  const descriptionInput = form.elements.descricao;
  const counter = document.querySelector('[data-description-counter]');
  const yearInput = document.querySelector('[data-current-year]');
  const saveButton = document.querySelector('[data-save-button]');
  let serverYear = null;

  function updateCounter() {
    const length = descriptionInput.value.length;
    counter.textContent = `${length}/25`;
    counter.classList.toggle('is-at-limit', length >= 25);
  }

  function updateDateState({ clear = false } = {}) {
    const isUndefined = undefinedInput.checked;
    startDayInput.disabled = isUndefined;
    endDayInput.disabled = isUndefined;
    startDayInput.required = !isUndefined;
    if (isUndefined && clear) {
      startDayInput.value = '';
      endDayInput.value = '';
    }
  }

  function updateDayLimits() {
    const month = Number.parseInt(monthInput.value, 10);
    if (!serverYear || !month) return;
    const lastDay = new Date(serverYear, month, 0).getDate();
    startDayInput.max = String(lastDay);
    endDayInput.max = String(lastDay);
  }

  function fillEvent(event) {
    form.elements.nome.value = event.nome || '';
    monthInput.value = event.mes || '';
    startDayInput.value = event.diaInicial ?? '';
    endDayInput.value = event.diaFinal ?? '';
    undefinedInput.checked = event.diaInicial === null;
    descriptionInput.value = event.descricao || '';
    form.elements.ordemExibicao.value = event.ordemExibicao ?? 0;
    updateCounter();
    updateDateState();
    updateDayLimits();
  }

  descriptionInput.addEventListener('input', updateCounter);
  undefinedInput.addEventListener('change', () => updateDateState({ clear: true }));
  monthInput.addEventListener('change', updateDayLimits);
  updateCounter();
  updateDateState();

  try {
    const data = id
      ? await adminApi(`/api/admin/eventos/${id}`)
      : await adminApi('/api/admin/eventos?limit=1');
    serverYear = data.currentYear;
    yearInput.value = String(serverYear);

    if (id) {
      document.querySelector('[data-editor-title]').textContent = 'Editar Evento';
      document.querySelector('[data-editor-breadcrumb]').textContent = 'Editar';
      saveButton.textContent = 'Atualizar Evento';
      fillEvent(data.event);
    }
  } catch (error) {
    yearInput.value = 'Indisponível';
    showTimedAlert(alertElement, error.message);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);

    if (!form.reportValidity()) return;
    if (descriptionInput.value.length > 25) {
      applyFieldErrors(form, { descricao: 'A descrição deve possuir no máximo 25 caracteres.' });
      descriptionInput.focus();
      return;
    }

    saveButton.disabled = true;
    const originalText = saveButton.textContent;
    saveButton.textContent = id ? 'Atualizando...' : 'Salvando...';

    try {
      const data = await adminApi(id ? `/api/admin/eventos/${id}` : '/api/admin/eventos', {
        method: id ? 'PUT' : 'POST',
        body: formPayload(form)
      });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      if (!id && data.redirect) {
        window.setTimeout(() => window.location.replace(data.redirect), 450);
      } else if (data.event) {
        fillEvent(data.event);
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
