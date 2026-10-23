// form[data-inquiry] 를 찾아 Turnstile을 붙이고 /api/inquiries 로 전송한다.
(function () {
  var forms = Array.prototype.slice.call(document.querySelectorAll('form[data-inquiry]'));
  var widgets = new Map();

  window.onTurnstileLoad = function () {
    forms.forEach(function (form) {
      var slot = form.querySelector('.turnstile');
      if (!slot) return;
      widgets.set(form, turnstile.render(slot, { sitekey: window.SITE_CONFIG.turnstileSiteKey }));
    });
  };

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit(form);
    });
  });

  async function submit(form) {
    var errorEl = form.querySelector('.form-error');
    var button = form.querySelector('button[type="submit"]');
    var fd = new FormData(form);
    errorEl.textContent = '';

    var payload = {
      source: form.dataset.inquiry,
      company: fd.get('company'),
      person: fd.get('person'),
      phone: fd.get('phone'),
      product: fd.get('product'),
      colors: fd.getAll('colors'),
      qty: fd.get('qty') && form.dataset.unit ? fd.get('qty') + form.dataset.unit : fd.get('qty'),
      region: fd.get('region'),
      message: fd.get('message'),
      consent: fd.get('consent') === 'on',
      turnstileToken: fd.get('cf-turnstile-response'),
    };

    if (!payload.consent) {
      errorEl.textContent = '개인정보 수집·이용에 동의해 주세요.';
      return;
    }

    button.disabled = true;
    try {
      var res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok) throw new Error(data.error || '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      form.reset();
      form.dispatchEvent(new CustomEvent('inquiry:sent', { bubbles: true }));
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      button.disabled = false;
      if (window.turnstile && widgets.has(form)) turnstile.reset(widgets.get(form));
    }
  }
})();
