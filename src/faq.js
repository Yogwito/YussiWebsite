export function initFaq() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')
      const isOpen = item.classList.contains('open')

      // close all open items
      document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'))

      if (!isOpen) item.classList.add('open')
    })
  })
}
