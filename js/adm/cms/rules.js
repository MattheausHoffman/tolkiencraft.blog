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

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
}

function statusLabel(status) {
  return status === 'active' ? 'Ativa' : 'Inativa';
}

function ruleRow(rule) {
  return `
    <tr>
      <td data-label="Título">
        <div class="admin-rule-title">
          <strong>${escapeHtml(rule.titulo)}</strong>
          <small>/${escapeHtml(rule.slug)} · ${rule.sections.length} ${rule.sections.length === 1 ? 'seção' : 'seções'}</small>
        </div>
      </td>
      <td data-label="Status"><span class="status-badge status-badge--${rule.status}">${statusLabel(rule.status)}</span></td>
      <td data-label="Ordem">${rule.ordemExibicao}</td>
      <td data-label="Data de criação">${escapeHtml(formatDate(rule.createdAt))}</td>
      <td data-label="Editar"><a class="admin-action-link" href="/adm/regras/${rule.id}/editar">Editar</a></td>
      <td data-label="Excluir"><button class="admin-action-link admin-action-link--danger" type="button" data-delete-id="${rule.id}" data-delete-title="${escapeHtml(rule.titulo)}">Excluir</button></td>
    </tr>`;
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-rule-filters]');
  const list = document.querySelector('[data-rule-list]');
  const count = document.querySelector('[data-result-count]');
  const dialog = document.querySelector('[data-delete-dialog]');
  const deleteTitle = document.querySelector('[data-delete-title]');
  let pendingDeleteId = null;
  let searchTimer = null;

  async function loadRules() {
    const params = new URLSearchParams(new FormData(form));
    list.innerHTML = '<tr><td colspan="6">Carregando Regras...</td></tr>';
    try {
      const data = await adminApi(`/api/admin/regras?${params.toString()}`);
      const rules = data.rules || [];
      count.textContent = `${rules.length} ${rules.length === 1 ? 'Regra' : 'Regras'}`;
      list.innerHTML = rules.length
        ? rules.map(ruleRow).join('')
        : '<tr><td colspan="6"><p class="empty-state">Nenhuma Regra encontrada.</p></td></tr>';
    } catch (error) {
      list.innerHTML = '<tr><td colspan="6"><p class="empty-state">Não foi possível carregar as Regras.</p></td></tr>';
      showTimedAlert(alertElement, error.message);
    }
  }

  form.addEventListener('input', (event) => {
    if (event.target.name === 'search') {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(loadRules, 280);
    }
  });
  form.addEventListener('change', loadRules);

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
      const data = await adminApi(`/api/admin/regras/${pendingDeleteId}`, { method: 'DELETE' });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      await loadRules();
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      pendingDeleteId = null;
    }
  });

  await loadRules();
}

init().catch((error) => console.error(error));
