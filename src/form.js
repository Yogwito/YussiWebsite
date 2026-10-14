const WHATSAPP_NUMBER = '573113858494'

const MESSAGES = {
  es: {
    error: 'No pudimos recibir la solicitud. Tus datos siguen aquí; inténtalo de nuevo o envíalos por WhatsApp.',
    notConfigured: 'El envío por formulario aún no está activo. Tus datos siguen aquí: envíalos por WhatsApp con un clic.',
    whatsapp: 'Enviar mi solicitud por WhatsApp',
    greeting: 'Hola Bordados Yussi, quiero cotizar.',
    labels: { name: 'Nombre', company: 'Empresa', phone: 'Teléfono', email: 'Correo', service: 'Línea', message: 'Detalles' }
  },
  en: {
    error: 'We could not receive the request. Your details are still here; try again or send them on WhatsApp.',
    notConfigured: 'Form submissions are not active yet. Your details are still here: send them on WhatsApp in one click.',
    whatsapp: 'Send my request on WhatsApp',
    greeting: 'Hi Bordados Yussi, I would like a quote.',
    labels: { name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', service: 'Line', message: 'Details' }
  }
}

export function initForm() {
  const form = document.getElementById('contact-form')
  if (!form) return

  const successMsg = document.getElementById('form-success')
  const errorMsg = document.getElementById('form-error')
  const submitBtn = form.querySelector('[type="submit"]')
  const startedAt = document.getElementById('form-started-at')
  const endpoint = form.dataset.endpoint || '/api/quote'
  let errorCode = ''

  const currentLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'es'

  // Arma un mensaje de WhatsApp con lo que la persona ya escribió, para que
  // la solicitud no se pierda si el envío por formulario falla.
  const whatsappUrl = () => {
    const t = MESSAGES[currentLanguage()]
    const data = new FormData(form)
    const service = form.querySelector('[name="service"]')
    const values = {
      ...Object.fromEntries(data.entries()),
      service: service?.value ? service.selectedOptions[0].textContent.trim() : ''
    }
    const lines = Object.entries(t.labels)
      .filter(([key]) => String(values[key] || '').trim())
      .map(([key, label]) => `${label}: ${String(values[key]).trim()}`)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent([t.greeting, ...lines].join('\n'))}`
  }

  const renderError = () => {
    if (!errorMsg) return
    const t = MESSAGES[currentLanguage()]
    const text = document.createElement('span')
    text.textContent = errorCode === 'LEAD_PROVIDER_NOT_CONFIGURED' ? t.notConfigured : t.error
    const link = document.createElement('a')
    link.className = 'form-error-whatsapp'
    link.href = whatsappUrl()
    link.target = '_blank'
    link.rel = 'noopener'
    link.textContent = t.whatsapp
    errorMsg.replaceChildren(text, ' ', link)
    errorMsg.hidden = false
  }

  const hideMessages = () => {
    if (successMsg) successMsg.hidden = true
    if (errorMsg) errorMsg.hidden = true
  }

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

  // Si edita los datos con el error visible, el enlace de WhatsApp se actualiza.
  form.addEventListener('input', () => {
    if (form.dataset.state === 'error' && errorMsg && !errorMsg.hidden) renderError()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    startClock()

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    hideMessages()
    setState('submitting')

    const payload = Object.fromEntries(new FormData(form).entries())

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
      if (successMsg) successMsg.hidden = false
      form.reset()
      if (startedAt) startedAt.value = ''
    } catch (error) {
      setState('error')
      errorCode = error.message
      renderError()
    }
  })

  document.addEventListener('languagechange', () => {
    if (form.dataset.state === 'error' && errorMsg && !errorMsg.hidden) renderError()
  })
}
