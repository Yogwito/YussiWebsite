export function initWaBubble() {
  const bubble = document.getElementById('wa-bubble')
  const close = document.getElementById('wa-bubble-close')
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
