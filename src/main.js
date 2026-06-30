import './css/loader.css'
import './css/main.css'
import './css/navbar.css'
import './css/hero.css'
import './css/why.css'
import './css/services.css'
import './css/process.css'
import './css/about.css'
import './css/sectors.css'
import './css/cta-banner.css'
import './css/faq.css'
import './css/contact.css'
import './css/footer.css'

import { initLang } from './lang.js'
import { initFaq } from './faq.js'
import { initNavbar } from './navbar.js'
import { initForm } from './form.js'
import { initAnimations } from './animations.js'

document.addEventListener('DOMContentLoaded', () => {
  initNavbar()
  initLang()
  initFaq()
  initForm()
  initAnimations()
})
