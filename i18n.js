// Minimal i18n runtime: [data-i18n] text swap + [data-lang] toggle. Persists in localStorage('ds_lang').
(function () {
  var L = function () { return window.DS_LOCALES || { vi: {}, en: {} }; };
  var lang = 'vi';
  try { lang = localStorage.getItem('ds_lang') || 'vi'; } catch (e) { }
  function t(k) { var d = L(); return (d[lang] && d[lang][k]) != null ? d[lang][k] : (d.vi && d.vi[k]); }
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v != null && el.textContent !== v) el.textContent = v;
    });
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.style.background = on ? '#2B241C' : 'transparent';
      b.style.color = on ? '#F5F1E8' : '#8A7B67';
      b.style.fontWeight = on ? '600' : '400';
    });
  }
  window.DS_I18N = {
    get lang() { return lang; },
    t: t, apply: apply,
    set: function (l) {
      lang = l;
      try { localStorage.setItem('ds_lang', l); } catch (e) { }
      apply();
      window.dispatchEvent(new Event('ds:lang'));
    }
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (b) window.DS_I18N.set(b.getAttribute('data-lang'));
  });
  var timer = null;
  var mo = new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(apply, 150); });
  function boot() { apply(); mo.observe(document.body, { childList: true, subtree: true }); }
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();
})();
