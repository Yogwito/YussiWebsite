export function initFaq() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item')
      const isOpen = item.classList.contains('open')

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        setExpanded(openItem, false)
      })

      if (!isOpen) setExpanded(item, true)
    })
  })
}

function setExpanded(item, expanded) {
  const question = item.querySelector('.faq-question')
  const answer = item.querySelector('.faq-answer')

  item.classList.toggle('open', expanded)
  question?.setAttribute('aria-expanded', String(expanded))
  answer?.setAttribute('aria-hidden', String(!expanded))
}
