const WHATSAPP_NUMBER = '573113858494'

// El envío al servidor (/api/quote → QUOTE_WEBHOOK_URL) queda apagado hasta
// tener destino de cotizaciones y política de datos. Para activarlo, definir
// VITE_QUOTE_WEBHOOK_ENABLED=true en Vercel (además de QUOTE_WEBHOOK_URL) y
// volver a desplegar. Sin la variable, el formulario solo abre WhatsApp.
const WEBHOOK_ENABLED = import.meta.env.VITE_QUOTE_WEBHOOK_ENABLED === 'true'

const MESSAGES = {
  es: {
    submit: 'Enviar solicitud de cotización',
    submitWhatsapp: 'Enviar solicitud por WhatsApp',
    opened: 'Abrimos WhatsApp con tu solicitud. Si no se abrió, usa el enlace:',
    error: 'No pudimos recibir la solicitud. Tus datos siguen aquí; inténtalo de nuevo o envíalos por WhatsApp.',
    notConfigured: 'El envío por formulario aún no está activo. Tus datos siguen aquí: envíalos por WhatsApp con un clic.',
    whatsapp: 'Enviar mi solicitud por WhatsApp',
    greeting: 'Hola Bordados Yussi, quiero cotizar.',
    labels: { name: 'Nombre', company: 'Empresa', phone: 'Teléfono', email: 'Correo', service: 'Línea', message: 'Detalles' }
  },
  en: {
    submit: 'Send quote request',
    submitWhatsapp: 'Send request on WhatsApp',
    opened: 'We opened WhatsApp with your request. If it did not open, use the link:',
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
  const submitLabel = submitBtn?.querySelector('[data-es]')
  const startedAt = document.getElementById('form-started-at')
  const endpoint = form.dataset.endpoint || '/api/quote'
  let errorCode = ''

  const currentLanguage = () => document.documentElement.lang === 'en' ? 'en' : 'es'

  // El texto del botón depende del modo de envío.
  if (submitLabel) {
    const key = WEBHOOK_ENABLED ? 'submit' : 'submitWhatsapp'
    submitLabel.dataset.es = MESSAGES.es[key]
    submitLabel.dataset.en = MESSAGES.en[key]
    submitLabel.textContent = MESSAGES[currentLanguage()][key]
  }

  // Por WhatsApp el teléfono ya llega con el mensaje: el correo es opcional.
  // Solo es obligatorio cuando el formulario envía al webhook.
  const email = form.querySelector('[name="email"]')
  const emailLabel = email && form.querySelector(`label[for="${email.id}"]`)
  if (email && !WEBHOOK_ENABLED) {
    email.required = false
    if (emailLabel) {
      emailLabel.dataset.es = 'Correo'
      emailLabel.dataset.en = 'Email'
      emailLabel.textContent = currentLanguage() === 'en' ? 'Email' : 'Correo'
    }
  }

  // Arma un mensaje de WhatsApp con lo que la persona ya escribió.
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

  const whatsappLink = () => {
    const link = document.createElement('a')
    link.className = 'form-error-whatsapp'
    link.href = whatsappUrl()
    link.target = '_blank'
    link.rel = 'noopener'
    link.textContent = MESSAGES[currentLanguage()].whatsapp
    return link
  }

  const renderError = () => {
    if (!errorMsg) return
    const t = MESSAGES[currentLanguage()]
    const text = document.createElement('span')
    text.textContent = errorCode === 'LEAD_PROVIDER_NOT_CONFIGURED' ? t.notConfigured : t.error
    errorMsg.replaceChildren(text, ' ', whatsappLink())
    errorMsg.hidden = false
  }

  const renderOpened = () => {
    if (!successMsg) return
    const text = document.createElement('span')
    text.textContent = MESSAGES[currentLanguage()].opened
    successMsg.replaceChildren(text, ' ', whatsappLink())
    successMsg.hidden = false
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

  // Si edita los datos con un mensaje visible, el enlace de WhatsApp se actualiza.
  const refreshMessages = () => {
    if (form.dataset.state === 'error' && errorMsg && !errorMsg.hidden) renderError()
    if (form.dataset.state === 'whatsapp' && successMsg && !successMsg.hidden) renderOpened()
  }
  form.addEventListener('input', refreshMessages)

  const submitToWhatsapp = () => {
    const opened = window.open(whatsappUrl(), '_blank', 'noopener')
    if (!opened) window.location.href = whatsappUrl()
    setState('whatsapp')
    renderOpened()
  }

  const submitToServer = async () => {
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
      if (successMsg) {
        successMsg.textContent = successMsg.getAttribute(`data-${currentLanguage()}`)
        successMsg.hidden = false
      }
      form.reset()
      if (startedAt) startedAt.value = ''
    } catch (error) {
      setState('error')
      errorCode = error.message
      renderError()
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    startClock()

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    hideMessages()
    if (WEBHOOK_ENABLED) submitToServer()
    else submitToWhatsapp()
  })

  document.addEventListener('languagechange', refreshMessages)
}
