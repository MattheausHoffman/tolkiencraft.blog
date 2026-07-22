import { showTimedAlert } from '../auth-ui.js';
import { initAdminShell } from '../admin-session.js';
import { adminApi, uploadMedia } from './api.js';

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190);
}

function currentKingdomId() {
  const match = window.location.pathname.match(/^\/adm\/reinos\/(\d+)\/editar\/?$/);
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
  Object.entries(errors).forEach(([field, message]) => {
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
    imagem: data.get('imagem'),
    status: data.get('status'),
    racas: data.get('racas'),
    lideranca: data.get('lideranca'),
    descricao: data.get('descricao'),
    ordemExibicao: data.get('ordemExibicao')
  };
}

async function init() {
  const alertElement = document.querySelector('[data-auth-alert]');
  await initAdminShell({ alertElement });

  const form = document.querySelector('[data-kingdom-editor]');
  const id = currentKingdomId();
  const nameInput = form.elements.nome;
  const slugInput = form.elements.slug;
  const imageInput = form.elements.imagem;
  const descriptionInput = form.elements.descricao;
  const counter = document.querySelector('[data-description-counter]');
  const preview = document.querySelector('[data-image-preview]');
  const previewImage = preview.querySelector('img');
  const uploadTrigger = document.querySelector('[data-upload-trigger]');
  const uploadInput = document.querySelector('[data-upload-input]');
  const saveButton = document.querySelector('[data-save-button]');

  function updateSlug() {
    slugInput.value = slugify(nameInput.value);
  }

  function updateCounter() {
    const length = descriptionInput.value.length;
    counter.textContent = `${length}/100`;
    counter.classList.toggle('is-at-limit', length >= 100);
  }

  function updatePreview() {
    const url = imageInput.value.trim();
    if (!url) {
      preview.hidden = true;
      previewImage.removeAttribute('src');
      return;
    }
    previewImage.src = url;
    preview.hidden = false;
  }

  nameInput.addEventListener('input', updateSlug);
  descriptionInput.addEventListener('input', updateCounter);
  imageInput.addEventListener('input', updatePreview);
  previewImage.addEventListener('error', () => {
    preview.hidden = true;
  });

  uploadTrigger.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', async () => {
    const [file] = uploadInput.files;
    if (!file) return;
    uploadTrigger.disabled = true;
    uploadTrigger.textContent = 'Enviando...';
    try {
      const data = await uploadMedia(file);
      imageInput.value = data.media.publicUrl;
      updatePreview();
      showTimedAlert(alertElement, 'Imagem enviada com sucesso.', 3000, 'success');
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    } finally {
      uploadInput.value = '';
      uploadTrigger.disabled = false;
      uploadTrigger.textContent = 'Enviar imagem';
    }
  });

  if (id) {
    document.querySelector('[data-editor-title]').textContent = 'Editar Reino';
    document.querySelector('[data-editor-breadcrumb]').textContent = 'Editar';
    saveButton.textContent = 'Atualizar Reino';
    try {
      const data = await adminApi(`/api/admin/reinos/${id}`);
      const kingdom = data.kingdom;
      nameInput.value = kingdom.nome || '';
      slugInput.value = kingdom.slug || '';
      imageInput.value = kingdom.imagem || '';
      form.elements.status.value = kingdom.status || 'active';
      form.elements.racas.value = kingdom.racas || '';
      form.elements.lideranca.value = kingdom.lideranca || '';
      descriptionInput.value = kingdom.descricao || '';
      form.elements.ordemExibicao.value = kingdom.ordemExibicao ?? 0;
      updateCounter();
      updatePreview();
    } catch (error) {
      showTimedAlert(alertElement, error.message);
    }
  } else {
    updateSlug();
    updateCounter();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);

    if (!form.reportValidity()) return;
    if (descriptionInput.value.length > 100) {
      applyFieldErrors(form, { descricao: 'A descrição deve possuir no máximo 100 caracteres.' });
      descriptionInput.focus();
      return;
    }

    saveButton.disabled = true;
    const originalText = saveButton.textContent;
    saveButton.textContent = id ? 'Atualizando...' : 'Salvando...';

    try {
      const data = await adminApi(id ? `/api/admin/reinos/${id}` : '/api/admin/reinos', {
        method: id ? 'PUT' : 'POST',
        body: formPayload(form)
      });
      showTimedAlert(alertElement, data.message, 3000, 'success');
      if (!id && data.redirect) {
        window.setTimeout(() => window.location.replace(data.redirect), 450);
      } else if (data.kingdom?.slug) {
        slugInput.value = data.kingdom.slug;
      }
    } catch (error) {
      applyFieldErrors(form, error.errors);
      showTimedAlert(alertElement, error.message);
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  });
}

init().catch((error) => console.error(error));
