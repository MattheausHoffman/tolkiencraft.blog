export function bindImageModal() {
  const modal = document.querySelector('[data-image-modal]');
  const openButton = document.querySelector('[data-open-image-modal]');
  const closeButtons = modal ? modal.querySelectorAll('[data-close-modal]') : [];
  if (!modal || !openButton) return;

  let previousFocus = null;
  const open = () => {
    previousFocus = document.activeElement;
    modal.showModal();
    modal.querySelector('[data-close-modal]')?.focus();
  };
  const close = () => {
    modal.close();
    previousFocus?.focus();
  };

  openButton.addEventListener('click', open);
  closeButtons.forEach((button) => button.addEventListener('click', close));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
}
