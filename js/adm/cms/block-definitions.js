export const BLOCK_OPTIONS = [
  ['title', 'Título'], ['subtitle', 'Subtítulo'], ['text', 'Texto'], ['paragraph', 'Parágrafo'],
  ['list', 'Lista'], ['ordered_list', 'Lista numerada'], ['quote', 'Citação'], ['image', 'Imagem'],
  ['gallery', 'Galeria'], ['link', 'Link'], ['button', 'Botão'], ['code', 'Código'], ['table', 'Tabela'],
  ['notice', 'Aviso'], ['highlight', 'Destaque'], ['separator', 'Separador'], ['video', 'Vídeo'],
  ['download', 'Download de arquivo']
];

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function blockLabel(type) {
  return BLOCK_OPTIONS.find(([id]) => id === type)?.[1] || type;
}

export function createDefaultBlock(type) {
  const defaults = {
    title: { text: 'Nova seção' },
    subtitle: { text: 'Novo subtítulo' },
    text: { html: '<p>Digite o texto...</p>' },
    paragraph: { html: '<p>Digite o parágrafo...</p>' },
    list: { items: ['Primeiro item', 'Segundo item'] },
    ordered_list: { items: ['Primeiro item', 'Segundo item'] },
    quote: { html: '<p>Digite a citação...</p>', cite: '' },
    image: { url: '', alt: '', caption: '', width: 100, alignment: 'center' },
    gallery: { columns: 2, images: [] },
    link: { url: '', text: 'Texto do link', newTab: false },
    button: { url: '', text: 'Acessar', newTab: false, style: 'primary' },
    code: { code: '', language: 'html' },
    table: { rowsCount: 2, columnsCount: 2, hasHeader: true, headers: ['Coluna 1', 'Coluna 2'], rows: [['', ''], ['', '']], alignment: 'left' },
    notice: { heading: 'Aviso', html: '<p>Conteúdo do aviso.</p>' },
    highlight: { heading: 'Destaque', html: '<p>Conteúdo em destaque.</p>' },
    separator: {},
    video: { url: '', title: '', caption: '' },
    download: { url: '', label: 'Baixar arquivo', description: '' }
  };
  return { type, data: structuredClone(defaults[type] || {}) };
}

function field(label, name, value = '', options = {}) {
  const wide = options.wide === false ? '' : ' form-field--wide';
  const type = options.type || 'text';
  const attrs = [
    options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : '',
    options.min !== undefined ? `min="${options.min}"` : '',
    options.max !== undefined ? `max="${options.max}"` : '',
    options.step !== undefined ? `step="${options.step}"` : ''
  ].filter(Boolean).join(' ');
  return `<div class="form-field${wide}"><label>${escapeHtml(label)}</label><input type="${type}" value="${escapeHtml(value)}" data-block-field="${name}" ${attrs}></div>`;
}

function textarea(label, name, value = '', rows = 5) {
  return `<div class="form-field form-field--wide"><label>${escapeHtml(label)}</label><textarea rows="${rows}" data-block-field="${name}">${escapeHtml(value)}</textarea></div>`;
}

