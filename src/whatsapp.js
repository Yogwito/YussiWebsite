export function initWaBubble() {
  const bubble = document.getElementById('wa-bubble')
  const close = document.getElementById('wa-bubble-close')
  if (!bubble || !close) return

  setTimeout(() => bubble.classList.add('visible'), 3000)

  close.addEventListener('click', (e) => {
    e.stopPropagation()
    bubble.classList.remove('visible')
  })

  // Clicking the bubble opens WhatsApp (link) and dismisses it
  bubble.querySelector('.wa-bubble-link').addEventListener('click', () => {
    bubble.classList.remove('visible')
  })
}
