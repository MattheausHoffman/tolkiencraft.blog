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
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}

function statusLabel(status) {
  return status === 'published' ? 'Publicado' : 'Rascunho';
}

function publicationRow(publication) {
  const publicLink = publication.status === 'published'
    ? `<a class="admin-action-link" href="/publicacoes/${encodeURIComponent(publication.slug)}" target="_blank" rel="noopener noreferrer">Visualizar</a>`
    : '';
  return `
    <tr>
      <td data-label="Publicação">
        <div class="admin-publication-cell">
          ${publication.coverImageUrl ? `<img src="${escapeHtml(publication.coverImageUrl)}" alt="">` : '<span class="admin-publication-placeholder" aria-hidden="true">TC</span>'}
          <div><strong>${escapeHtml(publication.title)}</strong><small>/${escapeHtml(publication.slug)} · ${publication.blockCount} blocos</small></div>
        </div>
      </td>
      <td data-label="Status"><span class="status-badge ${publication.status === 'published' ? 'status-badge--active' : 'status-badge--draft'}">${statusLabel(publication.status)}</span></td>
      <td data-label="Ordem">${publication.displayOrder}</td>
      <td data-label="Atualização">${escapeHtml(formatDate(publication.updatedAt))}</td>
      <td data-label="Ações">
        <div class="admin-row-actions">
          <a class="admin-action-link" href="/adm/publicacoes/${publication.id}/editar">Editar</a>
          ${publicLink}
          <button class="admin-action-link admin-action-link--danger" type="button" data-delete-id="${publication.id}" data-delete-title="${escapeHtml(publication.title)}">Excluir</button>
        </div>
      </td>
    </tr>`;
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-publication-filters]');
  const list = document.querySelector('[data-publication-list]');
  const count = document.querySelector('[data-result-count]');
  const dialog = document.querySelector('[data-delete-dialog]');
  const deleteTitle = document.querySelector('[data-delete-title]');
  let pendingDeleteId = null;
  let searchTimer = null;

  async function loadPublications() {
    const params = new URLSearchParams(new FormData(form));
    list.innerHTML = '<tr><td colspan="5">Carregando publicações...</td></tr>';
    try {
      const data = await adminApi(`/api/admin/publicacoes?${params.toString()}`);
      const publications = data.publications || [];
      count.textContent = `${publications.length} ${publications.length === 1 ? 'publicação' : 'publicações'}`;
      list.innerHTML = publications.length
        ? publications.map(publicationRow).join('')
        : '<tr><td colspan="5"><p class="empty-state">Nenhuma publicação encontrada.</p></td></tr>';
    } catch (error) {
      list.innerHTML = '<tr><td colspan="5"><p class="empty-state">Não foi possível carregar as publicações.</p></td></tr>';
      showTimedAlert(alertElement, error.message);
    }
  }

  form.addEventListener('input', (event) => {
    if (event.target.name === 'search') {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(loadPublications, 280);
    }
  });
  form.addEventListener('change', loadPublications);

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
      const data = await adminApi(`/api/admin/publicacoes/${pendingDeleteId}`, { method: 'DELETE' });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      await loadPublications();
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      pendingDeleteId = null;
    }
  });

  await loadPublications();
}

init().catch((error) => console.error(error));
