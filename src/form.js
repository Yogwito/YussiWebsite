export function initForm() {
  const form = document.getElementById('contact-form')
  const successMsg = document.getElementById('form-success')
  const submitBtn = form?.querySelector('[type="submit"]')

  if (!form) return

  form.addEventListener('submit', () => {
    if (submitBtn) submitBtn.classList.add('loading')

    setTimeout(() => {
      if (submitBtn) submitBtn.classList.remove('loading')
      successMsg.classList.add('visible')
      form.reset()
    }, 300)
  })
}
