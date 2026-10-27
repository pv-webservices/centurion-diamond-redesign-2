/* ============================================================
   CONTACT — enquiry form.
   Validates in the browser, then posts JSON to CD.CONTACT.endpoint (any
   form backend that accepts JSON: Formspree, Basin, Getform, a Vercel
   function...). If only CD.CONTACT.email is set, the enquiry opens in the
   visitor's mail app instead. Until either is supplied by the client the
   form says so plainly rather than pretending to send.
   ============================================================ */
window.CD = window.CD || {};

CD.CONTACT = {
  endpoint: '',   // e.g. 'https://formspree.io/f/xxxxxxx'  (client to supply)
  email: ''       // e.g. 'retail@centuriondiamond.com'      (client to supply)
};

CD.pageInits = CD.pageInits || [];
CD.pageInits.push(function initContactForm() {
  'use strict';
  var form = document.getElementById('enquiry');
  if (!form) return;

  var status = form.querySelector('[data-form-status]');
  var submit = form.querySelector('[type="submit"]');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var LIMITS = { name: 120, company: 160, email: 160, phone: 40, message: 4000 };

  /* ?topic=retail preselects the enquiry type (the retail page links here) */
  var topic = new URLSearchParams(location.search).get('topic');
  if (topic) {
    var pick = form.querySelector('input[name="topic"][value="' + topic.replace(/[^a-z-]/g, '') + '"]');
    if (pick) pick.checked = true;
  }

  function field(name) { return form.elements[name]; }
  function setError(name, msg) {
    var input = field(name), wrap = input && (input.closest ? input.closest('.field') : null);
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    var err = wrap.querySelector('.field__err');
    if (err) err.textContent = msg || '';
    if (input.setAttribute) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  function read() {
    var d = {};
    ['name', 'company', 'email', 'phone', 'message'].forEach(function (k) {
      d[k] = (field(k).value || '').trim().slice(0, LIMITS[k]);
    });
    var t = form.querySelector('input[name="topic"]:checked');
    d.topic = t ? t.value : '';
    d.newsletter = field('newsletter').checked;
    return d;
  }

  function validate(d) {
    var ok = true;
    function check(name, msg) { setError(name, msg); if (msg) ok = false; }
    check('name', d.name.length < 2 ? 'Please tell us your name.' : '');
    check('email', !EMAIL_RE.test(d.email) ? 'Please enter a valid email address.' : '');
    check('phone', d.phone && !/^[\d\s()+.-]{7,}$/.test(d.phone) ? 'Please check the phone number.' : '');
    check('message', d.message.length < 10 ? 'A few words about your enquiry, please.' : '');
    return ok;
  }

  ['name', 'email', 'phone', 'message'].forEach(function (k) {
    field(k).addEventListener('blur', function () { if (field(k).closest('.field').classList.contains('is-invalid')) validate(read()); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (field('website').value) return;                 // honeypot: a bot filled the hidden field
    var d = read();
    if (!validate(d)) {
      say('Please check the highlighted fields.', 'err');
      var first = form.querySelector('.is-invalid input, .is-invalid textarea');
      if (first) first.focus();
      return;
    }
    var subject = 'Centurion enquiry: ' + (d.topic || 'general') + ' — ' + d.name;

    if (CD.CONTACT.endpoint) {
      submit.disabled = true;
      say('Sending…');
      fetch(CD.CONTACT.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, name: d.name, company: d.company, email: d.email, phone: d.phone,
          topic: d.topic, newsletter: d.newsletter, message: d.message, page: location.href })
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        say('Thank you. Your enquiry is with us and we will reply shortly.', 'ok');
      }).catch(function () {
        say('Sorry, your enquiry could not be sent just now. Please try again in a moment.', 'err');
      }).then(function () { submit.disabled = false; });
      return;
    }

    if (CD.CONTACT.email) {
      var body = ['Name: ' + d.name, d.company && 'Company: ' + d.company, 'Email: ' + d.email, d.phone && 'Phone: ' + d.phone,
        'Enquiry: ' + (d.topic || 'general'), '', d.message].filter(function (x) { return x !== '' && x; }).join('\n');
      location.href = 'mailto:' + CD.CONTACT.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      say('Your mail app should open with the enquiry ready to send.', 'ok');
      return;
    }

    say('Online enquiries are being connected. In the meantime, our store locator lists every Centurion retailer.', 'err');
  });
});