function select(label, name, value, options, wide = false) {
  return `<div class="form-field${wide ? ' form-field--wide' : ''}"><label>${escapeHtml(label)}</label><select data-block-field="${name}">${options.map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${optionValue === value ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`).join('')}</select></div>`;
}

function checkbox(label, name, checked) {
  return `<label class="check-field"><input type="checkbox" data-block-field="${name}" ${checked ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`;
}

function richEditor(label, name, html = '') {
  return `<div class="form-field form-field--wide"><label>${escapeHtml(label)}</label><div class="rich-editor" data-rich-editor><div class="rich-editor__toolbar" role="toolbar" aria-label="Formatação do texto"><button type="button" data-rich-command="bold" title="Negrito"><strong>B</strong></button><button type="button" data-rich-command="italic" title="Itálico"><em>I</em></button><button type="button" data-rich-command="underline" title="Sublinhado"><u>U</u></button><button type="button" data-rich-command="strikeThrough" title="Tachado"><s>S</s></button><button type="button" data-rich-command="inlineCode" title="Código inline">&lt;/&gt;</button><button type="button" data-rich-command="insertUnorderedList" title="Lista">• Lista</button><button type="button" data-rich-command="insertOrderedList" title="Lista numerada">1. Lista</button><button type="button" data-rich-command="createLink" title="Inserir link">Link</button><button type="button" data-rich-command="unlink" title="Remover link">Remover link</button></div><div class="rich-editor__content" contenteditable="true" role="textbox" aria-multiline="true" data-rich-field="${name}">${html || ''}</div></div></div>`;
}

function renderGallery(data) {
  const images = Array.isArray(data.images) ? data.images : [];
  return `<div class="admin-form-grid">${select('Colunas', 'columns', String(data.columns || 2), [['1', '1 coluna'], ['2', '2 colunas'], ['3', '3 colunas'], ['4', '4 colunas']])}</div><div class="gallery-editor" data-gallery-list>${images.length ? images.map((image, index) => `<div class="gallery-editor__item" data-gallery-index="${index}"><div class="gallery-editor__preview">${image.url ? `<img src="${escapeHtml(image.url)}" alt="">` : '<span>Sem imagem</span>'}</div><div class="admin-form-grid">${field('URL', 'gallery-url', image.url || '')}${field('Texto ALT', 'gallery-alt', image.alt || '')}${field('Legenda', 'gallery-caption', image.caption || '')}</div><div class="gallery-editor__actions"><button class="button button--small button--secondary" type="button" data-gallery-upload="${index}">Enviar imagem</button><button class="button button--small button--danger" type="button" data-gallery-remove="${index}">Remover</button></div></div>`).join('') : '<p class="empty-state">Nenhuma imagem na galeria.</p>'}</div><button class="button button--small button--secondary" type="button" data-gallery-add>Adicionar imagem</button>`;
}

function renderTable(data) {
  const rows = Math.min(Math.max(Number(data.rowsCount) || data.rows?.length || 2, 1), 30);
  const columns = Math.min(Math.max(Number(data.columnsCount) || data.headers?.length || 2, 1), 12);
  const headers = Array.from({ length: columns }, (_, index) => data.headers?.[index] || '');
  const bodyRows = Array.from({ length: rows }, (_, rowIndex) => Array.from({ length: columns }, (_, columnIndex) => data.rows?.[rowIndex]?.[columnIndex] || ''));
  return `<div class="admin-form-grid">${field('Linhas', 'rowsCount', rows, { type: 'number', min: 1, max: 30, wide: false })}${field('Colunas', 'columnsCount', columns, { type: 'number', min: 1, max: 12, wide: false })}${select('Alinhamento', 'alignment', data.alignment || 'left', [['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']])}${checkbox('Usar primeira linha como cabeçalho', 'hasHeader', Boolean(data.hasHeader))}</div><div class="table-builder"><table><tbody>${data.hasHeader ? `<tr>${headers.map((cell, columnIndex) => `<th><input value="${escapeHtml(cell)}" data-table-header="${columnIndex}" aria-label="Cabeçalho ${columnIndex + 1}"></th>`).join('')}</tr>` : ''}${bodyRows.map((row, rowIndex) => `<tr>${row.map((cell, columnIndex) => `<td><input value="${escapeHtml(cell)}" data-table-row="${rowIndex}" data-table-column="${columnIndex}" aria-label="Linha ${rowIndex + 1}, coluna ${columnIndex + 1}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function renderBlockFields(block) {
  const data = block.data || {};
  switch (block.type) {
    case 'title': return `<div class="admin-form-grid">${field('Título da seção', 'text', data.text || '')}</div>`;
    case 'subtitle': return `<div class="admin-form-grid">${field('Subtítulo', 'text', data.text || '')}</div>`;
    case 'text': return richEditor('Texto', 'html', data.html || '');
    case 'paragraph': return richEditor('Parágrafo', 'html', data.html || '');
    case 'list':
    case 'ordered_list': return textarea('Itens, um por linha', 'items', (data.items || []).join('\n'), 7);
    case 'quote': return `<div class="admin-form-grid">${richEditor('Citação', 'html', data.html || '')}${field('Autor ou fonte', 'cite', data.cite || '')}</div>`;
    case 'image': return `<div class="admin-form-grid">${field('URL da imagem', 'url', data.url || '')}<div class="form-field"><label>Upload</label><button class="button button--small button--secondary" type="button" data-block-upload>Enviar imagem</button></div>${field('Texto alternativo (ALT)', 'alt', data.alt || '')}${field('Legenda', 'caption', data.caption || '')}${field('Largura (%)', 'width', data.width || 100, { type: 'number', min: 10, max: 100, wide: false })}${select('Alinhamento', 'alignment', data.alignment || 'center', [['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']])}</div>`;
    case 'gallery': return renderGallery(data);
    case 'link': return `<div class="admin-form-grid">${field('URL', 'url', data.url || '')}${field('Texto do link', 'text', data.text || '')}${checkbox('Abrir em nova aba', 'newTab', Boolean(data.newTab))}</div>`;
    case 'button': return `<div class="admin-form-grid">${field('URL', 'url', data.url || '')}${field('Texto do botão', 'text', data.text || '')}${select('Estilo', 'style', data.style || 'primary', [['primary', 'Primário'], ['secondary', 'Secundário'], ['ghost', 'Contorno']])}${checkbox('Abrir em nova aba', 'newTab', Boolean(data.newTab))}</div>`;
    case 'code': return `<div class="admin-form-grid">${field('Linguagem', 'language', data.language || '')}${textarea('Código', 'code', data.code || '', 12)}</div>`;
    case 'table': return renderTable(data);
    case 'notice': return `<div class="admin-form-grid">${field('Título do aviso', 'heading', data.heading || '')}${richEditor('Conteúdo', 'html', data.html || '')}</div>`;
    case 'highlight': return `<div class="admin-form-grid">${field('Título do destaque', 'heading', data.heading || '')}${richEditor('Conteúdo', 'html', data.html || '')}</div>`;
    case 'separator': return '<p class="block-help">O separador cria uma linha visual entre conteúdos.</p>';
    case 'video': return `<div class="admin-form-grid">${field('URL do YouTube ou Vimeo', 'url', data.url || '')}${field('Título acessível', 'title', data.title || '')}${field('Legenda', 'caption', data.caption || '')}</div>`;
    case 'download': return `<div class="admin-form-grid">${field('URL do arquivo', 'url', data.url || '')}<div class="form-field"><label>Upload</label><button class="button button--small button--secondary" type="button" data-file-upload>Enviar arquivo</button></div>${field('Texto do download', 'label', data.label || '')}${field('Descrição', 'description', data.description || '')}</div>`;
    default: return '<p>Tipo de bloco não reconhecido.</p>';
  }
}
