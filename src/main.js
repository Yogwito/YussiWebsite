import './css/loader.css'
import './css/main.css'
import './css/navbar.css'
import './css/hero.css'
import './css/why.css'
import './css/services.css'
import './css/process.css'
import './css/about.css'
import './css/sectors.css'
import './css/brands.css'
import './css/certs.css'
import './css/cta-banner.css'
import './css/faq.css'
import './css/contact.css'
import './css/footer.css'

import { initLang } from './lang.js'
import { initFaq } from './faq.js'
import { initNavbar } from './navbar.js'
import { initForm } from './form.js'
import { initAnimations } from './animations.js'
import { initWaBubble } from './whatsapp.js'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const resetInitialScroll = () => {
  if (!window.location.hash) window.scrollTo(0, 0)
}

resetInitialScroll()

document.addEventListener('DOMContentLoaded', () => {
  resetInitialScroll()
  initNavbar()
  initLang()
  initFaq()
  initForm()
  initAnimations()
  initWaBubble()
})
