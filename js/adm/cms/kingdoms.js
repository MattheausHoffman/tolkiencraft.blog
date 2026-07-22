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

function statusLabel(status) {
  return status === 'active' ? 'Ativo' : 'Inativo';
}

function kingdomRow(kingdom) {
  return `
    <tr>
      <td data-label="Imagem">
        ${kingdom.imagem
          ? `<img class="admin-kingdom-image" src="${escapeHtml(kingdom.imagem)}" alt="">`
          : '<span class="admin-publication-placeholder admin-kingdom-image" aria-hidden="true">TC</span>'}
      </td>
      <td data-label="Nome"><div class="admin-kingdom-name"><strong>${escapeHtml(kingdom.nome)}</strong><small>/reinos/${escapeHtml(kingdom.slug)}</small></div></td>
      <td data-label="Status"><span class="status-badge status-badge--${kingdom.status}">${statusLabel(kingdom.status)}</span></td>
      <td data-label="Liderança">${escapeHtml(kingdom.lideranca)}</td>
      <td data-label="Raças">${escapeHtml(kingdom.racas)}</td>
      <td data-label="Descrição"><p class="admin-kingdom-description">${escapeHtml(kingdom.descricao)}</p></td>
      <td data-label="Ordem">${kingdom.ordemExibicao}</td>
      <td data-label="Ações">
        <div class="admin-row-actions">
          <a class="admin-action-link" href="/adm/reinos/${kingdom.id}/editar">Editar</a>
          <button class="admin-action-link admin-action-link--danger" type="button" data-delete-id="${kingdom.id}" data-delete-title="${escapeHtml(kingdom.nome)}">Excluir</button>
        </div>
      </td>
    </tr>`;
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-kingdom-filters]');
  const list = document.querySelector('[data-kingdom-list]');
  const count = document.querySelector('[data-result-count]');
  const dialog = document.querySelector('[data-delete-dialog]');
  const deleteTitle = document.querySelector('[data-delete-title]');
  let pendingDeleteId = null;
  let searchTimer = null;

  async function loadKingdoms() {
    const params = new URLSearchParams(new FormData(form));
    list.innerHTML = '<tr><td colspan="8">Carregando Reinos...</td></tr>';
    try {
      const data = await adminApi(`/api/admin/reinos?${params.toString()}`);
      const kingdoms = data.kingdoms || [];
      count.textContent = `${kingdoms.length} ${kingdoms.length === 1 ? 'Reino' : 'Reinos'}`;
      list.innerHTML = kingdoms.length
        ? kingdoms.map(kingdomRow).join('')
        : '<tr><td colspan="8"><p class="empty-state">Nenhum Reino encontrado.</p></td></tr>';
    } catch (error) {
      list.innerHTML = '<tr><td colspan="8"><p class="empty-state">Não foi possível carregar os Reinos.</p></td></tr>';
      showTimedAlert(alertElement, error.message);
    }
  }

  form.addEventListener('input', (event) => {
    if (event.target.name === 'search') {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(loadKingdoms, 280);
    }
  });
  form.addEventListener('change', loadKingdoms);

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
      const data = await adminApi(`/api/admin/reinos/${pendingDeleteId}`, { method: 'DELETE' });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      await loadKingdoms();
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      pendingDeleteId = null;
    }
  });

  await loadKingdoms();
}

init().catch((error) => console.error(error));
