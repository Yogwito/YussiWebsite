export function initLang() {
  let lang = 'es';
  const langBtn = document.getElementById('lang-btn');

  function applyLang(l) {
    lang = l;
    const attr = 'data-' + l;
    document.querySelectorAll('[' + attr + ']').forEach((el) => {
      const val = el.getAttribute(attr);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else if (el.tagName === 'OPTION') {
        el.textContent = val;
      } else {
        el.textContent = val;
      }
    });
    langBtn.textContent = l === 'es' ? 'ES | EN' : 'EN | ES';
    document.documentElement.lang = l === 'es' ? 'es' : 'en';
  }

  langBtn.addEventListener('click', () => {
    applyLang(lang === 'es' ? 'en' : 'es');
  });
}
