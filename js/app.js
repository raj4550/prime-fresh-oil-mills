/* Prime Fresh Oil Mills: catalog, enquiry sheet and quote handoff.
   Only facts confirmed by the owner are used. No backend: the enquiry is handed
   off through WhatsApp, email or copy, so it works for a real buyer today. */
(function () {
  'use strict';

  var WA = '919057292529';
  var EMAIL = 'Puneet2garg@gmail.com';
  function newRef() { return 'PF-' + Date.now().toString(36).toUpperCase().slice(-6); }
  var STORE_KEY = 'pfom-enquiry-v1';

  var FORMS = [
    { id: 'all', label: 'All products' },
    { id: 'oil', label: 'Oils' },
    { id: 'seed', label: 'Seeds' },
    { id: 'cake', label: 'De-oiled cakes' }
  ];
  var CROPS = [
    { id: 'all', label: 'Every crop' },
    { id: 'mustard', label: 'Mustard' },
    { id: 'sesame', label: 'Sesame' },
    { id: 'groundnut', label: 'Groundnut' }
  ];
  var FORM_LABEL = { oil: 'Oil', seed: 'Seed', cake: 'De-oiled cake' };
  var CROP_LABEL = { mustard: 'Mustard', sesame: 'Sesame', groundnut: 'Groundnut' };

  var PRODUCTS = [
    { id: 'yellow-mustard-oil', name: 'Yellow mustard oil', form: 'oil', crop: 'mustard', best: true, feature: true, art: 'gold',
      blurb: 'Our best-selling oil, quoted in bulk for oil brands, FMCG makers and private-label buyers.' },
    { id: 'sesame-oil', name: 'Sesame oil', form: 'oil', crop: 'sesame', best: true, art: 'amber',
      blurb: 'One of our best sellers. Share your volume and packing needs and we will quote.' },
    { id: 'yellow-mustard-seeds', name: 'Yellow mustard seeds', form: 'seed', crop: 'mustard',
      img: '/img/yellow-mustard-seeds.webp', blurb: 'Whole yellow mustard seed.' },
    { id: 'black-mustard-seeds', name: 'Black mustard seeds', form: 'seed', crop: 'mustard',
      img: '/img/black-mustard-seeds.webp', pos: '50% 40%', blurb: 'Whole black mustard seed.' },
    { id: 'sesame-seeds', name: 'Sesame seeds', form: 'seed', crop: 'sesame', best: true,
      img: '/img/sesame-seeds.webp', blurb: 'Whole sesame seed. One of our best sellers.' },
    { id: 'black-sesame-seeds', name: 'Black sesame seeds', form: 'seed', crop: 'sesame',
      img: '/img/black-sesame-seeds.webp', blurb: 'Whole black sesame seed.' },
    { id: 'groundnut-seeds', name: 'Groundnut seeds', form: 'seed', crop: 'groundnut', best: true,
      img: '/img/groundnut-seeds.webp', blurb: 'Groundnut seeds. One of our best sellers.' },
    { id: 'yellow-mustard-cake', name: 'Yellow mustard cake', form: 'cake', crop: 'mustard',
      img: '/img/yellow-mustard-cake.webp', blurb: 'De-oiled cake left after yellow mustard oil extraction.' },
    { id: 'black-mustard-cake', name: 'Black mustard cake', form: 'cake', crop: 'mustard',
      img: '/img/black-mustard-cake.webp', blurb: 'De-oiled cake left after black mustard oil extraction.' }
  ];
  var OTHER = { id: 'other', name: 'Custom product', form: null, crop: null };

  var ROUTES = [
    { id: 'oil-brand', title: 'Edible oil brands', text: 'Bulk yellow mustard and sesame oil for your own range.',
      action: 'Show oils', form: 'oil', buyer: 'Edible oil brand' },
    { id: 'fmcg', title: 'FMCG and food manufacturers', text: 'Oils and seeds as ingredients in the products you make.',
      action: 'Show all products', form: 'all', buyer: 'FMCG or food manufacturer' },
    { id: 'private-label', title: 'Private-label businesses', text: 'Your brand on our supply. Start with a sample and a quotation.',
      action: 'See how it works', scrollTo: 'private-label', buyer: 'Private-label business' },
    { id: 'trader', title: 'Traders and distributors', text: 'Seeds and de-oiled cakes in volume.',
      action: 'Show seeds', form: 'seed', buyer: 'Trader or distributor' }
  ];

  var BUYERS = ['Edible oil brand', 'FMCG or food manufacturer', 'Private-label business', 'Trader or distributor', 'Other'];
  var PACKAGING = ['Bulk (tanker or loose)', 'Drums or barrels', 'Bags (jute or PP)', 'Retail packs for my own brand', 'Not sure, please advise'];
  var NEED_BY = ['As soon as possible', 'Within 2 weeks', 'Within a month', 'Just comparing prices'];
  var UNITS = ['MT', 'kg', 'litres'];

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function byId(id) { return id === 'other' ? OTHER : PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  var state = { form: 'all', crop: 'all', items: [], drawerId: null, lastFocus: null };
  try { state.items = JSON.parse(localStorage.getItem(STORE_KEY) || '[]').filter(function (i) { return byId(i.id); }); } catch (e) { state.items = []; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state.items)); } catch (e) { /* storage can be blocked */ } }
  function has(id) { return state.items.some(function (i) { return i.id === id; }); }

  /* ---------- droplet art (used for oils, which have no photo yet) ---------- */
  var dropN = 0;
  function dropSVG(kind) {
    dropN += 1;
    var id = 'dg' + dropN;
    var stops = kind === 'amber'
      ? ['#EBCB8A', '#C8923A', '#8F5E1B']
      : ['#F7CE5B', '#E5AC2B', '#B57C10'];
    return '<svg viewBox="60 20 280 420" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".4" y2="1">' +
      '<stop offset="0" stop-color="' + stops[0] + '"/><stop offset=".55" stop-color="' + stops[1] + '"/><stop offset="1" stop-color="' + stops[2] + '"/></linearGradient></defs>' +
      '<path d="M200 30 C200 30 78 190 78 300 A122 122 0 0 0 322 300 C322 190 200 30 200 30 Z" fill="url(#' + id + ')"/>' +
      '<path d="M122 290 C122 240 150 188 176 146" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="9" stroke-linecap="round"/></svg>';
  }
  function mediaHTML(p) {
    if (p.img) {
      return '<img src="' + p.img + '" alt="' + esc(p.name) + '" width="400" height="300" loading="lazy"' +
        (p.pos ? ' style="object-position:' + p.pos + '"' : '') + ' />';
    }
    return '<div class="tile__art">' + dropSVG(p.art) + '<small>Illustration</small></div>';
  }
  function metaHTML(p) {
    return '<span class="tag tag--' + p.form + '">' + FORM_LABEL[p.form] + '</span>' +
      (p.best ? '<span class="tag tag--best">Best seller</span>' : '');
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg, actionLabel, action) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (actionLabel ? '<button type="button">' + esc(actionLabel) + '</button>' : '');
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    if (actionLabel) $('button', t).onclick = function () { t.hidden = true; action(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3800);
  }

  /* ---------- buyer routes ---------- */
  function renderRoutes() {
    $('#routes').innerHTML = ROUTES.map(function (r) {
      return '<li><button class="route" type="button" data-route="' + r.id + '"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) +
        '</p><span>' + esc(r.action) + '</span></button></li>';
    }).join('');
  }

  /* ---------- filters + grid ---------- */
  function renderFilters() {
    $('#formFilters').innerHTML = FORMS.map(function (f) {
      return '<button type="button" data-form="' + f.id + '" aria-pressed="' + (state.form === f.id) + '">' + f.label + '</button>';
    }).join('');
    $('#cropFilters').innerHTML = CROPS.map(function (c) {
      return '<button type="button" data-crop="' + c.id + '" aria-pressed="' + (state.crop === c.id) + '">' + c.label + '</button>';
    }).join('');
  }
  function visible() {
    return PRODUCTS.filter(function (p) {
      return (state.form === 'all' || p.form === state.form) && (state.crop === 'all' || p.crop === state.crop);
    });
  }
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.500 4.500L19 7.500"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  function addBtn(p) {
    var on = has(p.id);
    return '<button class="add" type="button" data-add="' + p.id + '" aria-pressed="' + on + '">' + (on ? CHECK + 'Added' : PLUS + 'Add to enquiry') + '</button>';
  }
  function renderGrid() {
    var list = visible();
    $('#grid').innerHTML = list.length ? list.map(function (p) {
      return '<article class="tile' + (p.feature ? ' tile--feature' : '') + '">' +
        '<button class="tile__media" type="button" data-open="' + p.id + '" aria-label="View details for ' + esc(p.name) + '">' + mediaHTML(p) + '</button>' +
        '<div class="tile__body"><div class="tile__meta">' + metaHTML(p) + '</div><h3>' + esc(p.name) + '</h3><p>' + esc(p.blurb) + '</p>' +
        '<div class="tile__actions">' + addBtn(p) + '<button class="link" type="button" data-open="' + p.id + '">Details</button><a class="link" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Prime Fresh Oil Mills, I am interested in ' + p.name + '. Please share details.') + '">WhatsApp</a></div></div></article>';
    }).join('') : '<p class="empty-grid">No product matches this filter. Try another crop, or add a custom product.</p>';
    $('#count').textContent = list.length + (list.length === 1 ? ' product' : ' products');
    // feature tile spans two columns on wide screens
    $$('.tile--feature').forEach(function (t) { t.style.gridColumn = window.innerWidth >= 700 ? 'span 2' : ''; });
  }
  function setFilter(form, crop, scroll) {
    state.form = form || 'all'; state.crop = crop || 'all';
    renderFilters(); renderGrid();
    if (scroll) $('#products').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- enquiry items ---------- */
  function toggleItem(id) {
    if (has(id)) { removeItem(id); return false; }
    state.items.push({ id: id, qty: '', unit: 'MT' });
    syncItems(); return true;
  }
  function removeItem(id) { state.items = state.items.filter(function (i) { return i.id !== id; }); syncItems(); }
  function reviewQuote() { $('#quote').scrollIntoView({ behavior: 'smooth' }); }

  function syncItems() {
    save(); renderItems(); renderAddSelect();
    $$('[data-add]').forEach(function (b) {
      var on = has(b.getAttribute('data-add'));
      b.setAttribute('aria-pressed', on); b.innerHTML = on ? CHECK + 'Added' : PLUS + 'Add to enquiry';
    });
    var n = state.items.length;
    $('#pill').hidden = n === 0; $('#pillCount').textContent = n;
    var bc = $('#barCount'); bc.hidden = n === 0; bc.textContent = n;
    if (state.drawerId) paintDrawerButton();
  }
  function renderItems() {
    var ul = $('#items');
    $('#itemsEmpty').hidden = state.items.length > 0;
    ul.innerHTML = state.items.map(function (it) {
      var p = byId(it.id);
      return '<li class="item" data-item="' + it.id + '"><div class="item__name">' + esc(p.name) +
        (p.form ? '<small>' + FORM_LABEL[p.form] + '</small>' : '<small>Describe it in the notes below</small>') + '</div>' +
        '<input class="qty" type="number" inputmode="decimal" min="0" step="any" placeholder="Quantity" aria-label="Quantity of ' + esc(p.name) + '" data-qty="' + it.id + '" value="' + esc(it.qty) + '" />' +
        '<select class="unit" aria-label="Unit for ' + esc(p.name) + '" data-unit="' + it.id + '">' +
        UNITS.map(function (u) { return '<option' + (u === it.unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select>' +
        '<button class="item__rm" type="button" data-remove="' + it.id + '" aria-label="Remove ' + esc(p.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
    }).join('');
  }
  function renderAddSelect() {
    var sel = $('#addSelect');
    var opts = '<option value="">Choose a product to add</option>';
    ['oil', 'seed', 'cake'].forEach(function (f) {
      var rest = PRODUCTS.filter(function (p) { return p.form === f && !has(p.id); });
      if (rest.length) opts += '<optgroup label="' + (f === 'cake' ? 'De-oiled cakes' : FORM_LABEL[f] + 's') + '">' +
        rest.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + '</option>'; }).join('') + '</optgroup>';
    });
    if (!has('other')) opts += '<option value="other">Custom product (describe in notes)</option>';
    sel.innerHTML = opts;
  }

  /* ---------- drawer ---------- */
  function openDrawer(id, trigger) {
    var p = byId(id); if (!p) return;
    state.drawerId = id; state.lastFocus = trigger || document.activeElement;
    $('#drawerMedia').innerHTML = p.img
      ? '<img src="' + p.img + '" alt="' + esc(p.name) + '"' + (p.pos ? ' style="object-position:' + p.pos + '"' : '') + ' />'
      : '<div class="tile__art">' + dropSVG(p.art) + '<small>Illustration</small></div>';
    $('#drawerMeta').innerHTML = metaHTML(p);
    $('#drawerTitle').textContent = p.name;
    $('#drawerText').textContent = p.blurb;
    $('#specCat').textContent = FORM_LABEL[p.form];
    $('#specCrop').textContent = CROP_LABEL[p.crop];
    $('#drawerWa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Prime Fresh Oil Mills, I would like to know more about ' + p.name + '.');
    paintDrawerButton();
    $('#drawer').hidden = false; document.body.style.overflow = 'hidden';
    $('.drawer__close').focus();
  }
  function paintDrawerButton() {
    var on = has(state.drawerId), b = $('#drawerAdd');
    b.textContent = on ? 'Added. Remove from enquiry' : 'Add to enquiry';
    b.className = 'btn btn--block ' + (on ? 'btn--outline' : 'btn--green');
  }
  function closeDrawer() {
    $('#drawer').hidden = true; document.body.style.overflow = ''; state.drawerId = null;
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* ---------- form setup ---------- */
  function fillSelect(id, list) { $(id).innerHTML = list.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join(''); }
  function prefill(buyer, notes) {
    if (buyer) $('#buyer').value = buyer;
    if (notes && !$('#notes').value.trim()) $('#notes').value = notes;
  }

  /* ---------- validation + submit ---------- */
  function clearErrors() {
    $$('.is-invalid').forEach(function (e) { e.classList.remove('is-invalid'); e.removeAttribute('aria-invalid'); });
    $$('.err-msg').forEach(function (e) { e.remove(); });
    $$('.item.has-error').forEach(function (e) { e.classList.remove('has-error'); });
    $('#formAlert').hidden = true;
  }
  function fieldError(input, msg) {
    input.classList.add('is-invalid'); input.setAttribute('aria-invalid', 'true');
    var m = document.createElement('span'); m.className = 'err-msg'; m.textContent = msg;
    input.parentNode.appendChild(m);
  }
  function validate() {
    clearErrors();
    var problems = [], first = null;
    function bad(el, msg) { fieldError(el, msg); problems.push(msg); if (!first) first = el; }

    if (!state.items.length) { problems.push('Add at least one product to your enquiry.'); first = first || $('#addSelect'); }
    state.items.forEach(function (it) {
      var qty = parseFloat(it.qty);
      if (!(qty > 0)) {
        var row = $('[data-item="' + it.id + '"]'); row.classList.add('has-error');
        var input = $('.qty', row);
        input.classList.add('is-invalid'); input.setAttribute('aria-invalid', 'true');
        problems.push('Enter a quantity for ' + byId(it.id).name + '.');
        if (!first) first = input;
      }
    });
    var name = $('#name'), company = $('#company'), phone = $('#phone'), email = $('#email');
    if (!name.value.trim()) bad(name, 'Enter your name.');
    if (!company.value.trim()) bad(company, 'Enter your company name.');
    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) bad(phone, 'Enter a phone number with 8 to 15 digits.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad(email, 'Enter a valid email, like name@company.com.');

    if (problems.length) {
      var a = $('#formAlert');
      a.textContent = problems.length === 1 ? problems[0] : 'Fix ' + problems.length + ' things before you request the quotation: ' + problems.join(' ');
      a.hidden = false;
      if (first) first.focus();
      return false;
    }
    return true;
  }
  function buildMessage() {
    var f = $('#enquiryForm');
    var extras = $$('input[name="extras"]:checked', f).map(function (c) { return c.value; });
    var lines = ['Hello Prime Fresh Oil Mills, I would like a quotation.', '', 'Products:'];
    state.items.forEach(function (it) { lines.push('- ' + byId(it.id).name + ': ' + it.qty + ' ' + it.unit); });
    lines.push('');
    if ($('#destination').value.trim()) lines.push('Delivery location: ' + $('#destination').value.trim());
    lines.push('Needed: ' + $('#needBy').value);
    lines.push('Packaging: ' + $('#packaging').value);
    lines.push('Order type: ' + $('input[name="orderType"]:checked', f).value);
    if (extras.length) lines.push('Please also send: ' + extras.join(', '));
    if ($('#notes').value.trim()) lines.push('Notes: ' + $('#notes').value.trim());
    lines.push('', 'From: ' + $('#name').value.trim() + ', ' + $('#company').value.trim() + ' (' + $('#buyer').value + ')');
    lines.push('Phone: ' + $('#phone').value.trim(), 'Email: ' + $('#email').value.trim());
    return lines.join('\n');
  }
  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    var ref = newRef();
    var msg = 'Reference: ' + ref + '\n' + buildMessage();
    $('#resultBody').textContent = msg;
    $('#sendWa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    $('#sendMail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quotation request from ' + $('#company').value.trim()) + '&body=' + encodeURIComponent(msg);
    var title = $('#resultTitle'), note = $('.result__note');
    title.textContent = 'Your enquiry is ready to send (ref ' + ref + ')';
    if (window.PF_ENDPOINT && window.fetch) {
      fetch(window.PF_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: ref, type: 'quote', message: msg, items: state.items, name: $('#name').value.trim(), company: $('#company').value.trim(), phone: $('#phone').value.trim(), email: $('#email').value.trim() }) })
        .then(function (r) { if (!r.ok) throw new Error('send failed'); title.textContent = 'Enquiry received (ref ' + ref + ')'; note.textContent = 'The team has been alerted and you will get an acknowledgment. For the fastest reply, also send it on WhatsApp.'; })
        .catch(function () { /* keep the manual send options */ });
    }
    $('#enquiryForm').hidden = true; $('.sheet__head').hidden = true;
    var r = $('#result'); r.hidden = false; r.focus({ preventScroll: true });
    $('#sheet').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a'); if (!t) return;

    if (t.hasAttribute('data-add')) {
      var id = t.getAttribute('data-add'), added = toggleItem(id);
      if (added) toast(byId(id).name + ' added to your enquiry', 'Review', reviewQuote);
      return;
    }
    if (t.hasAttribute('data-open')) { openDrawer(t.getAttribute('data-open'), t); return; }
    if (t.hasAttribute('data-close')) { closeDrawer(); return; }
    if (t.id === 'drawerAdd') {
      var did = state.drawerId, nowOn = toggleItem(did);
      if (nowOn) toast(byId(did).name + ' added to your enquiry', 'Review', function () { closeDrawer(); reviewQuote(); });
      return;
    }
    if (t.hasAttribute('data-form')) { state.form = t.getAttribute('data-form'); renderFilters(); renderGrid(); return; }
    if (t.hasAttribute('data-crop')) { state.crop = t.getAttribute('data-crop'); renderFilters(); renderGrid(); return; }
    if (t.hasAttribute('data-filter-form')) { setFilter(t.getAttribute('data-filter-form'), t.getAttribute('data-filter-crop'), true); return; }
    if (t.hasAttribute('data-route')) {
      var r = ROUTES.filter(function (x) { return x.id === t.getAttribute('data-route'); })[0];
      prefill(r.buyer);
      if (r.scrollTo) $('#' + r.scrollTo).scrollIntoView({ behavior: 'smooth' });
      else setFilter(r.form, 'all', true);
      return;
    }
    if (t.hasAttribute('data-remove')) { removeItem(t.getAttribute('data-remove')); return; }
    if (t.hasAttribute('data-add-other')) {
      if (!has('other')) toggleItem('other');
      toast('Custom product added. Describe it in the notes.', 'Review', reviewQuote); return;
    }
    if (t.hasAttribute('data-prefill-product')) { var pid = t.getAttribute('data-prefill-product'); if (!has(pid)) toggleItem(pid); }
    if (t.id === 'plStart') {
      prefill('Private-label business', 'Private-label enquiry. Brand and pack I have in mind: ');
      reviewQuote(); setTimeout(function () { $('#notes').focus({ preventScroll: true }); }, 500); return;
    }
    if (t.id === 'pill') { reviewQuote(); return; }
    if (t.id === 'editBtn') { $('#result').hidden = true; $('#enquiryForm').hidden = false; $('.sheet__head').hidden = false; return; }
    if (t.id === 'copyBtn') {
      var text = $('#resultBody').textContent;
      var done = function () { toast('Enquiry copied. Paste it anywhere.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { toast('Copy failed. Select the text and copy it.'); });
      else toast('Select the text above and copy it.');
      return;
    }
    if (t.id === 'menuBtn') {
      var open = $('#nav').classList.toggle('is-open'); t.setAttribute('aria-expanded', open); return;
    }
    if (t.closest('#nav')) { $('#nav').classList.remove('is-open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
  });

  document.addEventListener('input', function (e) {
    var q = e.target.getAttribute && e.target.getAttribute('data-qty');
    if (q) {
      state.items.forEach(function (i) { if (i.id === q) i.qty = e.target.value; }); save();
      e.target.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid');
      var row = e.target.closest('.item'); if (row) row.classList.remove('has-error');
    }
    if (e.target.classList && e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid');
      var m = e.target.parentNode.querySelector('.err-msg'); if (m) m.remove();
    }
  });
  document.addEventListener('change', function (e) {
    var u = e.target.getAttribute && e.target.getAttribute('data-unit');
    if (u) { state.items.forEach(function (i) { if (i.id === u) i.unit = e.target.value; }); save(); }
    if (e.target.id === 'addSelect' && e.target.value) {
      var id = e.target.value; toggleItem(id);
      var inp = $('[data-qty="' + id + '"]'); if (inp) inp.focus();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!$('#drawer').hidden) closeDrawer();
      else if ($('#nav').classList.contains('is-open')) { $('#nav').classList.remove('is-open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
    }
    if (e.key === 'Tab' && !$('#drawer').hidden) {          // keep focus inside the drawer
      var f = $$('button, a[href]', $('.drawer__panel')).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () {
    $$('.tile--feature').forEach(function (t) { t.style.gridColumn = window.innerWidth >= 700 ? 'span 2' : ''; }); }, 100); });

  /* ---------- init ---------- */
  fillSelect('#buyer', BUYERS); fillSelect('#needBy', NEED_BY); fillSelect('#packaging', PACKAGING);
  renderRoutes(); renderFilters(); renderGrid(); syncItems();
  $('#enquiryForm').addEventListener('submit', onSubmit);
  /* sample request from the product drawer */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#drawerSample')) return;
    var id = state.drawerId; if (!id) return;
    if (!has(id)) toggleItem(id);
    var box = $('input[name="extras"][value="a sample"]'); if (box) box.checked = true;
    closeDrawer(); reviewQuote();
  });
})();
