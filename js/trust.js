/* Document and reference requests. Sends nothing silently: the buyer gets WhatsApp and email options,
   and a lead endpoint is used too when window.PF_ENDPOINT is set. */
(function () {
  var WA = '919057292529', EMAIL = 'Puneet2garg@gmail.com';
  var f = document.getElementById('docForm'); if (!f) return;
  var out = document.getElementById('docResult');
  function v(id) { return document.getElementById(id).value.trim(); }
  function link(text, href, cls) { var a = document.createElement('a'); a.className = cls; a.textContent = text; a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var picks = [].slice.call(f.querySelectorAll('input[name="docs"]:checked')).map(function (c) { return c.value; });
    out.hidden = false; out.textContent = '';
    if (!v('dName') || !v('dCompany') || (!v('dPhone') && !v('dEmail')) || !picks.length) {
      out.className = 'docs__out is-err';
      out.textContent = 'Add your name, company, a phone number or email, and tick at least one item.';
      return;
    }
    out.className = 'docs__out';
    var ref = 'PF-D' + Date.now().toString(36).toUpperCase().slice(-5);
    var msg = 'Reference: ' + ref + '\nHello Prime Fresh Oil Mills, please send: ' + picks.join(', ') + '.\nFrom: ' + v('dName') + ', ' + v('dCompany') + '\nPhone: ' + v('dPhone') + '\nEmail: ' + v('dEmail');
    var p = document.createElement('p'); p.textContent = 'Request ready (ref ' + ref + '). Send it to the mill the way that suits you.'; out.appendChild(p);
    var row = document.createElement('div'); row.className = 'row';
    row.appendChild(link('Send on WhatsApp', 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), 'btn btn--wa'));
    row.appendChild(link('Send by email', 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Document request ' + ref) + '&body=' + encodeURIComponent(msg), 'btn btn--outline'));
    out.appendChild(row);
    if (window.PF_ENDPOINT && window.fetch) {
      fetch(window.PF_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: ref, type: 'documents', message: msg }) })
        .then(function (r) { if (r.ok) p.textContent = 'Request received (ref ' + ref + '). The team has been alerted.'; }).catch(function () {});
    }
  });
})();
