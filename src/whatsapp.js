export function initWaBubble() {
  const bubble = document.getElementById('wa-bubble')
  const close = document.getElementById('wa-bubble-close')
  initFabContext()
  if (!bubble || !close) return

  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  const wasDismissed = sessionStorage.getItem('wa-bubble-dismissed') === 'true'
  if (!isDesktop || wasDismissed) return

  let hideTimer
  const showTimer = setTimeout(() => {
    bubble.classList.add('visible')
    hideTimer = setTimeout(() => bubble.classList.remove('visible'), 7000)
  }, 8000)

  const dismiss = () => {
    clearTimeout(showTimer)
    clearTimeout(hideTimer)
    bubble.classList.remove('visible')
    sessionStorage.setItem('wa-bubble-dismissed', 'true')
  }

  close.addEventListener('click', (e) => {
    e.stopPropagation()
    dismiss()
  })

  bubble.querySelector('.wa-bubble-link').addEventListener('click', dismiss)
}

function initFabContext() {
  const fab = document.getElementById('fab-wa')
  const contact = document.getElementById('contact')
  if (!fab || !contact) return

  const observer = new IntersectionObserver(([entry]) => {
    fab.classList.toggle('fab-context-hidden', entry.isIntersecting)
  }, { threshold: 0.18 })

  observer.observe(contact)
}
