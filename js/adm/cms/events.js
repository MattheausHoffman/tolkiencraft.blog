import { eventMonthName, formatEventDate } from '../../event-format.js';
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

function eventRow(event) {
  return `
    <tr>
      <td data-label="Nome"><strong>${escapeHtml(event.nome)}</strong></td>
      <td data-label="Mês">${escapeHtml(eventMonthName(event.mes))}</td>
      <td data-label="Dia"><strong class="admin-event-date">${escapeHtml(formatEventDate(event))}</strong></td>
      <td data-label="Descrição"><p class="admin-event-description">${escapeHtml(event.descricao || '—')}</p></td>
      <td data-label="Ordem">${event.ordemExibicao}</td>
      <td data-label="Editar"><a class="admin-action-link" href="/adm/eventos/${event.id}/editar">Editar</a></td>
      <td data-label="Excluir"><button class="admin-action-link admin-action-link--danger" type="button" data-delete-id="${event.id}" data-delete-title="${escapeHtml(event.nome)}">Excluir</button></td>
    </tr>`;
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-event-filters]');
  const list = document.querySelector('[data-event-list]');
  const count = document.querySelector('[data-result-count]');
  const currentYear = document.querySelector('[data-current-year]');
  const dialog = document.querySelector('[data-delete-dialog]');
  const deleteTitle = document.querySelector('[data-delete-title]');
  let pendingDeleteId = null;
  let searchTimer = null;

  async function loadEvents() {
    const params = new URLSearchParams(new FormData(form));
    list.innerHTML = '<tr><td colspan="7">Carregando Eventos...</td></tr>';
    try {
      const data = await adminApi(`/api/admin/eventos?${params.toString()}`);
      const events = data.events || [];
      currentYear.textContent = data.currentYear;
      count.textContent = `${events.length} ${events.length === 1 ? 'Evento' : 'Eventos'}`;
      list.innerHTML = events.length
        ? events.map(eventRow).join('')
        : '<tr><td colspan="7"><p class="empty-state">Nenhum Evento encontrado.</p></td></tr>';
    } catch (error) {
      list.innerHTML = '<tr><td colspan="7"><p class="empty-state">Não foi possível carregar os Eventos.</p></td></tr>';
      showTimedAlert(alertElement, error.message);
    }
  }

  form.addEventListener('input', (event) => {
    if (event.target.name === 'search') {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(loadEvents, 280);
    }
  });
  form.addEventListener('change', loadEvents);

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;
    pendingDeleteId = button.dataset.deleteId;
    deleteTitle.textContent = button.dataset.deleteTitle;
    dialog.returnValue = '';
    dialog.showModal();
  });

  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'confirm' || !pendingDeleteId) {
      pendingDeleteId = null;
      return;
    }
    try {
      const data = await adminApi(`/api/admin/eventos/${pendingDeleteId}`, { method: 'DELETE' });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      await loadEvents();
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      pendingDeleteId = null;
    }
  });

  await loadEvents();
}

init().catch((error) => console.error(error));
