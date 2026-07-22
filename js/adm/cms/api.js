import { requestCsrfToken } from '../auth-ui.js';

let csrfToken = null;

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Não foi possível concluir a solicitação.');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }
  return data;
}

export async function adminApi(url, options = {}) {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
    csrfToken ||= await requestCsrfToken();
    headers.set('X-CSRF-Token', csrfToken);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      method,
      credentials: 'same-origin',
      headers,
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
    });
    return await parseResponse(response);
  } catch (error) {
    if (error.status === 403) csrfToken = null;
    throw error;
  }
}

export async function uploadMedia(file, publicationId = null) {
  const formData = new FormData();
  formData.append('arquivo', file);
  if (publicationId) formData.append('publicationId', String(publicationId));
  return adminApi('/api/admin/uploads', { method: 'POST', body: formData });
}
