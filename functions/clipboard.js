export function bindCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy || '';
      const originalLabel = button.textContent;

      try {
        await navigator.clipboard.writeText(value);
        button.textContent = 'Copiado!';
        button.classList.add('is-success');
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        button.textContent = 'Copiado!';
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove('is-success');
      }, 1800);
    });
  });
}
