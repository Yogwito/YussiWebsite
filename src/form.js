const DEFAULT_ERROR = {
  es: 'No pudimos recibir la solicitud. Tus datos siguen aquí; inténtalo de nuevo o escríbenos por WhatsApp.',
  en: 'We could not receive the request. Your details are still here; try again or contact us on WhatsApp.'
}

export function initForm() {
  const form = document.getElementById('contact-form')
  if (!form) return

  const successMsg = document.getElementById('form-success')
  const errorMsg = document.getElementById('form-error')
  const submitBtn = form.querySelector('[type="submit"]')
  const startedAt = document.getElementById('form-started-at')
  const endpoint = form.dataset.endpoint || '/api/quote'

  const setMessage = (element, visible, message) => {
    if (!element) return
    if (message) element.textContent = message
    element.hidden = !visible
  }

  const currentLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'es'

  const setState = (state) => {
    const isSubmitting = state === 'submitting'
    form.dataset.state = state
    form.setAttribute('aria-busy', String(isSubmitting))
    if (submitBtn) {
      submitBtn.disabled = isSubmitting
      submitBtn.classList.toggle('loading', isSubmitting)
    }
  }

  const startClock = () => {
    if (startedAt && !startedAt.value) startedAt.value = String(Date.now())
  }

  form.addEventListener('input', startClock, { once: true })
  form.addEventListener('focusin', startClock, { once: true })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    startClock()

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    setMessage(successMsg, false)
    setMessage(errorMsg, false)
    setState('submitting')

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || result.ok !== true) {
        throw new Error(result.code || 'QUOTE_REQUEST_FAILED')
      }

      setState('success')
      setMessage(successMsg, true)
      form.reset()
      if (startedAt) startedAt.value = ''
    } catch (error) {
      setState('error')
      const language = currentLanguage()
      const message = error.message === 'LEAD_PROVIDER_NOT_CONFIGURED'
        ? language === 'en'
          ? 'The quote form is ready, but its receiving service is not configured yet. Please use WhatsApp while it is being activated.'
          : 'El formulario está listo, pero falta configurar el servicio que recibe las solicitudes. Mientras se activa, puedes escribirnos por WhatsApp.'
        : DEFAULT_ERROR[language]
      setMessage(errorMsg, true, message)
    }
  })

  document.addEventListener('languagechange', () => {
    if (form.dataset.state === 'error' && errorMsg?.hidden === false) {
      setMessage(errorMsg, true, DEFAULT_ERROR[currentLanguage()])
    }
  })
}
