function normalizeFilterValue(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function bindFilterButtons({ buttonSelector, itemSelector, getValue, onChange }) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const items = [...document.querySelectorAll(itemSelector)];

  function applyFilter(rawFilter) {
    const filter = normalizeFilterValue(rawFilter || 'all');
    let visibleCount = 0;

    items.forEach((item) => {
      const searchableValue = normalizeFilterValue(getValue(item));
      const visible = filter === 'all' || searchableValue.includes(filter);
      item.hidden = !visible;
      item.classList.toggle('is-filtered-out', !visible);
      if (visible) visibleCount += 1;
    });

    if (typeof onChange === 'function') onChange({ filter, visibleCount, totalCount: items.length });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      applyFilter(button.dataset.filter || 'all');
    });
  });

  const activeButton = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  applyFilter(activeButton?.dataset.filter || 'all');
}
